import { groupBy, map, reverse, skip, skipWhile, take, takeWhile, where } from './enumerable.js'

type Predicate<T> = (arg: T) => any

interface BaseSequence<T> extends Iterable<T> {
    /** Map each element to another */
    map<TResult>(f: (arg: T) => TResult): Sequence<TResult>

    /** Filters with a TS type assertion ('is'), narrowing to that type */
    where<TResult = T>(f: (arg: T | TResult) => arg is TResult): Sequence<TResult>
    /** Filters with a boolean predicate */
    where<TResult extends T>(f: (arg: T | TResult) => boolean): Sequence<TResult>
    /** Filters with a predicate that must return a truthy value */
    where<TResult extends T>(f: Predicate<T | TResult>): Sequence<TResult>

    /** Reverses the sequence. */
    reverse(): Sequence<T>

    /** Project each element to get a key, and group all items by that key. */
    groupBy<TKey, TProject = T>(keySelector: (arg: T) => TKey): BaseSequence<KeySequence<TKey, TProject>>
    /** Project each element to get a key, and group all items, each projected onto another type. */
    groupBy<TKey, TProject = T>(keySelector: (arg: T) => TKey, elementSelector?: (arg: T) => TProject): BaseSequence<KeySequence<TKey, TProject>>

    /** Sort the array in ascending order of the selector */
    orderBy(keySelector: (arg: T) => string | number): OrderedSequence<T>;
    /** Sort the array in ascending order of the selector, with a custom comparer */
    orderBy<TKey>(keySelector: (arg: T) => TKey, comparer: ICompare<TKey>): OrderedSequence<T>

    /** Sort the array in descending order of the selector */
    orderByDescending(keySelector: (arg: T) => string | number): OrderedSequence<T>;
    /** Sort the array in descending order of the selector, with a custom comparer */
    orderByDescending<TKey>(keySelector: (arg: T) => TKey, comparer: ICompare<TKey>): OrderedSequence<T>

    /** Take a maximum amount of elements */
    take(count: number): Sequence<T>;

    /** Take elements while the predicate is true, then skips the rest */
    takeWhile(predicate: Predicate<T>): Sequence<T>;

    /** Skip a number of elements before letting the rest through */
    skip(count: number): Sequence<T>;

    /** Skip elements while the predicate is true, then take the rest */
    skipWhile(predicate: Predicate<T>): Sequence<T>;

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

    /** Converts this sequence into an object */
    toObject<TKey extends PropertyKey, TElement>(keySelector: (arg: T) => TKey, elementSelector: (arg: T) => TElement): Record<TKey, TElement>;

    /**
     * Get the first element in the sequence.
     * Will throw if empty! Use defaultIfEmpty(default).first() if no throw is wanted.
     */
    first(): T;
    /**
     * Get the first element in the sequence that matches a condition.
     * Will throw if empty!
     */
    first(predicate: Predicate<T>): T;

    /**
     * Get the first element in the sequence.
     * If empty, returns undefined.
     */
    firstOrDefault(): T | undefined;
    /**
     * Get the first element in the sequence that matches a condition.
     * If empty or no matches, returns undefined.
     */
    firstOrDefault(predicate: Predicate<T>): T | undefined;

    /**
     * Get the _only_ element in the sequence.
     * Will throw if empty or more than one element! Use defaultIfEmpty(default).single() if no throw is wanted.
     */
    single(): T
    /**
     * Get the _only_ element in the sequence that matches a condition.
     * Will throw if empty or more than one element! Use defaultIfEmpty(default).single() if no throw is wanted.
     */
    single(predicate: Predicate<T>): T;

    /**
     * Get the _only_ element in the sequence.
     * Returns undefined if empty or more than one element.
     */
    singleOrDefault(): T | undefined
    /**
     * Get the _only_ element in the sequence that matches a condition.
     * @returns undefined if empty or more than one element.
     */
    singleOrDefault(predicate: Predicate<T>): T | undefined;

    /** True if all elements pass the predicate */
    all(predicate: Predicate<T>): boolean

    /** True if any elements pass the predicate */
    any(predicate: Predicate<T>): boolean

    /** True if no elements pass the predicate */
    none(predicate: Predicate<T>): boolean
}
type NumberSequence<T> = BaseSequence<T> & {
    sum(): number
    average(): number
}
interface BaseKeySequence<TKey, TElement> extends BaseSequence<TElement> {
    readonly key: TKey;
}
interface BaseOrderedSequence<T> extends BaseSequence<T> {
    /** Next, sort the array in ascending order of the selector */
    thenBy(keySelector: (arg: T) => string | number): OrderedSequence<T>;
    /** Next, sort the array in ascending order of the selector, with a custom comparer */
    thenBy<TKey>(keySelector: (arg: T) => TKey, comparer: ICompare<TKey>): OrderedSequence<T>

    /** Next, sort the array in descending order of the selector */
    thenByDescending(keySelector: (arg: T) => string | number): OrderedSequence<T>;
    /** Next, sort the array in descending order of the selector, with a custom comparer */
    thenByDescending<TKey>(keySelector: (arg: T) => TKey, comparer: ICompare<TKey>): OrderedSequence<T>
}

// disable Distributive Conditional Types
export type Sequence<T> = [T] extends [number] ? NumberSequence<T> : BaseSequence<T>;
export type KeySequence<TKey, TElement> = BaseKeySequence<TKey, TElement> & Sequence<TElement>;
export type OrderedSequence<T> = BaseOrderedSequence<T> & Sequence<T>;

export type SequenceTypes<T> = T extends BaseSequence<infer Y> ? Y : never;

