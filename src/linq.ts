import { reverse } from './enumerable.js'

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

    /** Project each element to get a key, and group all items by that key. */
    groupBy<TKey, TProject = T>(keySelector: (arg: T) => TKey): ISequence<TypedIKeySequence<TKey, TProject>>
    /** Project each element to get a key, and group all items, each projected onto another type. */
    groupBy<TKey, TProject = T>(keySelector: (arg: T) => TKey, elementSelector?: (arg: T) => TProject): ISequence<TypedIKeySequence<TKey, TProject>>

    /** Sort the array in ascending order of the selector */
    orderBy(keySelector: (arg: T) => string | number): TypedIOrderedSequence<T>;
    /** Sort the array in ascending order of the selector, with a custom comparer */
    orderBy<TKey>(keySelector: (arg: T) => TKey, comparer: ICompare<TKey>): TypedIOrderedSequence<T>

    /** Sort the array in descending order of the selector */
    orderByDescending(keySelector: (arg: T) => string | number): TypedIOrderedSequence<T>;
    /** Sort the array in descending order of the selector, with a custom comparer */
    orderByDescending<TKey>(keySelector: (arg: T) => TKey, comparer: ICompare<TKey>): TypedIOrderedSequence<T>

    /** Counts the number of elements in the sequence */
    count(): number

    /**
     * Converts this sequence to an array.  
     * Note: If you are using this Sequence in a for..of loop, you do _not_ need this --
     *       you can use the sequence directly.
    */
    toArray(): T[]

    /**
     * Converts this sequence to a Map.
     */
    toMap<TKey, TElement>(keySelector: (arg: T) => TKey, elementSelector: (arg: T) => TElement): Map<TKey, TElement>;

    /**
     * Get the first element in the sequence.
     * Will throw if empty! Use defaultIfEmpty(default).first() if no throw is wanted.
     */
    first(): T;
    /**
     * Get the first element in the sequence that matches a condition.
     * Will throw if empty!
     */
    first(predicate: (arg: T) => any): T;

    /**
     * Get the first element in the sequence.
     * If empty, returns undefined.
     */
    firstOrDefault(): T | undefined;
    /**
     * Get the first element in the sequence that matches a condition.
     * If empty or no matches, returns undefined.
     */
    firstOrDefault(predicate: (arg: T) => any): T | undefined;

    /**
     * Get the _only_ element in the sequence.
     * Will throw if empty or more than one element! Use defaultIfEmpty(default).single() if no throw is wanted.
     */
    single(): T
    /**
     * Get the _only_ element in the sequence that matches a condition.
     * Will throw if empty or more than one element! Use defaultIfEmpty(default).single() if no throw is wanted.
     */
    single(predicate: (arg: T) => any): T;

    /**
     * Get the _only_ element in the sequence.
     * Returns undefined if empty or more than one element.
     */
    singleOrDefault(): T | undefined
    /**
     * Get the _only_ element in the sequence that matches a condition.
     * @returns undefined if empty or more than one element.
     */
    singleOrDefault(predicate: (arg: T) => any): T | undefined;
}

export interface INumberSequence extends ISequence<number> {
    sum(): number
    average(): number
}

export interface IKeySequence<TKey, TElement> extends ISequence<TElement> {
    readonly key: TKey;
}
export type INumberKeySequence<TKey> = IKeySequence<TKey, number> & INumberSequence;

export interface IOrderedSequence<T> extends ISequence<T> {
    /** Next, sort the array in ascending order of the selector */
    thenBy(keySelector: (arg: T) => string | number): TypedIOrderedSequence<T>;
    /** Next, sort the array in ascending order of the selector, with a custom comparer */
    thenBy<TKey>(keySelector: (arg: T) => TKey, comparer: ICompare<TKey>): TypedIOrderedSequence<T>

