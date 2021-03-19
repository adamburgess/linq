function range(start: number, count: number) {
    const end = start + count;
    return {
        [Symbol.iterator]() {
            let s = start;

            return {
                next(): IteratorResult<number, unknown> {
                    if (s < end) {
                        return {
                            done: false,
                            value: s++
                        };
                    } else {
                        return {
                            done: true
                        } as IteratorReturnResult<unknown> // https://github.com/microsoft/TypeScript/issues/38479
                    }
                }
            }
        }
    }
}

export default range;
