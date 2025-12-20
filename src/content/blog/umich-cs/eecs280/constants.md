---
title: "The Joy of Constants"
date: '2025-11-17'
order: 1
description: "I really did not want to talk about constants lol. They're incredibly boring, and the syntax is immensely frustrating. But they're important, so here we are."
tags: ['C++', 'cpp', 'C-lang', 'C', 'programming', 'constants',]
---


## Quick Reference

**Reading tip**: Read right-to-left for clarity:
- `const int* ptr`: "ptr is a pointer to an int that is const"
- `int* const ptr`:  "ptr is a const pointer to an int"
- `const int* const ptr`: "ptr is a const pointer to an int that is const"

**Key Patterns**:
- `const` before `*`: data is const
- `const` after `*`: pointer is const
- `const` on both sides: everything is const

## Constants

Constants are a type qualifier that indicate something cannot change after it's declared.
`const` tells the compiler that we don't intend for some value to change or be changeable.
This is a really easy concept to understand, but like with I/O, the syntax can become annoying
very quickly, specifically when you mix pointers & references in.

The trick is understanding WHAT the `const` is modifying. The best mental model:
**read declarations right-to-left**. For example, `const int* ptr` reads as "ptr is a
pointer to an int that is const."


### Basic Const Variables

The simplest form of const - making a variable itself immutable (*unchanging over time; unable to be changed*).
```cpp
const int MAX_SIZE = 100;
// MAX_SIZE = 200;  // error: assignment of read-only variable
```

Once initialized, `MAX_SIZE` cannot be modified. This is useful for values that should remain
constant throughout the program, like configuration values or mathematical constants.


### Pointers to Const Data

A pointer that can change where it points, but **cannot modify the data** it points to.
```cpp
int x = 5;
int y = 10;

const int* ptr_to_const = &x;
// *ptr_to_const = 20;  // error: assignment of read-only location
ptr_to_const = &y;      // ok: can point to different address
```

The `const` qualifier is placed before the type (or after, but that's less readable). This means
the data is read-only through this pointer, but the pointer itself can be reassigned. This is
extremely common in function parameters where you want to pass data without allowing modification.

**Alternative Syntax (Avoid):**
```cpp
int const* ptr_to_const2 = &x;  // same meaning as above
```

While `int const*` is technically equivalent to `const int*`, the latter is more conventional
and easier to read for most developers.
[Google, once again, has spoken on this:](https://google.github.io/styleguide/cppguide.html#Use_of_const)

> Some people favor the form int const* foo to const int* foo. They argue that this is more readable
> because it's more consistent: it keeps the rule that const always follows the object it's describing.
> However, this consistency argument doesn't apply in codebases with few deeply-nested pointer expressions
> since most const expressions have only one const, and it applies to the underlying value. In such cases,
> there's no consistency to maintain. Putting the const first is arguably more readable, since it follows
> English in putting the "adjective" (const) before the "noun" (int).

TL:DR: Don't be a dick. Use `const int*`.


### Const Pointers

A pointer whose **address** cannot change, but the data it points to can be modified.
```cpp
int x = 5;
int y = 10;

int* const const_ptr = &x;
*const_ptr = 20;   // ok: can modify the data
// const_ptr = &y; // error: assignment of read-only variable
```

The `const` qualifier comes after the `*`, making the pointer itself constant. Once initialized,
you cannot make it point to a different address. This is useful when you need a guaranteed,
fixed reference to a specific memory location.


### Const Pointer to Const Data

Maximum immutability - neither the pointer nor the data can change.
```cpp
int x = 5;
int y = 10;

const int* const fully_const = &x;
// *fully_const = 20; // error: can't modify data
// fully_const = &y;  // error: can't change pointer
```

This combines both forms of const. The data is read-only AND the pointer cannot be reassigned.
This is less common but useful when you need complete immutability guarantees.


### Const References

A reference that cannot be used to modify the referenced data.
```cpp
int x = 5;

const int& ref_to_x = x;
// ref_to_x = 30; // error: assignment of read-only reference
x = 30;           // ok: can still modify x directly
```

Const references are extremely common in C++, especially for function parameters. They provide
the efficiency of pass-by-reference without allowing the function to modify the original data.
Note that the original variable can still be modified through other means - the const only
applies to access through this particular reference.


### Const Function Parameters

Using const in function signatures to prevent modification of arguments.
```cpp
void print_value(const int& val) {
  // val = 10;  // error: assignment of read-only reference
  std::cout << "Value: " << val << std::endl;
}

int x = 5;
print_value(x);
```

This is one of the most important uses of const in C++. For non-primitive types especially,
passing by const reference (`const Type&`) is the standard way to avoid expensive copies while
guaranteeing the function won't modify the argument. This is far more efficient than pass-by-value
for large objects like strings, vectors, or custom classes.


### Const Return Values

Returning const values from functions (though rarely useful for primitives).
```cpp
const int get_const() {
  return 42;
}
int result = get_const();  // const is stripped on copy
result = 50;  // ok: result is not const
```

For primitive types, returning const is generally pointless because the value is copied anyway.
However, returning `const&` or `const*` can be useful for preventing modification of class
members or static data (I'll talk about classes later). For example:

```cpp
class Person {
  private:
    std::string name;
  public:
    Person(std::string n) : name(n) {}

    // returns const reference - prevents modification
    const std::string& getName() const {
      return name;
    }
  };

Person p("Alice");
const std::string& name = p.getName();
// name[0] = 'B';  // error: can't modify through const reference
```

In the `getName()` function, the first const, before the type, means the reference
that we return CANNOT be modified to change the string it points to. The second
const, after the function name, means that this function does not modify the
class/object, `Person`, itself.


### Const with Arrays

Making array elements immutable.
```cpp
const int arr[] = {1, 2, 3};
// arr[0] = 10;  // error: array elements are const
```

When you declare an array as const, all of its elements become read-only. This is useful for
lookup tables or other data that should never change at runtime.

### Pointers and Const Arrays

Combining pointers with const arrays.
```cpp
const int arr[] = {1, 2, 3};

const int* arr_ptr = arr;
arr_ptr++;  // ok: can move pointer
// *arr_ptr = 20;  // error: can't modify through pointer
```

Array names decay to pointers, so you can create a pointer to const data from a const array.
The pointer itself can move through the array, but you cannot modify the elements through
the pointer.