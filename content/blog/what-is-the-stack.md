---
title: "What is the stack?"
date: '2025-11-11'
order: 1
description: "The stack makes me want to reference my head against a wall repeatedly until I heap."
tags: ['cpp', 'programming', 'pointers', 'references', 'aliases', 'C++']
---
Definitionally, the stack is a region of memory that your program uses to store
local variables - the variables you declare inside functions. When your operating
system runs your program, it gives you a chunk of memory (usually a few megabytes)
and says "here's your stack, use it for your function variables."

**Why does it exist?** The stack provides automatic memory management. When you
declare a variable, memory is allocated. When the function returns, that memory
is automatically freed. You don't have to think about it - it just works. This
makes the stack fast and safe for temporary data that only needs to exist while
a function is running.

Think of the stack like a simple two-column spreadsheet. When you write:
```c++
int main() {
  int x = 10; // Row gets added: [0x7fff100, 10]
  int y = 20; // Row gets added: [0x7fff0fc, 20]
  int* ptr_x = &x; // Row gets added: [0x7fff0f8, 0x7fff100]
}
```

| **Address** | **Value** |
|-------------|-----------|
| 0x7fff100 | 10        |
| 0x7fff0fc | 20        |
| 0x7fff0f8 | 0x7fff100 |

**That's it.** The stack is just:
- **Addresses** (memory locations) in the left column
- **Values** (what's stored there) in the right column

## If only it were that easy.
This is where it get's a little annoying. Let's use a slightly different representation
to illustrate how the stack works:

| Type  | Variable Name | Address    | Value      |
|-------|---------------|------------|------------|
| int   | x             | 0x7fff100  | 10         |
| int   | y             | 0x7fff0fc  | 20         |
| int*  | ptr_x         | 0x7fff0f8  | 0x7fff100  |


Right now, this analogy of the stack is **not** technically correct when looking
through the lens of the `call stack`. That's because the stack follows a principle
called **LIFO** (Last In, First Out). This means that the last item added to the
stack is the first one to be removed. Since the stack grows **downward in memory**,
newer variables get **lower** addresses, but should appear at the **top** of our
visualization.

You can think of the stack (LIFO) like a stack of books; you add a book to the
top of the stack, and when you need to remove a book, you can only take from
the top. You cannot access or remove anything from the middle - only the top
book is accessible at any given time.

So, what does the corrected table look like in relation to the code snippet above?
The newest item (ptr_x) should be at the top, with the **lowest** address:

| Type  | Variable Name | Address    | Value      |
|-------|---------------|------------|------------|
| int*  | ptr_x         | 0x7fff0f8  | 0x7fff100  |
| int   | y             | 0x7fff0fc  | 20         |
| int   | x             | 0x7fff100  | 10         |

## Stack Frames

A stack frame is a chunk of the stack that belongs to a single function call. When you call a function, all of its local variables get grouped together into one frame. When the function returns, that entire frame gets 'popped' off the stack.

Think of it like this: each function gets its own "section" of the spreadsheet, and when the function is done, that entire section disappears.

```c++
int double_it(int x) {
    int result = x * 2;
    return result;
}

int main() {
    int num = 5;
    int answer = double_it(num);
    return 0;
}
```

Before calling `double_it()`, the stack looks like:

| Type          | Variable Name | Address    | Value      | Stack Frame |
|---------------|---------------|------------|------------|-------------|
| int           | num           | 0x7fff100  | 5          | main()      |

While `double_it()` is running, the stack looks like:

| Type          | Variable Name | Address    | Value      | Stack Frame |
|---------------|---------------|------------|------------|-------------|
| int           | result        | 0x7fff0f4  | 10         | double_it() |
| int           | x             | 0x7fff0f8  | 5          | double_it() |
| return addr   | (hidden)      | **0x7fff0fc**  | 0x400150  | double_it() |
| int           | num           | 0x7fff100  | 5          | main()      |

After `double_it()` returns, the stack looks like:

| Type          | Variable Name | Address    | Value      | Stack Frame |
|---------------|---------------|------------|------------|-------------|
| int           | answer        | **0x7fff0fc**  | 10         | main()      |
| int           | num           | 0x7fff100  | 5          | main()      |

Notice how the entire `double_it()` frame (x, result, NOT the return address) disappeared
when the function returned. While `double_it()` was running, the first thing that gets
added to the stack was the return address (the value is 0x400150 because it's pointing to the
next instruction in main()). That stack location (0x7fff0fc) eventually becomes the address
where `answer` is stored in `main()` after the function returns.

The running stack isn't hugely important in this context, but it becomes relevant when
trying to understand recursion, stack overflows, memory errors, and other stuff I'll
cover some other time.

### Which function has the biggest stack frame?

In this example, **`double_it()` has the biggest stack frame** with 3 items
(return address, x, result), while `main()` has 2 variables (num, answer).

### How can you identify a stack frame?

A stack frame contains:
- **Return address** (pushed first - tells the CPU where to jump back to after the function finishes)
- **Function parameters** (x in `double_it()`)
- All **local variables** declared in that function (result, num, answer)

**The boundary?** When a function returns, everything from the top of the stack down to where that function started gets removed. That's the frame. The return address is used to know where to continue execution, then the entire frame is popped off. So in this example, there were 2 stack frames:
- `main()` frame: num, answer
- `double_it()` frame: return address, x, result
