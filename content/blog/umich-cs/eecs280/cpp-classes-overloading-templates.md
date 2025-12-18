---
title: "C++ Classes, Operator Overloading, & Templates"
date: '2025-12-01'
order: 1
description: "You have no idea how long I procrastinated writing this. C++ classes are wild & easily contain some of the worst parts of the language."
tags: ['C++', 'cpp', 'programming', 'classes', 'operator overloading', 'templates']
---

## Introduction
This post is going to be a bit of a doozy because it's an
amalgamation of several different C++ concepts that all tie together in
an extraordinarily messy way. Classes, operator overloading, and templates
are prerequisites to one of the most dog shit parts about C++:
The Big Three/Five/Zero (which is what I will cover in the next post).


## What is a class?
Asking "what is a class?" is, unfortunately, not as straightforward as asking
"what is a function?". The idea of a function is pure—you put some data in
and you get some data out. The idea of a class is not necessarily about what you
expect out of the class based on your input, but it's really about giving data
to the class and letting that define the behavior you want that class to have.


### Why is everything an object now???
This can be confusing to beginners because this is where the term "object"
starts to take on a bit more of an obscure meaning. Previously, I've said that
an object is just a piece of data that lives at an address in memory, and while
that's technically true, that's not really how most people think about objects
conceptually or talk about them semantically. It's a very academic way of speaking.
When programmers say "object" in the context of OOP (object-oriented programming)
or classes, they usually mean an instance of a class you've defined, but sometimes
they don't mean that either! And they're literally just referring to the class
definition itself.

This ambiguity is unfortunate, but as it so happens, that ambiguity works out in
your favor. Now an 'object' isn't just a piece of data that lives at an address in
memory, it has literally become a synonym for the word 'thing'. This means that
you can now use it super liberally to talk about literally anything in programming.
It might just be me, but I think one of these sounds significantly cooler than the other:

> Yeah, my ex passed me an object that had a method to break up with me.

> She left me bro.


### What does a class do for us?
If you look at what it takes to define a physical object in the real world, like a chair,
you can prescribe attributes to that chair—color, material, size, weight, etc. You can
also prescribe behaviors to that chair—it can be sat on, it can be moved, lifted, stuff like that.
Defining and prescribing these attributes and behaviors to things is the essence of
what a class is. It's literally a blueprint for creating objects that have certain
attributes and behaviors. This set of capabilities is an incredibly powerful tool
on your belt, but as Uncle Ben once said, and I paraphrase:

> With great power... comes a huge fucking number of keywords & dumbass concepts to remember.

To help with the mess we're about to dive into, please review this table for definitions
of all of the terms we will cover:

| Term | Definition |
|------|------------|
| Instance | A specific object created from a class |
| Instantiate | To make an instance of |
| Instance Variable / Member variable | A variable who holds data for each instance of the class |
| Class Variable / Static Member Variable | A variable shared across all instances of a class. Never changes |
| Method | A function defined inside a class, which can use member variables |
| Constructor | A special method that initializes an object when it's created |
| Destructor | A special method that cleans up when an object is destroyed |
| `this` | A pointer to the current instance of the class. Used to reference the classes internal members |
| Access Specifier | Keywords (`public`, `private`, `protected`) that control visibility of members |


