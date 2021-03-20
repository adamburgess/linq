import 'source-map-support/register.js'
import { Assert } from 'zora'
import { expectType } from './helpers.js'
import Enumerable from '../src/enumerable.js'
import from, { INumberKeySequence, INumberSequence, ISequence, SequenceTypes } from '../src/linq.js'

export default function linq(t: Assert) {
    t.test('constructor', t => {
        t.test('with array', t => {
            const result = from([1, 2, 3]);
            t.equals(result.count(), 3);
        });
        t.test('with generator', t => {
            const iterable = Enumerable.range(0, 3);
            const result = from(iterable);
            t.equals(result.count(), 3);
        });
    });

    const numArr = from([1, 2, 3]);
    expectType<ISequence<number>>(numArr);
    const strArr = from(['do', 're', 'mi']);
    expectType<ISequence<string>>(strArr);
    const symbol = Symbol('Symbol');
    const unionArr = from(['truthy', false, true, 0, 1, 2, symbol]);
    unionArr.where(x => x === 1);
    expectType<ISequence<string | number | boolean | symbol>>(unionArr);
    const anyArr = unionArr as ISequence<any>;
    const rangeArr = from(Enumerable.range(0, 3));
    expectType<ISequence<number>>(rangeArr);

    const emptyArr = from([] as unknown[]);
    expectType<ISequence<unknown>>(emptyArr);

    t.test('count', t => {
        t.equals(numArr.count(), 3);
        t.equals(rangeArr.count(), 3);
        t.equals(emptyArr.count(), 0);
    });

    t.test('select', t => {
        const addOne = (x: number) => x + 1;
        const added = numArr.map(addOne);
        const addedTwice = added.map(addOne);

        t.deepEqual(Array.from(added), [2, 3, 4]);
        t.deepEqual(Array.from(addedTwice), [3, 4, 5]);
    });

    t.test('filter', t => {
        t.test('booleans', t => {
            const odd = numArr.where(x => {
                expectType<number>(x);
                return x % 2 === 1
            });
            expectType<ISequence<number>>(odd);
            t.deepEqual(Array.from(odd), [1, 3]);
            const even = numArr.where(x => x % 2 === 0);
            t.deepEqual(Array.from(even), [2]);
        });

        t.test('any', t => {
            const truthy = unionArr.where(x => x);
            t.deepEqual(Array.from(truthy), ['truthy', true, 1, 2, symbol]);
        });

        t.test('narrowing', t => {
            t.test('implicit', t => {
                function isNumber(x: string | number | boolean | symbol): x is number {
                    return typeof x === 'number';
                }
                const numbers = unionArr.where(isNumber);
                expectType<INumberSequence>(numbers);
                t.deepEqual(Array.from(numbers), [0, 1, 2]);
            });
            t.test('explicit', t => {
                const numbers = anyArr.where<number>(x => typeof x === 'number');
                expectType<INumberSequence>(numbers);
                t.deepEqual(Array.from(numbers), [0, 1, 2]);
            });
            t.test('implicit, weird', t => {
                type Marvelous = { marvelous: 'indeed' }
                function isMarvelous(x: SequenceTypes<typeof unionArr> | Marvelous): x is Marvelous {
                    return true;
                }
                const marvelous = unionArr.where(isMarvelous);
                expectType<ISequence<Marvelous>>(marvelous);
                t.ok(true);
            });
        });
    });

    t.test('reverse', t => {
        const reverse = numArr.reverse();
        t.deepEqual(Array.from(reverse), [3, 2, 1]);
    });

    t.test('groupBy', t => {
        const grouped = numArr.groupBy(x => x % 2 === 0 ? 'even' : 'odd');
        expectType<ISequence<INumberKeySequence<'even' | 'odd'>>>(grouped);
        const basic = grouped.map(g => ({ key: g.key, val: g.toArray() }));
        t.deepEqual(Array.from(basic), [
            {
                key: 'odd',
                val: [1, 3]
            }, {
                key: 'even',
                val: [2]
            }
        ]);
        // check repeatability:
        t.equals(grouped.map(g => ({ key: g.key, val: g.toArray() })).count(), 2);
    });

    t.test('sum', t => {
        t.test('numbers', t => {
            t.equals(numArr.sum(), 1 + 2 + 3);
        });
        t.test('strings', t => {
            // @ts-expect-error sum should not be on strArr's type
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            strArr.sum();
        });
    });

    t.test('average', t => {
        t.test('numbers', t => {
            t.equal(numArr.average(), (1 + 2 + 3) / 3);
        });
        t.test('strings', t => {
            // @ts-expect-error average should not be on strArr's type
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            strArr.average();
        })
    });

    t.test('e2e', t => {
        const e2e = from([1, 2, 3])     // 1, 2, 3
            .map(x => x + 1)            // 2, 3, 4
            .reverse()                  // 4, 3, 2
            .map(x => x * 2)            // 8, 6, 4
            .where(x => x % 4 === 0)    // 8, 4

        t.deepEqual(Array.from(e2e), [8, 4]);
    });
}
