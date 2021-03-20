import 'source-map-support/register.js'
import linqTest from './linq.test.js'
import enumerableTest from './enumerable.test.js'
import contractsTest from './contracts.test.js'

import { test } from 'zora'

test('linq', linqTest);
test('enumerable', enumerableTest);
test('contracts', contractsTest);
