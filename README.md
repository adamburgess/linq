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
