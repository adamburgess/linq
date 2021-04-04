import { byMin_byMax_min_max, concat, createLazyGenerator, distinct, flat, groupBy, groupByMap, map, reverse, skip, skipWhile, take, takeWhile, where } from './enumerable.js'

interface BaseSequence<T> extends Iterable<T> {
    /** Map each element to another */
    map<TResult>(f: (arg: T) => TResult): Sequence<TResult>

    /** Filters with a TS type assertion ('is'), narrowing to that type */
    where<TNarrowed extends T>(f: (arg: T | TNarrowed) => arg is TNarrowed): Sequence<TNarrowed>
    /** Filters with and narrows to a type */
    where<TNarrowed extends T>(f: (arg: T | TNarrowed) => boolean): Sequence<TNarrowed>
    /** Filters with a predicate that must return a truthy value */
    where(f: (arg: T) => any): Sequence<T>

    /** Reverses the sequence. */
    reverse(): Sequence<T>

    // I'd like to use Sequence<KeySequence>> here... but it doesn't work?

    /** Project each element to get a key, and group all items by that key. */
    groupBy<TKey>(keySelector: (arg: T) => TKey): ArraySequence<KeySequence<TKey, T>>
    /** Project each element to get a key, and group all items, each projected onto another type. */
    groupBy<TKey, TProject>(keySelector: (arg: T) => TKey, elementSelector: (arg: T) => TProject): ArraySequence<KeySequence<TKey, TProject>>

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
    takeWhile(predicate: (arg: T) => any): Sequence<T>;

    /** Skip a number of elements before letting the rest through */
    skip(count: number): Sequence<T>;

    /** Skip elements while the predicate is true, then take the rest */
    skipWhile(predicate: (arg: T) => any): Sequence<T>;

    /** Append another iterable to the end */
    append<TAppend>(iterable: Iterable<TAppend>): Sequence<T | TAppend>

    /** Prepend another iterable to the start */
    prepend<TPrepend>(iterable: Iterable<TPrepend>): Sequence<TPrepend | T>

    /** Get all distinct elements of the sequence using strict equality. First value wins. */
    distinct(): Sequence<T>;
    /** Get all distinct elements of the sequence, mapping each element to a key that will be used for strict equality. First value wins. */
    distinct(keySelector: (arg: T) => unknown): Sequence<T>

    /** Project each element to an iterable/array, then flatten the result */
    flat<TProject>(projector: (input: T) => Iterable<TProject>): Sequence<TProject>;

    /** Correlates the elements of two sequences based on matching keys. An inner join. */
    join<TInner, TKey, TResult>(
        innerSequence: Iterable<TInner>,
        outerKeySelector: (arg: T) => TKey,
        innerKeySelector: (arg: TInner) => TKey,
        resultSelector: (outer: T, inner: TInner) => TResult
    ): Sequence<TResult>;

    /** Counts the number of elements in the sequence */
    count(): number

    /**
     * Converts this sequence to an array.  
     * Note: If you are using this Sequence in a for..of loop, you do _not_ need this --
     *       you can use the sequence directly.
    */
    toArray(): T[]

    /** Converts this sequence to a Map. First key wins. */
    toMap<TKey, TElement>(keySelector: (arg: T) => TKey, elementSelector: (arg: T) => TElement): Map<TKey, TElement>;

    /** Converts this sequence into an object */
    toObject<TKey extends PropertyKey, TElement>(keySelector: (arg: T) => TKey, elementSelector: (arg: T) => TElement): Record<TKey, TElement>;

    /** Convert this sequence into a Set */
    toSet(): Set<T>;
    /** Map each element and convert the resulting sequence into a set */
    toSet<TProject>(projector: (arg: T) => TProject): Set<TProject>

    /** Get the first element in the sequence. Will throw if empty! Use firstOrDefault if no throw is wanted. */
    first(): T;
    /** Get the first element in the sequence that matches a condition. Will throw if empty! Use firstOrDefault if no throw is wanted. */
    first(predicate: (arg: T) => any): T;

