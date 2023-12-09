import { SingleTranslateResponse } from './SingleTranslateResponse';
import { cacheWithLocalStorage } from './cacheWithLocalStorage';

    // bd - dictionary, t - translation, at - alternate translations, ex - examples, rm - translilterate
export type TranslationType = "bd" | "t" | "at" | "ex" | "rm";

export interface FetchTranslationsParams {
    sourceLanguage: string;
    targetLanguage: string;
    hostLanguage: string;
    query: string;
    type: TranslationType | TranslationType[];
}

async function fetchTranslationsImpl(
    params: FetchTranslationsParams
): Promise<SingleTranslateResponse> {
    const { sourceLanguage, targetLanguage, hostLanguage, query, type } = params;
    const encodedQuery = encodeURIComponent(query);
    const dt = Array.isArray(type) ? type.join("&dt=") : type;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&hl=${hostLanguage}&dt=${dt}&dj=1&source=bubble&q=${encodedQuery}`;
    const response = await fetch(url);
    const data: SingleTranslateResponse = await response.json();
    return data;
}

export const fetchTranslations = cacheWithLocalStorage(fetchTranslationsImpl, 1000 * 3600 * 24 * 7);
