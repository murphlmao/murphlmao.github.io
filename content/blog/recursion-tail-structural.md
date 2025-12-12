---
title: "Recursion: Tail, Structural, & Tree"
date: '2025-12-11'
order: 2
description: "I'm going to recurse(recurse(recurse(recurse(recurse(please make it stop)))))"
tags: ['C++', 'cpp', 'C-lang', 'C', 'programming', 'recursion', 'bst', 'tail recursion', 'structural recursion', 'binary tree', 'binary search tree']
---


## What is Recursion?
Recursion is a function that calls itself. This is not confusing on it's own, but there are a couple of different types of recursion that can be used in programming. The two most common types are tail recursion and structural recursion.

A cliché example of recursion is the factorial function:

```cpp
#include <iostream>

int factorial(int n) {
  if (n == 0) {
    return 1;
  } else {
    return n * factorial(n - 1);
  }
}

int main() {
  int x = factorial(5);
  std::cout << "Factorial of 5 is: " << x << std::endl;
  return 0;
}
```

Every recursive function **must have a base case**. The base case is the condition that stops the recursion from continuing indefinitely. In the example above, the base case is when `n` is equal to 0. Without a base case, the function would continue to call itself forever, eventually leading to a stack overflow error... which leads me into what this actually looks like in memory!

There are also a couple types of recursion that you should keep in mind while
looking through this post:

- Linear Recursion: A function makes a single recursive call each time it is invoked. The factorial example above is an example of linear recursion.
- Tail Recursion: A special case of linear recursion where the recursive call is the last operation in the function. If it's not the last operation, it's not tail recursion. More on this later.
- Structural Recursion: A function that breaks down a data structure into smaller parts and processes each part recursively. This is often used with tree-like structures, such as binary search trees. More on that later too.
- Tree Recursion: A function makes multiple recursive calls for each invocation, leading to a tree-like structure of calls. An example would be calculating Fibonacci numbers.


