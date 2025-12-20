---
title: "Arrays & Pointer Arithmetic"
date: '2025-11-13'
order: 1
description: "You guys ever learn so much about something you really didn't want to learn about? That's been me for all of Fall 2025."
tags: ['C++', 'cpp', 'pointers', 'references', 'pointer arithmetic']
---

## Foreword & Credits
Don't let the word "arithmetic" intimidate you. Pointer arithmetic is just
simple addition and subtraction (+, -, ++, --) that moves pointers through
memory. If you can do `x + 3`, you can do pointer arithmetic.

I'm going to rip an example right from
[Low Level Learning's video](https://www.youtube.com/watch?v=q24-QTbKQS8)
on pointer arithmetic, but I've translated it to C++ & without all of the assembly
stuff.

I still recommend watching his video regardless.


## First, a very long detour: what is an array?
To understand pointer arithmetic, we *need* to understand arrays at a low level.
An array is a data structure that has a fixed capacity of elements of the same type
that you can store inside of it. For example, let's say we wanted to store the numbers
1-5 in one data structure:
```cpp
#include <array>

int main() {
  std::array<int, 5> cpp_array = {10, 20, 30, 40, 50};
  // OR, for C-style arrays
  int c_array[5] = {10, 20, 30, 40, 50};
  return 0;
}
```

For all examples going forward, we will be using C-style arrays because, while C++
provides some niceties in `std::array`, C-style arrays make these concepts a lot clearer,
and we don't have to worry about all of the extra fluff that C++ gives us (with one exception
I'll note later).


### Array on the stack
An array in memory is just a contiguous (*sharing a common border; touching*) block
where elements are stored back-to-back. Take the above array declaration and
consider what that looks like in memory:
```
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│   10    │   20    │   30    │   40    │   50    │
└─────────┴─────────┴─────────┴─────────┴─────────┘
0x1000    0x1004    0x1008    0x100C    0x1010
  arr[0]    arr[1]    arr[2]    arr[3]    arr[4]
```


### But, of course, that's not the entire story
Take this code here & observe the output:
```cpp
#include <iostream>
using namespace std; // don't do this btw.

int main() {
  int c_array[5] = {10, 20, 30, 40, 50};
  cout << &c_array << endl; // 0x1000
  cout << &c_array[0] << endl; // 0x1000

  // decays to pointer of first element
  cout << c_array << endl; // 0x1000

  cout << typeid(&c_array).name() << endl; // PA5_i
  cout << typeid(&c_array[0]).name() << endl; // Pi
  cout << typeid(c_array).name() << endl; // A5_i
  return 0;
}
```

All of these things point to the same address in memory, but, confusingly, all
of them have different types. The `typeid` translates to types we're already familiar with:
| **Type Name** | **C++ Type**          |
|---------------|-----------------------|
| PA5_i         | Pointer to Array of 5 ints |
| Pi            | Pointer to int        |
| A5_i          | Array of 5 ints       |


### What is pointer decay?
Let's zoom in on `c_array` for the moment. "Pointer decay" means the array automatically
converts to a pointer to its first element in most contexts. In other words, the
compiler, because it hates you (and only because it hates you), secretly converts
your array to a pointer to its first element.

Why would someone do this to you? Well, pointer decay happens for a good reason, I guess.
Efficiency! Passing pointers is more optimal than copying entire arrays.

A good rule of thumb: If you use the array name by itself
(not with `[]` or `sizeof`), it decays to a pointer.

```cpp
int* ptr = c_array;     // c_array decays to &c_array[0]
int* ptr = &c_array[0]; // explicitly get address of first element

// more decay examples:
c_array             // just using the name → decays to int*
c_array + 2         // using in arithmetic → decays to int*, then adds
func(c_array)       // passing to function → decays to int*
int* ptr = c_array; // assignment → decays to int*
```

There are exactly **three** contexts where arrays don't decay:
```cpp
sizeof(c_array) // returns 20 (bytes) (4 bytes/int * 5 ints)
&c_array        // address of array
c_array[0]      // using operator[]
```


### Why does this matter?
The type matters for pointer arithmetic. Because of pointer decay, when we
want to pass a **C-style array** to a function, we have to be careful about
the type we use.
```cpp
void print_array(int c_array[5]) {
  // this looks like it takes an array, but it's a TRAP
  // c_array is actually int*, NOT int[5]
  // the [5] is ignored by the compiler. thanks C!

  sizeof(c_array); // returns 8 (size of pointers on 64-bit), not 20

  // since you've lost the size information completely, you can't loop
  // over the array safely
  for (int i = 0; i < 6; i++) {
    cout << c_array[i] << endl; // will read out of bounds.
  }
}

int main() {
  int c_array[5] = {10, 20, 30, 40, 50};
  sizeof(c_array);  // 20 bytes (5 ints)

  print_array(c_array);  // c_array decays to int*
  // the function has NO idea it's 5 elements long
}
```

This is why C programmers pass size separately:
```cpp
void print_array(int* c_array, int size) {
  // now we know how many elements we actually have
  for (int i = 0; i < size; i++) {
    cout << c_array[i] << endl;
  }
}

int main() {
  int c_array[5] = {10, 20, 30, 40, 50};
  print_array(c_array, 5);  // must pass size manually
}
```

These function signatures are ALL identical to the compiler:
```cpp
void func(int c_array[5]);
void func(int c_array[]);
void func(int* c_array);
// all three mean the SAME thing: takes an int*
```

The moment you pass an array to a function, it decays to a pointer &
loses all size information. This is one of C++'s most infamous footguns
inherited from C.

Fortunately, C++ provides `std::array` to solve this problem. Since it's a
real object that can be copied, passed by value, and keeps its type information,
we don't actually have to worry about pointer decay with it:
```cpp
#include <array>

void printArray(const std::array<int, 5>& cpp_array) {
  for (size_t i = 0; i < cpp_array.size(); ++i) {
    std::cout << cpp_array[i] << std::endl;
  }
}

int main() {
  std::array<int, 5> cpp_array = {10, 20, 30, 40, 50};
  printArray(cpp_array);
  return 0;
}
```


## Hey, remember pointer arithmetic?
Pointer arithmetic is weird. Take this code for example:
```cpp
#include <iostream>

int main() {
  // see the earlier "Array on the stack" diagram
  int c_array[5] = {1,2,3,4,5};
  int element1 = c_array[0];
  int element3 = c_array[0] + 2;
  return 0;
}
```

What would you expect `element3` to return? You would be forgiven for
thinking that maybe it returns some address like `0x1002`, but that
is not the case. The deal with pointer arithmetic is that the
compiler already knows what you're talking about and doesn't
literally try to add 2 to the address of the pointer. It instead
recognizes that:

"The user wants to move forward 2 elements. Each element is an int (4
bytes). So I'll add 2 × 4 = 8 bytes to the address."

