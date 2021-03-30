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
1. Sum (with projection to number)
1. Average (with projection to number)
1. Max (with projection to number)
1. Min (with projection to number)
<!--
1. Min By
1. Max By
-->

Special additions for number sequences:

1. Sum
1. Average
1. Max
1. Min

\* Note: Some transformations/most outputs do not work with infinite sequences, such as Group By and Order By.


## Other libraries

or: why use this one?

### [linq.js](https://github.com/mihaifm/linq) (on npm: linq)

✔️ Has _everything_.  
❌ Except iterator support.  
✔️ Extremely popular.  
⚠️ Types could be improved: toObject is not typed  
❌ 35KB minified/6.6KB brotlied  


### [iterare](https://github.com/felixfbecker/iterare)

⚠️ Really doesn't have enough methods to be general purpose. It is missing: Group, Order, Count, First, Last, Distinct. Subjectively, I use all of these.  
⚠️ Supports ES iterators, but doesn't support repeatable/lazy ES iterators  
✔️ Very popular.  
✔️ 3,744 bytes minified/1,068 bytes brotlied  

### [fromfrom](https://github.com/tomi/fromfrom)

✔️ Has it all: Yep, it just does.  
✔️ Supports ES iterators, including lazy/repeatable. (Nice!)  
⚠️ Not very popular, but hey, this library is awesome.  
✔️ 4,221 bytes minified/1,347 bytes brotlied  
✅ Great name.  

### [@siderite/linqer](https://github.com/Siderite/LInQer)

✔️ Has it all  
✔️ Supports ES iterators, including lazy/repeatable.  
⚠️ Not very popular  
❌ Typings that _aren't generic_. Useless.  
❌ 21kb minified, 4,790 bytes brotlied. It has a slim library, but it isn't UMD! Can't use it in bundlers.  

### [@adamburgess/linq](https://github.com/adamburgess/linq)

✔️ Supports ES iterators, including lazy/repeatable.  
⚠️ Has a lot of stuff. Working to get parity with fromfrom.  
✔️ Excellent typing, if I do say so myself. Has a couple features that other libraries don't have.  
❌ 1 user. Hah.  
✔️ 3,975 bytes minified/1,070 bytes brotlied (just behind iterare with way more features)  

## Performance

It's probably slow.  
It uses iterators for everything.  
If you want performance, maybe use iterare. Their readme puts performance front and center.  
