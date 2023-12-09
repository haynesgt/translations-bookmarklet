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
        const params: FetchTranslationsParams = {
            sourceLanguage: getSourceLanguage(),
            targetLanguage: getTargetLanguage(),
            hostLanguage: navigator?.language?.slice(0, 2) || "en-US",
            query: textToTranslate,
            type: ["bd", "rm"],
        };
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
        if (!data.dict) {
            params.type = ["t", "rm"];
            data = await fetchTranslations(params);
        }
         console.log({textToTranslate, data, params});
        const dict = data.dict?.[0];
        const entry = dict?.entry;
        const translits = data.sentences?.map(s => s.src_translit).filter(s => s) || [];
        const header = textToTranslate + (translits.length ? " (" + translits.join(" / ") + ")" : "");
        if (entry && entry.length) {
            const mainTerms = entry.filter(entry => (entry.score || 0) > 0.25).map(entry => entry.word) || [];
            const minorTerms = entry.filter(entry => (entry.score || 0) <= 0.25).map(entry => entry.word).slice(0, 3) || [];
            myWindow.translationTooltip?.show(
                header + ": " + mainTerms.join(" / ") + (minorTerms.length ? " (" + minorTerms.join(" / ") + ")" : "")
            );
        } else if (data.sentences && data.sentences.length) {
            myWindow.translationTooltip?.show(
                header + ": " + data.sentences?.map(s => s.trans).filter(s => s).join(" / ") || "Error"
            );
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
        (offset > halfMaxPhrase ? textToTranslateFat.replace(/^[^\s]+\s*/, "") : textToTranslateFat)
    );
    const textToTranslate = (
        (offset < text.length - halfMaxPhrase ? textToTranslateTrimLeft.replace(/\s*[^\s]+$/, "") : textToTranslateTrimLeft)
    );
    if (textToTranslate) {
        const params: FetchTranslationsParams = {
            sourceLanguage: getSourceLanguage(),
            targetLanguage: getTargetLanguage(),
            hostLanguage: navigator?.language?.slice(0, 2) || "en-US",
            query: textToTranslate,
            type: ["t", "rm"],
        };
        const data = await fetchTranslations(params);
        console.log({text, offset, roundOffset, textToTranslate, data, params});
        myWindow.translationTooltip?.show(data.sentences?.map(s => s.trans || s.src_translit).join("\n") || "Error", 1000);
    }
}

function onMouseMove(event: MouseEvent) {
    myWindow.translationTooltip?.move(event);
    translateWordOnMouseMove(event);
}

function watchMouse() {
    if (myWindow.cancelTranslator) {
        myWindow.cancelTranslator();
        delete myWindow.cancelTranslator;
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("click", translatePhraseOnMouseClick);
    myWindow.cancelTranslator = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("click", translatePhraseOnMouseClick);
    };
}

function start() {
    myWindow.translationTooltip = new Tooltip();
    promptSourceLanguage();
    watchMouse();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
} else {
    start();
}
