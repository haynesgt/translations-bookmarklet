export function getTextNextToElement(
    element: HTMLElement,
    length: number,
    direction: "next" | "previous" = "next"
): string {
    if (length <= 0) {
        return "";
    }
    const nextKey = direction === "next" ? "nextSibling" : "previousSibling";
    const parent = element.parentElement;
    const texts: string[] = [];
    for (let ei = element[nextKey]; ei; ei = ei[nextKey]) {
        const text = ei.textContent;
        if (text) {
            if (text.length >= length) {
                if (direction === "previous") {
                    texts.push(text.slice(-length));
                } else {
                    texts.push(text.slice(0, length));
                }
                length -= text.length;
                break;
            }
            texts.push(text);
            length -= text.length;
        }
    }
    if (length && parent) {
        texts.push(getTextNextToElement(parent, length));
    }
    if (direction === "previous") {
        texts.reverse();
    }
    return texts.join("");
}

export function getTextSurroundingElement(
    element: HTMLElement,
    before: number,
    after: number,
): string[] {
    return [getTextNextToElement(element, before, "previous"), getTextNextToElement(element, after, "next")];
}