class SequenceKlass<T> implements BaseSequence<T> {
    constructor(protected iterable: Iterable<T>) {
    }

    map<TResult>(f: (arg: T) => TResult): Sequence<TResult> {
        return new SequenceKlass(map(this.iterable, f)) as unknown as Sequence<TResult>;
    }

    where<TResult = T>(f: (arg: T | TResult) => arg is TResult): Sequence<TResult>
    where<TResult extends T>(f: (arg: T | TResult) => boolean): Sequence<TResult>
    where<TResult extends T>(f: (arg: T | TResult) => any): Sequence<TResult> {
        return new SequenceKlass(where(this.iterable, f)) as unknown as Sequence<TResult>;
    }

    reverse() {
        return new SequenceKlass(reverse(this.iterable)) as unknown as Sequence<T>;
    }

    groupBy<TKey, TProject = T>(keySelector: (arg: T) => TKey): BaseSequence<KeySequence<TKey, TProject>>
    groupBy<TKey, TProject = T>(keySelector: (arg: T) => TKey, elementSelector?: (arg: T) => TProject): BaseSequence<KeySequence<TKey, TProject>> {
        return new SequenceKlass(groupBy(this.iterable, keySelector, elementSelector))
            .map(kv => new KeySequenceKlass(kv[1], kv[0])) as unknown as BaseSequence<KeySequence<TKey, TProject>>;
    }

    orderBy<TKey>(selector: (arg: T) => TKey, comparer?: ICompare<TKey>) {
        return new OrderedSequenceKlass(this.iterable, [{
            selector, comparer: (comparer as ICompare<unknown>) ?? defaultComparer, ascending: true
        }]) as unknown as OrderedSequence<T>;
    }

    orderByDescending<TKey>(selector: (arg: T) => TKey, comparer?: ICompare<TKey>) {
        return new OrderedSequenceKlass(this.iterable, [{
            selector, comparer: (comparer as ICompare<unknown>) ?? defaultComparer, ascending: false
        }]) as unknown as OrderedSequence<T>;
    }

    take(count: number) {
        return new SequenceKlass(take(this.iterable, count)) as unknown as Sequence<T>;
    }

    takeWhile(predicate: (arg: T) => boolean): Sequence<T> {
        return new SequenceKlass(takeWhile(this.iterable, predicate)) as unknown as Sequence<T>;
    }

    skip(count: number) {
        return new SequenceKlass(skip(this.iterable, count)) as unknown as Sequence<T>;
    }

    skipWhile(predicate: (arg: T) => boolean): Sequence<T> {
        return new SequenceKlass(skipWhile(this.iterable, predicate)) as unknown as Sequence<T>;
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

    all(predicate: Predicate<T>) {
        for (const x of this.iterable) {
            if (!predicate(x)) return false;
        }
        return true;
    }

    any(predicate: Predicate<T>) {
        for (const x of this.iterable) {
            if (predicate(x)) return true;
        }
        return false;
    }

    none(predicate: Predicate<T>) {
        return !this.any(predicate);
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

    toObject<TKey extends PropertyKey, TElement>(keySelector: (arg: T) => TKey, elementSelector: (arg: T) => TElement) {
        const record = {} as Record<TKey, TElement>;
        for (const x of this.iterable) {
            record[keySelector(x)] = elementSelector(x);
        }
        return record;
    }

    first(): T
    first(predicate: (arg: T) => any): T
    first(predicate?: (arg: T) => any): T {
        if (predicate) return this.where(predicate).first();

        const iterator = this.iterable[Symbol.iterator]();
        const result = iterator.next();
        if (result.done) throw new Error('Sequence was empty');
        return result.value;
    }

    firstOrDefault(): T | undefined
    firstOrDefault(predicate: (arg: T) => any): T | undefined;
    firstOrDefault(predicate?: (arg: T) => any): T | undefined {
        if (predicate) return this.where(predicate).firstOrDefault();

        const iterator = this.iterable[Symbol.iterator]();
        const result = iterator.next();
        return result.value as unknown as T | undefined;
    }

    single(): T
    single(predicate: (arg: T) => any): T
    single(predicate?: (arg: T) => any): T {
        if (predicate) return this.where(predicate).single();

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
        if (predicate) return this.where(predicate).singleOrDefault();

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

class KeySequenceKlass<TKey, TElement> extends SequenceKlass<TElement> implements BaseKeySequence<TKey, TElement> {
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

class OrderedSequenceKlass<T> extends SequenceKlass<T> implements BaseOrderedSequence<T> {
    constructor(iterable: Iterable<T>, protected sc: SelectorComparer<T>[]) {
        super(iterable);
    }

    thenBy<TKey>(selector: (arg: T) => TKey, comparer?: ICompare<TKey>) {
        return new OrderedSequenceKlass(this.iterable, [...this.sc, {
            selector, comparer: (comparer as ICompare<unknown>) ?? defaultComparer, ascending: true
        }]) as unknown as OrderedSequence<T>;
    }

    thenByDescending<TKey>(selector: (arg: T) => TKey, comparer?: ICompare<TKey>) {
        return new OrderedSequenceKlass(this.iterable, [...this.sc, {
            selector, comparer: (comparer as ICompare<unknown>) ?? defaultComparer, ascending: false
        }]) as unknown as OrderedSequence<T>
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

type HasSum = 'sum' extends keyof Sequence<number> ? true : false
type DoesntHaveSum = 'sum' extends keyof Sequence<string> ? false : true
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Passes = HasSum & DoesntHaveSum
// Passes should be true!

export function from<T>(arg: Iterable<T>): Sequence<T> {
    return new SequenceKlass(arg) as unknown as Sequence<T>;
}

export default from;
