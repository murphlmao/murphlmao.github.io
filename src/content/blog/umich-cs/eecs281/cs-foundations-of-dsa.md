---
title: "Computer Science Foundations of Data Structures & Algorithms"
date: '2026-09-19'
order: 1
description: "Basic CS topics that are needed in order to engage with Data Structures & Algorithms"
tags: ['C++', 'cpp', 'pointers', 'Data Structures', 'Algorithms', 'Data Structures & Algorithms']
---


## What to know before DS&A.


## What is an abstraction?
An abstraction is just "deferring" the work or understanding to something else. In other words, it's choosing what to ignore & letting something else "handle it" for you.

You do this every day. When you use a computer, you abstract or 'defer' all of the processing that your computer does away to the actual device.

In code, this means that we just ignore things. From the electricity from the ground, to the logic gates, to 0s & 1s, to data persistence, to `int`, `char`s (which are actually an abstraction over integer character codes), strings (abstraction of `char`s), and so on and so forth. 


## What is a data type? 
A data type is how your computer (the compiler/interpreter) will interpret, store, & manipulate a value. It dictates what sorts of data can be stored in it, how much memory it takes up, & what operations you can perform with it. There are 2 important classifications of data types: Primitive data types & composite data types.


### Primitive Data Types
Primitive data types, often called fundamental data types, are data types that you can't "reach inside of". For example, when you have a vector, you can call `push_back()` to add an element to the end of the vector:

```cpp
#include <vector>
#include <iostream>

void printVectorContents(std::vector<int> vec) {
    for (int value : vec) {
        std::cout << value << " ";
    }
    std::cout << std::endl;
}

int main() {
    std::vector<int> test = {0,1,2,3,4};
    printVectorContents(test); // 0 1 2 3 4
    test.push_back(5);
    printVectorContents(test); // 0 1 2 3 4 5
}
```

But with a primitive data type, you can't call anything within it because there is nothing to call:
```cpp
int main() {
    char character = 'a';
    character.push_back('b'); /* not a thing
              ^~~~~~~~~
    error: request for member ‘push_back’ in ‘character’, which is of non-class type ‘char’
    */
}
```

Practically, this means that primitive values get added directly to memory. Another way of looking at it is that these values physically translate onto something the hardware can actually read (machine words, registers, etc).

There are quite a few "fundamental" data types in C++, but the most important ones are:

| Category | Type | Typical size | Notes |
|---|---|---|---|
| Boolean | `bool` | 1 byte | `true` / `false` |
| Character | `char` | 1 byte | Integer type with character interpretation |
| Integer | `short` | 2 bytes | |
| Integer | `int` | 4 bytes | Default integer |
| Integer | `long` | 4 or 8 bytes | 8 on Linux/macOS, 4 on Windows |
| Integer | `long long` | 8 bytes | |
| Floating-point | `float` | 4 bytes | Single precision |
| Floating-point | `double` | 8 bytes | Double precision, the default |
| Floating-point | `long double` | 8–16 bytes | Platform-dependent |
| No value | `void` | — | Functions that return nothing |

Every integer type also has an `unsigned` variant. Sizes are what you'll see on mainstream 64-bit platforms; the standard only guarantees minimums and ordering (`char` ≤ `short` ≤ `int` ≤ `long` ≤ `long long`).

For the readable version with ranges and version notes: https://en.cppreference.com/w/cpp/language/types

Standard section: https://eel.is/c++draft/basic.fundamental


### Composite Data Types
Also called complex data types, composite data types are data types that are, as the name implies, composed of other types. A composite data type should be seen more as a layout (or blueprint) that can be treated as one value. Fundamentally, this means you can "reach" parts within the type.

Importantly, a composite data type isn't necessarily one thing or one idea, it's just a broad definition that encompasses the overwhelming majority of all practical data types. 

For example, structs:
```cpp
#include <iostream>

struct Characters {
    int A = 10;
    int B = 11;
};

int main() {
    Characters character_set;
    std::cout
        << character_set.A << " "
        << &character_set.A << "\n";

    std::cout
        << character_set.B << " "
        << &character_set.B << "\n";
    // 10 0x7ffc473350a0
    // 11 0x7ffc473350a4
}
```

Example 2: Arrays

```cpp
#include <iostream>

int main() {
    const int array_size = 4;
    int array_ints[array_size] = {0,1,2,3};
    for (int index = 0; index < array_size ; index++) {
        std::cout
            << array_ints[index] << " " << &array_ints[index] << "\n";
        // 0 0x7ffef72beef0 // size of an int is 4 bytes
        // 1 0x7ffef72beef4 // each member of the array is "contiguous"
        // 2 0x7ffef72beef8 // i.e. "in the same block" of memory
        // 3 0x7ffef72beefc
    }
}
```

Functionally, that is all that is really needed to understand data types. There is quite a bit more, like talking about how classes, vectors, strings, etc are composites, but it's not pertinent to the discussion of higher level data structures.


## What's a Data Structure?
A data structure is a composite data type that has specific functionality to perform a specific set of operations.

The reason we organize data into data structures is so that, when we need to use them, it translates real ideas into data representations in memory. The goal is to make sure that our operations are as cheap as possible. 

What this actually means is that we need to define what trade-offs are acceptable for each use case. In English, that means we want some operations to be fast while recognizing that some other operations will suffer as a result.


### Example: Linked Lists vs Arrays.
Imagine a scenario where you have a sorted container and you keep inserting new values into it, one at a time, each at its correct sorted position. The number of values in these containers will be denoted by `n`.

Why not use an array? Well, finding the sorted position is fast: you can jump to any index directly, and since it's sorted you can binary search. Insertion, however, is slow. Every element after the spot has to shift right one slot to make room. Shifting `n` elements costs `O(n)` (linear, cost scales directly with the number of elements).

What about [a doubly] linked lists? Insertion is fast. Once you find it, you allocate a node & you re-point 2 pointers, which is `O(1)` (constant, the time it takes does not scale with `n` elements in the list). Finding the correct position is slow. Because you can't use pointer (technically index) arithmetic (linked lists aren't contiguous in memory), that means that you need to walk through the list, one pointer at a time, to find the correct position. This costs `O(n)` because, worst case, you will need to scan every element in the list to find the correct position. 

So which one wins? Neither. This scenario isn't actually trying to make the case that one is better than the other. It's purely about showing that there are trade-offs to how you choose to approach a problem. Whether you choose to use an array or a linked list depends on which operation you do more. 


## What's an Abstract Data Type (ADT)?
An abstract data type, colloquially called an interface, is just a description of what a data structure does. For example, the List ADT looks like: 

| Operation | Promise |
|---|---|
| `size()` | Returns the number of elements, `n` |
| `empty()` | Returns true if `n == 0` |
| `get(i)` | Returns the element at position `i`, for `0 <= i < n` |
| `set(i, x)` | Replaces the element at position `i` with `x` |
| `insert(i, x)` | Puts `x` at position `i`; every element from `i` onward shifts to `i + 1`; `n` grows by 1 |
| `remove(i)` | Removes the element at position `i`; every element after it shifts to `i - 1`; `n` shrinks by 1 |

It's literally just saying "Hey these are the functions you can call on this data structure to do stuff". ADTs don't actually *do* or, more accurately, implement anything. They just describe the thing that does the doing. 


## What's an Algorithm?
An algorithm is a set of instructions. That's it. If you're a nerd, you could be a little more specific and say *"An algorithm is a finite, unambiguous sequence of steps that turns an input into an output."*
