export interface ISequence<T> extends Iterable<T> {
    /** Map each element to another */
    map<TResult>(f: (arg: T) => TResult): TypedISequence<TResult>

    /** Filters with a TS type assertion ('is'), narrowing to that type */
    where<TResult = T>(f: (arg: T | TResult) => arg is TResult): TypedISequence<TResult>
    /** Filters with a boolean predicate */
    where<TResult extends T>(f: (arg: T | TResult) => boolean): TypedISequence<TResult>
    /** Filters with a predicate that must return a truthy value */
    where<TResult extends T>(f: (arg: T | TResult) => any): TypedISequence<TResult>

    /** Reverses the sequence. */
    reverse(): TypedISequence<T>

    groupBy<TKey, TProject = T>(keySelector: (arg: T) => TKey): ISequence<TypedIKeySequence<TKey, TProject>>
    groupBy<TKey, TProject = T>(keySelector: (arg: T) => TKey, elementSelector?: (arg: T) => TProject): ISequence<TypedIKeySequence<TKey, TProject>>

    /** Counts the number of elements in the sequence */
    count(): number

    /**
     * Converts this sequence to an array.  
     * Note: If you are using this Sequence in a for..of loop, you do _not_ need this --
     *       you can use the sequence directly.
    */
    toArray(): T[]
}

export interface INumberSequence extends ISequence<number> {
    sum(): number
    average(): number
}

export interface IKeySequence<TKey, TElement> extends ISequence<TElement> {
    readonly key: TKey;
}
export type INumberKeySequence<TKey> = IKeySequence<TKey, number> & INumberSequence;

// disable Distributive Conditional Types
export type TypedISequence<T> = [T] extends [number] ? INumberSequence : ISequence<T>;
export type TypedIKeySequence<TKey, TElement> = [TElement] extends [number] ? INumberKeySequence<TKey> : IKeySequence<TKey, TElement>;

export type SequenceTypes<T> = T extends ISequence<infer Y> ? Y : never;

function wrappedIterator<T, TOut = T>(parentIterable: Iterable<T>, f: (iterator: Iterator<T>) => () => IteratorResult<TOut>) {
    const iterable: Iterable<TOut> = {
        [Symbol.iterator]: () => {
            const parentIterator = parentIterable[Symbol.iterator]();
            const next = f(parentIterator);
            return {
                next
            };
        }
    }
    return iterable;
}
function wrappedIterable<T, TOut = T>(parentIterable: Iterable<T>, f: (iterable: Iterable<T>) => () => IteratorResult<TOut>) {
    const iterable: Iterable<TOut> = {
        [Symbol.iterator]: () => {
            const next = f(parentIterable);
            return {
                next
            };
        }
    }
    return iterable;
}

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

    reverse() {
        const wrapped = wrappedIterable(this.iterable, function (iterable) {
            const items = Array.from(iterable);
            let position = items.length;

            return () => {
                if (position === 0) {
                    return {
                        done: true
                    } as IteratorReturnResult<T>;
                } else {
                    return {
                        done: false,
                        value: items[--position]
                    }
                }
            }
        });

        return new Sequence(wrapped) as unknown as TypedISequence<T>;
    }

    groupBy<TKey, TProject = T>(keySelector: (arg: T) => TKey): ISequence<TypedIKeySequence<TKey, TProject>>
    groupBy<TKey, TProject = T>(keySelector: (arg: T) => TKey, elementSelector?: (arg: T) => TProject): ISequence<TypedIKeySequence<TKey, TProject>> {
        const wrapped = wrappedIterator<T, TypedIKeySequence<TKey, TProject>>(this.iterable, function (iterator) {
            const map = new Map<TKey, TProject[]>();
            while (true) {
                const n = iterator.next();
                if (n.done) break;
                const item = n.value;
                const key = keySelector(item);
                const element = elementSelector ? elementSelector(item) : (item as unknown as TProject);
                const bucket = map.get(key);
                if (bucket === undefined) map.set(key, [element]);
                else bucket.push(element);
            }

            // now, since we have collected everything, create an output sequence.
            // we could nearly return the Map directly, but we'll take control for now.
            const mapIterator = map[Symbol.iterator]();

            return () => {
                const result = mapIterator.next();
                if (result.done) return result;

                const [key, value] = result.value;
                return {
                    value: new KeySequence(value, key) as unknown as TypedIKeySequence<TKey, TProject>
                };
            };
        });

        return new Sequence(wrapped);
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

    toArray() {
        return Array.from(this);
    }

    [Symbol.iterator]() {
        return this.iterable[Symbol.iterator]();
    }
}

class KeySequence<TKey, TElement> extends Sequence<TElement> implements IKeySequence<TKey, TElement> {
    constructor(protected iterable: Iterable<TElement>, public readonly key: TKey) {
        super(iterable);
    }
}

type Test = Sequence<number> extends INumberSequence ? true : false;
// Test should be true!

export function from<T>(arg: Iterable<T>): TypedISequence<T> {
    return new Sequence(arg) as unknown as TypedISequence<T>;
}

export default from;
