/**
 * Some handy methods to create repeatable iterables.
 * ```typescript
 * // you can import _all_ of them:
 * import Enumerable from '@adamburgess/linq/enumerable'
 * // or just the one you want:
 * import { repeat } from '@adamburgess/linq/enumerable'
 * Array.from(repeat([1, 2], 3))
 * // => [1, 2, 1, 2, 1, 2]
 * ```
 * Best to import exactly what you need, as this can be tree-shooken.
 * @module
 */

/** Creates a repeatable iterable from a generator. */
export function createLazyGenerator<T>(generator: () => Generator<T>): Iterable<T> {
    return {
        [Symbol.iterator]() {
            return generator()[Symbol.iterator]();
        }
    };
}

/** An empty iterable. */
export function* empty<T = unknown>(): Iterable<T> {

}

/** An iterable with _count_ numbers starting from _start_, counting up. */
export function range(start: number, count: number): Iterable<number> {
    function* range() {
        let value = start;
        let i = 0;
        while (i < count) {
            yield value++;
            i++;
        }
    }
    return createLazyGenerator(range);
}

/** An iterable that repeats _input_ _count_ times. If _count_ is -1, repeat indefinitely. */
export function repeat<T>(input: Iterable<T>, count: number) {
    function* repeat() {
        for (let start = 0; (start < count) || (count === -1); start++) {
            yield* input;
        }
    }
    return createLazyGenerator(repeat);
}

/** An iterable that reverses _input_. 
 * 
 *  See {@link AnySequence.reverse} for examples.
 */
export function reverse<T>(input: Iterable<T>) {
    function* reverse() {
        // collect everything
        const items = Array.from(input);
        // and output it in reverse
        let position = items.length;
        while (position !== 0) {
            yield items[--position];
        }
    }
    return createLazyGenerator(reverse);
}

/** An iterable that maps each element of _input_ to another value with _convert_.
 * 
 *  See {@link AnySequence.map} for examples.
 */
export function map<T, TOut>(input: Iterable<T>, convert: (arg: T) => TOut) {
    function* map() {
        for (const x of input) {
            yield convert(x);
        }
    }
    return createLazyGenerator(map);
}

/** An iterable that filters _input_ to only elements that are truthy in _predicate_.
 * 
 *  See {@link AnySequence.where} for examples.
 */
export function where<T>(input: Iterable<T>, predicate: (arg: T) => any) {
    function* where() {
        for (const x of input) {
            if (predicate(x)) yield x;
        }
    }
    return createLazyGenerator(where);
}

/** Groups the input and returns a map. 
 * 
 *  See {@link AnySequence.groupBy} for examples.
 */
export function groupByMap<T, TKey>(input: Iterable<T>, keySelector: (arg: T) => TKey): Map<TKey, T[]>
export function groupByMap<T, TKey, TValue>(input: Iterable<T>, keySelector: (arg: T) => TKey, elementSelector: (arg: T) => TValue): Map<TKey, TValue[]>
export function groupByMap<T, TKey, TValue>(input: Iterable<T>, keySelector: (arg: T) => TKey, elementSelector?: (arg: T) => TValue): Map<TKey, T[]> | Map<TKey, TValue[]> {
    const map = new Map<TKey, TValue[]>();
    for (const x of input) {
        const key = keySelector(x);
        const value = elementSelector ? elementSelector(x) : (x as unknown as TValue);
        const bucket = map.get(key);
        if (bucket) bucket.push(value);
        else map.set(key, [value]);
    }
    return map;
}

/** Groups the input and into an iterable with the key and values.
 * 
 *  See {@link AnySequence.groupBy} for examples.
 */
export function groupBy<T, TKey>(input: Iterable<T>, keySelector: (arg: T) => TKey): Iterable<[TKey, T[]]>
export function groupBy<T, TKey, TValue>(input: Iterable<T>, keySelector: (arg: T) => TKey, elementSelector: (arg: T) => TValue): Iterable<[TKey, TValue[]]>
export function groupBy<T, TKey, TValue>(input: Iterable<T>, keySelector: (arg: T) => TKey, elementSelector?: (arg: T) => TValue): Iterable<[TKey, T[]]> | Iterable<[TKey, TValue[]]> {
    return {
        [Symbol.iterator]() {
            return groupByMap(input, keySelector, elementSelector as any)[Symbol.iterator]() as unknown as Iterator<[TKey, T[]]>;
        }
    }
}

/** Takes X elements from input.
 * 
 *  See {@link AnySequence.take} for examples.
 */
export function take<T>(input: Iterable<T>, count: number) {
    function* take() {
        let i = 0;
        for (const x of input) {
            if (i < count) yield x;
            else break;
            i++;
        }
    }
    return createLazyGenerator(take);
}

