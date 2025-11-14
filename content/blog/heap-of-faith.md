---
title: "What is the heap? The hell that is dynamic memory."
date: '2025-11-14'
order: 1
description: "It's easy bro. If you have use 'new' then just remember to 'delete'. Just don't code bugs bro."
tags: ['C++', 'cpp', 'god died with the invention of C++', 'stack', 'memory models', 'heap']
---

## Foreword
I don't like the heap. I don't like memory management. That is all.

## Briefly revisiting the stack
Like I noted earlier in my explanation of the stack, the primary benefit it provides
for you is that it automatically manages `object lifetimes`; a lifetime is how long
that object lives in memory. For clarification, an `object` is just a piece of data
that lives at an address in memory. Stack objects have automatic lifetime; they're
created when declared and destroyed when they go out of scope.

**Static storage objects** live for the entire duration of the program. These include:
- Global variables (accessible everywhere)
- Static local variables (function-level `static int x = 0;` - local scope, but permanent lifetime)
- Static member variables in classes (shared by all instances)

The key difference is that stack objects die when their scope ends, but static storage objects
live until the program terminates.

So what happens if we declare a static variable within a new scope? Can we still use it?
The answer is technically no, but also yes! The devil is in the details. We cannot use that
**variable**, however, we can use that **object** still.

```cpp
int main() {
  int x = 10;
  int* ptr_z = nullptr;

  { // this is a new scope
    int y = 20; // allocated; local scope
    static int z = 30; // allocated; permanent lifetime
    ptr_z = &z; // save z's address before `z` becomes inaccessible
  } // y & z go out of scope; y is deallocated, z persists in memory
  // x & ptr_z are still in scope
  // *ptr_z is now set to 30
  return 0;
}
```

Even though we can't write `z` anymore after the closing brace, the object is still
alive in static storage. The variable name was just a compile-time label - once the
program runs, only the memory location matters. By saving a pointer to that location,
we bypass the scope restriction.

**Why does this matter for the heap?** Because heap memory works the same way - you'll
be managing objects that outlive their original scope, accessed through pointers. The
difference is that with heap memory, *you* control when the object dies, not the compiler.

## Dynamic memory
Dynamic memory is memory that is allocated *after* the program is already
compiled & running. We call this `at runtime`. This is important because there
are some parts of applications where we can't predict how much memory we will
need. This makes our programs more flexible when, for example, we need to take
in a range of user input data that may vary in size.

### Okay... but how do you know? Source???
You may be already using the heap without realizing it. While it's true that, in C++,
you often will use the `new` keyword to allocate memory on the heap, let's take an easier
and more relevant example to introduce the concept of dynamic memory: `std::vector` & C-style arrays.

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
  // address on the stack: 0x7ffd6d82c680
  // size: 5
  // capacity: 5

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
The general workflow for manual memory management is:

- Use `new` to allocate an object on the heap and get back a pointer to it.
`new` returns a pointer to the heap object. You'll need a pointer variable to
store that address.
- Keep track of that pointer. **The object isn't restricted to any scope**
and can be used throughout our program
- When finished, use `delete` with that pointer to destroy the object
and free its memory

For example, `new int x = 10;` is invalid because `new int` returns a pointer, but
`x` would be a regular `int` variable. Keep in mind that The heap object is anonymous
- it has no name, only an address that we access through our pointer. Here's the correct syntax:
```cpp
int* ptr = new int(10);  // correct: pointer variable stores the heap address
// stack:              heap:
// ptr (address) ───>  [10]

// wrong examples:
// new int x = 10;     // x isn't a pointer, can't store the address
// int x = new int(10); // x is an int, not a pointer (type mismatch)
```

Now, we approach the reason that all of your games run horribly; the demon that is
manual memory management: forgetting to free your object from memory. For example,
this is perfectly valid code that will compile and run.
```cpp
#include <iostream>
int main() {
  int* ptr = new int(3);
  std::cout << *ptr << std::endl;
  return 0;
}
```

What's the issue? Remember from my explanation of the stack where I said:
> When your operating system runs your program, it gives you a chunk of
> memory (usually a few megabytes) and says "here's your stack, use it for
> your function variables."

