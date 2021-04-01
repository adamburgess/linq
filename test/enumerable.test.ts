import 'source-map-support/register.js'
import { Assert } from 'zora'
import { expectType } from './helpers.js'
import Enumerable, { max, maxBy, min, minBy, repeat, take } from '../src/enumerable.js'

export default function enumerable(t: Assert) {
    t.test('range', t => {
        const range = Enumerable.range(1, 3);
        expectType<Iterable<number>>(range);

        const first = Array.from(range);
        t.deepEqual(first, [1, 2, 3]);
        const second = Array.from(range);
        t.deepEqual(second, [1, 2, 3], 'repeatable');
    });

    t.test('empty', t => {
        const empty = Enumerable.empty();
        let count = 0;
        for (const _ of empty) count++;
        t.equals(count, 0);
    });

    t.test('repeat', t => {
        const input = [1, 2, 3];
        t.deepEqual(Array.from(repeat(input, 0)), []);
        t.deepEqual(Array.from(repeat(input, 1)), input);
        t.deepEqual(Array.from(repeat(input, 2)), [...input, ...input]);
        // infinite sequence
        t.deepEqual(Array.from(take(repeat(input, -1), 50)).length, 50);
    });

    t.test('max', t => {
        t.equals(max([2, 1, 10, 4]), 10);
        t.throws(() => max([]));
    });

    t.test('min', t => {
        t.equals(min([2, 1, 10, 4]), 1);
        t.throws(() => min([]));
    });

    t.test('xBy', t => {
        const numArr = [2, 1, 10, 4];
        t.equals(minBy(numArr, x => x), 1);
        t.equals(maxBy(numArr, x => x), 10);
        const strArr = ['zero', 'one', 'fourteen', 'seven'];
        t.equals(minBy(strArr, x => x.length), 'one');
        t.equals(maxBy(strArr, x => x.length), 'fourteen');
    });
}
