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

const Enumerable = {
    range,
    empty,
    reverse
};

export default Enumerable;
