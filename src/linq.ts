/**
 * ```typescript
 * import from from '@adamburgess/linq'
 * const sequence = from(['an', 'iterable', 'here!']);
 * // now use all the methods on sequence!
 * ```
 * 
 * See {@link AnySequence} for all the transformations you can do to a sequence.
 * @module
 */

import { byMin_byMax_min_max, concat, createLazyGenerator, distinct, flat, groupBy, groupByMap, map, reverse, skip, skipWhile, take, takeWhile, where } from './enumerable.js'

/** A sequence of values. */
export interface AnySequence<T> extends Iterable<T> {
    /** Map each element to another 
     * 
     * ```typescript
     * from([2, 1, 5]).map(x => x + 1)
     * // => [3, 2, 6]
     * ```
     */
    map<TResult>(f: (arg: T) => TResult): Sequence<TResult>

    /** Filters with a TS type assertion ('is'), narrowing to that type 
     * 
     * ```typescript
     * function isNumber(x: number | string): x is number {
     *     return typeof x === 'number';
     * }
     * from(['string', 12, 'str']).where(isNumber)
     * // => [12]
     * // sequence is now Sequence<number>
     * ```
     */
    where<TNarrowed extends T>(f: (arg: T | TNarrowed) => arg is TNarrowed): Sequence<TNarrowed>
    /** Filters with and narrows to a type 
     * 
     * ```typescript
     * from(['string', 12, 'str']).where<number>(x => typeof x === 'number')
     * // => [12]
     * // sequence is now Sequence<number>
     * ```
     * note! must use generic type! otherwise this overload is not used, and the type is not narrowed.
     */
    where<TNarrowed extends T>(f: (arg: T | TNarrowed) => boolean): Sequence<TNarrowed>
    /** Filters with a predicate that must return a truthy value 
     * 
     * ```typescript
     * from([5, 10, 20]).where(x => x >= 8)
     * // => [10, 20]
     * ```
     */
    where(f: (arg: T) => any): Sequence<T>

    /** Reverses the sequence. 
     * 
     * ```typescript
     * from([2, 1, 5]).reverse()
     * // => [5, 1, 2]
     * ```
     */
    reverse(): Sequence<T>

    // I'd like to use Sequence<KeySequence>> here... but it doesn't work?

    /** Project each element to get a key, and group all items by that key. 
     * 
     * ```typescript
     * from([10, 15, 20]).groupBy(x => Math.trunc(x / 10))
     * // => key: 1, values: [10, 15]
     * //    key: 2, values: [20]
     * ```
     */
    groupBy<TKey>(keySelector: (arg: T) => TKey): ArraySequence<KeySequence<TKey, T>>
    /** Project each element to get a key, and group all items, each projected onto another type. 
     * 
     * ```typescript
     * from([10, 15, 20]).groupBy(x => Math.trunc(x / 10), x => x.toString())
     * // => key: 1, values: ['10', '15']
     * //    key: 2, values: ['20']
     * ```
     */
    groupBy<TKey, TProject>(keySelector: (arg: T) => TKey, elementSelector: (arg: T) => TProject): ArraySequence<KeySequence<TKey, TProject>>

    /** Sort the array in ascending order of the selector 
     * 
     * ```typescript
     * from([4, 1, 10]).orderBy(x => x)
     * // => [1, 4, 10]
     * ```
     */
    orderBy(keySelector: (arg: T) => string | number): OrderedSequence<T>;
    /** Sort the array in ascending order of the selector, with a custom comparer 
     * 
     * ```typescript
     * // Sort alphabetically, ignoring case.
     * from(['A xylophone', 'a frog', 'a zoo']).orderBy(x => x, new Intl.Collator('en', { sensitivity: 'base' }).compare)
     * // => ['a frog', 'A xylophone', 'a zoo']
     * ```
     */
    orderBy<TKey>(keySelector: (arg: T) => TKey, comparer: ICompare<TKey>): OrderedSequence<T>

