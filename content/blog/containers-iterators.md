---
title: "Containers & Iterators"
date: '2025-12-09'
order: 1
description: "I avoid iteration like the plague and use map and similar unless I'm held at gunpoint"
tags: ['C++', 'cpp', 'C-lang', 'C', 'programming', 'iterators', 'containers', 'sets', 'maps', 'vectors']
---

## What's a container?
A container is very simple: It's a thing that stores (contains) objects.
It is literally that simple. More specifically, It's a class that
**stores multiple objects** and provides methods to add, remove,
and access those objects.

You've already used containers before: arrays, vectors, lists, are
all examples of containers. Why is this important? Well, each type
of container focuses on organizing and accessing data differently
based on specific tradeoffs. Knowing how to choose the right container
for the job can make your programs more efficient and easier to understand.

It also helps to understand containers because then you can build your
own specialized containers when needed. There are a couple of basic
containers in C++ that generally fall into 2 categories: sequence containers
and associative containers.


## Sequential Containers
### Arrays & Vector
Arrays & Vectors are two types of sequential containers that are often referred to as
"array based containers" because `arrays` are the fundamental abstraction to
interface with a block of memory. This basically means it's the lowest-level
way to interact with memory in a structured way.

The thing to note about these two types of sequential containers is that they store objects
in a linear sequence. This means that the order of the objects matters,
and you can access them based on their position in that sequence. In memory, as you
might expect, these objects are stored in a contiguous block (contiguous allocation).
I explained this in detail in my previous post on [Arrays & Pointer Arithmetic](./arrays-pointer-arithmetic)

In addition to the aforementioned post & my post on [The Heap / Dynamic Memory](./heap-of-faith#source),
I brought up the fact that `std::array` has some niceties around C-style arrays & that `std::vector`s are just
dynamic wrappers around C arrays (as in they are dynamic, not fixed, in size). Arrays are
usually allocated on the stack, while vectors are allocated on the heap.

Why is this important to bring up now? Well, lets look at some of the niceties the
STL provides us when using containers like `std::array` and `std::vector` vs C-style arrays:

```cpp
#include <iostream>
#include <array>
#include <vector>

void beta_c_array(int c_array[], std::size_t size = 5) {
  // iterate through the array; including
  // 5 indices past the total amount we allocated
  for (int index = 0; index < size + 5; index++) {
    if (index == size) {
      std::cout << "We're now out of bounds:" << "\n";
    }
    std::cout << c_array[index] << "\n";
  }
}

template<typename ContainerType>
void alpha_stl_containers(ContainerType& container) {
  for (int index = 0; index < container.size() + 5; index++) {
    if (index < container.size()) {
      std::cout << container[index] << "\n";
      continue;
    }
    try {
      std::cout
        << "We're now out of bounds. Trying to access an index"
        << " with STL Containers is not allowed, & will throw"
        << " an exception"
      << "\n";
      std::cout << container.at(index) << "\n";
    } catch (const std::out_of_range& e) {
      std::cout
        << "Caught out-of-bounds exception: "
        << e.what()
      << "\n";
      break;
    }
  }
}

int main() {
  std::cout << "-----C-Style Arrays-----" << "\n";
  int c_array[5] = {1,2,3,4,5};
  beta_c_array(c_array, 5);

  std::cout << "\n" << "-----STL Array-----" << "\n";
  std::array<int, 5> std_array = {1,2,3,4,5};
  alpha_stl_containers(std_array);

  std::cout << "\n" << "-----Vector-----" << "\n";
  std::vector<int> std_vector = {1,2,3,4,5};
  alpha_stl_containers(std_vector);
  std::cout << std::endl;
  return 0;
}
```

This example basically just shows us that STL containers don't let
us do bad things, like go out of bounds. It shields us from a lot
of the common pitfalls of using raw arrays in C.

Both of these data structures provide fast & random access via indexing
(i.e. `c_array[3]`), which includes accessing/modifying elements at any
index in the container in constant time `O(1)`, and are efficient at iterating
through based on the number (`n`) of elements in the object: `O(n)`. I'll dig into
time complexity statements at another time, I fear.

Where they differ is that `std::vector` can dynamically resize itself when
elements are added or removed because of methods like `push_back()`
(to add an element to the vector) & `pop_back()` (to remove the last element).
The vector class, in addition to just the raw data, also stores two critical
attributes: `size` (The number of elements currently in the vector) and
`capacity` (The total amount of space allocated in memory)

**The capacity is always greater than or equal to the size**. When you add
elements and the size exceeds the capacity, the vector automatically allocates
a larger block of memory (typically doubling its capacity), copies all existing
elements to the new location, and frees the old memory. This reallocation is
expensive, but it happens infrequently enough that the average cost of `push_back()`
remains constant time. This design allows vectors to avoid reallocating memory on
every insertion while still providing dynamic sizing. If you know ahead of time
how many elements you'll need, you can use `reserve()` to pre-allocate the capacity
and avoid any reallocations entirely:

```cpp
#include <iostream>
#include <vector>

int main() {
  std::vector<int> numbers;
  numbers.reserve(5); // pre-allocate space for 5 elements

  // vectors track the size (elements) & capacity (allocated space)
  std::cout << "initial size: " << numbers.size() << "\n";
  std::cout << "initial capacity: " << numbers.capacity() << "\n\n";

  // add elements one by one
  for (int index = 1; index <= 10; index++) {
    // when size exceeds capacity, vector reallocates with more space
    // this reallocation is expensive, but happens infrequently
    numbers.push_back(index * 10);
    std::cout << "added " << index * 10
              << " | size: " << numbers.size()
              << " | capacity: " << numbers.capacity() << "\n";
  }

  std::cout << "\n";

  return 0;
}
```

This would be the output of that program:
```
initial size: 0
initial capacity: 5

added 10 | size: 1 | capacity: 5
added 20 | size: 2 | capacity: 5
added 30 | size: 3 | capacity: 5
added 40 | size: 4 | capacity: 5
added 50 | size: 5 | capacity: 5
added 60 | size: 6 | capacity: 10 <- capacity doubled
added 70 | size: 7 | capacity: 10
added 80 | size: 8 | capacity: 10
added 90 | size: 9 | capacity: 10
added 100 | size: 10 | capacity: 10
```


### List
Welcome to linked lists! You will use these exactly 3 more times
for the remainder of your career.

Linked lists are another type of sequential container that store
elements in a linear sequence. However, unlike arrays and vectors,
which store elements in contiguous memory locations, linked lists
store elements in `nodes`. A node is just a single unit that contains
the data, often called a datum, & pointer(s) to other nodes in the
structure that are connected via pointers.

This sounds simply conceptually, but, personally, I find the syntax
frustrating. Here is a diagram to help demonstrate a **REGULAR** linked
list first, not a doubly linked list, which is what `std::list` is in C++:

```

```

## Associative Containers



### Map
### Set


### Ordered vs Sorted

An important distinction that the C++ standard library loves to confuse:

- Ordered: Elements are stored in the order you add them. A vector is ordered.
- Sorted: Elements are arranged according to their value (ascending or descending). A sorted vector is ordered AND sorted.

```cpp
// this is "ordered" (order of submission)
std::vector submissions = {85, 92, 78, 95};

// now it's "sorted" (ascending by value): {78, 85, 92, 95}
std::sort(submissions.begin(), submissions.end());
```


Maps and sets in C++ are **sorted by key** by default because they're implemented as binary search trees. The C++ standard sometimes calls them "ordered containers," which is confusing as hell.