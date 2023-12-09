export function getRangeFromMouseEvent(event: MouseEvent): [string, number] {
    let node;
    let offset;
    const documentAsAny: Document | any = document as any;
    if (documentAsAny.caretPositionFromPoint) {
        const position = documentAsAny.caretPositionFromPoint(event.clientX, event.clientY);
        if (position) {
            node = position.offsetNode;
            offset = position.offset;
        }
    } else if (documentAsAny.caretRangeFromPoint) {
        const range: Range | null = documentAsAny.caretRangeFromPoint(event.clientX, event.clientY);
        if (range) {
            node = range.startContainer;
            offset = range.startOffset;
        }
    }
    if (node && node.textContent && offset !== undefined) {
        return [node.textContent, offset];
    }
    return ["", 0];
}
