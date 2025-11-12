---
title: "What are pointers, references, aliases?"
date: '2025-11-12'
description: "In my arrogance, I realized I don't actually know these concepts well enough to teach lol."
tags: ['cpp', 'programming', 'pointers', 'references', 'aliases', 'C++']
---

## Preamble
'The best way to fully understand something is to make sure you can teach it to someone else' is the best
advice I've ever received in my professional career. It is an impossibly high standard that I've always
held myself to. At the University of Michigan, I realized that I was still on the bottom rung when it came
to being able to teach these concepts in the same way academics here at the University do. I want to see if
I can do it better. This all articles following this one will assume basic C++ syntax knowledge, what
programming is, what the function of code is, etc.


## Wtf is a pointer?
Let's start with a very simple code example:
```c++
int main() {
    int x = 10;
    int* ptr_to_x = &x;
    int** ptr_to_ptr_to_x = &ptr_to_x;
    int& reference_to_x = x;

    return 0;
}
```
Read out loud what is happening in each line of code here, it will help later:
- Declare a variable with the type of an `int` named `x` with the value of `10`
- Declare a **variable** with the type of an `int*` named `ptr_to_x` with a value that is the `address of x`
- Declare a **variable** with the type of an `int**` named `ptr_to_ptr_to_x` with a value that is the `address of ptr_to_x`
- Declare a **reference** with the type of `int&` named `reference_to_x` and `bind it to x`

This wording is very deliberate. Let's first break down the symbols, because they're stupid. C++, being a statically typed language, has a very specific syntax for declaring variables: `[type] [variable_name] = [value]`

That means that, to break down each line, we understand that `int`, `int*`, `int**`, and `int&` are all types. `x`, `ptr_to_x`, and `reference_to_x` are all variable names. The stuff after the equals sign is the value assigned to each variable.

You will occasionally see some morons declare pointers and references using the wrong syntax, which
usually consists of some variation of :
```c++

int * ptr_to_x =  &x;
int* *ptr_to_ptr_to_x = &ptr_to_x;
int &reference_to_x = x;
```
This is wrong. The `*` and `&` are part of the type, not the variable name. Don't do this.