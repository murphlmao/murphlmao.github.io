---
title: "C++ Object Oriented Programming - Classes & Polymorphism"
date: '2025-11-25'
order: 1
description: "RAHHH"
tags: ['C++', 'cpp', 'C-lang', 'C', 'programming', 'c style adts', 'c strings']
---


- OOP / Polymorphism
  - inheritance
  - composition

## Quickly, Templates
Templates, being the lightest part of this post, are the easiest to understand conceptually.
Basically, they allow you to specify functions or classes that can accept any
data type. This is super useful for creating generic and reusable code. They're very powerful,
but can feel a little odd to get working at first. Here is the simplest form of a template function:
```cpp
#include <iostream>

template<typename Type>
void unknown_arg_type(Type arg1) {
  std::cout << arg1 << std::endl;
}

int main() {
  unknown_arg_type("HERRO"); // prints "HERRO"
  unknown_arg_type(67); // prints 67
}
```

Without templates, you'd need to write the same function multiple times:
```cpp
void unknown_arg_type(int arg1) { std::cout << arg1 << std::endl; }
void unknown_arg_type(double arg1) { std::cout << arg1 << std::endl; }
void unknown_arg_type(const char* arg1) { std::cout << arg1 << std::endl; }
// ... and so on for every type you want to support
```

TL:DR: Templates let you write type-safe, reusable code without sacrificing
performance. The compiler generates optimized code for each type you actually use, so
there's no runtime overhead (allegedly).


TODO: protected access specifier