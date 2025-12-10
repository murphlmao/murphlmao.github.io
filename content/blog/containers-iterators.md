---
title: "Containers & Iterators"
date: '2025-12-09'
order: 1
description: "I avoid iteration like the plague and use map and similar unless I'm held at gunpoint"
tags: ['C++', 'cpp', 'C-lang', 'C', 'programming', 'iterators', 'containers', 'sets', 'maps', 'vectors']
---
TODO

##
- Containers & iterators
 - Maps, vectors, sets


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
In my previous posts on [Arrays & Pointer Arithmetic](./arrays-pointer-arithmetic) &
[The Heap / Dynamic Memory](./heap-of-faith#source), I brought up the fact that
`std::array` has some niceties around C-style arrays & that vectors are just dynamic
wrappers around C arrays (as in they are dynamic, not fixed, in size). Arrays are
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
        << "We're now out of bounds. Trying to access an index "
        << "with STL Containers is not allowed, & will throw an exception"
      << "\n";
      std::cout << container.at(index) << "\n";
    } catch (const std::out_of_range& e) {
      std::cout << "Caught out-of-bounds exception: " << e.what() << "\n";
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



### List


## Associative Containers
### Map
### Set