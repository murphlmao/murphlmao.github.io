---
title: "C++ Class Fundamentals: RAII, Overloading, Templates, & The Big Three"
date: '2025-12-01'
order: 1
description: "You have no idea how long I procrastinated writing this; Classes, Overloading, RAII, Deep Copies, and the Big Three."
tags: ['C++', 'cpp', 'programming', 'deep copies', 'raii', 'classes', 'templates', 'operator overloading']
---


## Introduction
### What is a class?
Asking "what is a class?" is, unfortunately, not as straightforward as asking
"what is a function?". The idea of a function is pure—you put some data in
and you get some data out. The idea of a class is not necessarily about what you
expect out of an object based on your input, but it's really about giving data
to the class and letting that define the behavior you want that class to have.


#### Object Definition
This is also confusing to beginners because this is where the term "object"
starts to take on a bit more of an obscure meaning. Previously, I've said that
an object is just a piece of data that lives at an address in memory, and while
that's technically true, that's not really how most people think about objects
conceptually or talk about them semantically. When programmers say "object" in
the context of OOP, they usually mean an instance of a class you've defined, but
sometimes they don't mean that either, and are literally just referring to the class
definition itself.

This ambiguity is unfortunate, but it's actually pretty useful,
because an 'object' is just a generic term that you can use to refer to a large subset
of your code without worrying about what specifically that object actually is. For example,
"This object has a method that does X" vs saying "The class, `MyClass`, has a method that
does X". Both are technically correct, but the former is more abstract and
can be used to refer to any instance of `MyClass` without needing to specify
which one you're talking about.


#### What does a class do for us?
If you look at what it takes to define a physical object in the real world, like a chair,
you can prescribe attributes to that chair—color, material, size, weight, etc. You can
also prescribe behaviors to that chair—it can be sat on, it can be moved, it can
be lifted, etc. Defining and prescribing these attributes and behaviors to things
is the essence of what a class is. It's literally a blueprint for creating objects
that have certain attributes and behaviors.

Obviously, being able to define something entirely object, data type, or whatever else
you can think of yourself is extremely powerful, but with great power... comes a huge fucking
number of concepts & keywords remember. To help with the mess we're about to dive into, please
review this table for definitions of all of the terms we will cover:

| Term | Definition |
|------|------------|
| Member Variable | A variable declared inside a class that holds data for each instance (e.g., `color`, `size`) |
| Instance Variable / Member variable | A variable who's value is given when the object is instantiated |
| Class Variable / Static Member Variable | A variable shared across all instances of a class. Never changes |
| Method | A function defined inside a class, which can use member variables |
| Constructor | A special method that initializes an object when it's created |
| Destructor | A special method that cleans up when an object is destroyed |
| Instance | A specific object created from a class blueprint |
| `this` | A pointer to the current instance of the class |
| Access Specifier | Keywords (`public`, `private`, `protected`) that control visibility of members |


## Using Classes
### Basic Class Example
```cpp
#include <string>
#include <iostream>

class Cat {
  public:
    // static member variable, or "class variable"
    // this is shared across all instances of the
    // class. since this is public, it can also be
    // freely accessed by the user of the class.
    inline static const std::string cat_sound = "meow";

    // default constructor
    Cat(std::string color_of_cat) {
      this->color_of_cat = color_of_cat;
    };

    // public method
    void print_cat_color() {
      std::cout << this->color_of_cat << std::endl;
    };

  private:
    // private member variable, or "instance variable"
    // can only be accessed by methods of the class.
    // the value of the variable is populated per-instance.
    std::string color_of_cat;
};

int main() {
  Cat black_cat = Cat("black");
  black_cat.print_cat_color(); ;; // prints "black"

  Cat orange_cat = Cat("orange");
  orange_cat.print_cat_color(); // prints "orange"

  std::cout
    << orange_cat.cat_sound // prints "meow"
    << black_cat.cat_sound // prints "meow"
  << std::endl;
}
```

This is a fair chunk of code, but conceptually it's really simple:
- We define a class called `Cat` with a constructor that takes a color
- The class has a private member variable `color_of_cat` to store the color of each cat
- The class has a public method `print_cat_color` that prints the color of the cat
- In `main`, we create two instances of `Cat` with different colors and print their colors
- We also access the public static member variable `cat_sound` which is shared across all
instances of the class (it always equals "meow").


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

### The Big Three: Copy Constructor, Copy Assignment Operator, Destructor
// TODO


## Operator Overloading & Templates
### What are operators?
Operators are symbols that perform operations on variables and values.

| Type | Operators                     |
|----------|---------------------------------|
| Arithmetic | `+`, `-`, `*`, `/`, `%`, `++`, `--`          |
| Comparison | `==`, `!=`, `>`, `<`, `>=`, `<=`           |
| Logical    | `&&`, `\|\|`, `!`                    |
| Assignment | `=`, `+=`, `-=`, `*=`, `/=`, `%=`, `<<=`, `>>=` |

This is something that you should already be familiar with conceptually.
`2 + 2 = 4` is a simple example of an arithmetic operation using the `+` operator.
If we tried to do something like "`"hello" + 5`", it would not make sense,
as adding a string and a number is not a defined operation. This sort of logic
becomes important later when we discuss something called `operator overloading`,
or defining what operators do for objects that we define (often via classes).
This is very simple conceptually, but as with everything in programming, the worst
part when we go to implement it later.


### Let's overload some operators bro
So, let's take our earlier cat and say that we want to check if two cats are the same
based on their color and weight. We can overload the `==` operator to do this for us.
Here's how that would look:

```cpp
#include <string>
#include <iostream>

class Cat {
  public:
    // default constructor
    Cat(std::string color_of_cat, double weight_lbs)
    : color_of_cat(color_of_cat),
      cat_weight_lbs(new double(weight_lbs))
    {};

    bool operator==(const Cat& other_cat) const {
      if (this == &other_cat) { return true; }

      // different colors; not equal
      if (this->color_of_cat != other_cat.color_of_cat) {
        return false;
      }

      // different weights: not equal
      if (*this->cat_weight_lbs != *other_cat.cat_weight_lbs) {
        return false;
      }

      return true; // same color & same weight: equal
    }

  private:
    std::string color_of_cat;
    double* cat_weight_lbs;
};

int main() {
  Cat black_cat = Cat("black", 20.0);
  Cat black_cat2 = Cat("black", 22.0);
  Cat black_cat3 = Cat("black", 20.0);
  Cat orange_cat = Cat("orange", 10.5);

  // these statements will always be false
  // because these are all unique objects in
  if (!(black_cat == orange_cat)) {
    std::cout << "orange and black cat are different" << std::endl;
  }

  if (black_cat == black_cat2) {
    std::cout << "both black cats are the same" << std::endl;
  }

  // this is the only case that will be true, because
  // we are comparing the same object
  if (black_cat == black_cat) {
    std::cout << "literally the same cat" << std::endl;
  };

  if (black_cat == black_cat3) {
    std::cout << "these cats are twins yo" << std::endl;

  }
  return 0;
}
```

This is, admittedly, a very bad example & also the implementation is very explicit. In practice,
you would want to make this more concise, but the point is to illustrate how operator
overloading works. By defining the `operator==` method, we can now use the `==` operator
to compare two `Cat` objects based on their attributes. When we run this program, the output will be:
```
orange and black cat are different
literally the same cat
these cats are twins yo
```

I'll take this concept much further when we talk about polymorphism later, but for now,
just understand that operator overloading allows us to define custom behavior for operators
when they are used with our own classes.


### Lastly, templates
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