/** Takes X elements from input while a predicate is true.
 * 
 *  See {@link AnySequence.takeWhile} for examples.
 */
export function takeWhile<T>(input: Iterable<T>, predicate: (arg: T) => boolean) {
    function* takeWhile() {
        for (const x of input) {
            if (predicate(x)) yield x;
            else break;
        }
    }
    return createLazyGenerator(takeWhile);
}

/** Skips X elements from input.
 * 
 *  See {@link AnySequence.skip} for examples.
 */
export function skip<T>(input: Iterable<T>, count: number) {
    function* skip() {
        let i = 0;
        for (const x of input) {
            i++;
            if (i > count) yield x;
        }
    }
    return createLazyGenerator(skip);
}

/** Skips X elements from input while a predicate is true.
 * 
 *  See {@link AnySequence.skipWhile} for examples.
 */
export function skipWhile<T>(input: Iterable<T>, predicate: (arg: T) => boolean) {
    function* skipWhile() {
        let skipping = true;
        for (const x of input) {
            if (skipping) {
                if (predicate(x)) continue;
                skipping = false;
            }
            yield x;
        }
    }
    return createLazyGenerator(skipWhile);
}

/** Concatenates two iterables together.
 * 
 *  See {@link AnySequence.append} and {@link AnySequence.prepend} for examples.
 */
export function concat<T>(a: Iterable<T>, b: Iterable<T>): Iterable<T> {
    function* concat() {
        yield* a;
        yield* b;
    }
    return createLazyGenerator(concat);
}

/** Finds the distinct values in a sequence
 * 
 *  See {@link AnySequence.distinct} for examples.
 */
export function distinct<T, TKey = T>(input: Iterable<T>, keySelector?: (arg: T) => TKey) {
    function* distinct() {
        const set = new Set<T | TKey>();
        for (const x of input) {
            const key = keySelector ? keySelector(x) : x;
            if (!set.has(key)) {
                set.add(key)
                yield x;
            }
        }
    }
    return createLazyGenerator(distinct);
}

/** Flattens a sequence.
 * 
 *  See {@link ArraySequence.flat} for examples.
 */
export function flat<T>(input: Iterable<Iterable<T>>): Iterable<T> {
    function* flat() {
        for (const x of input) {
            yield* x;
        }
    }
    return createLazyGenerator(flat);
}

/** Finds the min of a number sequence
 * 
 *  See {@link NumberSequence.min} for examples.
 */
export function min(input: Iterable<number>) {
    return byMin_byMax_min_max(input, undefined, true, false);
}

/** Finds the max of a number sequence
 * 
 *  See {@link NumberSequence.max} for examples.
 */
export function max(input: Iterable<number>) {
    return byMin_byMax_min_max(input, undefined, false, false);
}

/** Finds the value of a sequence that is the min of a projected value.
 * 
 *  See {@link AnySequence.minBy} for more info.
 */
export function minBy<T>(input: Iterable<T>, selector: (arg: T) => number) {
    return byMin_byMax_min_max(input, selector, true, true);
}

/** Finds the value of a sequence that is the max of a projected value.
 * 
 *  See {@link AnySequence.maxBy} for more info.
 */
export function maxBy<T>(input: Iterable<T>, selector: (arg: T) => number) {
    return byMin_byMax_min_max(input, selector, false, true);
}

/** Finds the value of a sequence, or the value in the sequence, that is the min, or the max.
 * 
 * Depending on the booleans at the end or if you pass a selector or not.
 */
export function byMin_byMax_min_max<T>(input: Iterable<T>, selector: ((arg: T) => number) | undefined, isMin: boolean, isBy: true): T
export function byMin_byMax_min_max<T>(input: Iterable<T>, selector: ((arg: T) => number) | undefined, isMin: boolean, isBy: false): number
export function byMin_byMax_min_max<T>(input: Iterable<T>, selector: ((arg: T) => number) | undefined, isMin: boolean, isBy: boolean): number | T {
    let element: T;
    let current: number | undefined;
    for (const x of input) {
        const val = selector ? selector(x) : x as unknown as number;
        if (current === undefined || (isMin ? val < current : val > current)) {
            current = val;
            element = x;
        }
    }
    if (current === undefined) throw new Error('empty');
    if (isBy) return element!;
    return current;
}

const Enumerable = {
    empty,
    range,
    repeat,
    reverse,
    map,
    where,
    groupBy,
    take,
    takeWhile,
    skip,
    skipWhile,
    concat,
    distinct,
    flat,
    min,
    max,
    minBy,
    maxBy,
    byMin_byMax_min_max
};

/**
 * @ignore
 */
export default Enumerable;