    /** Next, sort the array in descending order of the selector */
    thenByDescending(keySelector: (arg: T) => string | number): TypedIOrderedSequence<T>;
    /** Next, sort the array in descending order of the selector, with a custom comparer */
    thenByDescending<TKey>(keySelector: (arg: T) => TKey, comparer: ICompare<TKey>): TypedIOrderedSequence<T>
}
export type INumberOrderedSequence<T> = IOrderedSequence<T> & INumberSequence;

// disable Distributive Conditional Types
export type TypedISequence<T> = [T] extends [number] ? INumberSequence : ISequence<T>;
export type TypedIKeySequence<TKey, TElement> = [TElement] extends [number] ? INumberKeySequence<TKey> : IKeySequence<TKey, TElement>;
export type TypedIOrderedSequence<T> = [T] extends [number] ? INumberOrderedSequence<T> : IOrderedSequence<T>;
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

class Sequence<T> implements ISequence<T> {
    constructor(protected iterable: Iterable<T>) {
    }

    map<TResult>(f: (arg: T) => TResult): TypedISequence<TResult> {
        const mapped = wrappedIterator(this.iterable, iterable => {
            return () => {
                const next = iterable.next();
                if (next.done) {
                    return next;
                } else {
                    return {
                        value: f(next.value)
                    };
                }
            }
        });

        return new Sequence(mapped) as unknown as TypedISequence<TResult>;
    }

    where<TResult = T>(f: (arg: T | TResult) => arg is TResult): TypedISequence<TResult>
    where<TResult extends T>(f: (arg: T | TResult) => boolean): TypedISequence<TResult>
    where<TResult extends T>(f: (arg: T | TResult) => any): TypedISequence<TResult> {
        const whered = wrappedIterator(this.iterable, iterator => {
            return () => {
                while (true) {
                    const next = iterator.next();
                    if (next.done) return next;

                    if (f(next.value)) {
                        return next as unknown as IteratorYieldResult<TResult>;
                    }
                }
            }
        });

        return new Sequence(whered) as unknown as TypedISequence<TResult>;
    }

    reverse() {
        return new Sequence(reverse(this.iterable)) as unknown as TypedISequence<T>;
    }