    /** Sort the array in descending order of the selector 
     * 
     * ```typescript
     * from([4, 1, 10]).orderBy(x => x)
     * // => [10, 4, 1]
     * ```
     */
    orderByDescending(keySelector: (arg: T) => string | number): OrderedSequence<T>;
    /** Sort the array in descending order of the selector, with a custom comparer 
     * 
     * ```typescript
     * // Sort reverse alphabetically, ignoring case.
     * from(['A xylophone', 'a frog', 'a zoo']).orderBy(x => x, new Intl.Collator('en', { sensitivity: 'base' }).compare)
     * // => ['a zoo', 'A xylophone', 'a frog']
     * ```
     */
    orderByDescending<TKey>(keySelector: (arg: T) => TKey, comparer: ICompare<TKey>): OrderedSequence<T>

    /** Take a maximum amount of elements 
     * 
     * ```typescript
     * from([2, 1, 5]).take(2)
     * // => [2, 1]
     * ```
     */
    take(count: number): Sequence<T>;

    /** Take elements while the predicate is true, then skips the rest 
     * 
     * ```typescript
     * from([2, 3, 1, 5]).takeWhile(x => x >= 2)
     * // => [2, 3]
     * ```
     */
    takeWhile(predicate: (arg: T) => any): Sequence<T>;

    /** Skip a number of elements before letting the rest through 
     * 
     * ```typescript
     * from([2, 3, 1, 5]).skip(2)
     * // => [1, 5]
     * ```
     */
    skip(count: number): Sequence<T>;

    /** Skip elements while the predicate is true, then take the rest 
     * 
     * ```typescript
     * from([2, 3, 1, 5]).skipWhile(x => x >= 2)
     * // => [1, 5]
     * ```
     */
    skipWhile(predicate: (arg: T) => any): Sequence<T>;

    /** Append another iterable to the end 
     * 
     * ```typescript
     * from([1, 2]).append([3, 4])
     * // => [1, 2, 3, 4]
     * ```
     */
    append<TAppend>(iterable: Iterable<TAppend>): Sequence<T | TAppend>

    /** Prepend another iterable to the start 
     * 
     * ```typescript
     * from([1, 2]).prepend([3, 4])
     * // => [3, 4, 1, 2]
     * ```
     */
    prepend<TPrepend>(iterable: Iterable<TPrepend>): Sequence<TPrepend | T>

    /** Get all distinct elements of the sequence using strict equality. First value wins. 
     * 
     * ```typescript
     * from([1, 2, 2, 3]).distinct()
     * // => [1, 2, 3]
     * ```
     */
    distinct(): Sequence<T>;
    /** Get all distinct elements of the sequence, mapping each element to a key that will be used for strict equality. First value wins. 
     * 
     * ```typescript
     * from([10, 15, 20, 25, 30]).distinct(x => Math.trunc(x / 10))
     * // => [10, 20, 30]
     * ```
     */
    distinct(keySelector: (arg: T) => unknown): Sequence<T>

    /** Project each element to an iterable/array, then flatten the result 
     * 
     * ```typescript
     * from(['1 2', '3 4']).flat(x => x.split(' ')))
     * // => ['1', '2', '3', '4']
     * ```
     */
    flat<TProject>(projector: (input: T) => Iterable<TProject>): Sequence<TProject>;

    /** Correlates the elements of two sequences based on matching keys. An inner join. 
     * 
     * ```typescript
     * const appleTypes = [
     *     { name: 'green apple', id: 5 },
     *     { name: 'red apple', id: 2 },
     *     { name: 'yellow apple', id: 10 }
     * ];
     * const apples = [
     *     { name: 'golden delicious', type: 10 },
     *     { name: 'granny smith', type: 5 },
     *     { name: 'pink lady', type: 2 },
     *     { name: 'fuji', type: 2 },
     *     { name: 'unknown', type: 999 }
     * ];
     * 
     * from(apples).join(
     *     appleTypes,
     *     apple => apple.type,
     *     type => type.id,
     *     (apple, type) => `${apple.name}: ${type.name}`
     * )
     * // => [ 'golden delicious: yellow apple',
     * //      'granny smith: green apple',
     * //      'pink lady: red apple',
     * //      'fuji: red apple' ]
     * ```
     */
    join<TInner, TKey, TResult>(
        innerSequence: Iterable<TInner>,
        outerKeySelector: (arg: T) => TKey,
        innerKeySelector: (arg: TInner) => TKey,
        resultSelector: (outer: T, inner: TInner) => TResult
    ): Sequence<TResult>;

