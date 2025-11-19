---
title: "C-Style ADTs & Strings"
date: '2025-11-18'
order: 1
description: "Hey, finally, a topic that is much more interesting, subjective, and abstract! Literally!"
tags: ['C++', 'cpp', 'C-lang', 'C', 'programming', 'c style adts', 'c strings']
---

Here is 5 minutes of easy fun before we get into the real hell of OOP
programming that is C++!

## What is an Abstract Data Type (ADT)?
One of the thing that was super confusing when I started programming was
"What does abstract mean in this context?" Well, the definition of *word*
abstract is *"existing in thought or as an idea but not having a physical
or concrete existence."* Okay, but what does that mean for code? How do
you have code that doesn't have a 'concrete existence'? This is a great
question, but in order to answer that, let's first understand the definition
of an Abstract Data Type (ADT), then show an example, at which point it
all becomes a LOT clearer.

An Abstract Data Type is a data type defined is basically an outline of
what you want something to do. ADTs effectively serves as a blueprint for
creating **structures** (that word is important for later) of data that
encapsulate both data and the operations that can be performed on that data.
There are varying levels of complexity to this, but with C, it's a *lot* more
fun & very simple to understand.


## C-Style ADTS
In C, we can create ADTs using the keyword `struct` (structures!). A `struct`
is a user-defined data type that allows us to group related variables together
under a single name. This is super useful for organizing data and creating more complex data types.

Here's an example of a simple `struct` that represents a `Person`:

```cpp
#include <iostream>
#include <string>

struct Person {
  std::string nickname;
  std::string address;
  int age;
  float height; // feet.inches
};

Person create_murphy() {
  Person murphy = {
    "murph",
    "i forgor :3",
    69,
    6.0f
  };
  return murphy;
}

Person create_murphys_girlfriend() {
  // this is my preferred syntax.
  // i prefer it because it's more explicit;
  // you can clearly see that .nickname is
  // being assigned "N/A", etc.
  Person murphys_non_existent_gf = {
    .nickname = "N/A",
    .address = "you're funny bro",
    .age = -1,
    .height = 6.7f
  };
  return murphys_non_existent_gf;
}

int main() {
  // these two functions do the same thing; just different syntax.
  // while the joke is that i'm perpetually single, the code
  // technically treats murphys_gf as a valid Person [object]
  Person murphy = create_murphy();
  Person murphys_gf = create_murphys_girlfriend();

  if (murphys_gf.age == -1 and murphys_gf.nickname == "N/A") {
    std::cout << murphy.nickname << "is single as FUCK" << std::endl;
  }

  murphy.height += 0.2f; // bought height boosting shoes
  return 0;
}
```

The syntax is painfully easy. A struct, for all intents & purposes, is literally
a new type - so you declare it using the same syntax as you would other types:
`[type] [variable] = [value]`. This is what makes it an ABSTRACT data type. You
define, not a `Person`, but what a `Person` is -- you define what constitutes a
a `Person`, aka... an abstract concept :).

### Syntax with pointers
The syntax for using structs with pointers is slightly different, but still
very easy to understand. When you have a pointer to a struct, you use the `->`
operator to access its members instead of the dot `.` operator.






## C-Style Strings
In C (and by extension, C++), strings aren't a built-in type like `int` or `float`.
Instead, they're represented as **arrays of characters** with a special marker
at the end of the array, which is a null character `'\0'`. The null character
indicates the end of the string.

This is fundamentally different from `std::string` in C++, which is an actual
class that handles all the messy details for you. With C-style strings, you're
working directly with raw memory. For example:

```cpp
char name[] = "Murphy";
// memory: ['M', 'u', 'r', 'p', 'h', 'y', '\0']
```

That `'\0'` at the end is invisible when you print the string, but it's
absolutely critical. Without it, functions that work with strings wouldn't
know where to stop reading. They'd just keep going through memory until they
randomly hit a zero byte, which could be... literally anywhere. This is
how buffer overflow vulnerabilities happen.

Where is this actually applicable? If you read my post on Streams & I/O,
you'll remember that `argv` is actually an array of C-style strings:
```cpp
int main(int argc, char* argv[]) {
  for (int i = 0; i < argc; ++i) {
    std::cout << argv[i] << std::endl;
  }
  return 0;
}
```

Otherwise.. just use `std::string` in C++. But why, you ask?


### Why do people hate C-style strings?
Because C-style strings are just arrays, they inherit all the limitations of arrays. You can't resize them. You can't concatenate them with `+`. You can't compare them with `==`. All of that convenient syntax you might expect simply doesn't exist.
```cpp
char* str1 = "Hello";
char* str2 = "World";
// str1 + str2;  // doesn't work
// str1 == str2; // compares pointers, not contents
```

Instead, you have to use library functions from `<cstring>` (or `<string.h>` in pure C):
```cpp
strlen(str);       // get the length
strcpy(dest, src); // copy one string to another
strcat(dest, src); // concatenate strings
strcmp(s1, s2);    // compare strings
```

As you can see, The biggest issue with C-style strings is that they
don't know their own size. These functions all rely on that null
terminator to know when to stop. If you forget to include it, these
functions will happily read past the end of your string into whatever
garbage happens to be in memory next.

This can actually be pretty dangerous, too. There's no built-in
protection against writing too much data into a string buffer. This
is called a **buffer overflow**, and it's one of the most common
sources of security vulnerabilities in C/C++ programs.

```cpp
char buffer[5] = "Hi";  // fine - "Hi\0" fits in 5 bytes
strcpy(buffer, "Hello World"); // disaster - way too long!
```

That second line will write way beyond the end of `buffer`, corrupting
whatever data happens to be there. In the best case, your program crashes.
In the worst case, an attacker exploits this to run malicious code.


### So why do they exist?
C-style strings are a relic from when C was designed in the early 1970s.
Back then, memory was extremely limited and every byte counted.
The design was simple and efficient: strings are just arrays of characters,
nothing more. No fancy classes, no safety checks, just raw pointers and memory.

Today, we still use them for a few reasons:

- **Legacy code**: Tons of existing C code uses them
- **C library compatibility**: Many system APIs expect `char*` pointers
- **Performance**: In very specific cases, they can be faster than `std::string`
- **Low-level programming**: Embedded systems and OS code often work with raw memory

### The modern alternative

Like I mentioned earlier, in C++, you should just use `std::string` instead:
```cpp
std::string name = "Murphy";
std::string greeting = "Hello, " + name;  // works, very easy!
if (name == "Murphy") { ... }             // works
```

`std::string` handles all the memory management, resizing, and safety checks
for you. It knows its own length. It can grow and shrink as needed.

C-style strings are still around because C++ maintains backward compatibility
with C, but in modern C++ code, you rarely need to touch them directly unless
you're interfacing with older C libraries or doing very low-level work.