    /** Get the first element in the sequence. If empty, returns undefined. */
    firstOrDefault(): T | undefined;
    /** Get the first element in the sequence that matches a condition. If empty or no matches, returns undefined. */
    firstOrDefault(predicate: (arg: T) => any): T | undefined;

    /** Get the _only_ element in the sequence. Will throw if empty or more than one element! Use singleOrDefault if no throw is wanted. */
    single(): T
    /** Get the _only_ element in the sequence that matches a condition. Will throw if empty or more than one element! Use singleOrDefault if no throw is wanted. */
    single(predicate: (arg: T) => any): T;

    /** Get the _only_ element in the sequence. Returns undefined if empty or more than one element. */
    singleOrDefault(): T | undefined
    /** Get the _only_ element in the sequence that matches a condition. Returns undefined if empty or more than one element. */
    singleOrDefault(predicate: (arg: T) => any): T | undefined;

    /** Get the last element in the sequence. Will throw if empty! Use lastOrDefault if no throw is wanted. */
    last(): T;
    /** Get the last element in the sequence that matches a condition. Will throw if empty! Use lastOrDefault if no throw is wanted. */
    last(predicate: (arg: T) => any): T;

    /** Get the last element in the sequence. If empty, returns undefined. */
    lastOrDefault(): T | undefined;
    /** Get the last element in the sequence that matches a condition. If empty or no matches, returns undefined. */
    lastOrDefault(predicate: (arg: T) => any): T | undefined;

    /** True if all elements pass the predicate */
    all(predicate: (arg: T) => any): boolean

    /** True if any elements pass the predicate */
    any(predicate: (arg: T) => any): boolean

    /** True if no elements pass the predicate */
    none(predicate: (arg: T) => any): boolean

    /** True if the element is in the sequence. Checked with ===. */
    contains(value: T): boolean

    /** Projects each element to a number and sums the sequence. If empty, returns 0. */
    sum(f: (arg: T) => number): number;

    /** Projects each element to a number and averages the sequence. If empty, throws. */
    average(f: (arg: T) => number): number;

    /** Projects each element to a number and finds the min of the sequence. If empty, throws. */
    max(f: (arg: T) => number): number;

    /** Projects each element to a number and finds the max of the sequence. If empty, throws. */
    min(f: (arg: T) => number): number;

    /** Finds the minimum element in the sequence according to a selector. Equivalent (but faster) to orderBy(f).first(). */
    minBy(f: (arg: T) => number): T;
    /** Finds the minimum element in the sequence according to a selector. Equivalent (but faster) to orderByDescending(f).first(). */
    maxBy(f: (arg: T) => number): T;
}
interface NumberSequence<T> extends BaseSequence<T> {
    /** Sums every number in the sequence. If empty, returns 0. */
    sum(): number
    /** Averages the sequence. If empty, throws. */
    average(): number
    /** Finds the maximum in the sequence. If empty, throws. */
    max(): number
    /** Finds the minimum in the sequence. If empty, throws. */
    min(): number
}
type UnwrapIterable<T> = [T] extends [Iterable<infer U>] ? U : never;
interface ArraySequence<T> extends BaseSequence<T> {
    /** project each element to an iterable/array, then flatten the result */
    flat<TProject>(projector: (input: T) => Iterable<TProject>): Sequence<TProject>
    /** flatten the sequence */
    flat(): Sequence<UnwrapIterable<T>>
}

interface WithKey<TKey> {
    /** The key that this set was grouped by */
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

type DoesExtend<T, TWant> = [T] extends [TWant] ? T : never;
type DoesExtendAny<T> = any extends T ? never : T;
type ExtendsCarefully<T, TWant> = DoesExtendAny<DoesExtend<T, TWant>>;

export type Sequence<T> = ExtendsCarefully<T, number> extends never ? (ExtendsCarefully<T, Iterable<unknown>> extends never ? BaseSequence<T> : ArraySequence<T>) : NumberSequence<T>;

export type KeySequence<TKey, TElement> = WithKey<TKey> & Sequence<TElement>;
export type OrderedSequence<T> = BaseOrderedSequence<T> & Sequence<T>;

export type SequenceType<T> = T extends Sequence<infer Y> ? Y : never;

class SequenceKlass<T> implements BaseSequence<T>, NumberSequence<T>, ArraySequence<T> {
    constructor(protected it: Iterable<T>) {
    }