## Using Classes
### Basic Class Example
```cpp
#include <string>
#include <iostream>

class Cat {
  private:
    // private member variable, or "instance variable"
    // can only be accessed by methods of the class.
    // the value of the variable is populated per-instance.
    std::string color_of_cat;

  public:
    // static member variable, or "class variable"
    // this is shared across all instances of the
    // class. since this is public, it can also be
    // freely accessed by the user of the class.
    inline static const std::string cat_sound = "meow";

    // default constructor
    Cat(std::string color_of_cat) {
      // to call methods within a class,
      // you can optionally just call the
      // method name directly, or use 'this->'.
      // i prefer using 'this->' for clarity.
      this->color_of_cat = color_of_cat;
    };

    // public method
    void print_cat_color() {
      std::cout << this->color_of_cat << std::endl;
    };
};

int main() {
  Cat black_cat = Cat("black");
  black_cat.print_cat_color(); // prints "black"

  Cat orange_cat = Cat("orange");
  orange_cat.print_cat_color(); // prints "orange"

  std::cout
    << orange_cat.cat_sound // prints "meow"
    << black_cat.cat_sound // prints "meow"
  << std::endl;
}
```
Read out loud everything that's happening
- We define a class called `Cat` with the following:
  - A private member variable `color_of_cat` to store the color of each cat
  - A public static member variable `cat_sound` that is shared across all instances of the class
  - A constructor that takes a color as input, and initializes the private member variable `color_of_cat` with that value
  - A public method `print_cat_color` that prints the color of the cat
- In `main`, we create two instances of `Cat` with different colors and print their colors
- We also access the public static member variable `cat_sound` which is shared across all
instances of the class (it always equals "meow").

A constructor may sound confusing and fancy, but it's literally just a function that gets
run immediately when you create an instance of a class. Its job is to set up the initial
state of the object. In other words, a set of operations that you want to immediately perform
when an object is created.

Quickly, let's touch on access specifiers: `public`, `private`, `protected`. They are
really simple to understand. `public` members can be accessed from outside the class,
while `private` members can only be accessed from within the class.

For example, I cannot call `orange_cat.color_of_cat` directly in `main` because
`color_of_cat` is private. If I tried to do that, the compiler would throw an error.
This is a fundamental part of encapsulation with classes, which helps to protect the
internal state of an object and prevent unintended interference from outside code.

The `protected` specifier is a bit more advanced, and I can't cover it here without worrying
about all of the baggage that is Object-Oriented Programming, but just know for now that `protected`
members can be accessed by derived classes (but not by outside code) via something called `inheritance`.


## Operator Overloading
We need to now take a quick detour to discuss operators in C++, because operator
overloading is a really important concept that will eventually tie into the
hell-scape that is **The Big Three**.


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
If we tried to do something like "`"hello" + 5`", it would not make sense because
adding a string and a number is not a defined operation.

Okay, but why is this important? Well, what if we wanted to define such a case that
we can add two objects together for a class of our own? For example, what if we had a `Cat` class and we wanted to
define what it means to "add" two cats together? Or if we divide two cats to get two really
funny looking half-cats that will have a very depressing story at the animal shelter? We can
actually do this by doing something called `operator overloading`. The term, in my opinion,
is a bit misleading, because we're not really "overloading" anything, we're just defining
what an operator means for our custom class; at its core, it's just another method that
we're adding to the class.


### How to divide cat???
So, let's give our cats the ability to have a really depressing backstory and literally look
at what it would look like if we had an operator overload for the division operators
(`/` & `/=`) that cut a cat based on what fraction we divided it by. Don't worry about
the ASCII art or the display methods at all, that's just for fun. Focus on the overloads.
Note that for operator overloads, you always need to use the keyword `operator` followed
by the operator symbol you want to overload.

