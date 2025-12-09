---
title: "C++'s Unholy Rules of Three, Five, & Zero"
date: '2025-12-08'
order: 1
description: "I had to split this away from the C++ classes post because this language is god awful."
tags: ['C++', 'cpp', 'programming', 'deep copies', 'raii', 'classes', 'rule of three', 'rule of five', 'rule of zero']
---


## Value Categories

Briefly, let's address a fundamental part of C++ that didn't really have
a home in any of my other previous posts: `value categories`.

There are five value categories in modern C++: `lvalues`, `prvalues`,
`xvalues`, `glvalues`, and `rvalues`. They can be a little weird to
understand at first, but there's a couple of rules you can generally
use to identify and understand them. In all honesty, the semantics here
are confusing and aren't practically important if you're just starting out
with C++, so if you want, you can probably just read these heading and move on:

- [What is an Expression?](#what-is-an-expression)
- [The Three Core Categories](#the-three-core-categories)
- [Why does this matter?](#why-does-this-matter)


### What is an Expression?

An **expression** is any piece of code that produces a value.
When you write code, almost everything is an expression:

```cpp
x           // expression - just the variable name
x + 5       // expression - adds two numbers
foo()       // expression - calls a function
x = 10      // expression - assigns a value

int x = 5;  // NOT an expression, but instead a declaration
// x = 5 by itself is an expression, however.
```

Every expression in C++ has a type (like `int` or `string`) and a value category.

### The Three Core Categories

There are three fundamental categories that every expression falls into. Here
is a quick reference table. Please note that we will go into what 'moves' are
later in this post.

| Value Category | Simple Rule |
|----------------|-------------|
| **lvalue** | Has a name or persistent memory location you can take the address of |
| **prvalue** | Creates a new temporary value (literals, arithmetic results, temporaries) |
| **xvalue** | Result of `std::move()` or casting to rvalue reference - can be moved from |
| **glvalue** | Has identity/memory location (lvalues + xvalues) |
| **rvalue** | Can be moved from (prvalues + xvalues) |


#### LValues

Literally meaning 'left hand value', `lvalues` are expressions that refer to an object with a persistent memory location (where you could take the address with `&`).

Simple rule: If it has a name, it's probably an lvalue.

```cpp
int x = 5;
x;              // lvalue - x is a variable with a memory address

int arr[3];
arr[0];         // lvalue - array elements have memory addresses

std::string s = "hello";
s;              // lvalue - named variable
```

#### PRValues (Pure RValues)

These are expressions that produce **pure temporary values** -
they don't refer to an existing object, they create a new temporary one.

Simple rule: Literals *(A literal is a fixed value written directly
in your source code that represents itself.)* & expressions that create
brand new temporaries.

```cpp
42;                      // prvalue - literal number
x + 5;                   // prvalue - creates a temporary result
std::string("hello");    // prvalue - creates a temporary string
true;                    // prvalue - boolean literal
```

#### XValues (eXpiring values)

These are expressions that refer to objects whose resources
**can be stolen** (moved from). They have identity like lvalues,
but are about to expire.

Simple rule: Results of `std::move()` or casting to rvalue references.


```cpp
std::move(x); // xvalue - x can now be moved from
static_cast<std::string&&>(s); // xvalue - casting to rvalue reference
std::vector<int>().front();    // xvalue - member of temporary
```

### The Two Mixed Categories

The language also defines two convenient groupings:

#### GLValues (Generalized LValues)

This is **lvalues + xvalues**. These are expressions that have
**identity** (a memory location you could refer to).

Simple rule: Anything with an address or name.

#### RValues

This is **prvalues + xvalues**. These are expressions that can be moved from.

Simple rule: Anything temporary or about to expire.

### Visual Hierarchy:

```
        expression
           /    \
     glvalue    rvalue
      /   \      /   \
 lvalue  xvalue  prvalue
         (shared)
```

### Why Does This Matter?

The main practical difference is about moving:

```cpp
std::string a = "hello";
std::string b = a;            // copy (a is lvalue)
std::string c = std::move(a); // move (std::move(a) is xvalue)
```

Simple rule: Lvalues get copied, rvalues (prvalues and xvalues) get moved.

For everyday programming, you mostly just need to know:
- Variables are **lvalues** (can't move from them)
- Temporaries are **prvalues** (can move from them)
- `std::move(x)` makes **xvalues** (tells compiler: "move from this")

The detailed categories mainly matter when you're implementing move constructors
or understanding `overload resolution` *(how C++ decides which function to call
when you have multiple functions with the same name but different parameters)*.

This is a quick example of overload resolution:

```cpp
#include <string>

void foo(int x) { } // v1
void foo(std::string s) { } // v2

int main() {
  foo(42);      // calls version 1
  foo("hello"); // calls version 2

  return 0;
}
```

Taken further, value categories matter for overload resolution
when you have functions that take lvalue references vs rvalue references:

```cpp
#include <string>
#include <iostream>

void foo(int x) { } // v1
void foo(std::string s) { } // v2

void process(std::string& s) { // v1: lvalue reference
    std::cout << "lvalue version\n";
}

void process(std::string&& s) { // v2: rvalue reference
    std::cout << "rvalue version\n";
}

int main() {
  std::string str = "hello";

  // calls v1 (str is lvalue)
  process(str);

  // calls v2 (std::move(str) is xvalue/rvalue)
  process(std::move(str));

  // calls v2 (temporary is prvalue/rvalue)
  process("temporary");

  return 0;
}
```


## The Big Three: Destructors, Shallow Copies, Deep Copies
### Destructors & RAII
Back to classes. So, if constructors are special methods that initialize an object when it's created,
then destructors are special methods that clean up when an object is destroyed. Classes
actually have default constructors that the compiler provides for you if you don't define one
yourself, but destructors are not always provided by default, especially if your class
manages resources like dynamic memory, file handles, or network connections.

This is where the terribly named concept RAII (Resource Acquisition Is Initialization) comes
into play. Don't let the name scare you, it's painfully easy to understand. Remember that
scope in C++ is defined by what's inside a pair of curly braces `{}`. When an object goes
out of scope, that means that we need to clean the object up... which is a
destructor's job. It cleans up (destroys, destructs) your object for you. Pay attention to the
following code, and notice how the stack unwinds in the LIFO order:

```cpp
#include <string>
#include <iostream>

class Cat {
  private:
    std::string color_of_cat;
    double* cat_weight_lbs;

    // private method to print variables
    void print_variables() {
      std::cout
        << " "
        << this->color_of_cat
        << " cat weighs "
        << *(this->cat_weight_lbs) // dereference pointer
        << " lbs"
      << std::endl;
    };

  public:
    // default constructor
    Cat(std::string color_of_cat, double weight_lbs)
      // member initializer list
      : color_of_cat(color_of_cat),
        // we need to use the 'new' keyword to allocate memory
        // for the pointer variable cat_weight_lbs, otherwise
        // it will point to a random location in memory.
        // If we passed weight_lbs by reference, we could just
        // use &weight_lbs here instead of allocating new memory.
        cat_weight_lbs(new double(weight_lbs))

    // constructor body
    {
      std::cout << color_of_cat << " kitty created" << std::endl;
      this->print_variables();
    };

    // destructor
    ~Cat() {
      std::cout << color_of_cat << " kitty destroyed" << std::endl;
      delete cat_weight_lbs; // only need to do this for pointers
      // this->print_variables(); // !! THIS IS A USE AFTER FREE !!
    };
};

void regular_scope() {
  Cat red_cat = Cat("red", 6.0);
  Cat blue_cat = Cat("blue", 7.0);
} // blue_cat destroyed FIRST, then red_cat destroyed
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
 red cat weighs 6 lbs
blue kitty created
 blue cat weighs 7 lbs
blue kitty destroyed
red kitty destroyed
black kitty created
 black cat weighs 20 lbs
black kitty destroyed
orange kitty created
 orange cat weighs 10.5 lbs
orange kitty destroyed
```


### What is a shallow copy?
When you copy an object, you just copy the values directly.
For pointers, this means copying the pointer value itself
(the memory address), not the data it points to. So both
objects end up pointing to the same memory location. It
may seem a little counterintuitive, but if you try implementing
it yourself, it makes a lot more sense, I promise.

If the object in the class is not a pointer, the objects just gets
copied to a new address in memory. If it is a pointer, it *SORT OF*
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
  // they both point to the same address in memory (i.e. the same string)

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
> internally and strings are classes? Why don't we see this
> problem all over the place in C++ code?

The answer is yes, it would be IF the C++ standard library types
did not implement something called `copy-on-write`, which they then
moved to `deep copy` methods because `copy-on-write` has its own
set of problems. So.. the answer? Kinda, but no.


### Mom.. what's a deep copy?
When you make a deep copy of an object, you create a completely independent copy
of the object and all of its data. This means that if the object contains pointers,
you also need to allocate new memory for the data being pointed to and copy the
actual data over, not just the pointer value.

How do we do that? By defining a custom `copy constructor` & `copy assignment operator`.
According to the rules of the Big Three, however, if define one member of the Big Three
(`copy constructor`, `copy assignment operator`, & `destructor`), we need to define all
of them. So, we will also need a `destructor` for our class.

Here is an example of a class that properly implements deep copying:

```cpp
#include <iostream>

class Cat {
  public:
    std::string name;
    int* age;

    // default constructor
    Cat(std::string cat_name, int cat_age)
      : name(cat_name), age(new int(cat_age))
    {
      std::cout << name << " created\n";
    }

    // copy constructor:
    // we literally just need to allocate
    // new memory and copy the value over.
    // really easily done via a member initializer list
    // the compiler will identify when to use this
    Cat(const Cat& other)
      : name(other.name),
        age(new int(*other.age))
    {};

    // copy assignment operator:
    // we need to be careful to avoid memory leaks here
    // so we first delete the existing memory
    // then allocate new memory and copy the values over.
    // why copy all the values over?
    // if the object already exists, this will be used to
    // overwrite its existing values with the ones from 'other'.
    Cat& operator=(const Cat& other) {
      if (this == &other) {
        return *this; // early return
      }

      delete age;
      this->name = other.name;
      this->age = new int(*other.age);

      return *this;
    }

    // bye bye
    ~Cat() {
      delete age;
    }

};

int main() {
  Cat fat_cat("fatass", 5);
  Cat copy_fat_cat = fat_cat;  // makes an independent copy

  *fat_cat.age = 10;

  std::cout << fat_cat.name << " is " << *fat_cat.age << " years old.\n";
  std::cout << copy_fat_cat.name << " is " << *copy_fat_cat.age << " years old.\n";

  return 0;
}
```


## The Big Five: Move Semantics
### What is a move?
We mentioned it earlier, but moving is about `transferring ownership`
(ownership being a very important programming concept) of resources instead
of copying them.

When you move an object, you 'steal' its data (like pointers)
and leave the original in a valid but empty state (usually `nullptr`). This is
way more efficient than copying because you're just swapping pointers around
instead of allocating new memory and copying data.

To properly support moves, you need to define a `move constructor` and
`move assignment operator` in addition to the Big Three. This is called
the Rule of Five or The Big Five. Without them, or if you have a copy constructor
& a copy assignment constructor defined, the compiler falls back to copying
(even when you use `std::move()`), which silently makes your code slower than it
should be. You can enable a flag in some compilers to warn you about this, but
by default, most of them won't. Thanks C++, you're awesome for not having a
standard build system :).

```cpp
#include <iostream>

class Cat {
  public:
    std::string name;
    int* age;

    // default constructor
    Cat(std::string cat_name, int cat_age)
      : name(cat_name), age(new int(cat_age))
    {
      std::cout << this->name << " created\n";
    }

    // copy constructor
    Cat(const Cat& other)
      : name(other.name),
        age(new int(*other.age))
    {}

    // copy assignment operator
    Cat& operator=(const Cat& other) {
      if (this == &other) {
        return *this;
      }

      delete age;
      this->name = other.name;
      this->age = new int(*other.age);

      return *this;
    }

    // move constructor
    // steal the resources from 'other' instead of copying
    // note: takes an rvalue reference (Cat&&)
    Cat(Cat&& other) noexcept
      : name(std::move(other.name)),
        age(other.age) // the `age` pointer is 'stolen' from `other`
    {
      other.age = nullptr;  // leave other in a valid empty state
    }

    // move assignment operator
    // same idea, but for already-existing objects
    Cat& operator=(Cat&& other) noexcept {
      if (this == &other) {
        return *this;
      }

      delete age;  // clean up current resources

      this->name = std::move(other.name);
      this->age = other.age;
      other.age = nullptr;

      return *this;
    }

    // destructor
    ~Cat() {
      delete age;  // safe to call delete on nullptr
    }

};

int main() {
  Cat cat1("cat1", 3);
  Cat cat2 = std::move(cat1);

  // careful: cat1.age is now nullptr, dereferencing would be a segfault
  std::cout << "cat1's name: " << cat1.name << ", age pointer: " << cat1.age << "\n";
  std::cout << "cat2's name: " << cat2.name << ", age: " << *cat2.age << "\n";

  return 0;
}
```


## The Rule of Zero
Here's some free advice: **Don't manage raw resources yourself!**

We just spent all that time learning about destructors, copy constructors,
copy assignment operators, move constructors, and move assignment operators.
Five special member functions. That's a whoooole lotta bullshit that
**you probably shouldn't be writing.**

The Rule of Zero says: if you can avoid manually managing resources, do it.
Let the standard library types handle it for you. Instead of using raw pointers
and manually calling `new`/`delete`, use smart pointers like `std::unique_ptr`
or `std::shared_ptr`. These handle memory management automatically, so you
don't need to define any of the special member functions.

Remember our Cat class with all five special member functions? Here's what
it looks like with the Rule of Zero:
```cpp
#include <iostream>
#include <memory>

class Cat {
  public:
    std::string name;
    std::unique_ptr<int> age;

    // just a regular constructor
    Cat(std::string cat_name, int cat_age)
      : name(cat_name), age(std::make_unique<int>(cat_age))
    {
      std::cout << name << " created\n";
    }

    // no destructor needed - unique_ptr cleans up automatically
    // no copy constructor needed
    // no copy assignment needed
    // no move constructor needed - compiler generates one
    // no move assignment needed - compiler generates one
};

int main() {
  Cat cat1("kibby", 3);
  Cat cat2 = std::move(cat1);  // just works!

  std::cout << "cat2's name: " << cat2.name << ", age: " << *cat2.age << "\n";

  return 0;
}
```

That's it. The `std::unique_ptr` handles all the memory management for us.
When a `Cat` is destroyed, the `unique_ptr` automatically deletes the memory.
When a `Cat` is moved, the `unique_ptr` transfers ownership automatically.


### What about copying?
You might notice that `unique_ptr` can't be copied. It's move-only. That's
intentional: it represents *unique* ownership of a resource. If you need
copyable shared ownership, use `std::shared_ptr` instead:
```cpp
#include <iostream>
#include <memory>

class Cat {
  public:
    std::string name;
    std::shared_ptr<int> age;

    Cat(std::string cat_name, int cat_age)
      : name(cat_name), age(std::make_shared<int>(cat_age))
    {}
};

int main() {
  Cat cat1("kibby", 3);
  Cat cat2 = cat1;  // copies! both cats share the same age

  *cat1.age = 10;

  // both are 10 now because they share the pointer
  std::cout << "cat1 age: " << *cat1.age << "\n";
  std::cout << "cat2 age: " << *cat2.age << "\n";

  return 0;
}
```

> But wait, that's a shallow copy again, right? Both cats share the same age.

If you actually want deep copy semantics with smart pointers, you're back
to writing a copy constructor. At that point, you might ask yourself: do I
actually need a pointer here at all?


### The real Rule of Zero

The deeper wisdom is this: **don't use pointers unless you actually need them.**

Our Cat class has been using `int* age` this whole time to demonstrate the
Big Three/Five, but in reality... why? An `int` is tiny. Just store it directly:
```cpp
class Cat {
  public:
    std::string name;
    int age;  // just an int, no pointer

    Cat(std::string cat_name, int cat_age)
      : name(cat_name), age(cat_age)
    {}

    // literally nothing else needed
    // compiler-generated defaults work perfectly
};
```

No destructor. No copy constructor. No copy assignment. No move constructor.
No move assignment. Zero special member functions. The compiler generates
sensible defaults for all of them, and they just work.

This is the Rule of Zero: design your classes so that you don't need to write
any special member functions. Use value types and standard library containers
(`std::string`, `std::vector`, `std::unique_ptr`, etc.) as your members, and
let them handle resource management for you.


Now say it with me:

**FUCK C++**.