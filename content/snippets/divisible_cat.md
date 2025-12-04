---
title: Divisible Cat
description: A cat that can be divided, optional adoption sign included.
date: December 1, 2025
icon: cpp
---

From my blog post on [C++ Classes, Operator Overloading, & Templates](../blog/cpp-classes-overloading-templates), here's the complete code for a `Cat` class that supports division operators to slice the ASCII art representation of a cat. The class also includes an optional adoption sign when displaying the cat.

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