So the math behind `element3` is actually:
```
c_array[0] + 2
= 0x1000 + (2 × sizeof(int))
= 0x1000 + (2 × 4)
= 0x1000 + 8
= 0x1008
```

The compiler scales the addition by the size of the
type. This is the magic (and confusion) of pointer arithmetic.

Array indexing is also just pointer arithmetic in disguise:
when you write `c_array[2]`, the compiler translates it to:
`c_array[2]  ≡  *(c_array + 2)`

That's right - array indexing IS pointer arithmetic plus
dereferencing. The brackets [] are just syntactic sugar. Both
expressions:
- Take the base address (c_array)
- Add 2 element-widths (+ 2 → + 8 bytes)
- Dereference to get the value (*)

You could even write this (but please don't):
```cpp
2[c_array] // this is just *(2 + c_array)
```
Because addition is commutative, `c_array + 2` is the same as `2 + c_array`,
so `c_array[2]` and `2[c_array]` are equivalent. This is
cursed knowledge that you should never use in production code.


### Contrived Example
Let's take this code example that I modified slightly from Low Level's video. The scenario
is that we have an array of `people` with the type `Person`. We want to set the age
of everyone in that array to `0`.
```cpp
struct Person {
  char name[64];
  int age;
};

int main() {
  int num_people = 100;
  Person people[num_people]; // array of 100 people
  Person* p_person = &people[0];

  for (int i = 0; i < num_people; ++i) {
    p_person->age = 0;
    ++p_person;
  }
  return 0;
}
```

Ignoring the fact that this example is a bit contrived, let's focus on the line
`++p_person;`. What does that do?

When you increment a pointer, it moves forward by the size of the type it points to.
In this case, `p_person` is a `Person*`, and `sizeof(Person)` is 68 bytes
(64 bytes for `name` + 4 bytes for `age`). So, each time we do `++p_person;`,
it moves forward by 68 bytes in memory, effectively pointing to the next `Person` in the array.

In case you were wondering why this example is a little contrived, it's because there's
actually a better way to do this with a range-based for loop:
```cpp
#include <iostream>

struct Person {
  char name[64];
  int age;
};

int main() {
  Person people[100];

  for (Person &person : people) {
    person.age = 0;
    std::cout << "Person age: " << person.age << std::endl;
  }
  return 0;
}
```


### Some other trivia
When you subtract two pointers from each other, you get the number
of elements (distance) between them (not bytes):
```cpp
int* ptr1 = &c_array[0];  // 0x1000
int* ptr2 = &c_array[4];  // 0x1010
ptr2 - ptr1;  // returns 4 (not 16!)

// the compiler calculates:
// (0x1010 - 0x1000) / sizeof(int)
// = 16 bytes / 4 bytes per int
// = 4 elements
```

### Pointer Comparison
You can compare pointers with `==`, `!=`, `<`, `>`, `<=`, `>=`. They compare **addresses**, not values.

```cpp
int c_array[5] = {10, 20, 30, 40, 50};
int* ptr1 = &c_array[1];
int* ptr2 = &c_array[3];

ptr1 == ptr2;  // false - different addresses
ptr1 < ptr2;   // true  - ptr1 is at lower address
*ptr1 < *ptr2; // true  - compares values (20 < 40)
```

This is occasionally useful for bounds checking; otherwise it's not super common or useful:
```cpp
int* end = c_array + 5;
int* current = c_array;

while (current < end) {
  std::cout << *current << std::endl;
  ++current;
}
```

**Note:** Only compare pointers within the same array. Comparing pointers from different arrays is undefined behavior.


### Traversal by pointer vs index
There's often multiple ways to traverse an array: by index or by pointer.
For all intents and purposes, there is no modern, meaningful difference
between the two methods in C++. You should use index traversal **unless**
you have a specific reason to use pointer traversal (e.g., working with C APIs).
```cpp
#include <iostream>

int main() {
  int const num_elements = 5;
  int c_array[num_elements] = {1,2,3,4,5};

  // c_array decays to a pointer to the first element
  // end points to one-past-the-end
  // we don't dereference end, however; we just use it for comparison
  int* end = c_array + num_elements;

  for (int* ptr = c_array; ptr < end; ++ptr) {
    std::cout << *ptr << std::endl;
  }

  // index
  for (int i = 0; i < num_elements; ++i) {
    std::cout << c_array[i] << std::endl;
  }
  return 0;
}
```