function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export class Tooltip {
    private element?: HTMLDivElement;
    private hideTimeout?: number;
    private freezeUntil: number = 0;
    private position = { x: 0, y: 0 };

    register() {
        const tooltip = document.createElement("div");
        Object.assign(tooltip.style, {
            position: "fixed",
            display: "none",
            pointerEvents: "none",
            zIndex: "1000",
            backgroundColor: "white",
            color: "black",
            padding: "2px",
            border: "1px solid black",
            borderRadius: "2px",
            left: "0px",
            top: "0px",
        });
        document.body.appendChild(tooltip);
        this.element = tooltip;
        this.freezeUntil = 0;
    }

    unregister() {
        if (!this.requireElement()) {
            return;
        }
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            delete this.hideTimeout;
        }
        document.body.removeChild(this.element!);
        delete this.element;
    }

    requireElement(): HTMLDivElement {
        if (this.element == undefined) {
            throw new Error("Tooltip is not registered");
        }
        return this.element;
    }

    setPosition(x: number, y: number, adjust: boolean) {
        const element = this.requireElement();
        const docWidth = document.documentElement.offsetWidth;
        const docHeight = window.innerHeight;
        if (adjust) {
            console.log(x, y, docHeight);
            y += ((y < docHeight * 3 / 4) ? 30 : -30);
            console.log(x, y, "");
        }
        const xClamp = clamp(x - element.offsetWidth / 2, 0, docWidth - element.offsetWidth);
        const yClamp = clamp(y, element.offsetHeight, docHeight - element.offsetHeight);
        // transform should have lower latency than left/top
        element.style.transform = `translate(${xClamp}px, ${yClamp}px)`;
        // this.element.style.left = `${x}px`;
        // this.element.style.top = `${y}px`;
        Object.assign(this.position, { x, y });
    }

    reposition() {
        this.setPosition(this.position.x, this.position.y, false);
    }

    move(event: MouseEvent) {
        requestAnimationFrame(() => {
            this.setPosition(event.clientX, event.clientY, true);
        });

    }

    show(text: string, freezForMs: number = 0) {
        const element = this.requireElement();
        const now = Date.now();
        if (now < this.freezeUntil) {
            return;
        }
        element.style.display = "block";
        element.innerText = text;
        this.freezeUntil = now + freezForMs;
        // this.hideAfterTimeout(30_000);
        this.reposition();
    }

    hideAfterTimeout(ms: number) {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        this.hideTimeout = setTimeout(() => this.hide(), ms);
    }

    hide() {
        const element = this.requireElement();
        element.style.display = "none";
    }

    isOver(event: MouseEvent) {
        const element = this.requireElement();
        const rect = element.getBoundingClientRect();
        const x = event.clientX;
        const y = event.clientY;
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }
}
