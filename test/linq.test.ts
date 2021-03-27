import 'source-map-support/register.js'
import { Assert } from 'zora'
import { expectType } from './helpers.js'
import Enumerable from '../src/enumerable.js'
import from, { IKeySequence, INumberKeySequence, INumberSequence, ISequence, SequenceTypes } from '../src/linq.js'

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
    const longRange = from(Enumerable.range(1, 10));
    const singleton = from([1]);

    const emptyArr = from([] as string[]);
    expectType<ISequence<string>>(emptyArr);

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
        t.test('with key selector only', t => {
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

        t.test('with both', t => {
            const grouped = numArr.groupBy(x => x % 2 === 0 ? 'even' : 'odd', x => x.toString());
            expectType<ISequence<IKeySequence<'even' | 'odd', string>>>(grouped);
            const basic = grouped.map(g => ({ key: g.key, val: g.toArray() }));
            t.deepEqual(Array.from(basic), [
                {
                    key: 'odd',
                    val: ['1', '3']
                }, {
                    key: 'even',
                    val: ['2']
                }
            ]);
        });
    });

    t.test('orderBy', t => {
        const numArr = from([1, 3, 2, 0]);
        const sorted = numArr.orderBy(x => x);
        t.deepEqual(Array.from(sorted), [0, 1, 2, 3]);
        const descending = numArr.orderByDescending(x => x);
        t.deepEqual(Array.from(descending), [3, 2, 1, 0]);
        t.test('stable', t => {
            const allArr = from([1, 1, 1]);
            t.deepEqual(Array.from(allArr.orderBy(x => x)), [1, 1, 1]);
            t.deepEqual(Array.from(allArr.orderByDescending(x => x)), [1, 1, 1]);
        });
        t.test('custom comparator', t => {
            const arbitraryArr = from([{ x: 2 }, { x: 3 }, { x: 1 }]);
            const ordered = arbitraryArr.orderBy(x => x, (a, b) => a.x - b.x);
            t.deepEqual(Array.from(ordered), [{ x: 1 }, { x: 2 }, { x: 3 }]);
        });
    });
    t.test('orderBy.thenBy', t => {
        // order by length, then alphabetical
        const strArr = from([
            'zzzzzz',
            'doreme',
            'test',
            'the longest'
        ]);
        const sorted = strArr.orderBy(x => x.length).thenBy(x => x);
        t.deepEqual(Array.from(sorted), [
            'test',
            'doreme',
            'zzzzzz',
            'the longest'
        ]);
        const sorted2 = strArr.orderBy(x => x.length).thenByDescending(x => x);
        t.deepEqual(Array.from(sorted2), [
            'test',
            'zzzzzz',
            'doreme',
            'the longest'
        ]);
    });

    t.test('take', t => {
        const expected = [1, 2, 3, 4];
        const actual = longRange.take(4).toArray();
        t.deepEqual(actual, expected);
    });

    t.test('skip', t => {
        const expected = [7, 8, 9, 10];
        const actual = longRange.skip(6).toArray();
        t.deepEqual(actual, expected);
    });

    t.test('takeWhile', t => {
        const expected = [1, 2, 3, 4];
        const actual = longRange.takeWhile(x => x <= 4).toArray();
        t.deepEqual(actual, expected);
    });

    t.test('skipWhile', t => {
        const expected = [4, 5, 6, 7, 8, 9, 10];
        const actual = longRange.skipWhile(x => x < 4).toArray();
        t.deepEqual(actual, expected);
    });

    t.test('first', t => {
        t.equals(numArr.first(), 1);
        t.throws(() => emptyArr.first());
        t.equals(numArr.first(x => x === 2), 2);
        t.throws(() => numArr.first(x => x === 999));
    });

    t.test('firstOrDefault', t => {
        t.equals(numArr.firstOrDefault(), 1);
        t.equals(emptyArr.firstOrDefault(), undefined);
        t.equals(numArr.firstOrDefault(x => x === 2), 2);
        t.equals(numArr.firstOrDefault(x => x === 999), undefined);
    });

    t.test('single', t => {
        t.equals(singleton.single(), 1);
        t.throws(() => emptyArr.single());
        t.throws(() => numArr.single());
        t.equals(numArr.single(x => x === 2), 2);
        t.throws(() => numArr.single(_ => true));
    });

    t.test('singleOrDefault', t => {
        t.equals(singleton.singleOrDefault(), 1);
        t.equals(emptyArr.singleOrDefault(), undefined);
        t.equals(numArr.singleOrDefault(), undefined);
        t.equals(numArr.singleOrDefault(x => x === 2), 2);
        t.equals(numArr.singleOrDefault(_ => true), undefined);
    });

    t.test('toArray', t => {
        t.deepEqual(Array.from(numArr), [1, 2, 3]);
        t.deepEqual(numArr.toArray(), [1, 2, 3]);
    });

    t.test('toMap', t => {
        const expected = new Map<number, string>([
            [1, '1'],
            [2, '2'],
            [3, '3']
        ]);
        const actual = numArr.toMap(x => x, x => x.toString());
        expectType<Map<number, string>>(actual);
        t.deepEqual(Array.from(actual), Array.from(expected));
    });

    t.test('toObject', t => {
        const expected = {
            do: 'do',
            re: 're',
            mi: 'mi'
        };
        const actual = strArr.toObject(x => x, x => x);
        expectType<Record<string, string>>(actual);
        t.deepEqual(actual, expected);
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
