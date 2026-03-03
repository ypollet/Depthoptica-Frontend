export class EmptyQueueError extends Error{
    constructor() {
        super("The queue is empty");

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, EmptyQueueError.prototype);
    }
}