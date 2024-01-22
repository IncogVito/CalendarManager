export class SimpleIterator<T> {
    private items: T[];
    private index: number;
    private currentValue: T;
    private done: boolean = false;

    constructor(items: T[]) {
        this.items = items;
        this.index = -1;
        this.currentValue = undefined;
        this.done = items.length === 0;
    }

    next(): void {
        if (this.index < this.items.length) {
            this.index++;
            this.currentValue = this.items[this.index];
        } else {
            this.done = true;
        }
    }

    hasNext(): boolean {
        return this.items.length > 0 && this.index < (this.items.length - 1);
    }

    getValue(): T {
        return this.currentValue;
    }

    reset(): void {
        this.index = -1;
        this.currentValue = undefined;
        this.done = this.items.length === 0;
    }
}