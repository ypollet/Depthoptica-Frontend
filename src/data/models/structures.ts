import { EmptyQueueError } from "./errors";

export class Deque<T> {

    private _array: T[] ;
    private _maxLength : number

    constructor(maxLength : number = -1){
        this._array = []
        this._maxLength = maxLength
    }

    get length() {
        return this._array.length
    }

    get first(): T | undefined {
        if (this.isEmpty()) return undefined;
        return this._array[0];
    }

    get last(): T | undefined{
        if (this.isEmpty()) return undefined;
        return this._array[this._array.length-1];
    }

    forEach(callback : (a : T) => void) {
        this._array.forEach((item) => callback(item))
    }


    add(data: T): void {
        if(this.isFull()){
            this.popFirst()
        }
        this._array.push(data);
        
    }


    popFirst(): T | undefined {
        if (this.isEmpty()) throw new EmptyQueueError();
        return this._array.shift();
    }

    popLast(): T | undefined {
        if (this.isEmpty()) throw new EmptyQueueError();
        return this._array.pop();
    }
    

    isEmpty(): boolean {
        return this._array.length === 0;
    }
    isFull(): boolean {
        return this._maxLength > 0 && this._array.length === this._maxLength;
    }

    toJSON() {
        return {array: this._array, maxLength: this._maxLength}
    }
}
