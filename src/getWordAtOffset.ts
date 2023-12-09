// see https://www.compart.com/en/unicode
const wordChar = `[\\p{L}\\p{N}\\p{M}\\p{Pd}']`;

export function getWordAtOffset(text: string, offset: number): string | undefined {
    const before = text.slice(0, offset);
    const after = text.slice(offset);
    // chinese
    if ((before.slice(-1) + after.slice(0, 1)).match(/^[\u4e00-\u9fff]/)) {
        return after[0];
    }
    const beforeMatch = before.match(new RegExp(`(${wordChar}*)$`, "u"));
    const afterMatch = after.match(new RegExp(`^(${wordChar}+)`, "u"));
    if (!afterMatch && !beforeMatch) {
        return;
    }
    const word = (beforeMatch && beforeMatch[1] || "") + (afterMatch && afterMatch[1] || "");
    return word;
}