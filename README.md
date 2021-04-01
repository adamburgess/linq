# linq

A somewhat decent linq. With also decent types. 1.2kb gzipped.

[![codecov](https://codecov.io/gh/adamburgess/linq/branch/master/graph/badge.svg?token=MSQWH7HI95)](https://codecov.io/gh/adamburgess/linq)

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

Missing:

1. Join

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

\* Note: Some transformations/most outputs do not work with infinite sequences, such as Group By and Order By.


## Other libraries

or: why use this one?

### [iterare](https://github.com/felixfbecker/iterare)

⚠️ Really doesn't have enough methods to be general purpose. It is missing: Group, Order, Count, First, Last, Distinct. Subjectively, I use all of these.  
⚠️ Supports ES iterators, but doesn't support repeatable/lazy ES iterators  
✔️ Extremely popular.  
✔️ 3,706 bytes minified/1,047 bytes brotlied  


### [linq.js](https://github.com/mihaifm/linq) (on npm: linq)

✔️ Has _everything_.  
❌ Except iterator support.  
✔️ Very popular.  
⚠️ Types could be improved: toObject is not typed  
❌ 35KB minified/6.6KB brotlied  

### [fromfrom](https://github.com/tomi/fromfrom)

✔️ Has it all: Yep, it just does.  
✔️ Supports ES iterators, including lazy/repeatable. (Nice!)  
⚠️ Not very popular, but hey, this library is awesome.  
✔️ 4,212 bytes minified/1,326 bytes brotlied  
✅ Great name. `import { from } from 'fromfrom'`  

### [@adamburgess/linq](https://github.com/adamburgess/linq)

✔️ Supports ES iterators, including lazy/repeatable.  
⚠️ Has a lot of stuff. Working to get parity with fromfrom.  
✔️ Excellent typing, if I do say so myself. Has a couple features that other libraries don't have.  
❌ 1 user. Hah.  
✔️ 3,934 bytes minified/1,085 bytes brotlied (just behind iterare with way more features)  

Others not considered:

❌ [@siderite/linqer](https://github.com/Siderite/LInQer): 5kb brotlied, and the typings _aren't generic_. For that reason, useless. Has similar features to fromfrom.

## Table comparison to other libraries

✔️ - has it  
⚠️ - doesn't have it, but has a one liner work around  
❌ - have to reimplement yourself, and reimplementing would be annoying if done multiple times  

|                                     | @adamburgess/linq |             fromfrom              |              iterare              |              linq.js              |
|------------------------------------:|:-----------------:|:---------------------------------:|:---------------------------------:|:---------------------------------:|
|                              Arrays |         ✔️         |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                           Iterables |         ✔️         |                 ✔️                 |                 ✔️                 |                 ❌                 |
|                          Generators |         ✔️         |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                  Infinite Iterables |         ✔️         |                 ✔️                 |                 ✔️                 |                 ❌                 |
|                      Lazy Iterables |         ✔️         |                 ✔️                 |                 ❌                 |                 ❌                 |
|                                 Map |         ✔️         |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                               Where |         ✔️         |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                             Reverse |         ✔️         |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                            Group By |         ✔️         |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                            Order By |         ✔️         |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                             Then By |         ✔️         |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                                Take |         ✔️         |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                                Skip |         ✔️         |                 ✔️                 | ⚠️[[5]](#user-content-comparison5) |                 ✔️                 |
|                          Take While |         ✔️         |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                          Skip While |         ✔️         |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                              Append |         ✔️         |                 ✔️                 |                 ✔️                 |                 ❌                 |
|                             Prepend |         ✔️         |                 ✔️                 |                 ❌                 |                 ❌                 |
|                            Distinct |         ✔️         |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                                Flat |         ✔️         | ⚠️[[1]](#user-content-comparison1) |                 ✔️                 |                 ✔️                 |
|                                Join |         ❌         |                 ❌                 |                 ❌                 |                 ✔️                 |
|                               Count |         ✔️         | ⚠️[[2]](#user-content-comparison2) | ⚠️[[2]](#user-content-comparison2) |                 ✔️                 |
|                            to Array |         ✔️         |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                              To Map |         ✔️         |                 ✔️                 |                 ✔️                 |                 ❌                 |
|                           to Object |         ✔️         |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                              to Set |         ❌         |                 ✔️                 |                 ✔️                 | ⚠️[[8]](#user-content-comparison8) |
|                               First |         ✔️         |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                              Single |         ✔️         |                 ❌                 |                 ❌                 |                 ✔️                 |
|                                Last |         ✔️         |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                                 All |         ✔️         |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                                 Any |         ✔️         |                 ✔️                 |                 ✔️                 |                 ✔️                 |
|                                None |         ✔️         | ⚠️[[3]](#user-content-comparison3) | ⚠️[[3]](#user-content-comparison3) | ⚠️[[3]](#user-content-comparison3) |
|                            Contains |         ✔️         |                 ✔️                 | ⚠️[[6]](#user-content-comparison6) |                 ✔️                 |
|                                 Sum |         ✔️         |                 ✔️                 |                 ❌                 |                 ✔️                 |
|                             Average |         ✔️         |                 ❌                 |                 ❌                 |                 ✔️                 |
|                                 Max |         ✔️         |                 ❌                 |                 ❌                 |                 ✔️                 |
|                                 Min |         ✔️         |                 ❌                 |                 ❌                 |                 ✔️                 |
|                              Min By |         ✔️         |                 ❌                 |                 ❌                 |                 ✔️                 |
|                              Max By |         ✔️         |                 ❌                 |                 ❌                 |                 ✔️                 |
| Sum/Avg/Max/Min fail on non-numbers |         ✔️         | ❌[[4]](#user-content-comparison4) |                ⁿ/ₐ                |                 ❌                 |
|      Flatten fails on non-iterables |         ✔️         |                ⁿ/ₐ                | ⚠️[[7]](#user-content-comparison7) | ⚠️[[7]](#user-content-comparison7) |
|                                     |                   |                                   |                                   |                                   |

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