    map<TResult>(f: (arg: T) => TResult): Sequence<TResult> {
        return new SequenceKlass(map(this, f));
    }

    where<TResult>(f: (arg: T | TResult) => arg is TResult): Sequence<TResult>
    where(f: (arg: T) => any): Sequence<T>
    where<TResult>(f: ((arg: T) => any) | ((arg: T | TResult) => arg is TResult)): Sequence<T> | Sequence<TResult> {
        return new SequenceKlass(where(this, f));
    }

    reverse() {
        return new SequenceKlass(reverse(this));
    }

    groupBy<TKey>(keySelector: (arg: T) => TKey): ArraySequence<KeySequence<TKey, T>>
    groupBy<TKey, TProject>(keySelector: (arg: T) => TKey, elementSelector: (arg: T) => TProject): ArraySequence<KeySequence<TKey, TProject>>
    groupBy<TKey, TProject>(keySelector: (arg: T) => TKey, elementSelector?: (arg: T) => TProject): ArraySequence<KeySequence<TKey, TProject>> | ArraySequence<KeySequence<TKey, T>> {
        // in a nice world TS would let us pass the elementSelector being undefined/or not and it'd still work
        return new SequenceKlass(groupBy(this, keySelector, elementSelector as any))
            .map(kv => new KeySequenceKlass(kv[1], kv[0])) as unknown as ArraySequence<KeySequence<TKey, TProject>> | ArraySequence<KeySequence<TKey, T>>;
    }

    orderBy<TKey>(selector: (arg: T) => TKey, comparer?: ICompare<TKey>) {
        return new OrderedSequenceKlass(this, [{
            selector, comparer: (comparer as ICompare<unknown>) ?? defaultComparer, ascending: true
        }]);
    }

    orderByDescending<TKey>(selector: (arg: T) => TKey, comparer?: ICompare<TKey>) {
        return new OrderedSequenceKlass(this, [{
            selector, comparer: (comparer as ICompare<unknown>) ?? defaultComparer, ascending: false
        }]);
    }

    take(count: number) {
        return new SequenceKlass(take(this, count));
    }

    takeWhile(predicate: (arg: T) => boolean): Sequence<T> {
        return new SequenceKlass(takeWhile(this, predicate));
    }

    skip(count: number) {
        return new SequenceKlass(skip(this, count));
    }

    skipWhile(predicate: (arg: T) => boolean): Sequence<T> {
        return new SequenceKlass(skipWhile(this, predicate));
    }

    append<TAppend>(iterable: Iterable<TAppend>): Sequence<T | TAppend> {
        return new SequenceKlass(concat<T | TAppend>(this, iterable));
    }

    prepend<TPrepend>(iterable: Iterable<TPrepend>): Sequence<T | TPrepend> {
        return new SequenceKlass(concat<T | TPrepend>(iterable, this));
    }

    distinct(keySelector?: (arg: T) => unknown) {
        return new SequenceKlass(distinct(this, keySelector));
    }

    flat(): Sequence<UnwrapIterable<T>>
    flat<TProject>(projector: (input: T) => Iterable<TProject>): Sequence<TProject>
    flat<TProject>(projector?: (input: T) => Iterable<TProject>): Sequence<TProject> | Sequence<UnwrapIterable<T>> {
        // Ok. These return types are simply never going to work. Lots of casting here.
        // Basically, if projector exists, we map that first, otherwise we use the iterator
        // Then we flatten it. Simple stuff.
        return new SequenceKlass(
            flat(
                (projector ? this.map(projector) : this) as unknown as Iterable<Iterable<unknown>>
            )
        ) as unknown as Sequence<TProject>;
    }

    join<TInner, TKey, TResult>(
        innerSequence: Iterable<TInner>,
        outerKeySelector: (arg: T) => TKey,
        innerKeySelector: (arg: TInner) => TKey,
        resultSelector: (outer: T, inner: TInner) => TResult
    ): Sequence<TResult> {
        const distinctInner = from(innerSequence).toMap(innerKeySelector, x => x);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this; // oh god no.
        // https://github.com/tc39/proposal-generator-arrow-functions PLEASE
        return new SequenceKlass(createLazyGenerator(function* join() {
            for (const outerValue of that) {
                const key = outerKeySelector(outerValue);
                const innerValue = distinctInner.get(key);
                if (innerValue) {
                    yield resultSelector(outerValue, innerValue);
                }
            }
        }));
    }