```cpp
#include <iostream>
#include <vector>
#include <string>

class Cat {
  private:
    inline static const std::vector<std::string> FULL_ASCII = {
      " _._     _,-'\"\"`-._",
      "(-.,`._,'(       |\\`-/|",
      "    `-.-' \\ )-`( , o o)",
      "          `-    \\`_`\"'-"
    };

    inline static const std::vector<std::string> ADOPTION_SIGN = {
      " _____________________",
      "|                     |",
      "|  This f'd up cat    |",
      "|  is adoptable!      |",
      "|_____________________|"
    };

    std::vector<std::string> current_ascii;

    // helper method to perform the division calculation
    std::vector<std::string> divide_ascii(int divisor) const {
      std::vector<std::string> divided_art;

      for (const std::string& line : current_ascii) {
        size_t start = line.length() / divisor;
        divided_art.push_back(line.substr(start));
      }

      return divided_art;
    }

  public:
    // default constructor: no arguments needed
    Cat()
      // every cat will start off looking normal: the full ASCII art
      // this : syntax is called a member initializer list,
      // it's the preferred way to initialize member variables in C++
      : current_ascii(FULL_ASCII)
    {}

    // constructor that takes custom ASCII art
    Cat(const std::vector<std::string>& art)
      : current_ascii(art)
    {}

    /*
      non-mutating: creates a new Cat.

      note the const at the end of the function
      declaration: this method does not modify
      'this', and only returns a new modified Cat.
    */
    Cat operator/(int divisor) const {
      return Cat(divide_ascii(divisor));
    }

    // mutating: modifies this Cat
    Cat& operator/=(int divisor) {
      this->current_ascii = divide_ascii(divisor);
      return *this; // return reference to self after modification
    }

    // display the cat ASCII art, don't worry about
    // what this code actually does, it's just for fun.
    void display(bool show_adoption_sign = false) const {
      for (size_t i = 0; i < this->current_ascii.size(); i++) {
        std::cout << this->current_ascii[i];

        if (show_adoption_sign && i < ADOPTION_SIGN.size()) {
          std::cout << "  " << ADOPTION_SIGN[i];
        }

        std::cout << std::endl;
      }

      if (
          show_adoption_sign && ADOPTION_SIGN.size() >
          this->current_ascii.size()
        ) {
        for (
          size_t i = this->current_ascii.size();
          i < ADOPTION_SIGN.size();
          i++
        ) {
          std::cout
            << std::string(this->current_ascii[0].length(), ' ')
            << "  " << ADOPTION_SIGN[i]
          << std::endl;
        }
      }
    }
};

int main() {
    Cat kibby;
    kibby.display(); // display full cat

    kibby /= 2;  // this will slice kibby in half
    kibby.display(true);

    // this will NOT modify kibby, but
    // instead create a new Cat that is
    // half of kibby, but that change is
    // lost since we don't store the result
    kibby / 2;

    // this does store the result, though
    Cat amputated_kibby = kibby / 2;
    amputated_kibby.display(true);

    return 0;
}
```

The output will end up being something like this:
```
 _._     _,-'""`-._
(-.,`._,'(       |\`-/|
    `-.-' \ )-`( , o o)
          `-    \`_`"'-
_,-'""`-._   _____________________
      |\`-/|  |                     |
 )-`( , o o)  |  This f'd up cat    |
-    \`_`"'-  |  is adoptable!      |
            |_____________________|
"`-._   _____________________
|\`-/|  |                     |
, o o)  |  This f'd up cat    |
`_`"'-  |  is adoptable!      |
       |_____________________|
```


#### Some stupid trivia
Look over this code, then realize that real people use this language
to build software that *billions* of people rely on every day.

```cpp
#include <iostream>

class Cat {
  public:
    Cat() {}

    // 'being a dick' overload
    Cat* operator&() {
      std::cout << "Nah." << std::endl;
      return nullptr;
    }
};

int main() {
  Cat cat1;
  Cat* cat2 = &cat1;
  // prints: 'Nah'
  // the & operator is overloaded
  // this is rarely useful, and
  // it's a terrible feature of
  // the language.

  // but don't worry! this is a good language!
  // you can still get the address!
  cat2 = std::addressof(cat1);
  std::cout << cat2 << std::endl;
  return 0;
}
```

Let me know when the nightmares stop.

## Lastly, Templates
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

I'll be honest, there's quite a bit more to templates, especially when you
start getting into template specialization, SFINAE, and concepts, but those are
advanced topics that are far beyond the scope of this post. For now, just understand
that templates let you write code that works with any data type, making your
code more flexible and reusable.

TL:DR: Templates let you write type-safe, reusable code without sacrificing
performance. The compiler generates optimized code for each type you actually use, so
there's no runtime overhead (allegedly).
