---
title: "Exceptions, Error Handling, & Exit Codes"
date: '2025-11-20'
order: 1
description: "Favorite error messages: 'Object reference not set to the instance of an object', 'Something went wrong', and 'Bailing out, you are on your own. Good luck."
tags: ['C++', 'cpp', 'C', 'programming', 'error handling', 'exceptions', 'exit codes']
---


## What is an exit code?
When a program or a process finishes execution, it returns an integer value
to the operating system. This value is known as the exit code (or return code).
Exit codes are used to indicate whether a program completed successfully or
encountered an error during its execution.

This value can range from 0-255, and anything that is non-zero (*literally* any value
that is not 0) indicates an error. The error code can be used to identify the type
of error that occurred. Generally, for 128 and up, they are reserved for special purposes.
In particular, the value 128 is used to indicate failure to execute another program
in a subprocess. This convention is not universally obeyed, but it is a good idea to
follow it in your programs.

Like I just mentioned, there actually isn't a right or wrong way to do exit codes,
but in general, one convention that I like a *lot* is storing them in header files
(for C/C++), or (something my co-worker did that I ended up loving) in our Python
projects, in an `enums.py` file (Thank you, Hunter) so that they can be easily
referenced throughout the codebase. There are a couple standards that I try to abide
by, however:
- [Advanced Bash-Scripting Guide's Exit Codes](https://tldp.org/LDP/abs/html/exitcodes.html)
- [sysexits.h](https://man.freebsd.org/cgi/man.cgi?query=sysexits)
- [GNU C Library - Exit Codes](https://www.gnu.org/software/libc/manual/html_node/Exit-Status.html)
- [Linux's errno.h](https://man7.org/linux/man-pages/man3/errno.3.html)

Usually, I'll take a mixed bag approach, and define, and just stick with a couple standards
that best fit my use case.
**Exit codes are inherently subjective, there is no golden standard for how you *should* do them**.
Here's a watered down example of exit codes I might use in a C++ project:

```cpp
// exit_codes.hpp
#ifndef EXIT_CODES_HPP
#define EXIT_CODES_HPP

enum ExitCode
{
  EX_OK = 0,           // successful termination
  EX_ERROR = 1,        // general error
  EX_MISUSE = 2,       // incorrect usage/invalid arguments
  EX_USAGE = 64,       // command line usage error
  EX_UNAVAILABLE = 69, // service unavailable
  EX_NOPERM = 77,      // permission denied
  EX_TERM = 130,       // user exit w/ Control-C
  EX_RANGE = 255       // exit status out of range
};

#endif // EXIT_CODES_HPP
```

```cpp
// main.cpp
#include "exit_codes.hpp"

int main() {
  int x = 10;

  if (x > 5) {
    return ExitCode::EX_OK;
  } else {
    return ExitCode::EX_ERROR;
  };
  return EX_OK; // why did we not use ExitCode::EX_OK here?
};
```


### Enum Styling
Here's a bit of styling info: with regular enums in C++, they dump
their values into the global namespace. So if you have two enums with
the same value names, you'll get a conflict. To avoid this, you
can use `enum class` instead of just `enum`, which scopes the
values to the enum type, which means you won't be able to use
`EX_OK` directly, but have to use `ExitCode::EX_OK`. You'll
technically need to statically cast them to integers when returning
them from `main()`, or you can do what I do and namespace them. I
think namespacing them looks prettier, so that's what I do, but I'll
show static casting as well for completeness:

```cpp
// exit_codes.hpp
#ifndef EXIT_CODES_HPP
#define EXIT_CODES_HPP

namespace ExitCode {
  enum Codes {
    EX_OK = 0,           // successful termination
    EX_ERROR = 1,        // general error
    EX_MISUSE = 2,       // incorrect usage/invalid arguments
    EX_USAGE = 64,       // command line usage error
    EX_UNAVAILABLE = 69, // service unavailable
    EX_NOPERM = 77,      // permission denied
    EX_TERM = 130,       // user exit w/ Control-C
    EX_RANGE = 255       // exit status out of range
  };
};

enum class UglyExitCode {
  EX_OK = 0,
  EX_ERROR = 1,
  EX_MISUSE = 2,
  EX_USAGE = 64,
  EX_UNAVAILABLE = 69,
  EX_NOPERM = 77,
  EX_TERM = 130,
  EX_RANGE = 255
};

#endif // EXIT_CODES_HPP
```

```cpp
// main.cpp
#include "exit_codes.hpp"

int main() {
  int x = 10;

  if (!(x > 5)) {
      return ExitCode::EX_ERROR;
  }
  // this does not work with enum class:
  // return UglyExitCode::EX_OK;
  return static_cast<int>(UglyExitCode::EX_OK);
}
```

You can see that they literally do the same thing, you just write less
code when you need to actually use an exit code, and it's more intuitive
:).

How do we check the exit code of a program? In bash, you can use the special
variable `$?`, which holds the exit code of the last executed command. For example:
```bash
./main
echo $?
# prints 0
# if we change > to <, it would print 1
```

I mentioned earlier that exit codes can't go above 255. What happens
if you try to return a value above that? Well, the exit code will
wrap around (the sweaty math nerds call it modulo 256 arithmetic).
For example, if you return 256, the exit code will be 0, if you return
257, the exit code will be 1, and so on. If you return 509, the exit code
will be 253 (509 % 256 = 253).

This isn't very useful nor practical knowledge, but it's good to know
that it, at the very least, exists. If the technical details are confusing,
that's fine. All you practically need to know is that you just can't
go above 255. If you do, weird shit happens. Simple!


## Why error & wat do exception do??
An error is self explanatory - you messed something up, and an error appeared.
Exceptions are a programming construct that allows you to handle errors OR define
your own set of errors gracefully. In C++, exceptions are thrown using the
`throw` keyword, and caught using the `try` and `catch` keywords.

More specifically, what does an exception look like? Well, let's define our
own for a simple division function that throws an exception when dividing by zero:

```cpp
#include <iostream>
#include <stdexcept>

int divide(int a, int b) {
  if (b == 0) {
    throw std::runtime_error("Division by zero!");
  }
  return a / b;
}

int main() {
  try {
    int result = divide(10, 0);
    std::cout << result << std::endl;
  }

  catch (const std::runtime_error& e) {
    std::cerr << "Error: " << e.what() << std::endl;
    return 1;
  }
  return 0;
}
```

Super, super easy syntax. However, there is actually a lot debate around
exception usage and when you should use them. That's pretty much what exception
handling is though - handling errors that arise during the execution of a program.


### Subjectivity & Debate Around Exceptions
There are times when you should and shouldn't define your own exceptions.
The general consensus, is that you don't want to mix legacy codebases that
isn't 'exception safe' with exceptions, or it can become a maintenance nightmare.
This is why Google actually tends to avoid exceptions in their codebase, but
they're generally considered an outlier in this regard.

Additionally, exceptions are generally slower than regular error handling, so in
performance critical code, you may want to avoid them. However, they do make
code a lot cleaner and easier to read, so it's a tradeoff.

This is a very hot take, but odds are, though, that if you're actually in need of
*real* performance, you probably shouldn't be using C++ to begin with, you should
probably be using C or Rust, and you can deal with the slight extra overhead of
exceptions. But sometimes, that's just not realistic, so you have to make do with
what you have.

I hold the very strong & firm belief that avoiding exceptions solely because they
*can be slower* is a poor excuse, and is an example of premature optimization,
but you need to be smart about how and where you use them (like don't put them in
a for loop that runs a million times, for example).

In the wise words of one of my Professors at the University of Michigan:

> Exceptions are quite expensive from a performance standpoint, and they're often
> better suited to handling unexpected runtime conditions (e.g. malformed input,
> file I/O errors, etc.) rather than bugs in the program. Exception behavior would
> also generally be specified in the documentation of a function, either as part
> an RME or in a separate exceptions clause.
> But there is no hard-and-fast rule here – it depends on the language and the
> programming practices common to that language. For example, Python uses exceptions
> to terminate for loops, which is rather unusual and would not be considered an
> exceptional case by most people. But Python also cares a lot less about performance
> than C++ does.

And he's absolutely right. Python absolutely doesn't care about performance whatsoever
([but we're getting there!](https://docs.python.org/3/whatsnew/3.13.html#whatsnew313-jit-compiler)).
In fact, in some of our production code at my work, we define exceptions *very* liberally because
they're great for giving us, the developers, immediate feedback to us when someone has an issue
with one of our tools. Exceptions, like the following, will give us an instant idea of what's going
on with the system:
```python
class DockerStartError(Exception):
  """Exception raised when starting Docker containers fails."""
  def __init__(self, message="Error starting Docker containers."):
      super().__init__(message)

class DockerStopError(Exception):
  """Exception raised when stopping Docker containers fails."""
  def __init__(self, message="Error stopping Docker containers."):
      super().__init__(message)

class ContainerRestartError(Exception):
  """Exception raised when restarting a container fails."""
  def __init__(self, container_name):
      message = f"Error restarting {container_name}"
      super().__init__(message)
```

Here is some code to benchmark the real performance cost of exceptions in C++.
You don't need to understand this code, but if you wanted to replicate this, feel
free:
```cpp
#include <iostream>
#include <chrono>
#include <stdexcept>
#include <optional>

using namespace std::chrono;

int divide_exc(int a, int b) {
  if (b == 0) throw std::runtime_error("div by zero");
  return a / b;
}

std::optional<int> divide_opt(int a, int b) {
  return b == 0 ? std::nullopt : std::optional(a / b);
}

template<typename F>
long benchmark(const char* name, F func) {
  auto start = high_resolution_clock::now();
  func();
  auto ms = duration_cast<milliseconds>(
    high_resolution_clock::now() - start
  ).count();
  std::cout << name << ": " << ms << "ms\n";
  return ms;
}

int main() {
  const int N = 10'000'000;

  benchmark("Exception success", [&]{
      long sum = 0;
      for (int i = 0; i < N; i++) {
          try { sum += divide_exc(100, 2); }
          catch(...) {}
      }
  });

  benchmark("Exception failure", [&]{
      int caught = 0;
      for (int i = 0; i < N; i++) {
          try { divide_exc(100, 0); }
          catch(...) { caught++; }
      }
  });

  benchmark("Optional success", [&]{
      long sum = 0;
      for (int i = 0; i < N; i++) {
          if (auto r = divide_opt(100, 2)) sum += *r;
      }
  });

  benchmark("Optional failure", [&]{
      int fails = 0;
      for (int i = 0; i < N; i++) {
          if (!divide_opt(100, 0)) fails++;
      }
  });
}
/*
❯ g++ main.cpp -o main && time ./main
Exception success: 17ms
Exception failure: 8430ms
Optional success: 152ms
Optional failure: 99ms

./main  8.68s user 0.00s system 99% cpu 8.703 total

--WITHOUT FAILURE CASE--
❯ g++ main.cpp -o main && time ./main
Exception success: 20ms
Optional success: 145ms
Optional failure: 96ms

./main  0.26s user 0.00s system 99% cpu 0.265 total
```

From this benchmark, we can see that, with the failure case, exceptions
it added *8 seconds of execution time* to the entire runtime of the
program. This is a *huge* difference (and is fucking ridiculous, honestly)
and is something to be aware of when deciding whether or not to use exceptions
in performance critical code.

## Combination of exit codes & exceptions
Lastly, standard practice, in my world, is to mix exceptions and exit codes.
When an exception is thrown, you catch it in `main()`, print the error message,
and return an appropriate exit code that corresponds to the exception (mostly):

```cpp
int main() {
  try {
    int result = divide(10, 0);
    std::cout << result << std::endl;
  }

  catch (const std::runtime_error& e) {
    std::cerr << "Error: " << e.what() << std::endl;
    return ExitCode::EX_ERROR;
  }

  catch (const std::invalid_argument& e) {
    return ExitCode::EX_MISUSE;
  }

  catch (...) { // safety net: catch all exceptions
    return ExitCode::EX_ERROR;
  }

  return ExitCode::EX_OK;
}
```

The only caveat is that library code shouldn't catch exceptions and
convert them to exit codes - that's the application's job. Libraries
should let exceptions propagate so the calling code can handle them
appropriately. This pattern of catching at main() and returning exit
codes is specifically for CLI applications and executables.

