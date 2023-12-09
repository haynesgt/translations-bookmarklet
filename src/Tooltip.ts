function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export class Tooltip {
    private element: HTMLDivElement;
    private hideTimeout?: number;
    private freezeUntil: number = 0;
    private lastPosition: { x: number, y: number } = { x: 0, y: 0 };

    constructor() {
        const tooltip = document.createElement("div");
        Object.assign(tooltip.style, {
            position: "fixed",
            display: "none",
            pointerEvents: "none",
            zIndex: "1000",
            backgroundColor: "white",
            padding: "2px",
            border: "1px solid black",
            borderRadius: "2px",
            left: "0px",
            top: "0px",
        });
        document.body.appendChild(tooltip);
        this.element = tooltip;
    }

    move(event: MouseEvent) {
        requestAnimationFrame(() => {
            const docWidth = document.documentElement.offsetWidth;
            const docHeight = document.documentElement.offsetHeight;
            const x = clamp(event.clientX - this.element.offsetWidth / 2, 0, docWidth - this.element.offsetWidth);
            const y = clamp(event.clientY + 30, 0, window.innerHeight - this.element.offsetHeight);
            // this.element.style.transform = `translate(${x}px, ${y}px)`;
            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
            this.lastPosition = { x, y };
        });

    }

    show(text: string, freezForMs: number = 0) {
        const now = Date.now();
        if (now < this.freezeUntil) {
            return;
        }
        this.element.style.display = "block";
        this.element.innerText = text;
        this.freezeUntil = now + freezForMs;
        this.hideAfterTimeout(30_000);
    }

    hideAfterTimeout(ms: number) {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        this.hideTimeout = setTimeout(() => this.hide(), ms);
    }

    hide() {
        this.element.style.display = "none";
    }

    isOver(event: MouseEvent) {
        const rect = this.element.getBoundingClientRect();
        const x = event.clientX;
        const y = event.clientY;
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }
}
