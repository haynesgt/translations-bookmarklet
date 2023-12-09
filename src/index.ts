import { debounce } from "./debounce";
import { FetchTranslationsParams, fetchTranslations } from "./fetchTranslations";
import { getRangeFromMouseEvent } from "./getRangeFromMouseEvent";
import { topLanguageCodes } from "./languageCodes";
import { Tooltip } from "./Tooltip";
import { getWordAtOffset } from "./getWordAtOffset";
import { clamp } from "./util";

interface MyWinow extends Window {
    translationSourceLanguage?: string;
    translationTargetLanguage?: string;
    translationTooltip?: Tooltip;
    cancelTranslator?: () => void;
    lastLanguage?: string;
    lastLanguageTime?: number;
}

const myWindow = window as MyWinow;

const SOURCE_LANG_KEY = "translationSourceLanguage";

async function fetchWords(text: string, delay: number = 1_000, controller: {cancel?: boolean} = {}) {
    const wordRegex = /[^\p{P}\s\u4e00-\u9fff]+|[\u4e00-\u9fff]/gu;
    const words = [...text.matchAll(wordRegex)].map(match => match[0]);
    // shuffle order
    words.sort(() => Math.random() - 0.5);
    for (const word of words) {
        if (controller.cancel) {
            return;
        }
        if (word.length > 20) continue;
        const params = getTranslateWordParams(word);
        if (!fetchTranslations.hasCachedValue(params)) {
            console.log("fetching", word);
            await new Promise(resolve => setTimeout(resolve, delay));
            await fetchTranslations(params);
        }
    }
}

function fetchRandomWords() {
    async function go(controller: {cancel: boolean}) {
        const documentText = document.body.innerText;
        await fetchWords(documentText, 1_000, controller);
        await new Promise(resolve => setTimeout(resolve, 1_000));
        setTimeout(() => go(controller));
    }

    const myThis = fetchRandomWords as { cancel?: () => void };
    if (myThis.cancel) {
        myThis.cancel();
    }
    const controller = { cancel: false };
    go(controller);
    myThis.cancel = () => { controller.cancel = true; };
    return () => { controller.cancel = true; };
}

function getSourceLanguage(): string {
    const lang = myWindow.translationSourceLanguage || "auto";
    if (lang === "auto") {
        if (myWindow.lastLanguage && Date.now() - (myWindow.lastLanguageTime || 0) < 10_000) {
            return myWindow.lastLanguage;
        }
    }
    return lang;
}

function setSourceLanguage(lang: string) {
    myWindow.translationSourceLanguage = lang;
    localStorage.setItem(SOURCE_LANG_KEY, myWindow.translationSourceLanguage || "");
}

function getTargetLanguage() {
    return myWindow.translationTargetLanguage || "en";
}

function promptSourceLanguage() {
    const storedLang = localStorage.getItem(SOURCE_LANG_KEY);
    const defaultLang = document.documentElement.lang?.slice(0, 2) || "auto";
    let newLang;

    if (storedLang && !myWindow.translationSourceLanguage) {
        newLang = storedLang || defaultLang;
    } else {
        const topLanguageCodePrompt = topLanguageCodes.map(entry => `${entry.code} - ${entry.lang}`).join("\n");
        newLang = prompt("Source language\nauto - auto\n" + topLanguageCodePrompt, defaultLang);
    }
    if (newLang) {
        myWindow.translationSourceLanguage = newLang;
        localStorage.setItem(SOURCE_LANG_KEY, newLang);
    }
}

function getWordAtMousePosition(event: MouseEvent) {
    const [ text, offset ] = getRangeFromMouseEvent(event);
    if (text) {
        return getWordAtOffset(text, offset);
    }
}

function getTranslateWordParams(text: string): FetchTranslationsParams {
    return {
        sourceLanguage: getSourceLanguage(),
        targetLanguage: getTargetLanguage(),
        hostLanguage: navigator?.language?.slice(0, 2) || "en-US",
        query: text,
        type: ["t", "bd", "rm"],
    };
}