    /** Correlates the elements of two sequences based on matching keys, and groups everything in the other table. 
     * 
     * ```typescript
     * const appleTypes = [
     *     { name: 'green apple', id: 5 },
     *     { name: 'red apple', id: 2 },
     *     { name: 'yellow apple', id: 10 }
     * ];
     * const apples = [
     *     { name: 'golden delicious', type: 10 },
     *     { name: 'granny smith', type: 5 },
     *     { name: 'pink lady', type: 2 },
     *     { name: 'fuji', type: 2 },
     *     { name: 'unknown', type: 999 }
     * ];
     * 
     * from(appleTypes).groupJoin(
     *     apples,
     *     type => type.id,
     *     apple => apple.type,
     *     (type, apples) => `${type.name}: ${apples.map(a => a.name).joinString(', ')}`
     * );
     * // => [ 'green apple: granny smith',
     * //      'red apple: pink lady, fuji',
     * //      'yellow apple: golden delicious' ]
     * ```
     */
    groupJoin<TInner, TKey, TResult>(
        innerSequence: Iterable<TInner>,
        outerKeySelector: (arg: T) => TKey,
        innerKeySelector: (arg: TInner) => TKey,
        resultSelector: (outer: T, inner: Sequence<TInner>) => TResult
    ): Sequence<TResult>;

    /** Counts the number of elements in the sequence 
     * 
     * ```typescript
     * from([2, 1, 5]).count()
     * // => 3
     * from([]).count()
     * // => 0
     * ```
     */
    count(): number

    /**
     * Converts this sequence to an array.  
     * Note: If you are using this Sequence in a for..of loop, you do _not_ need this --
     *       you can use the sequence directly.
     * 
     * ```typescript
     * from([2, 1, 5]).toArray()
     * // => [2, 1, 5]
     * ```
     */
    toArray(): T[]

    /** Converts this sequence to a Map. First key wins. 
     * 
     * ```typescript
     * from([{ k: 'a', v: 123 }, { k: 'b', v: 456 }]).toMap(x => x.k, x => x.v)
     * // => Map([['a', 456], ['b', 456]]);
     * ```
     */
    toMap<TKey, TElement>(keySelector: (arg: T) => TKey, elementSelector: (arg: T) => TElement): Map<TKey, TElement>;

    /** Converts this sequence into an object. First key wins. 
     * 
     * ```typescript
     * from([{ k: 'a', v: 123 }, { k: 'b', v: 456 }]).toObject(x => x.k, x => x.v)
     * // => { a: 123, b: 456 }
     * ```
     */
    toObject<TKey extends PropertyKey, TElement>(keySelector: (arg: T) => TKey, elementSelector: (arg: T) => TElement): Record<TKey, TElement>;

    /** Convert this sequence into a Set 
     * 
     * ```typescript
     * from([2, 1, 1, 5]).toSet()
     * // => Set([2, 1, 5])
     * ```
     */
    toSet(): Set<T>;
    /** Map each element and convert the resulting sequence into a set 
     * 
     * ```typescript
     * from([2, 1, 1, 5]).toSet(x => x + 1)
     * // => Set([3, 2, 6])
     * ```
     */
    toSet<TProject>(projector: (arg: T) => TProject): Set<TProject>

    /** Get the first element in the sequence. Will throw if empty! Use firstOrDefault if no throw is wanted. 
     * 
     * ```typescript
     * from([2, 1, 5]).first()
     * // => 2
     * from([]).first()
     * // => throws
     * ```
     */
    first(): T;
    /** Get the first element in the sequence that matches a condition. Will throw if empty! Use firstOrDefault if no throw is wanted. 
     * 
     * ```typescript
     * from([2, 1, 5]).first(x => x >= 4)
     * // => 5
     * from([2, 1, 5]).first(x => x < 0)
     * // => throws
     * ```
     */
    first(predicate: (arg: T) => any): T;

