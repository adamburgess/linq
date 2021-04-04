import 'source-map-support/register.js'
import { Assert } from 'zora'
import { expectType } from './helpers.js'
import Enumerable, { createLazyGenerator } from '../src/enumerable.js'
import from, { SequenceType, KeySequence, Sequence } from '../src/linq.js'

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
    expectType<Sequence<number>>(numArr);
    const strArr = from(['do', 're', 'mi']);
    expectType<Sequence<string>>(strArr);
    const symbol = Symbol('Symbol');
    const unionArr = from(['truthy', false, true, 0, 1, 2, symbol]);
    unionArr.where(x => x === 1);
    expectType<Sequence<string | number | boolean | symbol>>(unionArr);
    const anyArr = unionArr as Sequence<any>;
    const rangeArr = from(Enumerable.range(0, 3));
    expectType<Sequence<number>>(rangeArr);
    const longRange = from(Enumerable.range(1, 10));
    const singleton = from([1]);

    const emptyStrArr = from([] as string[]);
    expectType<Sequence<string>>(emptyStrArr);
    const emptyNumArr = from([] as number[]);

    t.test('count', t => {
        t.equals(numArr.count(), 3);
        t.equals(rangeArr.count(), 3);
        t.equals(emptyStrArr.count(), 0);
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
            expectType<Sequence<number>>(odd);
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
                expectType<Sequence<number>>(numbers);
                t.deepEqual(Array.from(numbers), [0, 1, 2]);
            });
            t.test('explicit', t => {
                const numbers = anyArr.where<number>(x => typeof x === 'number');
                expectType<Sequence<number>>(numbers);
                t.deepEqual(Array.from(numbers), [0, 1, 2]);
            });
            t.test('implicit, weird', t => {
                type Marvelous = { marvelous: 'indeed' }
                function isMarvelous(x: SequenceType<typeof unionArr> | Marvelous): x is Marvelous {
                    return true;
                }
                const marvelous = unionArr.where(isMarvelous);
                expectType<Sequence<Marvelous>>(marvelous);
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
            expectType<Sequence<KeySequence<'even' | 'odd', number>>>(grouped);
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
            expectType<Sequence<KeySequence<'even' | 'odd', string>>>(grouped);
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

    t.test('append', t => {
        const expected = [1, 2, 3, 4, 5, 6];
        const a = [1, 2, 3];
        const b = [4, 5, 6];
        t.deepEqual(from(a).append(b).toArray(), expected);
    });

    t.test('prepend', t => {
        const expected = [4, 5, 6, 1, 2, 3];
        const a = [1, 2, 3];
        const b = [4, 5, 6];
        t.deepEqual(from(a).prepend(b).toArray(), expected);
    });

    t.test('distinct', t => {
        const duplicate = [1, 2, 3, 2];
        const expected = [1, 2, 3];
        t.deepEqual(from(duplicate).distinct().toArray(), expected);
        const objectDuplicates = from([
            { id: 5, foo: 'first' },
            { id: 5, foo: 'second' },
            { id: 6, foo: 'other' }
        ]);
        t.deepEqual(objectDuplicates.distinct().count(), 3);
        t.deepEqual(objectDuplicates.distinct(x => x.id).toArray(), [
            { id: 5, foo: 'first' },
            { id: 6, foo: 'other' }
        ]);
    });

    t.test('flat', t => {
        t.test('on iterables', t => {
            const arrArr = from([[1, 2], [3, 4]]);
            t.deepEqual(arrArr.flat().toArray(), [1, 2, 3, 4]);
            const groupBy = unionArr.groupBy(x => x).flat();
            t.deepEqual(groupBy.toArray(), unionArr.toArray());
        });
        t.test('map then flat', t => {
            const stringArrArr = from(['1 2', '3, 4']);
            t.deepEqual(stringArrArr.flat(x => x.split(' ').map(x => parseInt(x, 10))).toArray(), [1, 2, 3, 4]);
        });
    });

    t.test('join', t => {
        const categoryNames = [
            { name: 'Red', id: 3 },
            { name: 'Blue', id: 10 },
            { name: 'Green', id: 4 },
            { name: 'Violet', id: 5555 }
        ];
        const otherThings = [
            { thing: 'foo', catId: 3 },
            { thing: 'bar', catId: 4 },
            { thing: 'baz', catId: 10 }
        ];

        const joined = from(otherThings).join(
            categoryNames,
            thing => thing.catId,
            cat => cat.id,
            (thing, cat) => `${thing.thing} ${cat.name}`
        );
        const joinedBackwards = from(categoryNames).join(
            otherThings,
            cat => cat.id,
            thing => thing.catId,
            (cat, thing) => `${thing.thing} ${cat.name}`
        );

        t.equals(joined.toArray(), [
            'foo Red',
            'bar Green',
            'baz Blue'
        ]);

        // note, when goes the other way, the order differs.
        t.equals(joinedBackwards.toArray(), [
            'foo Red',
            'baz Blue',
            'bar Green'
        ]);
    });

    t.test('first', t => {
        t.equals(numArr.first(), 1);
        t.throws(() => emptyStrArr.first());
        t.equals(numArr.first(x => x === 2), 2);
        t.throws(() => numArr.first(x => x === 999));
    });

    t.test('firstOrDefault', t => {
        t.equals(numArr.firstOrDefault(), 1);
        t.equals(emptyStrArr.firstOrDefault(), undefined);
        t.equals(numArr.firstOrDefault(x => x === 2), 2);
        t.equals(numArr.firstOrDefault(x => x === 999), undefined);
    });

    t.test('single', t => {
        t.equals(singleton.single(), 1);
        t.throws(() => emptyStrArr.single());
        t.throws(() => numArr.single());
        t.equals(numArr.single(x => x === 2), 2);
        t.throws(() => numArr.single(_ => true));
    });

    t.test('singleOrDefault', t => {
        t.equals(singleton.singleOrDefault(), 1);
        t.equals(emptyStrArr.singleOrDefault(), undefined);
        t.equals(numArr.singleOrDefault(), undefined);
        t.equals(numArr.singleOrDefault(x => x === 2), 2);
        t.equals(numArr.singleOrDefault(_ => true), undefined);
    });

    t.test('last', t => {
        t.equals(numArr.last(), 3);
        t.throws(() => emptyNumArr.last());
        t.equals(numArr.last(x => x <= 2), 2);
        t.throws(() => numArr.last(x => x === 999));
    });

    t.test('lastOrDefault', t => {
        t.equals(numArr.lastOrDefault(), 3);
        t.equals(emptyNumArr.lastOrDefault(), undefined);
        t.equals(numArr.lastOrDefault(x => x <= 2), 2);
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
        const actual = from<[number, string]>([
            [1, '1'], [2, '2'], [2, 'first wins'], [3, '3']
        ]).toMap(x => x[0], x => x[1]);
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

    t.test('toSet', t => {
        t.deepEqual(Array.from(numArr.toSet()), Array.from(new Set([1, 2, 3])));
        const duplicateArray = [1, 2, 2, 1, 3, 4, 5];
        const withoutDuplicates = [1, 2, 3, 4, 5];
        t.deepEqual(Array.from(from(duplicateArray).toSet()), withoutDuplicates);
        const mapped = ['1', '2', '2', '3'];
        const mappedWithout = [1, 2, 3];
        t.deepEqual(Array.from(from(mapped).toSet(x => parseInt(x, 10))), mappedWithout);
    })

    t.test('sum', t => {
        t.test('numbers', t => {
            t.equals(numArr.sum(), 1 + 2 + 3);
        });
        t.test('strings', t => {
            // @ts-expect-error sum should not be on strArr's type
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            strArr.sum();

            t.deepEqual(strArr.sum(x => x.length), 6);
        });
    });

    t.test('average', t => {
        t.test('numbers', t => {
            t.equals(numArr.average(), (1 + 2 + 3) / 3);
            t.throws(() => emptyNumArr.average());
        });
        t.test('strings', t => {
            // @ts-expect-error average should not be on strArr's type
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            strArr.average();

            t.equals(strArr.average(x => x.length), 2);
        });
    });

    t.test('max', t => {
        const numArr = from([2, 1, 10, 4]);
        t.equals(numArr.max(), 10);
        t.throws(() => emptyNumArr.max());
        const strNumArr = from(['1', '54', '34']);
        t.equals(strNumArr.max(x => parseInt(x, 10)), 54);
    });

    t.test('min', t => {
        const numArr = from([2, 1, 10, 4]);
        t.equals(numArr.min(), 1);
        t.throws(() => emptyNumArr.min());
        const strNumArr = from(['1', '-34', '54', '34']);
        t.equals(strNumArr.min(x => parseInt(x, 10)), -34);
    });

    t.test('xBy', t => {
        const numArr = from([2, 1, 10, 4]);
        t.equals(numArr.minBy(x => x), 1);
        t.equals(numArr.maxBy(x => x), 10);
        const strArr = from(['zero', 'one', 'fourteen', 'seven']);
        t.equals(strArr.minBy(x => x.length), 'one');
        t.equals(strArr.maxBy(x => x.length), 'fourteen');
    });

    t.test('all', t => {
        t.truthy(numArr.all(x => x >= 0 && x <= 5));
        t.falsy(numArr.all(x => x >= 2));
        // confirm all stops short
        let finished = false;
        const input = from(createLazyGenerator<number>(function* () {
            yield 1;
            yield 2;
            yield 3;
            finished = true;
        }));
        // goes through the entire generator and sets finished to true.
        t.truthy(input.all(_ => true));
        t.truthy(finished);
        finished = false;
        // goes through 1, 2, and 3 but then exits, thus does finish the generator.
        t.falsy(input.all(x => x < 3));
        t.falsy(finished);
    });

    t.test('any', t => {
        t.truthy(numArr.any(x => x === 2));
        t.falsy(numArr.any(x => x === 999));
        // confirm any stops short
        let finished = false;
        const input = from(createLazyGenerator<number>(function* () {
            yield 1;
            yield 2;
            yield 3;
            finished = true;
        }));
        t.truthy(input.any(x => x === 3));
        t.falsy(finished);
        t.falsy(input.any(x => x === 999));
        t.truthy(finished);
    });

    t.test('none', t => {
        t.truthy(numArr.none(x => x === 500));
        t.falsy(numArr.none(x => x === 2));
        // confirm none stops short
        let finished = false;
        const input = from(createLazyGenerator<number>(function* () {
            yield 1;
            yield 2;
            yield 3;
            finished = true;
        }));
        t.truthy(input.none(x => x === 999));
        t.truthy(finished);
        finished = false;
        t.falsy(input.none(x => x === 3));
        t.falsy(finished);
    });

    t.test('contains', t => {
        t.truthy(numArr.contains(2));
        t.falsy(numArr.contains(999));
        t.falsy(from([{ object: '456' }, { object: '123' }]).contains({ object: '123' }));
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