    groupBy<TKey, TProject = T>(keySelector: (arg: T) => TKey): ISequence<TypedIKeySequence<TKey, TProject>>
    groupBy<TKey, TProject = T>(keySelector: (arg: T) => TKey, elementSelector?: (arg: T) => TProject): ISequence<TypedIKeySequence<TKey, TProject>> {
        const grouped = wrappedIterator<T, TypedIKeySequence<TKey, TProject>>(this.iterable, iterator => {
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

        return new Sequence(grouped);
    }

    orderBy<TKey>(selector: (arg: T) => TKey, comparer?: ICompare<TKey>) {
        return new OrderedSequence(this.iterable, [{
            selector, comparer: (comparer as ICompare<unknown>) ?? defaultComparer, ascending: true
        }]) as unknown as TypedIOrderedSequence<T>;
    }

    orderByDescending<TKey>(selector: (arg: T) => TKey, comparer?: ICompare<TKey>) {
        return new OrderedSequence(this.iterable, [{
            selector, comparer: (comparer as ICompare<unknown>) ?? defaultComparer, ascending: false
        }]) as unknown as TypedIOrderedSequence<T>;
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
        // in types we make sure average is only allowed on number types.
        let value = 0;
        let count = 0;
        for (const x of this.iterable) {
            value += x as unknown as number;
            count++;
        }
        return value / count;
    }

    toArray() {
        return Array.from(this);
    }

    toMap<TKey, TElement>(keySelector: (arg: T) => TKey, elementSelector: (arg: T) => TElement) {
        const map = new Map<TKey, TElement>();
        for (const e of this.iterable) {
            map.set(keySelector(e), elementSelector(e));
        }
        return map;
    }

    first(): T
    first(predicate: (arg: T) => any): T
    first(predicate?: (arg: T) => any): T {
        if (predicate) return (this.where(predicate) as unknown as Sequence<T>).first();

        const iterator = this.iterable[Symbol.iterator]();
        const result = iterator.next();
        if (result.done) throw new Error('Sequence was empty');
        return result.value;
    }

    firstOrDefault(): T | undefined
    firstOrDefault(predicate: (arg: T) => any): T | undefined;
    firstOrDefault(predicate?: (arg: T) => any): T | undefined {
        if (predicate) return (this.where(predicate) as unknown as Sequence<T>).firstOrDefault();

        const iterator = this.iterable[Symbol.iterator]();
        const result = iterator.next();
        return result.value as unknown as T | undefined;
    }

    single(): T
    single(predicate: (arg: T) => any): T
    single(predicate?: (arg: T) => any): T {
        if (predicate) return (this.where(predicate) as unknown as Sequence<T>).single();

        const iterator = this.iterable[Symbol.iterator]();
        const result1 = iterator.next();
        if (result1.done) throw new Error('Sequence was empty');
        const result2 = iterator.next();
        if (!result2.done) throw new Error('Sequence had 2 or more elements');

        return result1.value;
    }

    singleOrDefault(): T | undefined
    singleOrDefault(predicate: (arg: T) => any): T | undefined
    singleOrDefault(predicate?: (arg: T) => any): T | undefined {
        if (predicate) return (this.where(predicate) as unknown as Sequence<T>).singleOrDefault();

        const iterator = this.iterable[Symbol.iterator]();
        const result1 = iterator.next();
        if (result1.done) return undefined;
        const result2 = iterator.next();
        if (!result2.done) return undefined;

        return result1.value;
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

class KeySequence<TKey, TElement> extends Sequence<TElement> implements IKeySequence<TKey, TElement> {
    constructor(iterable: Iterable<TElement>, public readonly key: TKey) {
        super(iterable);
    }
}

type ICompare<T> = (a: T, b: T) => number
type SelectorComparer<T> = {
    selector: (arg: T) => unknown,
    comparer: ICompare<unknown>,
    ascending: boolean
}

const defaultComparer: ICompare<any> = (a: any, b: any) => a > b ? 1 : a < b ? -1 : 0;

class OrderedSequence<T> extends Sequence<T> implements IOrderedSequence<T> {
    constructor(iterable: Iterable<T>, protected sc: SelectorComparer<T>[]) {
        super(iterable);
    }

    thenBy<TKey>(selector: (arg: T) => TKey, comparer?: ICompare<TKey>) {
        return new OrderedSequence(this.iterable, [...this.sc, {
            selector, comparer: (comparer as ICompare<unknown>) ?? defaultComparer, ascending: true
        }]) as unknown as TypedIOrderedSequence<T>;
    }

    thenByDescending<TKey>(selector: (arg: T) => TKey, comparer?: ICompare<TKey>) {
        return new OrderedSequence(this.iterable, [...this.sc, {
            selector, comparer: (comparer as ICompare<unknown>) ?? defaultComparer, ascending: false
        }]) as unknown as TypedIOrderedSequence<T>
    }

    [Symbol.iterator]() {
        const elements = Array.from(this.iterable);
        elements.sort((a, b) => {
            for (const compare of this.sc) {
                let result = compare.comparer(compare.selector(a), compare.selector(b));
                if (!compare.ascending) result = -result;
                // if non zero, the compare functions were not the same
                // thus, we return.
                if (result !== 0) return result;
            }
            // all comparators were the same, so keep the same order.
            return 0;
        });
        return elements[Symbol.iterator]();
    }
}

type Test = Sequence<number> extends INumberSequence ? true : false;
// Test should be true!

export function from<T>(arg: Iterable<T>): TypedISequence<T> {
    return new Sequence(arg) as unknown as TypedISequence<T>;
}

export default from;