    /** Get the first element in the sequence. If empty, returns undefined. 
     * 
     * ```typescript
     * from([2, 1, 5]).firstOrDefault()
     * // => 2
     * from([]).firstOrDefault()
     * // => undefined
     * ```
     */
    firstOrDefault(): T | undefined;
    /** Get the first element in the sequence that matches a condition. If empty or no matches, returns undefined. 
     * 
     * ```typescript
     * from([2, 1, 5]).firstOrDefault(x => x >= 4)
     * // => 5
     * from([2, 1, 5]).firstOrDefault(x => x < 0)
     * // => undefined
     * ```
     */
    firstOrDefault(predicate: (arg: T) => any): T | undefined;

    /** Get the _only_ element in the sequence. Will throw if empty or more than one element! Use singleOrDefault if no throw is wanted. 
     * 
     * ```typescript
     * from([2]).single()
     * // => 2
     * from([2, 1, 5]).single()
     * // => throws
     * from([]).single()
     * // => throws
     * ```
     */
    single(): T
    /** Get the _only_ element in the sequence that matches a condition. Will throw if empty or more than one element! Use singleOrDefault if no throw is wanted. 
     * 
     * ```typescript
     * from([2, 1, 5]).single(x => x >= 4)
     * // => 5
     * from([2, 1, 5]).single(x => x >= 1)
     * // => throws
     * ```
     */
    single(predicate: (arg: T) => any): T;

    /** Get the _only_ element in the sequence. Returns undefined if empty or more than one element. 
     * 
     * ```typescript
     * from([2]).singleOrDefault()
     * // => 2
     * from([2, 1, 5]).singleOrDefault()
     * // => undefined
     * ```
     */
    singleOrDefault(): T | undefined
    /** Get the _only_ element in the sequence that matches a condition. Returns undefined if empty or more than one element. 
     * 
     * ```typescript
     * from([2, 1, 5]).singleOrDefault(x => x >= 4)
     * // => 5
     * from([2, 1, 5]).singleOrDefault(x => x >= 1)
     * // => undefined
     * ```
     */
    singleOrDefault(predicate: (arg: T) => any): T | undefined;

    /** Get the last element in the sequence. Will throw if empty! Use lastOrDefault if no throw is wanted. 
     * 
     * ```typescript
     * from([2, 1, 5]).last()
     * // => 5
     * from([]).last()
     * // => throws
     * ```
     */
    last(): T;
    /** Get the last element in the sequence that matches a condition. Will throw if empty! Use lastOrDefault if no throw is wanted. 
     * 
     * ```typescript
     * from([2, 1, 5]).last(x => x < 4)
     * // => 1
     * from([]).last(x => x < 0)
     * // => throws
     * ```
     */
    last(predicate: (arg: T) => any): T;

    /** Get the last element in the sequence. If empty, returns undefined. 
     * 
     * ```typescript
     * from([2, 1, 5]).lastOrDefault()
     * // => 5
     * from([]).lastOrDefault()
     * // => undefined
     * ```
     */
    lastOrDefault(): T | undefined;
    /** Get the last element in the sequence that matches a condition. If empty or no matches, returns undefined. 
     * 
     * ```typescript
     * from([2, 1, 5]).lastOrDefault(x => x < 4)
     * // => 1
     * from([2, 1, 5]).lastOrDefault(x => x < 0)
     * // => undefined
     * ```
     */
    lastOrDefault(predicate: (arg: T) => any): T | undefined;

    /** True if all elements pass the predicate 
     * 
     * ```typescript
     * from([2, 1, 5]).all(x => x >= 1)
     * // => true
     * from([2, 1, 5]).all(x => x >= 2)
     * // => false
     * ```
     */
    all(predicate: (arg: T) => any): boolean

    /** True if any elements pass the predicate 
     * 
     * ```typescript
     * from([2, 1, 5]).any(x => x >= 4)
     * // => true
     * from([2, 1, 5]).any(x => x <= 0)
     * // => false
     * ```
     */
    any(predicate: (arg: T) => any): boolean

    /** True if no elements pass the predicate 
     * 
     * ```typescript
     * from([2, 1, 5]).none(x => x === 0)
     * // => true
     * from([2, 1, 5]).none(x => x === 1)
     * // => false
     * ```
     */
    none(predicate: (arg: T) => any): boolean

