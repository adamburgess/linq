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

export function groupBy<T, TKey>(input: Iterable<T>, keySelector: (arg: T) => TKey): Iterable<[TKey, T[]]>
export function groupBy<T, TKey, TValue>(input: Iterable<T>, keySelector: (arg: T) => TKey, elementSelector?: (arg: T) => TValue): Iterable<[TKey, TValue[]]>
export function groupBy<T, TKey, TValue>(input: Iterable<T>, keySelector: (arg: T) => TKey, elementSelector?: (arg: T) => TValue): Iterable<[TKey, TValue[]]> {
    return {
        [Symbol.iterator]() {
            const map = new Map<TKey, TValue[]>();
            for (const x of input) {
                const key = keySelector(x);
                const value = elementSelector ? elementSelector(x) : (x as unknown as TValue);
                const bucket = map.get(key);
                if (bucket) bucket.push(value);
                else map.set(key, [value]);
            }
            return map[Symbol.iterator]();
        }
    };
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
};

export default Enumerable;
