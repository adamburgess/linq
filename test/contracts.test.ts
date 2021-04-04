import 'source-map-support/register.js'
import sinon from 'sinon'
import { Assert } from 'zora'
import Enumerable from '../src/enumerable.js'
import from, { Sequence } from '../src/linq.js'
import { expectType } from './helpers.js'

export default function contracts(t: Assert) {
    t.test('drawing from original iterable', t => {
        const range = Enumerable.range(1, 3);
        const spy = sinon.spy(range, Symbol.iterator);
        const input = from(range);
        // not called before it has been got
        t.eq(spy.callCount, 0);
        const mapped = input.map(x => x);
        // still not called, even after transformations
        t.eq(spy.callCount, 0);
        // called once for each enumeration.
        t.eq(mapped.count(), 3);
        t.eq(spy.callCount, 1);
        t.eq(mapped.count(), 3);
        t.eq(spy.callCount, 2);
    });

    t.test('groupBy', t => {
        const range = Enumerable.range(1, 3);
        const spy = sinon.spy(range, Symbol.iterator);
        const input = from(range);
        const grouped = input.groupBy(x => x);
        t.eq(spy.callCount, 0);
        grouped.toArray();
        t.eq(spy.callCount, 1);
    });

    t.test('map', t => {
        const input = from([1, 2, 3]);
        const mapper = sinon.spy((x: number) => x);
        const mapped = input.map(mapper);
        t.eq(mapped.count(), 3);
        t.eq(mapper.callCount, 3);
        t.eq(mapped.count(), 3);
        t.eq(mapper.callCount, 6);
    });

    t.test('orderBy then something else', t => {
        const input = from([2, 1, 3]);
        t.equals(input.first(), 2);
        t.equals(input.orderBy(x => x).toArray(), [1, 2, 3]);
        t.equals(input.orderBy(x => x).first(), 1);
    });

    t.test('iterable that is iterable', t => {
        class Test implements Iterable<string> {
            [Symbol.iterator]() {
                return ['one', 'two', 'three'][Symbol.iterator]();
            }
        }
        const input = from([new Test()]);
        expectType<Test[]>(input.toArray());
        expectType<Sequence<string>>(input.flat());
    });
}
