export function getRangeFromMouseEvent(event: MouseEvent): [Node | undefined, number] {
    let node: Node | undefined;
    let offset: number | undefined;
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
        return [node, offset];
    }
    return [undefined, 0];
}
