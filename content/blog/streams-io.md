---
title: "Streams & I/O"
date: '2025-11-16'
order: 1
description: "This is not relevant at all, but I constantly regret the period of my life where I tried live-streaming. Bro was dreaming a little TOO big."
tags: ['C++', 'cpp', 'programming', 'streams', 'io', 'stringstreams']
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
  if (argc > 1) {
    std::cout << argv[1] << std::endl;
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
```cpp
#include <iostream>

int main(int argc, char* argv[]) {
  std::cout << "# of args:" << argc << std::endl;

  for (int i = 0; i < argc; ++i) {
    std::cout << argv[i] << std::endl;
  };

  std::cout << "do you see cin used a lot? ";
  std::string user_answer;
  std::cin >> user_answer;
  std::cout << user_answer << std::endl;
  return 0;
}
```

There are actually two ways we can get user input. Let's cover `argc` & `argv` first.

So, as you can see from the example above, we check `argc` for the number of arguments,
and then we use `argv` to access the values that the user passed in. `argc` literally stands for
`argument count`, and `argv` literally stands for `argument vector`, but, personally, I find it more
intuitive to look at this as `argument values`. Let's say we pass in the following code to our
application, and let's take a look at the output:

```bash
./main arg1 arg2 arg3 arg4
# # of args:5
# ./main
# arg1
# arg2
# arg3
# arg4
# do you see cin used a lot? {}
# {}
```

Something interesting you may notice is that the number of arguments printed out & counted (by `argc`)
actually came out to 5 rather than 4. This is because, technically, the program name is the very first
index/value of the array. That's it.

**Note**: Where `{}` appears, that indicates a field where the program is waiting for your input.
It will then print out exactly what you pass into that field on the next line. This is the second
way of accepting user input.

### I/O redirection

I/O redirection is a way to control where your program's input comes from and
where its output goes. Instead of typing into the terminal and seeing output
on the screen, you can redirect data to/from files. I'll cover this quickly,
because it's not particularly interesting nor difficult to understand:

**Output redirection (`>`)**
```bash
./main arg1 arg2 > output.txt
```

This sends all `std::cout` output to `output.txt` instead of the terminal.

**Input redirection (`<`)**
```bash
./main < input.txt
```
This feeds the contents of `input.txt` into your program
(as if you typed it), which `std::cin` can read.

**Append output (`>>`)**
```bash
./main arg1 >> output.txt
```
This adds output to the end of `output.txt` instead of overwriting it.

**Piping (`|`)**
```bash
echo "hello world" | ./main
```
The output from one command becomes the input to another. Here,
"hello world" gets piped into your program as `std::cin` input.

### Quick example
```bash
echo "yes" > answer.txt

# run program with input from file, output to another file
./main arg1 arg2 < answer.txt > results.txt
```

That's really all you need to know for now. I/O redirection is super handy
for testing programs or processing large amounts of data without manual typing.

## File streams

Something mildly more interesting is how we can read & write files using C++.
We can do this with something called `file streams`. Conceptually, they're very easy
to understand, the syntax can just be very frustrating. Here's an example of reading in
the number of animals in a file called `test.txt`

```cpp
#include <iostream>
#include <fstream>

/*
test.txt's content:
cats 25
dogs 24
*/

int main(int argc, char* argv[]) {
  std::ifstream file_input("test.txt");

  if (!file_input.is_open()) {
    std::cout << "failed to open file" << std::endl;
    return 1;
  };

  std::string animal_1, animal_2;
  int num_of_animal_1, num_of_animal_2;

  file_input >> animal_1 >> num_of_animal_1;
  file_input >> animal_2 >> num_of_animal_2;

  std::cout << animal_1 << ": " << num_of_animal_1 << std::endl;
  std::cout << animal_2 << ": " << num_of_animal_2 << std::endl;

 // always remember to close the file after you're done with it
  file_input.close();
  return 0;
}

/* program output:
cats: 25
dogs: 24
*/
```

My first thought when I see this code isn't "Wow that's super cool"; but instead
"This doesn't scale for shit"™. What if we have hundreds of animals in that file?
Let's clean the file up a bit.

```cpp
#include <iostream>
#include <fstream>

int main(int argc, char* argv[]) {
  std::ifstream file_input("test.txt");

  if (!file_input.is_open()) {
    std::cout << "failed to open file" << std::endl;
    return 1;
  };

  std::string animal;
  int num_of_animal;

  while (file_input >> animal >> num_of_animal) {
    std::cout << animal << ": " << num_of_animal << std::endl;
  }

  file_input.close();
  return 0;
}
```

Much better. Now, we've read the contents of the file, what if we want
to write that content to a different file in a `csv` (comma separated value) format?
We can use `ostream` for that:
```cpp
#include <iostream>
#include <fstream>

int main(int argc, char* argv[]) {
  std::ifstream file_input("test.txt");
  std::ofstream file_output("output.txt");

  if (!file_input.is_open() or !file_output.is_open()) {
    std::cout << "failed to open input or output file" << std::endl;
    return 1;
  };

  std::string animal;
  int num_of_animal;

  // the first line of csv files is conventionally the
  // header i.e. "what data does this column contain?"
  // we write that first line to the file, then iterate.
  file_output << "animal" << "," << "count" << std::endl;

  while (file_input >> animal >> num_of_animal) {
    file_output << animal << "," << num_of_animal << std::endl;
  }

  file_input.close();
  file_output.close(); // close them both!
  return 0;
}
```

So, like I said, really conceptually simple
, the syntax is just annoying as fuck.

### istream, ostream, and stringstreams
Lastly, there are two generic types of streams: `istream` and `ostream`.
There are different 'sub-streams' or 'subtypes' for each of these which
are considered valid when they are passed in to functions. For example,

- `ostream` consists of: `basic_ostream` (cout, cerr), `ofstream`, & `ostringstream`
- `istream` consists of: `basic_istream` (cin), `ifstream`, & `istringstream`

We've been using `ofstream` & `ifstream` for the examples above.
Considering that there are multiple types of streams, however, think about
this: what if we want to test cin but in an automated fashion
(so the tester doesn't need to sit there and manually input data)?

Because `cin` is a type of `istream`, let's make a function which accepts
the generic `istream` (and `ostream` just for fun) as an argument:
```cpp
#include <iostream>
#include <fstream>
#include <sstream>

void csv_writer(
  std::string column1,
  std::string column2,
  std::istream& input,
  std::ostream& output
) {
  output << column1 << "," << column2 << std::endl;
  while (input >> column1 >> column2) {
    output << column1 << "," << column2 << std::endl;
  }
}

void file_stream_example() {
  std::ifstream file_input("test.txt");
  std::ofstream file_output("output.txt");

  if (!file_input.is_open() or !file_output.is_open()) {
    std::cout << "failed to open input or output file" << std::endl;
  }

  csv_writer(
    "animal",
    "count",
    file_input,
    file_output
  );

  file_input.close();
  file_output.close();
}

void basic_stream_example() {
  // remember to pass in/type
  // your input, i.e. /main < test.txt
  csv_writer(
    "animal",
    "count",
    std::cin,
    std::cout
  );
}

void stringstream_example() {
  std::string input = "giraffe 67";
  std::istringstream input_ss(input); // simulated input
  std::ostringstream output_ss; // this will hold our output

  csv_writer(
    "animal",
    "count",
    input_ss,
    output_ss
  );

  std::string expected = "animal,count\ngiraffe,67\n";
  if (output_ss.str() == expected) {
    std::cout << "yay" << std::endl;
  }
}

int main() {
  // both of these functions are equally valid
  // because csv_writer() is generic.

  file_stream_example();
  basic_stream_example();
  stringstream_example();
  return 0;
}
```

And thats it! This concept is actually very useful for data science & data
analytics, because it lets you take some malformed or terribly formatted data,
and rewrite it to different file with a consistent format that you can use for analysis.