    groupJoin<TInner, TKey, TResult>(
        innerSequence: Iterable<TInner>,
        outerKeySelector: (arg: T) => TKey,
        innerKeySelector: (arg: TInner) => TKey,
        resultSelector: (outer: T, inner: Sequence<TInner>) => TResult
    ) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        return new SequenceKlass(createLazyGenerator(function* groupJoin() {
            const groupedInner = groupByMap(innerSequence, innerKeySelector);
            for(const outerValue of that) {
                const key = outerKeySelector(outerValue);
                const innerValue = groupedInner.get(key);
                if(innerValue) {
                    yield  resultSelector(outerValue, from(innerValue));
                }
            }
        }));
    }

    count() {
        let count = 0;
        for (const _ of this) count++;
        return count;
    }

    sum(f?: (arg: T) => number) {
        // in types we make sure sum is only allowed on number types.
        let value = 0;
        for (const x of this) {
            value += f ? f(x) : x as unknown as number;
        }
        return value;
    }

    average(f?: (arg: T) => number) {
        // in types we make sure average is only allowed on number types.
        let value = 0;
        let count = 0;
        for (const x of this) {
            value += f ? f(x) : x as unknown as number;
            count++;
        }
        if (count === 0) throw new Error('empty');
        return value / count;
    }

    min(f?: (arg: T) => number) {
        return byMin_byMax_min_max(this, f, true, false);
    }

    max(f?: (arg: T) => number) {
        return byMin_byMax_min_max(this, f, false, false);
    }

    minBy(f: (arg: T) => number): T {
        return byMin_byMax_min_max(this, f, true, true);
    }

    maxBy(f: (arg: T) => number): T {
        return byMin_byMax_min_max(this, f, false, true);
    }

    all(predicate: (arg: T) => any) {
        for (const x of this) {
            if (!predicate(x)) return false;
        }
        return true;
    }

    any(predicate: (arg: T) => any) {
        for (const x of this) {
            if (predicate(x)) return true;
        }
        return false;
    }

    none(predicate: (arg: T) => any) {
        return !this.any(predicate);
    }

    contains(value: T) {
        return this.any(x => x === value);
    }

    toArray() {
        return Array.from(this);
    }

    toMap<TKey, TElement>(keySelector: (arg: T) => TKey, elementSelector: (arg: T) => TElement) {
        const map = new Map<TKey, TElement>();
        for (const e of this) {
            const key = keySelector(e);
            if (!map.has(key))
                map.set(key, elementSelector(e));
        }
        return map;
    }

    toObject<TKey extends PropertyKey, TElement>(keySelector: (arg: T) => TKey, elementSelector: (arg: T) => TElement) {
        const record = {} as Record<TKey, TElement>;
        for (const x of this) {
            record[keySelector(x)] = elementSelector(x);
        }
        return record;
    }


    toSet(): Set<T>;
    toSet<TProject>(projector: (arg: T) => TProject): Set<TProject>
    toSet<TProject>(projector?: (arg: T) => TProject): Set<TProject> | Set<T> {
        return projector ? new Set<TProject>(this.map(projector)) : new Set<T>(this);
    }

    first(): T
    first(predicate: (arg: T) => any): T
    first(predicate?: (arg: T) => any): T {
        if (predicate) return this.where(predicate).first();

        const iterator = this[Symbol.iterator]();
        const result = iterator.next();
        if (result.done) throw new Error('empty');
        return result.value;
    }

    firstOrDefault(): T | undefined
    firstOrDefault(predicate: (arg: T) => any): T | undefined;
    firstOrDefault(predicate?: (arg: T) => any): T | undefined {
        if (predicate) return this.where(predicate).firstOrDefault();

        const iterator = this[Symbol.iterator]();
        const result = iterator.next();
        return result.value as unknown as T | undefined;
    }