    /** True if the element is in the sequence. Checked with ===. 
     * 
     * ```typescript
     * from([2, 1, 5]).contains(1)
     * // => true
     * from([{ a: '1' }]).contains({ a: '1' })
     * // => false (strict equality. use any instead.)
     * ```
     */
    contains(value: T): boolean

    /** Projects each element to a number and sums the sequence. If empty, returns 0. 
     * 
     * ```typescript
     * from(['2', '1', '5']).sum(x => parseFloat(x))
     * // => 8
     * ```
     */
    sum(f: (arg: T) => number): number;

    /** Projects each element to a number and averages the sequence. If empty, throws. 
     * 
     * ```typescript
     * from(['2', '1', '5']).average(x => parseFloat(x))
     * // => 4
     * ```
     */
    average(f: (arg: T) => number): number;

    /** Projects each element to a number and finds the min of the sequence. If empty, throws. 
     * 
     * ```typescript
     * from(['2', '1', '5']).max(x => parseFloat(x))
     * // => 5
     * ```
     */
    max(f: (arg: T) => number): number;

    /** Projects each element to a number and finds the max of the sequence. If empty, throws.
     * 
     * ```typescript
     * from(['2', '1', '5']).min(x => parseFloat(x))
     * // => 1
     * ```
     */
    min(f: (arg: T) => number): number;

    /** Finds the minimum element in the sequence according to a selector. Equivalent (but faster) to orderBy(f).first(). 
     * 
     * ```typescript
     * from([{ key: 'A', value: 2 }, { key: 'B', value: 1 }, { key: 'C', value: 10 }]).minBy(x => x.value)
     * // => { key: 'B', value: 1 }
     * ```
     */
    minBy(f: (arg: T) => number): T;
    /** Finds the maximum element in the sequence according to a selector. Equivalent (but faster) to orderByDescending(f).first(). 
     * 
     * ```typescript
     * from([{ key: 'A', value: 2 }, { key: 'B', value: 1 }, { key: 'C', value: 10 }]).maxBy(x => x.value)
     * // => { key: 'C', value: 10 }
     * ```
     */
    maxBy(f: (arg: T) => number): T;

    /** Iterates through this sequence. */
    [Symbol.iterator](): Iterator<T>;
}
/** A sequence of numbers */
export interface NumberSequence<T> extends AnySequence<T> {
    /** Sums every number in the sequence. If empty, returns 0. 
     * 
     * ```typescript
     * from([2, 1, 5]).sum()
     * // => 8
     * ```
     */
    sum(): number
    /** Averages the sequence. If empty, throws. 
     * 
     * ```typescript
     * from([2, 1, 5]).average()
     * // => 4
     * ```
     */
    average(): number
    /** Finds the maximum in the sequence. If empty, throws. 
     * 
     * ```typescript
     * from([2, 1, 5]).max()
     * // => 5
     * ```
     */
    max(): number
    /** Finds the minimum in the sequence. If empty, throws. 
     * 
     * ```typescript
     * from([2, 1, 5]).min()
     * // => 1
     * ```
     */
    min(): number
}
type UnwrapIterable<T> = [T] extends [Iterable<infer U>] ? U : never;
/** A sequence of iterable elements */
export interface ArraySequence<T> extends AnySequence<T> {
    /** Project each element to an iterable/array, then flatten the result 
     * 
     * ```typescript
     * from([[1, 2], [3, 4]]).flat(x => [...x, 0])
     * // => [1, 2, 0, 3, 4, 0]
     * ```
     */
    flat<TProject>(projector: (input: T) => Iterable<TProject>): Sequence<TProject>
    /** Flatten the sequence 
     * 
     * ```typescript
     * from([[1, 2], [3, 4]]).flat()
     * // => [1, 2, 3, 4]
     * ```
     */
    flat(): Sequence<UnwrapIterable<T>>
}
/** A sequence of strings */
export interface StringSequence<T> extends AnySequence<T> {
    /** Joins the elements with an optional separator
     * 
     * ```typescript
     * from(['a', 'b', 'c']).join(', ')
     * // => 'a, b, c'
     * ```
     */
    joinString(separator?: string): string;
}