## Call Stack
As I spoke about on my post about [the stack](./what-is-the-stack#stack-frames), each function call creates a new stack frame on the call stack. That's certainly the case with recursion, and it's actually one of the downsides of it: high memory utilization and a high number of function calls. This is a very crude mockup of the call stack during the execution of `factorial(5)`:

```
| Stack Frame    | n   |
|----------------|-----|
| factorial(0)   | 0   | ← returns 1
| factorial(1)   | 1   |
| factorial(2)   | 2   |
| factorial(3)   | 3   |
| factorial(4)   | 4   |
| factorial(5)   | 5   |
| main()         | -   |

Unwinding:
- factorial(0) returns 1
- factorial(1) returns 1 * 1 = 1
- factorial(2) returns 2 * 1 = 2
- factorial(3) returns 3 * 2 = 6
- factorial(4) returns 4 * 6 = 24
- factorial(5) returns 5 * 24 = **120**
```


## Linear & Tail Recursion: Reverse a Raw Array?
Unlike the vector approach where we remove and add elements, reversing an array works by swapping elements from the outside in. We use two pointers, left and right, that start at opposite ends and move toward each other.
```
Initial array: [1, 2, 3, 4, 5]
                ↑           ↑
              left        right

Call 1: swap(1, 5) → [5, 2, 3, 4, 1]
                        ↑       ↑
                      left    right

Call 2: swap(2, 4) → [5, 4, 3, 2, 1]
                           ↑  ↑
                        right left  (crossed - done!)
```

Here's the complete visualization:
```
reverse(arr, arr+4)         // [1, 2, 3, 4, 5]
├─ swap arr[0] ↔ arr[4]     // [5, 2, 3, 4, 1]
└─ reverse(arr+1, arr+3)
    ├─ swap arr[1] ↔ arr[3] // [5, 4, 3, 2, 1]
    └─ reverse(arr+2, arr+2)
        └─ BASE CASE! (left >= right)
```

Here is what that looks like in code:
```cpp
#include <iostream>

// O(n) time, O(1) space with tail call optimization
// otherwise O(n) space due to call stack
void reverse(int* left, int* right) {
  // base case: pointers have met or crossed - nothing left to swap
  if (left >= right) {
    return;
  }

  // swap the elements at left and right pointers
  int temp = *left;
  *left = *right;
  *right = temp;

  // recurse on the inner subarray (move pointers toward center)
  reverse(left + 1, right - 1);
}

void print(int* array, int size) {
  for (int i = 0; i < size; ++i) {
    std::cout << array[i] << " ";
  }
  std::cout << std::endl;
}

int main() {
  int arr[] = {1, 2, 3, 4, 5};
  int size = 5;

  print(arr, size);
  reverse(arr, arr + size - 1);  // pass pointer to first and last element
  print(arr, size);

  return 0;
}
```


### Tail Recursion Digest
Remember that thing about high memory usage with recursion? Tail recursion is a special case of recursion where the **recursive call is the last operation in the function**. This allows some compilers to optimize the recursion, reusing the current function's stack frame for the next function call, effectively converting the recursion into iteration and reducing memory usage. You'll notice that the example above actually already uses tail recursion... but it's entirely possible to do something to the effect of:

```cpp
void reverse(int* left, int* right) {
  if (left <right) {
    reverse(left + 1, right - 1);
    int temp = *left;
    *left = *right;
    *right = temp;
  }
}
```

Which guarantees that we don't get something called `Tail Call Optimization (TCO)` performed by our compiler. In order for TCO to be applied, the last operation must be the recursive call, but in this case, the last operation is the swap, not the recursive call.

TCO basically turns the recursion into a loop under the hood, which saves memory and can improve performance. However, not all compilers support TCO, and even when they do, it may not always be applied, so it's important to be aware of this when writing recursive functions.

So, for example it might turn the TCO version of `reverse` into something like this under the hood:

```cpp
// O(n) time, O(1) space
void iterative_reverse(int* left, int* right) {
  while (left < right) {
    int temp = *left;
    *left = *right;
    *right = temp;
    // the better way to do the above would
    // actually be: std::swap(*left, *right);

    ++left;
    --right;
  }
}
```


## Structural Recursion
Structural recursion is, in as few words as possible, just breaking down the data structure you're working with into smaller portions of itself, and processing those smaller portions recursively. This is often used with tree-like structures, such as binary search trees, which I will get into in my next post.


### Reversing a Vector
So, how do we reverse a vector with recursion? This is the kind of thinking I suckkk at, so this took a while for me to figure out, I'll do my best to explain how it clicked for me. We need think about what the base case is, i.e. what kinds of vectors are not able to be reversed?

The answer is if we have an empty vector, or a vector with one element. Both of these cases are already "reversed". So our base case is if the vector size is less than or equal to 1.

Next, we need to think about how we can reduce the problem size with each recursive call. To reverse a vector, we can take the first element, erase it from the vector,  pass that new vector into a recursive call until it hits our base case. At that point, when we hit the base case (`vector.size() <= 1`, the entire stack will unwind). Once the base case causes us to return,  we push the first element we removed to the back of the vector. This effectively reverses the vector one element at a time as the stack unwinds. As always, I recommend reading this aloud to yourself. It sort of helps me to visualize this as a 'U' shaped, where we go down until we hit the base case, and then come back up, working our way back up.

```cpp
/*
reverseVector({1, 2, 3, 4, 5})
├─ saves front = 1
├─ vec becomes {2, 3, 4, 5}
└─ calls reverseVector({2, 3, 4, 5})
    ├─ saves front = 2
    ├─ vec becomes {3, 4, 5}
    └─ calls reverseVector({3, 4, 5})
        ├─ saves front = 3
        ├─ vec becomes {4, 5}
        └─ calls reverseVector({4, 5})
            ├─ saves front = 4
            ├─ vec becomes {5}
            └─ calls reverseVector({5})
                └─ BASE CASE! size = 1, returns {5}
*/

#include <iostream>
#include <vector>

std::vector<int>& reverseVector(std::vector<int>& vec) {
  // base case, only gets triggered when size is 0 or 1
  if (vec.size() <= 1) {
    return vec;
  }

  int front = vec.front(); // we store the variable for later
  vec.erase(vec.begin()); // remove the front element

  // we pass the new vector into the function with the
  // front popped off, and then this effectively 'freezes'
  // the current state of the vector for this function call
  // until the base case is hit
  reverseVector(vec); // reverse the rest of the vector

  // push the front to the back of the array
  // after reverseVector returns
  vec.push_back(front);
  return vec;
}

int main() {
  std::vector<int> my_vector = {1,2,3,4,5};
  auto new_vec = reverseVector(my_vector);

  for (auto i : new_vec) {
    std::cout << i << std::endl;
  }
  return 0;
}
```

That is, fundamentally, breaking down the data structure and then building it back up. You can also do this with linked lists. Here is a rather complete example of a linked list with several recursive functions:

```cpp
#include <iostream>
#include <initializer_list>

struct Node {
  int data;
  Node* next;
  Node(int val) : data(val), next(nullptr) {}
};

class LinkedList {
  public:
    Node* head;

    LinkedList() : head(nullptr) {}

    LinkedList(std::initializer_list<int> values) : head(nullptr) {
      for (int val : values) {
        this->push_back(val);
      }
    }

    ~LinkedList() {
      while (this->head) {
        Node* temp = this->head;
        this->head = this->head->next;
        delete temp;
      }
    }

    void push_back(int val) {
      if (!this->head) {
        this->head = new Node(val);
        return;
      }
      Node* current = this->head;
      while (current->next) {
        current = current->next;
      }
      current->next = new Node(val);
    }

    int sum(Node* node) {
      if (!node) return 0;
      return node->data + this->sum(node->next);
    }

    int count(Node* node) {
      if (!node) return 0;
      return 1 + this->count(node->next);
    }

    void print(Node* node) {
      if (!node) return;
      std::cout << node->data << " ";
      this->print(node->next);
    }

    int max(Node* node) {
      if (!node->next) return node->data;
      return std::max(node->data, this->max(node->next));
    }

    // tail recursive
    Node* reverse(Node* node, Node* prev = nullptr) {
      if (!node) return prev;
      Node* next = node->next;
      node->next = prev;
      return this->reverse(next, node);
    }

    // iterative
    void reverse() {
      Node* prev = nullptr;
      Node* current = this->head;
      while (current) {
        Node* next = current->next;
        current->next = prev;
        prev = current;
        current = next;
      }
      this->head = prev;
    }
};

int main() {
  LinkedList list = {1, 2, 3, 4, 5};

  std::cout << "Sum: " << list.sum(list.head) << std::endl;
  std::cout << "Count: " << list.count(list.head) << std::endl;
  std::cout << "Max: " << list.max(list.head) << std::endl;
  std::cout << "List: ";
  list.print(list.head);
  std::cout << std::endl;

  list.head = list.reverse(list.head);
  std::cout << "Reversed: ";
  list.print(list.head);
  std::cout << std::endl;

  list.reverse();
  std::cout << "Revert: ";
  list.print(list.head);
  std::cout << std::endl;

  return 0;
}
```


## Tree Recursion
Tree recursion occurs when a function makes multiple recursive calls for each invocation, leading to a tree-like structure of calls. A classic example of tree recursion is the calculation of Fibonacci numbers:
```cpp
/*
                fibonacci(4)
                /          \
          fib(3)              fib(2)
          /    \              /    \
      fib(2)  fib(1)      fib(1)  fib(0)
      /    \
  fib(1)  fib(0)
*/

#include <iostream>

int fibonacci(int n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);  // TWO recursive calls!
}

int main() {
  std::cout << fibonacci(4) << std::endl;
  return 0;
}
```

You will often see that binary search trees almost always use tree recursion and structural recursion for various operations. Each node in the tree can lead to two recursive calls: one for the left subtree and one for the right subtree.

With that being said... my next post will be about binary search trees, so please pray I don't pull the trigger.