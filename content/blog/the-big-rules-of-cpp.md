---
title: "The Unholy Rules of Zero, Three, and Five in C++ Classes"
date: '2025-12-02'
order: 1
description: "I had to split this away from the C++ classes post because this language is god awful."
tags: ['C++', 'cpp', 'programming', 'deep copies', 'raii', 'classes', 'rule of three', 'rule of five', 'rule of zero']
---


todo:
- LValues & RValues — quick primer since you moved it here, sets up move semantics later
- Shallow copies — here's what happens by default, here's why it's dangerous (double free, dangling pointers)
- Deep copies — here's how we fix it (copy constructor, copy assignment operator)
- Destructors & RAII — cleaning up resources when objects go out of scope
- The Rule of Three — if you define one of these, you probably need all three
- Moves — hey, copying is expensive, what if we could just steal instead?
- The Rule of Five — Rule of Three + move constructor + move assignment operator
- The Rule of Zero — actually, just don't do any of this shit if you can avoid it. Use smart pointers.


## LValues & RValues
Before we dive into classes, the backbone of C++, we need to quickly cover
the concepts of LValues and RValues, because they are fundamental to
understanding how C++ works under the hood.


## Shallow Copies, Moves, & Deep Copies
### What is a shallow copy?
When you copy an object, you just copy the values directly.
For pointers, this means copying the pointer value itself
(the memory address), not the data it points to. So both
objects end up pointing to the same memory location. It's
can be a little counterintuitive.

If the object in the class is not a pointer, the objects just gets
copied to a new address in memory. If it is a pointer, it SORT OF
acts like a reference in that both objects now point to the same
data, but without all of the safeties that references provide (like
not being null, not being re-assignable, etc). To be clear, it is NOT
a reference, it's just a pointer that both objects happen to share
because we're making a copy of a pointer that's already been assigned to
the object we're copying from.

Here is a pretty complete example that shows shallow copying in action:
```cpp
#include <iostream>

class Cat {
  public:
    std::string* color_of_cat;

    Cat(std::string& cat_color)
      : color_of_cat(&cat_color)
    {}
};

int main() {
  std::string color_of_cat = "black";

  Cat cat1(color_of_cat);
  Cat cat2_shallow_copy = cat1;

  std::cout << "Cat 1 Address: " << &cat1 << "\n";
  std::cout << "Cat 2 Address: " << &cat2_shallow_copy << "\n\n";

  std::cout << "Cat 1 Color Pointer Address: " << cat1.color_of_cat << "\n";
  std::cout << "Cat 2 Color Pointer Address: " << cat2_shallow_copy.color_of_cat << "\n\n";

  std::cout << "Cat 1 color: " << *cat1.color_of_cat << "\n";
  std::cout << "Cat 2 color: " << *cat2_shallow_copy.color_of_cat << "\n\n";

  // change through cat1
  *cat1.color_of_cat = "orange";

  std::cout << "After changing cat1 to orange:\n";
  std::cout << "Cat 1 color: " << *cat1.color_of_cat << "\n";
  std::cout << "Cat 2 color: " << *cat2_shallow_copy.color_of_cat << "\n";
  // both values are changed, they share the same string.

  return 0;
}
```

Why is this dangerous? Because if one of the objects is destroyed and frees
the memory that the pointer points to, the other object is left with
a dangling pointer/double free situation:

```cpp
#include <iostream>

class DangerousCat {
  public:
    int* age;

    DangerousCat(int a) {
      age = new int(a);
      std::cout << "constructor: allocated memory at " << age << "\n";
    }

    ~DangerousCat() {
      std::cout << "destructor: deleting memory at " << age << "\n";
      delete age;
    }
};

int main() {
  std::cout << "creating cat1:\n";
  DangerousCat cat1(3);

  std::cout << "\ncopying cat1 to cat2 (shallow copy):\n";
  DangerousCat cat2 = cat1; // shallow copy

  std::cout << "\ncat 1 object address: " << &cat1 << "\n";
  std::cout << "cat 2 object address: " << &cat2 << "\n\n";

  std::cout << "cat 1 age pointer: " << cat1.age << "\n";
  std::cout << "cat 2 age pointer: " << cat2.age << "\n";
  std::cout << "^ both point to the address in memory\n\n";

  std::cout << "exiting main (destructors will run):\n";
  // when main ends:
  // cat2 destructor runs: deletes age
  // cat1 destructor runs: deletes the same age again
  // this is a double free.
  return 0;
}
```

A perfectly valid (and fucking amazing) question might be:

> Well, isn't `std::string my_string = 'test';`
> `std::string another_string = my_string;`
> also a shallow copy since strings use pointers
> internally and strings are classes?

The answer is yes, it would be IF the C++ standard library types
did not implement something called `copy-on-write`, which they then
moved to `deep copy` methods because `copy-on-write` has its own
set of problems. We will get into that shortly. So the answer is yes,
but actually no.


### What is a deep copy?
When you make a deep copy of an object, you create a completely independent copy
of the object and all of its data. This means that if the object contains pointers,
you also need to allocate new memory for the data being pointed to and copy the
actual data over, not just the pointer value.

How do we do that? By defining a custom `copy constructor`, `copy assignment operator`,
& a `destructor` for our class. This is referred to as the Big Three, and it's
what we need to do to properly manage resources in C++ classes.

But, because it's C++, that's not the only way to manage resources in classes, as we'll
see with the Rule of Zero later.


### What is a move?
Moving is about `transferring ownership` (ownership being a very important
programming concept) of resources instead of copying them. When you move an
object, you steal its data (like pointers) and leave the original in a valid
but empty state (usually nullptr). This is way more efficient than copying
because you're just swapping pointers around instead of allocating new memory
and copying data.

