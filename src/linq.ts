export interface ISequence<T> extends Iterable<T> {
    /** Map each element to another */
    map<TResult>(f: (arg: T) => TResult): TypedISequence<TResult>

    /** Filters with a TS type assertion ('is'), narrowing to that type */
    where<TResult = T>(f: (arg: T | TResult) => arg is TResult): TypedISequence<TResult>
    /** Filters with a boolean predicate */
    where<TResult extends T>(f: (arg: T | TResult) => boolean): TypedISequence<TResult>
    /** Filters with a predicate that must return a truthy value */
    where<TResult extends T>(f: (arg: T | TResult) => any): TypedISequence<TResult>

    /** Counts the number of elements in the sequence */
    count(): number
}

export interface INumberSequence extends ISequence<number> {
    sum(): number
    average(): number
}

export type SequenceTypes<T> = T extends ISequence<infer Y> ? Y : never;

class Sequence<T> implements ISequence<T> {
    constructor(protected iterable: Iterable<T>) {
    }

    map<TResult>(f: (arg: T) => TResult): TypedISequence<TResult> {
        const iterable: Iterable<TResult> = {
            [Symbol.iterator]: () => {
                const parent = this.iterable[Symbol.iterator]();
                return {
                    next(): IteratorResult<TResult> {
                        const next = parent.next();
                        if (next.done) {
                            return next;
                        } else {
                            return {
                                done: false,
                                value: f(next.value)
                            };
                        }
                    }
                }
            }
        }

        return new Sequence(iterable) as unknown as TypedISequence<TResult>;
    }

    where<TResult = T>(f: (arg: T | TResult) => arg is TResult): TypedISequence<TResult>
    where<TResult extends T>(f: (arg: T | TResult) => boolean): TypedISequence<TResult>
    where<TResult extends T>(f: (arg: T | TResult) => any): TypedISequence<TResult> {
        const iterable: Iterable<TResult> = {
            [Symbol.iterator]: () => {
                const parent = this.iterable[Symbol.iterator]();
                return {
                    next(): IteratorResult<TResult> {
                        while (true) {
                            const next = parent.next();
                            if (next.done) return next;

                            if (f(next.value)) {
                                return next as unknown as IteratorYieldResult<TResult>;
                            }
                        }
                    }
                }
            }
        }

        return new Sequence(iterable) as unknown as TypedISequence<TResult>;
    }

    count() {
        let count = 0;
        for (const _ of this.iterable) count++;
        return count;
    }

    sum() {
        // in types we make sure sum is only allowed on number types.
        let value = 0;
        for (const x of this.iterable) {
            value += x as unknown as number;
        }
        return value;
    }

    average() {
        let value = 0;
        let count = 0;
        for (const x of this.iterable) {
            value += x as unknown as number;
            count++;
        }
        return value / count;
    }

    // debug
    // *[Symbol.iterator]() {
    //     for (const x of this.iterable) {
    //         console.log('output', x);
    //         yield x;
    //     }
    // }

    [Symbol.iterator]() {
        return this.iterable[Symbol.iterator]();
    }
}

type Test = Sequence<number> extends INumberSequence ? true : false;
// Test should be true!

// disable Distributive Conditional Types
type TypedISequence<T> = [T] extends [number] ? INumberSequence : ISequence<T>;

export function from<T>(arg: Iterable<T>): TypedISequence<T> {
    return new Sequence(arg) as unknown as TypedISequence<T>;
}

export default from;
