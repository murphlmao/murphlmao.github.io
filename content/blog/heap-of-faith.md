---
title: "What is the heap? The hell that is dynamic memory."
date: '2025-11-13'
order: 2
description: "It's easy bro. If you have use 'new' then just remember to 'delete'. Just don't code bugs bro."
tags: ['C++', 'cpp', 'god died with the invention of C++', 'stack', 'memory models', 'heap']
---

## Foreword
I don't like the heap. I don't like memory management. That is all.

## Dynamic memory
Dynamic memory is memory that is allocated *after* the program is already
compiled & running. We call this `at runtime`. This is important because there
are some parts of applications where we can't predict how much memory we will
need. This makes our programs more flexible when, for example, we need to take
in a range of user input data that may vary in size.

### What are some examples of this?
You may be already using the heap without realizing it. While it's true that, in C++,
you often will use the `new` keyword to allocate memory on the heap, let's take an easier
and more relevant example to introduce the concept of dynamic memory: `std::vector` & `std::array`.

Vectors are fundamentally dynamic in size. You can add or remove elements from them at runtime,
and they will automatically manage their memory for you. Why is this the case? Because vectors are
actually **pointers to the first element of an array on the heap**. So what does the vector object
look like on the stack?
- A pointer to the first element of a heap-allocated array
- Size (how many elements are in use)
- Capacity (how much space is allocated)
```
  Stack:
  ┌─────────────────┐
  │  my_vector      │
  │  ├─ pointer ────┼──┐  (points to first element on heap)
  │  ├─ size = 5    │  │
  │  └─ capacity = 5│  │
  └─────────────────┘  │
                       │
  Heap:                │
  ┌────────────────────▼──┐
  │ [1][2][3][4][5]       │  ← contiguous array
  └───────────────────────┘
    ↑
    pointer points here (to array[0])
```

Here is a code example which demonstrates this:
```cpp
#include <iostream>
#include <vector>

int main() {
  std::vector<int> my_vector = {1,2,3,4,5};
  // Address on the stack: 0x7ffd6d82c680
  // Size: 5
  // Capacity: 5

  // how do we find the pointer to the heap allocated array?
  // my_vector.data() -> 0x562fd87a8320
  for (int i = 0; i < my_vector.size(); ++i) {
    std::cout << "vec[" << i << "] addr = " << (my_vector.data() + i) << std::endl;
    // my_vector[0] = 1 at address 0x562fd87a8320
    // my_vector[1] = 2 at address 0x562fd87a8324
    // my_vector[2] = 3 at address 0x562fd87a8328
    // my_vector[3] = 4 at address 0x562fd87a832c
    // my_vector[4] = 5 at address 0x562fd87a8330
  }
  return 0;
}
```

Anytime you want to do anything with a vector, like add or remove elements, the wrapper
around the heap-allocated array will handle all of that for you. This is one of the
main reasons why vectors are preferred over raw arrays in C++.

## Okay, but what if we want to make it ourselves?

To allocate memory on the heap manually, we use the `new` keyword. This tells the
compiler to allocate a block of memory of a specified size on the heap and return
a pointer to that memory. Here is an example:
```cpp