Moves happen automatically with temporary objects, or you can explicitly
request a move with `std::move()`:


```cpp
Cat makeCat(int age) {
    return Cat(age);  // Creates a temporary Cat
}

int main() {
  Cat cat1(3);
  Cat cat2 = std::move(cat1);
  // cat1 is now empty (pointer is nullptr)
  // cat2 owns the data

  return 0;
}
```

To properly support moves, you need to define a `move constructor` and
`move assignment operator` in addition to the Big Three. This is called
the Rule of Five or The Big Five. Without them, or if you have a copy constructor & a
copy assignment constructor defined, the compiler falls back to copying (even
when you use `std::move()`), which silently makes your code slower than it
should be. You can enable a flag in some compilers to warn you about this, but
by default, most of them won't.


## The Rule of Zero, Three, and Five.
All of that bullshit above was just to get us to this point. The reason these
rules exist is to solve the same problem: managing resources in C++ classes.

Broadly, let's dive into each of these rules one by one, then wrap up with showing
the Big Three/Five & Rule of Zero in action.


## The Rule of Three:
The rule of three goes something like this: If you need to define a
custom destructor, copy constructor, or copy assignment operator,
then you should probably define all three.


### The Rule of Five
C++11 introduced *move semantics*, which means we now have **five**
special member functions to worry about:
1. Destructor
2. Copy constructor
3. Copy assignment operator
4. **Move constructor** (new!)
5. **Move assignment operator** (new!)

Move semantics let you "steal" resources from temporary objects
instead of copying them. If you're managing resources and define
the Big Three, you probably want to define move operations too for
better performance. More on that later.

### The Rule of Zero (The Actual Good Advice)
Here's some free advice: **Don't manage raw resources yourself!**

Instead of using raw pointers and manually calling `new`/`delete`,
use smart pointers like `std::unique_ptr` or `std::shared_ptr`.
These handle memory management automatically, so you don't need to
define *any* of the special member functions.

```cpp
class GoodCat {
  private:
    std::unique_ptr<int[]> data;  // Smart pointer handles cleanup!
    // no destructor needed!
    // no copy constructor needed (unique_ptr isn't copyable)!
    // compiler handles everything!
};
```

The Rule of Zero says: if you can avoid manually managing resources,
**do it**. Let the standard library types handle it for you.
Modern C++ code should rarely need custom destructors or copy/move operations.

**TL;DR:** The Big Three became the Big Five, but the real wisdom is to aim for Zero.

### Okay.. but I need to show you the Big Three anyway.
Normally, I would stop there and just use the rule of zero because it's what you
*should* be doing. Unfortunately, I'm actually using these posts to help myself
study for a class... which makes me use the Big Three. So, let's dive into them one by one.

### Destructors & RAII
So, if constructors are special methods that initialize an object when it's created,
then destructors are special methods that clean up when an object is destroyed. Classes
actually have default constructors that the compiler provides for you if you don't define one
yourself, but destructors are not always provided by default, especially if your class
manages resources like dynamic memory, file handles, or network connections.

This is where the terribly named concept RAII (Resource Acquisition Is Initialization) comes
into play. Don't let the name scare you, it's painfully easy to understand. Remember that
scope in C++ is defined by what's inside a pair of curly braces `{}`. When an object goes
out of scope, that means that we need to clean the object up... which is literally a
destructors job. It cleans up or 'destroys' your object for you. Pay attention to the
following code, and notice how the stack unwinds in the LIFO order:

```cpp
#include <string>
#include <iostream>

class Cat {
  public:
    // default constructor
    Cat(std::string color_of_cat, double weight_lbs)
    // member initializer list, preferred way to
    // initialize members in C++
    : color_of_cat(color_of_cat),
      cat_weight_lbs(new double(weight_lbs)) {
        // to call methods, within a class,
        // you can optionally just call the
        // method name directly, or use 'this->'.
        // i prefer using 'this->' for clarity.
        std::cout << color_of_cat << " kitty created" << std::endl;
        this->print_variables();
        // print_variables();
    };

    // destructor
    ~Cat() {
      std::cout << color_of_cat << " kitty destroyed" << std::endl;
      delete cat_weight_lbs;
      // this->print_variables(); // !! THIS IS A USE AFTER FREE !!
    };

  private:
    std::string color_of_cat;
    double* cat_weight_lbs;

    // private method now
    void print_variables() {
      std::cout
        << " "
        << this->color_of_cat
        << " cat weighs "
        << *(this->cat_weight_lbs) // dereference pointer
        << " lbs"
      << std::endl;
    };
};

void regular_scope() {
  Cat red_cat = Cat("red", 6.0);
  Cat blue_cat = Cat("blue", 7.0);
} // blue_cat destroyed FIRST, then red_cat destroyed.
  // LIFO order: this is the stack unwinding

void new_scopes() {
  {
    // one of my cats does literally weigh 20 pounds
    Cat black_cat = Cat("black", 20.0);
  } // black cat out of scope: destroyed
  {
    // my other cat is skinny, but she has a fat heart
    Cat orange_cat = Cat("orange", 10.5);
  } // orange cat out of scope: destroyed
}

int main() {
  regular_scope();
  new_scopes();
  return 0;
}
```

The output of this program will be:
```
red kitty created
 red cat weighs 5 lbs
blue kitty created
 blue cat weighs 5 lbs
blue kitty destroyed
red kitty destroyed
black kitty created
 black cat weighs 20 lbs
black kitty destroyed
orange kitty created
 orange cat weighs 10.5 lbs
orange kitty destroyed
```

### The Big Three: Copy Constructor, Copy Assignment Operator


