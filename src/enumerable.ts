export function createLazyGenerator<T, TOut = T>(source: Iterable<T>, generator: (input: Iterable<T>) => Generator<TOut>): Iterable<TOut> {
    return {
        [Symbol.iterator]: () => {
            return generator(source)[Symbol.iterator]();
        }
    };
}

function createLazyGenerator2<TOut>(generator: () => Generator<TOut>): Iterable<TOut> {
    return {
        [Symbol.iterator]() {
            return generator()[Symbol.iterator]();
        }
    }
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
    return createLazyGenerator2(range);
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
    return createLazyGenerator(input, reverse);
}

export function map<T, TOut>(input: Iterable<T>, convert: (arg: T) => TOut) {
    function* map() {
        for (const x of input) {
            yield convert(x);
        }
    }
    return createLazyGenerator(input, map);
}

export function where<T>(input: Iterable<T>, predicate: (arg: T) => any) {
    function* where() {
        for (const x of input) {
            if (predicate(x)) yield x;
        }
    }
    return createLazyGenerator(input, where);
}

export function groupBy<T, TKey>(input: Iterable<T>, keySelector: (arg: T) => TKey): Iterable<[TKey, T[]]>
export function groupBy<T, TKey, TValue>(input: Iterable<T>, keySelector: (arg: T) => TKey, elementSelector?: (arg: T) => TValue): Iterable<[TKey, TValue[]]>
export function groupBy<T, TKey, TValue>(input: Iterable<T>, keySelector: (arg: T) => TKey, elementSelector?: (arg: T) => TValue): Iterable<[TKey, TValue[]]> {
    return {
        [Symbol.iterator]() {
            const map = new Map<TKey, TValue[]>();
            for(const x of input) {
                const key = keySelector(x);
                const value = elementSelector ? elementSelector(x) : (x as unknown as TValue);
                const bucket = map.get(key);
                if(bucket) bucket.push(value);
                else map.set(key, [value]);
            }
            return map[Symbol.iterator]();
        }
    };
}

const Enumerable = {
    range,
    empty,
    reverse
};

export default Enumerable;