interface WithKey<TKey> {
    /** The key that this set was grouped by */
    readonly key: TKey;
}

interface BaseOrderedSequence<T> extends AnySequence<T> {
    /** Order the sequence by another key, ascending.
     * 
     * ```typescript
     * // Sort by length of the string, then alphabetical order
     * from(['two', 'one', 'thirteen', 'five']).orderBy(x => x.length).thenBy(x => x)
     * // => ['one', 'two', 'five', 'thirteen']
     * ```
     */
    thenBy(keySelector: (arg: T) => string | number): OrderedSequence<T>;
    /** Order the sequence by another key, ascending, with a custom comparer.
     * 
     * See orderBy for an example.
     */
    thenBy<TKey>(keySelector: (arg: T) => TKey, comparer: ICompare<TKey>): OrderedSequence<T>

    /** Order the sequence by another key, descending.
     * 
     * ```typescript
     * // Sort by length of the string, then reverse alphabetical order
     * from(['one', 'two', 'thirteen', 'five']).orderBy(x => x.length).thenBy(x => x)
     * // => 'two', 'one', 'five', 'thirteen'
     * ```
     */
    thenByDescending(keySelector: (arg: T) => string | number): OrderedSequence<T>;
    /** Order the sequence by another key, descending, with a custom comparer. 
     * 
     * 
     * See orderBy for an example.
     */
    thenByDescending<TKey>(keySelector: (arg: T) => TKey, comparer: ICompare<TKey>): OrderedSequence<T>
}

type DoesExtend<T, TWant> = [T] extends [TWant] ? T : never;
type DoesExtendAny<T> = any extends T ? never : T;
type ExtendsCarefully<T, TWant> = DoesExtendAny<DoesExtend<T, TWant>>;

/** A sequence of values. */
export type Sequence<T> = ExtendsCarefully<T, number> extends never ? (
    ExtendsCarefully<T, string> extends never ? (
        ExtendsCarefully<T, Iterable<unknown>> extends never ? AnySequence<T> : ArraySequence<T>
    ) : StringSequence<T>
) : NumberSequence<T>;

/** A sequence with a key. Obtained from groupBy. */
export type KeySequence<TKey, TElement> = WithKey<TKey> & Sequence<TElement>;
/** An ordered sequence. Can use thenBy to continue ordering. */
export type OrderedSequence<T> = BaseOrderedSequence<T> & Sequence<T>;

/** Gets the sequence type.
 * ```typescript
 * type MySequence = Sequence<string>
 * type MySequenceType = SequenceType<MySequence>
 * // MySequenceType === string
 *  ```
 */
export type SequenceType<T> = T extends Sequence<infer Y> ? Y : never;

class SequenceKlass<T> implements AnySequence<T>, NumberSequence<T>, ArraySequence<T>, StringSequence<T> {
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
            for (const outerValue of that) {
                const key = outerKeySelector(outerValue);
                const innerValue = groupedInner.get(key);
                if (innerValue) {
                    yield resultSelector(outerValue, from(innerValue));
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
        const keys = new Set<TKey>();
        for (const x of this) {
            const key = keySelector(x);
            if (!keys.has(key)) {
                record[key] = elementSelector(x);
                keys.add(key);
            }
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

    joinString(separator?: string) {
        return this.toArray().join(separator);
    }

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

/** Start the sequence. Can be used with an array or any iterable. 
 * 
 * ```typescript
 * // Import me:
 * import from from '@adamburgess/linq'
 * // Arrays:
 * from([1, 2, 3])
 * // Objects that support the Iterable protocol:
 * from(new Map())
 * // Generators:
 * from(function*() { yield 'generated values' })
 * ```
*/
export function from<T>(it: Iterable<T>): Sequence<T> {
    if (it instanceof SequenceKlass) return it as unknown as Sequence<T>;
    return new SequenceKlass(it) as unknown as Sequence<T>;
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
type Test_NumberAnySequence2 = Is<Sequence<number | any>, AnySequence<number | any>>;

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
