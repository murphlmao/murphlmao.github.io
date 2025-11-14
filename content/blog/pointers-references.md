---
title: "Intro to pointers & references."
date: '2025-11-11'
order: 2
description: "Pointer? I barely even knew her! Can you allocate a pointer to my heart???"
tags: ['cpp', 'programming', 'pointers', 'references', 'aliases', 'C++']
---

Quick Mapping:
- `*` next to a type (e.g., `int*`): Makes it a pointer type
- `*` in front of a pointer variable (e.g., `*ptr`): "Dereference" operator - gets the value at the address
- `&` next to a type (e.g., `int&`): Makes it a reference type
- `&` in front of a variable (e.g., `&x`): "Address of" operator - gets the memory address


## What is a pointer?
A pointer, for all intents and purposes, is just another variable. Let's start with a very simple code example:
```c++
int main() {
    int x = 10;
    int* ptr_to_x = &x;
    int** ptr_to_ptr_to_x = &ptr_to_x;
    int& reference_to_x = x;

    return 0;
}
```
Read out loud what is happening in each line of code here, it will help later;
- Declare a **variable** with the type of an `int` named `x` with the value of `10`
- Declare a **variable** with the type of an `int*` named `ptr_to_x` with a value that is the `address of x`
- Declare a **variable** with the type of an `int**` named `ptr_to_ptr_to_x` with a value that is the `address of ptr_to_x`
- Declare a **reference** with the type of `int&` named `reference_to_x` and `bind it to x`

This wording is very deliberate. Let's first break down the symbols, because they're stupid
 C++, being a statically typed language, has a very specific syntax for declaring variables:
 `[type] [variable_name] = [value]`

That means that, to break down each line, we understand that `int`, `int*`, `int**`,
and `int&` are all types. `x`, `ptr_to_x`, `ptr_to_ptr_to_x`, and `reference_to_x` are
all variable names. The stuff after the equals sign is the value assigned to each variable.

You will occasionally see some people declare pointers & references using the 'politically incorrect' syntax,
which usually consists of some variation of:
```c++
int * ptr_to_x = &x;
int *ptr_to_x = &x;
int ** ptr_to_ptr_to_x = &ptr_to_x;
int &reference_to_x = x;
```
**This is wrong**. The `*` and `&` are part of the type, not the variable name. Don't do this. Please. [Even Google agrees with me](https://google.github.io/styleguide/cppguide.html#Pointer_and_Reference_Expressions).

> Ermmm actually ☝️🤓 what about multiple declarations on a single line???  Like `int *x, y`;

Why the fuck are you doing this in the first place? That declares `x` as a pointer
but `y` as just a regular int - which proves exactly why this syntax is terrible and
you shouldn't do it. If it's not clear that they're supposed to be the same type
**while you're including a type modifier**, like is the case with `int x, y` then
you literally have no defendable position to argue from. You're risking code readability
for the sake of getting back one extra line. Read Google's style guide & go take a shower.


The reason it helps to understand pointers this way is for when we
start actually doing things with pointers. For example, can we get the value of a pointer? Yes, we
just need to do something called `dereferencing`. This literally just means we are getting the value
of the thing the pointer is pointing to. That's it.

I, personally, treat the `*` symbol similarly to the mathematical concept of `cancelling out like terms`. What happens when we remove `*` from a type like `int*`? We are left with just an `int`. What about `*` from an `int**`? `int*`. And so on and so forth.
```c++
int main() {
  int x = 10;
  int* ptr_to_x = &x;
  int** ptr_to_ptr_to_x = &ptr_to_x;

  // both of these variables now hold the value of x.
  int value_of_ptr_to_x = *ptr_to_x;
  int value_of_ptr_to_ptr_to_x = **ptr_to_ptr_to_x;

  return 0;
}
```

## What is a reference?
A reference is basically just an alias for another variable. When you create a reference, you are
not creating a new variable; you are just creating a new name for an existing variable. This means
that any changes made to the reference will also affect the original variable, and vice versa.
```c++
int main() {
  int x = 10;
  int& reference_to_x = x;
  reference_to_x = 20; // this changes x to 20

  return 0;
}
```
When you declare a reference, you cannot change what it is referencing. It is permanently bound
to the variable it was created with.
```c++
int main() {
  int x = 10;
  int y = 20;
  int& reference_to_x = x;

  // this does NOT change the reference to point to y.
  // it changes the value of x to 20.
  reference_to_x = y;
  return 0;
}
```

## Cool. How do we do shit with pointers and references?

When you pass variables to functions, you have three options:

### 1. Pass by Value (Copy)
We can essentially provide a copy of `num` to `change_value`, where we cannot
modify the argument that was passed into it, but we can modify that argument within
the scope of the `change_value` function.

```c++
void change_value(int x) {
  x = 100;  // x is locally scoped here.
}

int main() {
  int num = 10;
  change_value(num);
  return 0;
}
```

### 2. Pass by Reference (Alias)
We are literally passing an alias to the original variable. Remember, references
are just another name for an existing variable.

```c++
void change_value(int& x) {
  x = 100; // this changes the ORIGINAL variable
}

int main() {
  int num = 10;
  change_value(num); // pass by reference
  // num is now 100!
  return 0;
}
```

### 3. Pass by Pointer (Address)
```c++
void change_value(int* x) {
  *x = 100;  // dereference to change the value at that address
}

int main() {
  int num = 10;
  change_value(&num); // pass the ADDRESS of num
  // num is now 100!
  return 0;
}
```

### Why use references vs pointers in function parameters?

**References (`int& x`):**
- Cleaner syntax - no need for `&` when calling or `*` when using
- Cannot be null - always refers to something valid
- Preferred when you know the parameter will always exist

**Pointers (`int* x`):**
- Can be `nullptr` - useful for optional parameters
- More explicit at call site (`&num` shows you're passing an address)
- Required when you might want to reassign what you're pointing to
```c++
void process(int& required, int* optional) {
    required = 50;  // Always valid

    if (optional != nullptr) {
        *optional = 100;  // Only modify if provided
    }
}

int main() {
    int x = 10;
    int y = 20;

    process(x, &y);      // Both provided
    process(x, nullptr); // Only x provided

    return 0;
}
```

**Rule of thumb:** Use references when the parameter is required, use pointers when it's optional or you need to convey that you're working with addresses explicitly.