# @adamburgess/linq

A decent linq. With decent types. Less than 2kb gzipped.

[![npm version](https://img.shields.io/npm/v/@adamburgess/linq)](https://www.npmjs.com/package/@adamburgess/linq) [![gzipped size](https://bundlephobia.fly.adam.id.au/size/@adamburgess/linq?shield)](https://bundlephobia.com/result?p=@adamburgess/linq) [![brotlied size](https://bundlephobia.fly.adam.id.au/size/@adamburgess/linq?shield&brotli)](https://bundlephobia.com/result?p=@adamburgess/linq) [![npm type definitions](https://img.shields.io/npm/types/@adamburgess/linq)](https://unpkg.com/browse/@adamburgess/linq/linq.d.ts) [![codecov](https://codecov.io/gh/adamburgess/linq/branch/master/graph/badge.svg?token=MSQWH7HI95)](https://codecov.io/gh/adamburgess/linq) 

## Docs/Usage

[Generated documentation: https://linq.adam.id.au/](https://linq.adam.id.au/interfaces/linq.anysequence.html)

```typescript
import from from '@adamburgess/linq'
const sequence = from(['an', 'iterable', 'here']);
// now use any methods on sequence!
// e.g. mapping:
const uppercases = sequence.map(x => x.toUpperCase());
// note: the sequence hasn't been mapped yet! toUpperCase hasn't been called!
// you must _run_ the sequence (see Outputs below)
Array.from(uppercases); // or uppercases.toArray()
// => ['AN', 'ITERABLE', 'HERE']

// You can extend already existing transforms:
const reversed = uppercases.reverse();
// still! The sequence hasn't been reversed!
// Again you must run it:
Array.from(reversed);
// => ['HERE', 'ITERABLE', 'AN']
// note! When this reversed array was created, it ran:
// 1. the uppercase sequence (yes, again!)
// 2. the reverse method
// _ALL_ operations are deferred until outputting the sequence!
```

## Features

Completely lazy evaluation.

### Inputs

1. Arrays
1. Iterables
1. Generators
1. _Infinite_ Generators*

### Transformations

1. Map
1. Where (with narrowing!)
1. Reversing
1. Group By
1. Order By
1. Order By Descending
1. Order By ..., Then By
1. Order By ..., Then By Descending
1. Take
1. Skip
1. Take While
1. Skip While
1. Append
1. Prepend
1. Distinct
1. Flat (with projection to sequence)
1. Join (an inner join)
1. GroupJoin

### Outputs

1. Count
1. toArray
1. toMap
1. toObject
1. First (+ or Default)
1. Single (+ or Default)
1. Last (+ or Default)
1. All
1. Any
1. None
1. Contains
1. Sum (with projection to number)
1. Average (with projection to number)
1. Max (with projection to number)
1. Min (with projection to number)
1. Min By
1. Max By

Special additions for number sequences:

1. Sum
1. Average
1. Max
1. Min

Special additions for iterable/array sequences:

1. Flat

Special additions for string sequences:

1. JoinString

\* Note: Some transformations/most outputs do not work with infinite sequences, such as Group By and Order By.


## Other libraries

or: why use this one?

### [iterare](https://github.com/felixfbecker/iterare)

⚠️ Really doesn't have enough methods to be general purpose. It is missing: Group, Order, Count, First, Last, Distinct. Subjectively, I use all of these.  
⚠️ Supports ES iterators, but doesn't support repeatable/lazy ES iterators  
✔️ Extremely popular.  
✔️ 3,818 bytes minified/1,065 bytes brotlied  


### [linq.js](https://github.com/mihaifm/linq) (on npm: linq)

✔️ Has _everything_.  
❌ Except iterable support. It supports [_iterators_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterator_protocol) but not [_iterables_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol). Most of the time, you use iterables. Arrays are iterables. You use the iterable protocol to _convert_ them to iterators. Technically, it doesn't even support iterators. Only objects that are **both** iterators and iterables.  
✔️ Very popular.  
⚠️ Types could be improved: toObject ~~is~~ **_was_** not typed  
❌ 35KB minified/6.6KB brotlied  

### [fromfrom](https://github.com/tomi/fromfrom)

✔️ Has nearly everything you'd like.  
✔️ Supports ES iterators, including lazy/repeatable. (Nice!)  
⚠️ Not very popular, but hey, this library is awesome.  
✔️ 4,216 bytes minified/1,330 bytes brotlied  
✅ Great name. `import { from } from 'fromfrom'`  

### [@adamburgess/linq](https://github.com/adamburgess/linq)

✔️ Supports ES iterators, including lazy/repeatable.  
✔️ Has everything in fromfrom, everything in iterare, but not everything in linq.js. Thinking about adding an "extended" version.    
✔️ Excellent typing, if I do say so myself. Has a couple features that other libraries don't have.  
❌ 1 user. Hah.  
✔️ 4,457 bytes minified/1,251 bytes brotlied  

Others not considered:

❌ [@siderite/linqer](https://github.com/Siderite/LInQer): 5kb brotlied, ~~and the typings _aren't generic_.~~ It now has a typescript version. Yet, they've borked the packaging -- I can't import the module without changing their package.json and importing the direct path. For that reason, useless. Has similar features to fromfrom.

## Table comparison to other libraries

✔️ - has it  
⚠️ - doesn't have it, but has a one liner work around  
❌ - have to reimplement yourself, and reimplementing would be annoying if done multiple times  

|                                     | this one |             fromfrom              |              iterare              |              linq.js              |
|------------------------------------:|:--------:|:---------------------------------:|:---------------------------------:|:---------------------------------:|
|            Size in bytes (minified) |  4,457   |               4,216               |               3,818               |         35,451 (+800% ❌)          |
|            Size in bytes (brotlied) |  1,251   |               1,330               |               1,065               |         6,516  (+500% ❌)          |
|                              Arrays |    ✔️     |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                           Iterables |    ✔️     |                 ✔️                 |                 ✔️                 |                 ❌                 |
|                          Generators |    ✔️     |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                  Infinite Iterables |    ✔️     |                 ✔️                 |                 ✔️                 |                 ❌                 |
|                      Lazy Iterables |    ✔️     |                 ✔️                 |                 ❌                 |                 ❌                 |
|                                 Map |    ✔️     |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                               Where |    ✔️     |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                             Reverse |    ✔️     |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                            Group By |    ✔️     |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                            Order By |    ✔️     |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                             Then By |    ✔️     |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                                Take |    ✔️     |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                                Skip |    ✔️     |                 ✔️                 | ⚠️[[5]](#user-content-comparison5) |                 ✔️                 |
|                          Take While |    ✔️     |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                          Skip While |    ✔️     |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                              Append |    ✔️     |                 ✔️                 |                 ✔️                 |                 ❌                 |
|                             Prepend |    ✔️     |                 ✔️                 |                 ❌                 |                 ❌                 |
|                            Distinct |    ✔️     |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                                Flat |    ✔️     | ⚠️[[1]](#user-content-comparison1) |                 ✔️                 |                 ✔️                 |
|                                Join |    ✔️     |                 ❌                 |                 ❌                 |                 ✔️                 |
|                          Group Join |    ✔️     |                 ❌                 |                 ❌                 |                 ✔️                 |
|                               Count |    ✔️     | ⚠️[[2]](#user-content-comparison2) | ⚠️[[2]](#user-content-comparison2) |                 ✔️                 |
|                            to Array |    ✔️     |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                              To Map |    ✔️     |                 ✔️                 |                 ✔️                 |                 ❌                 |
|                           to Object |    ✔️     |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                              to Set |    ✔️     |                 ✔️                 |                 ✔️                 | ⚠️[[8]](#user-content-comparison8) |
|                               First |    ✔️     |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                              Single |    ✔️     |                 ❌                 |                 ❌                 |                 ✔️                 |
|                                Last |    ✔️     |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                                 All |    ✔️     |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                                 Any |    ✔️     |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                                None |    ✔️     | ⚠️[[3]](#user-content-comparison3) | ⚠️[[3]](#user-content-comparison3) | ⚠️[[3]](#user-content-comparison3) |
|                            Contains |    ✔️     |                 ✔️                 | ⚠️[[6]](#user-content-comparison6) |                 ✔️                 |
|                                 Sum |    ✔️     |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                             Average |    ✔️     |                 ❌                 |                 ❌                 |                 ✔️                 |
|                                 Max |    ✔️     |                 ❌                 |                 ❌                 |                 ✔️                 |
|                                 Min |    ✔️     |                 ❌                 |                 ❌                 |                 ✔️                 |
|                              Min By |    ✔️     |                 ❌                 |                 ❌                 |                 ✔️                 |
|                              Max By |    ✔️     |                 ❌                 |                 ❌                 |                 ✔️                 |
| Sum/Avg/Max/Min fail on non-numbers |    ✔️     | ❌[[4]](#user-content-comparison4) |                ⁿ/ₐ                |                 ❌                 |
|      Flatten fails on non-iterables |    ✔️     |                ⁿ/ₐ                | ⚠️[[7]](#user-content-comparison7) | ⚠️[[7]](#user-content-comparison7) |
|                                     |          |                                   |                                   |                                   |

notes:  
<a name="comparison1"></a>1. Use flatmap with identity.  
<a name="comparison2"></a>2. Use forEach with a count.  
<a name="comparison3"></a>3. Use !any  
<a name="comparison4"></a>4. [There is some typing to prevent Sum on non-numbers, but it actually has no effect.](https://github.com/tomi/fromfrom/blob/3876ae0/src/types.ts#L457)  
<a name="comparison5"></a>5. Use slice  
<a name="comparison6"></a>6. Use find, check for !== undefined  
<a name="comparison7"></a>7. If used on non-iterables, it returns the element unchanged. This follows how JS's .flat() works. My opinion: Why are you flattening an array of things that aren't arrays? Don't.  
<a name="comparison8"></a>8. It's untyped!  

## Performance

It's probably slow.  
It uses iterators for everything.  
If you want performance, maybe use iterare. Their readme puts performance front and center.  
