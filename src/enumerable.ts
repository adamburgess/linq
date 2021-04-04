export function createLazyGenerator<T>(generator: () => Generator<T>): Iterable<T> {
    return {
        [Symbol.iterator]() {
            return generator()[Symbol.iterator]();
        }
    };
}

export function* empty<T = unknown>(): Generator<T> {

}

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

export function repeat<T>(input: Iterable<T>, count: number) {
    function* repeat() {
        for (let start = 0; (start < count) || (count < 0); start++) {
            yield* input;
        }
    }
    return createLazyGenerator(repeat);
}

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

export function map<T, TOut>(input: Iterable<T>, convert: (arg: T) => TOut) {
    function* map() {
        for (const x of input) {
            yield convert(x);
        }
    }
    return createLazyGenerator(map);
}

export function where<T>(input: Iterable<T>, predicate: (arg: T) => any) {
    function* where() {
        for (const x of input) {
            if (predicate(x)) yield x;
        }
    }
    return createLazyGenerator(where);
}

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

export function groupBy<T, TKey>(input: Iterable<T>, keySelector: (arg: T) => TKey): Iterable<[TKey, T[]]>
export function groupBy<T, TKey, TValue>(input: Iterable<T>, keySelector: (arg: T) => TKey, elementSelector: (arg: T) => TValue): Iterable<[TKey, TValue[]]>
export function groupBy<T, TKey, TValue>(input: Iterable<T>, keySelector: (arg: T) => TKey, elementSelector?: (arg: T) => TValue): Iterable<[TKey, T[]]> | Iterable<[TKey, TValue[]]> {
    return {
        [Symbol.iterator]() {
            return groupByMap(input, keySelector, elementSelector as any)[Symbol.iterator]() as unknown as Iterator<[TKey, T[]]>;
        }
    }
}

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

export function takeWhile<T>(input: Iterable<T>, predicate: (arg: T) => boolean) {
    function* takeWhile() {
        for (const x of input) {
            if (predicate(x)) yield x;
            else break;
        }
    }
    return createLazyGenerator(takeWhile);
}

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

export function concat<T>(a: Iterable<T>, b: Iterable<T>): Iterable<T> {
    function* concat() {
        yield* a;
        yield* b;
    }
    return createLazyGenerator(concat);
}

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

export function flat<T>(input: Iterable<Iterable<T>>): Iterable<T> {
    function* flat() {
        for (const x of input) {
            yield* x;
        }
    }
    return createLazyGenerator(flat);
}

export function min(input: Iterable<number>) {
    return byMin_byMax_min_max(input, undefined, true, false);
}

export function max(input: Iterable<number>) {
    return byMin_byMax_min_max(input, undefined, false, false);
}

export function minBy<T>(input: Iterable<T>, selector: (arg: T) => number) {
    return byMin_byMax_min_max(input, selector, true, true);
}

export function maxBy<T>(input: Iterable<T>, selector: (arg: T) => number) {
    return byMin_byMax_min_max(input, selector, false, true);
}

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

export default Enumerable;