    single(): T
    single(predicate: (arg: T) => any): T
    single(predicate?: (arg: T) => any): T {
        if (predicate) return this.where(predicate).single();

        const iterator = this[Symbol.iterator]();
        const result1 = iterator.next();
        if (result1.done) throw new Error('empty');
        const result2 = iterator.next();
        if (!result2.done) throw new Error('more than 1');

        return result1.value;
    }

    singleOrDefault(): T | undefined
    singleOrDefault(predicate: (arg: T) => any): T | undefined
    singleOrDefault(predicate?: (arg: T) => any): T | undefined {
        if (predicate) return this.where(predicate).singleOrDefault();

        const iterator = this[Symbol.iterator]();
        const result1 = iterator.next();
        if (result1.done) return undefined;
        const result2 = iterator.next();
        if (!result2.done) return undefined;

        return result1.value;
    }

    last(): T
    last(predicate: (arg: T) => any): T
    last(predicate?: (arg: T) => any): T {
        if (predicate) return this.where(predicate).last();

        let stored: T | undefined = undefined;
        for (const x of this) {
            stored = x;
        }
        if (stored === undefined) throw new Error('empty');
        return stored;
    }

    lastOrDefault(): T | undefined
    lastOrDefault(predicate: (arg: T) => any): T | undefined;
    lastOrDefault(predicate?: (arg: T) => any): T | undefined {
        if (predicate) return this.where(predicate).lastOrDefault();

        let stored: T | undefined = undefined;
        for (const x of this) {
            stored = x;
        }
        return stored;
    }

    // debug
    // *[Symbol.iterator]() {
    //     for (const x of this.iterable) {
    //         console.log('output', x);
    //         yield x;
    //     }
    // }

    [Symbol.iterator]() {
        return this.it[Symbol.iterator]();
    }
}

class KeySequenceKlass<TKey, TElement> extends SequenceKlass<TElement> implements WithKey<TKey> {
    constructor(it: Iterable<TElement>, public readonly key: TKey) {
        super(it);
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
    constructor(it: Iterable<T>, protected sc: SelectorComparer<T>[]) {
        super(it);
    }

    thenBy<TKey>(selector: (arg: T) => TKey, comparer?: ICompare<TKey>) {
        return new OrderedSequenceKlass(this.it, [...this.sc, {
            selector, comparer: (comparer as ICompare<unknown>) ?? defaultComparer, ascending: true
        }]) as unknown as OrderedSequence<T>;
    }

    thenByDescending<TKey>(selector: (arg: T) => TKey, comparer?: ICompare<TKey>) {
        return new OrderedSequenceKlass(this.it, [...this.sc, {
            selector, comparer: (comparer as ICompare<unknown>) ?? defaultComparer, ascending: false
        }]) as unknown as OrderedSequence<T>
    }

    [Symbol.iterator]() {
        const elements = Array.from(this.it);
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

export function from<T>(arg: Iterable<T>): Sequence<T> {
    if (arg instanceof SequenceKlass) return arg as unknown as Sequence<T>;
    return new SequenceKlass(arg) as unknown as Sequence<T>;
}

export default from;

type Not<T> = T extends true ? false : true
type Is<T, Test> = T extends Test ? true : false
type IsNot<T, Test> = Not<Is<T, Test>>

/* eslint-disable @typescript-eslint/no-unused-vars */
// All the following should be true:
type Test_NumberSequence = Is<Sequence<number>, NumberSequence<number>>;
type Test_ArraySequence = Is<Sequence<number[]>, ArraySequence<number[]>>;
type Test_NumberAnySequence = IsNot<Sequence<number | any>, NumberSequence<number | any>>;
type Test_NumberAnySequence2 = Is<Sequence<number | any>, BaseSequence<number | any>>;

/*

For future me:

base.ts:
    export interface ITest {
        sum(): number;
    }

    export class Test implements ITest {
        sum() {
            return 123;
        }
    }

extend.ts:
    import { Test } from './base.js'

    declare module './base' {
        interface ITest {
            bar(): string
        }
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface Test extends ITest {}
    }

    Test.prototype.bar = function() {
        return 'test';
    }

*/
