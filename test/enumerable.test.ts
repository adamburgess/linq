import 'source-map-support/register.js'
import { Assert } from 'zora'
import { expectType } from './helpers.js'
import Enumerable from '../src/enumerable.js'

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
}