async function translateWordOnMouseMove(event: MouseEvent) {
    // ignore if mouse is over tooltip
    if (myWindow.translationTooltip?.isOver(event)) {
        return;
    }
    const myThis = translateWordOnMouseMove as { lastCalled?: number, cancel?: () => void };
    const lastCalled = myThis.lastCalled || 0;
    const debounceTime = 500;
    myThis.lastCalled = Date.now();
    const canFetch = Date.now() - lastCalled > debounceTime;
    const textToTranslate = getWordAtMousePosition(event);
    if (textToTranslate) {
        const params = getTranslateWordParams(textToTranslate);
        const cacheHit = fetchTranslations.hasCachedValue(params);
        if (!canFetch && !cacheHit) {
            if (myThis.cancel) {
                myThis.cancel();
            }
            const timeout = setTimeout(() => translateWordOnMouseMove(event), debounceTime);
            myThis.cancel = () => { clearTimeout(timeout); myThis.cancel = undefined; };
            myWindow.translationTooltip?.show(textToTranslate + ": ...");
            return;
        }
        let data = await fetchTranslations(params);
        const dict = data.dict?.[0];
        const entry = dict?.entry;
        const translits = data.sentences?.map(s => s.src_translit).filter(s => s) || [];
        const header = textToTranslate + (translits.length ? " (" + translits.join(" / ") + ")" : "");
        let explanation = "";
        if (entry && entry.length) {
            const mainTerms = entry.filter(entry => (entry.score || 0) > 0.25).map(entry => entry.word) || [];
            const minorTerms = entry.filter(entry => (entry.score || 0) <= 0.25).map(entry => entry.word).slice(0, 3) || [];
            explanation = mainTerms.join(" / ") + (minorTerms.length ? " (" + minorTerms.join(" / ") + ")" : "");
        } else if (data.sentences && data.sentences.length) {
            explanation = data.sentences?.map(s => s.trans).filter(s => s).join(" / ") || "";
        }
        if (explanation) {
            myWindow.translationTooltip?.show(header + ": " + explanation);
        }
    } else {
        myWindow.translationTooltip?.hide();
    }
}

async function translatePhraseOnMouseClick(event: MouseEvent) {
    const [ text, offset ] = getRangeFromMouseEvent(event);
    const maxPhraseLength = 100;
    const halfMaxPhrase = maxPhraseLength / 2;
    const roundOffset = Math.round(offset / halfMaxPhrase) * halfMaxPhrase;
    const textToTranslateFat = text.slice(
        clamp(roundOffset - halfMaxPhrase, 0, Math.max(0, text.length - maxPhraseLength)),
        clamp(roundOffset + halfMaxPhrase, Math.min(maxPhraseLength, text.length), text.length)
    );
    const textToTranslateTrimLeft = (
        (offset > halfMaxPhrase ? textToTranslateFat.replace(/^[^\p{P}\s]+\s*/u, "") : textToTranslateFat)
    );
    const textToTranslate = (
        (offset < text.length - halfMaxPhrase ? textToTranslateTrimLeft.replace(/\s*[^\p{P}\s]+$/u, "") : textToTranslateTrimLeft)
    );
    fetchWords(textToTranslate, 100);
    if (textToTranslate) {
        const params: FetchTranslationsParams = {
            sourceLanguage: getSourceLanguage(),
            targetLanguage: getTargetLanguage(),
            hostLanguage: navigator?.language?.slice(0, 2) || "en-US",
            query: textToTranslate,
            type: ["t", "rm"],
        };
        const data = await fetchTranslations(params);
        // console.log({text, offset, roundOffset, textToTranslate, data, params});
        myWindow.translationTooltip?.show(data.sentences?.map(s => s.trans || s.src_translit).join("\n") || "Error", 1000);
    }
}

function onMouseMove(event: MouseEvent) {
    myWindow.translationTooltip?.move(event);
    translateWordOnMouseMove(event);
}

function watchMouse() {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("click", translatePhraseOnMouseClick);
    return () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("click", translatePhraseOnMouseClick);
    };
}

function start() {
    myWindow.translationTooltip = new Tooltip();
    myWindow.translationTooltip.register();
    promptSourceLanguage();
    const cancelMouse = watchMouse();
    const cancelRandomWords = fetchRandomWords();
    myWindow.cancelTranslator = () => {
        cancelMouse();
        cancelRandomWords();
        delete myWindow.cancelTranslator;
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
} else {
    start();
}
