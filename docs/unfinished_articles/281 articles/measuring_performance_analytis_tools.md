---
title: "Measuring Performance & Analysis Tools"
date: '2026-01-20'
order: 1
description: "An overview of tools and techniques for measuring the performance of code and analyzing its efficiency."
tags: ['C++', 'cpp', 'C-lang', 'C', 'programming', 'stacks', 'big O', 'time complexity', 'data structures', 'algorithms']
---


# lecture notes:

- runtime demo in 01/20/26
logarithmic algorithms ?

- the issue in this code the snippet is not passed by reference

- the algorithm implentation can be correct but we can still be getting slowdowns and not the expected time complexity due to the fact that, for vector, we aren't passing by reference (constant time), where passing by value is linear time

```claude
 any issues with this search.cpp?

● Read(search.cpp)
  ⎿  Read 144 lines

● Yes, there's a significant performance bug (which the comments
  indicate is intentional for lecture discussion):

  Pass-by-value instead of pass-by-reference (lines 51 and 68)

  int linearSearch(vector<int> vec, int val)    // copies entire
  vector!
  int binarySearch(vector<int> vec, int val)    // copies entire
  vector!

  Both functions take the vector by value, meaning the entire
  vector is copied on every call. Since testSearch calls these
  functions 100 times, you're copying the vector 100 times.

  This should be:
  int linearSearch(const vector<int> &vec, int val)
  int binarySearch(const vector<int> &vec, int val)

  This bug makes both searches appear to have worse complexity
  than they actually do - the O(n) copy operation dominates,
  making even binary search appear O(n) instead of O(log n).

  Minor issues:

  1. Line 123: atoi() has no error handling - invalid input
  returns 0 silently. std::stoi() would throw on bad input.
  2. Line 122: No check that argv[1] is non-empty before
  accessing argv[1][0] (though argc check makes this unlikely to
  cause problems).
  3. Line 94: For very large vectors, 2 * vec.size() could
  overflow, but this is unlikely in practice.

  The pass-by-value bug is the key teaching point - it
  demonstrates why passing large containers by const reference
  matters for performance.

❯ is pass by value a linear time operation?

● Yes. When you pass a vector<int> by value, the copy constructor
   runs and must:

  1. Allocate memory for n elements
  2. Copy all n elements to the new location

  Both steps are O(n), so passing a vector by value is O(n).

  This is why the bug matters so much:
  ┌──────────────┬──────────┬────────────────────────┐
  │   Function   │ Expected │ With pass-by-value bug │
  ├──────────────┼──────────┼────────────────────────┤
  │ linearSearch │ O(n)     │ O(n) + O(n) = O(n)     │
  ├──────────────┼──────────┼────────────────────────┤
  │ binarySearch │ O(log n) │ O(n) + O(log n) = O(n) │
  └──────────────┴──────────┴────────────────────────┘
  The O(n) copy dominates binary search's O(log n) work,
  destroying its advantage. When you time both searches in this
  code, they'll perform similarly - not because binary search is
  slow, but because both are bottlenecked by the copy.

❯ so if we pass by reference, that means its constant time?

● Yes. Passing by reference is O(1) - constant time.

  A reference is essentially just an address (pointer) to the
  original object. Regardless of whether the vector has 10
  elements or 10 million, you're only passing a fixed-size memory
   address (typically 8 bytes on a 64-bit system).

  No copying of elements occurs - the function operates directly
  on the original vector.

  That's why the fix changes the complexity:
  ┌──────────────┬──────────────────────┬────────────────┐
  │   Function   │ With copy (by value) │ With reference │
  ├──────────────┼──────────────────────┼────────────────┤
  │ linearSearch │ O(n)                 │ O(n)           │
  ├──────────────┼──────────────────────┼────────────────┤
  │ binarySearch │ O(n)                 │ O(log n)       │
  └──────────────┴──────────────────────┴────────────────┘
  Binary search regains its logarithmic advantage once the linear
   copy overhead is removed.

```


tool usage isnt really on exam according to lecture

What do the stats mean in each column:
- using perf
- also time command
  - dd command


- using valgrind for memory leaks
  - memcheck

(maybe callgrind ?)

