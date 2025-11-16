---
title: "C++ Streams & IO with constants"
date: '2025-11-16'
order: 1
description: "This is not relevant at all, but I constantly regret the period of my life where I tried live-streaming. Bro was dreaming a little TOO big."
tags: ['C++', 'cpp', 'programming', 'streams', 'io', 'constants', 'const']
---


## The context behind 'I/O'
I/O stands for input & output. I first came to know the terminology from working
in IT. The concept behind I/O is really simple: Input can be anything from your mouse,
keyboard, microphone, webcam, barcode scanner, or anything where you physically give
*input* or direction to something. Output is the opposite; monitors,
printers, speakers, and headphones are all examples of it. It is a direct causal
relationship: you provide input, something produces output for you. It's that easy.

When we talk about I/O in terms of software or application logic, it's following the
same principle. Take `CLI` (Command-line interface) applications, which accept text from
the user (referred to as `arguments`), and, based on the conditions of the arguments you
provide it, do something for you in return.

```cpp
#include <iostream>
int main(int argc, char* argv[]) {
  if (argc >= 1) {
    std::cout << argv[1]<< std::endl;
  };
  return 0;
}
```

Then if you compile & run your application with any argument, it will print to the terminal.
```bash
g++ main.cpp -o main && ./main my_argument
 # my_argument
```

Let's talk about what those `argc` & `argv[]` parameters are, though.


## Accepting & parsing user input