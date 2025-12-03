---
title: "C++ Classes, RAII, Operator Overloading, & The Big Three"
date: '2025-12-01'
order: 1
description: "You have no idea how long I procrastinated writing this lol. C++ classes are wild & contain some of the worst parts of the language"
tags: ['C++', 'cpp', 'programming', 'deep copies', 'raii', 'classes',, 'operator overloading']
---

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
| Instance | A specific object created from a class blueprint |
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

Quickly, let's touch on access specifiers: `public`, `private`, `protected`. They are
really simple to understand. `public` members can be accessed from outside the class,
while `private` members can only be accessed from within the class.

For example, I cannot call `orange_cat.color_of_cat` directly in `main` because
`color_of_cat` is private. If I tried to do that, the compiler would throw an error.
This is a fundamental part of encapsulation in OOP, which helps to protect the
internal state of an object and prevent unintended interference from outside code.

The `protected` specifier is a bit more advanced, and I can't cover it here without worrying
about all of the baggage that is Object-Oriented Programming, but just know for now that `protected`
members can be accessed by derived classes (but not by outside code) via something called `inheritance`.


## Operator Overloading
We need to now take a quick detour to discuss operators in C++, because operator
overloading is a really important concept that that will eventually tie into the
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
we can add two objects together? For example, what if we had a `Cat` class and we wanted to
define what it means to "add" two cats together? Or if we divide two cats to get two really
funny looking half-cats that will have a very depressing story at the animal shelter? We cannot
actually do this by doing something called `operator overloading`. The term, in my opinion,
is a bit misleading, because we're not really "overloading" anything, we're just defining
what an operator means for our custom class; at its core, it's just another method that
we're adding to the class.


### How to divide cat???
So, let's take that joke I made earlier a little more seriously, and literally look
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
      : current_ascii(FULL_ASCII)
    {}

    // constructor that takes custom ASCII art
    Cat(const std::vector<std::string>& art)
      : current_ascii(art)
    {}

    /*
      non-mutating: creates a new Cat.

      note the const at the end of the function
      declaration : this method does not modify
      'this', and only returns a new modified Cat.
    */
    Cat operator/(int divisor) const {
      return Cat(divide_ascii(divisor));
    }

    // mutating: modifies this Cat
    Cat& operator/=(int divisor) {
      current_ascii = divide_ascii(divisor);
      return *this; // return reference to self after modification
    }

    // display the cat ASCII art, don't worry about
    // what this code actually does, it's just for fun.
    void display(bool show_adoption_sign = false) const {
      for (size_t i = 0; i < current_ascii.size(); i++) {
        std::cout << current_ascii[i];

        if (show_adoption_sign && i < ADOPTION_SIGN.size()) {
          std::cout << "  " << ADOPTION_SIGN[i];
        }

        std::cout << std::endl;
      }

      if (show_adoption_sign && ADOPTION_SIGN.size() > current_ascii.size()) {
        for (size_t i = current_ascii.size(); i < ADOPTION_SIGN.size(); i++) {
          std::cout
            << std::string(current_ascii[0].length(), ' ')
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

  // but don't worry! this is a good language!
  // you can still get the address!
  cat2 = std::addressof(cat1);
  std::cout << cat2 << std::endl;
  return 0;
}
```

Let me know when the nightmares stop.


## The Big Three: Destructors, Copy Constructor, Copy Assignment Operator
The story behind the Big Three is nightmarish. The "rule of three"
goes something like this: If you need to define a custom destructor,
copy constructor, or copy assignment operator, then you should probably
define all three.

Simple enough? **Nope.** That's not actually the entire story.

### The Rule of Five
C++11 introduced *move semantics*, which means we now have **five** special member functions to worry about:
1. Destructor
2. Copy constructor
3. Copy assignment operator
4. **Move constructor** (new!)
5. **Move assignment operator** (new!)

Move semantics let you "steal" resources from temporary objects
instead of copying them. If you're managing resources and define the
Big Three, you probably want to define move operations too for better performance.

**Python analogy:** Python doesn't really have this problem because it uses reference counting. When you do `x = y`, you're just copying a reference, not the entire object. C++ makes you explicitly choose between copying (`Cat new_cat = old_cat;`) and moving (`Cat new_cat = std::move(old_cat);`).

### The Rule of Zero (The Actual Good Advice)
Here's the plot twist: **Don't manage raw resources yourself!** 

Instead of using raw pointers and manually calling `new`/`delete`, use smart pointers like `std::unique_ptr` or `std::shared_ptr`. These handle memory management automatically, so you don't need to define *any* of the special member functions.
```cpp
class GoodCat {
private:
    std::unique_ptr<int[]> data;  // Smart pointer handles cleanup!
    // No destructor needed!
    // No copy constructor needed (unique_ptr isn't copyable)!
    // Compiler handles everything!
};
```

The Rule of Zero says: if you can avoid manually managing resources, **do it**. Let the standard library types handle it for you. Modern C++ code should rarely need custom destructors or copy/move operations.

**TL;DR:** The Big Three became the Big Five, but the real wisdom is to aim for Zero.


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


