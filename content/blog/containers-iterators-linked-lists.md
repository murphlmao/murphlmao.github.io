---
title: "Containers, Iterators, & Linked Lists"
date: '2025-12-11'
order: 1
description: "I avoid iteration like the plague and use map (or similar) unless I'm held at gunpoint."
tags: ['C++', 'cpp', 'C-lang', 'C', 'programming', 'iterators', 'containers', 'sets', 'maps', 'vectors']
---


## What's a container?
A container is very simple: It's a thing that stores (contains) objects.
It is literally that simple. More specifically, It's a class that
**stores multiple objects** and provides methods to add, remove,
and access those objects.

You've already used containers before: arrays, vectors, lists, are
all examples of containers. Why is this important? Well, each type
of container focuses on organizing and accessing data differently
based on specific tradeoffs. Knowing how to choose the right container
for the job can make your programs more efficient and easier to understand.

It also helps to understand containers because then you can build your
own specialized containers when needed. There are a couple of basic
containers in C++ that generally fall into 2 categories: sequence containers
and associative containers.


## Terminology Clarification: Ordered vs Sorted

- Ordered = maintains insertion order (like `std::vector`)
- Sorted = maintains elements by value (like `std::set`, `std::map`)

```cpp
// "ordered" - stores in insertion order
std::vector<int> nums = {85, 92, 78, 95};  // stays: 85, 92, 78, 95

// "sorted" - arranges by value
std::set<int> sorted_nums = {85, 92, 78, 95};  // becomes: 78, 85, 92, 95

// you can sort a vector manually
std::sort(nums.begin(), nums.end());  // now: 78, 85, 92, 95
```

The confusion is that `std::map` and `std::set`, which I will get to shortly, are called "ordered associative containers" in the C++ standard, but they actually maintain **sorted** order (by key/value), not insertion order. They stay sorted automatically because they're implemented as binary search trees.

## Sequential Containers
### Arrays & Vector
Arrays & Vectors are two types of sequential containers that are often referred to as
"array based containers" because `arrays` are the fundamental abstraction to
interface with a block of memory. This basically means it's the lowest-level
way to interact with memory in a structured way.

The thing to note about these two types of sequential containers is that they store objects
in a linear sequence. This means that the order of the objects matters,
and you can access them based on their position in that sequence. In memory, as you
might expect, these objects are stored in a contiguous block (contiguous allocation).
I explained this in detail in my previous post on [Arrays & Pointer Arithmetic](./arrays-pointer-arithmetic)

In addition to the aforementioned post & my post on [The Heap / Dynamic Memory](./heap-of-faith#source),
I brought up the fact that `std::array` has some niceties around C-style arrays & that `std::vector`s are just
dynamic wrappers around C arrays (as in they are dynamic, not fixed, in size). Arrays are
usually allocated on the stack, while vectors are allocated on the heap.

Why is this important to bring up now? Well, lets look at some of the niceties the
STL provides us when using containers like `std::array` and `std::vector` vs C-style arrays:

```cpp
#include <iostream>
#include <array>
#include <vector>

void beta_c_array(int c_array[], std::size_t size = 5) {
  // iterate through the array; including
  // 5 indices past the total amount we allocated
  for (int index = 0; index < size + 5; index++) {
    if (index == size) {
      std::cout << "We're now out of bounds:" << "\n";
    }
    std::cout << c_array[index] << "\n";
  }
}

template<typename ContainerType>
void alpha_stl_containers(ContainerType& container) {
  for (int index = 0; index < container.size() + 5; index++) {
    if (index < container.size()) {
      std::cout << container[index] << "\n";
      continue;
    }
    try {
      std::cout
        << "We're now out of bounds. Trying to access an index"
        << " with STL Containers is not allowed, & will throw"
        << " an exception"
      << "\n";
      std::cout << container.at(index) << "\n";
    } catch (const std::out_of_range& e) {
      std::cout
        << "Caught out-of-bounds exception: "
        << e.what()
      << "\n";
      break;
    }
  }
}

int main() {
  std::cout << "-----C-Style Arrays-----" << "\n";
  int c_array[5] = {1,2,3,4,5};
  beta_c_array(c_array, 5);

  std::cout << "\n" << "-----STL Array-----" << "\n";
  std::array<int, 5> std_array = {1,2,3,4,5};
  alpha_stl_containers(std_array);

  std::cout << "\n" << "-----Vector-----" << "\n";
  std::vector<int> std_vector = {1,2,3,4,5};
  alpha_stl_containers(std_vector);
  std::cout << std::endl;
  return 0;
}
```

This example basically just shows us that STL containers don't let
us do bad things, like go out of bounds. It shields us from a lot
of the common pitfalls of using raw arrays in C.

Both of these data structures provide fast & random access via indexing
(i.e. `c_array[3]`), which includes accessing/modifying elements at any
index in the container in constant time `O(1)`, and are efficient at iterating
through based on the number (`n`) of elements in the object: `O(n)`. I'll dig into
time complexity statements at another time, I fear.

Where they differ is that `std::vector` can dynamically resize itself when
elements are added or removed because of methods like `push_back()`
(to add an element to the vector) & `pop_back()` (to remove the last element).
The vector class, in addition to just the raw data, also stores two critical
attributes: `size` (The number of elements currently in the vector) and
`capacity` (The total amount of space allocated in memory)

**The capacity is always greater than or equal to the size**. When you add
elements and the size exceeds the capacity, the vector automatically allocates
a larger block of memory (typically doubling its capacity), copies all existing
elements to the new location, and frees the old memory. This reallocation is
expensive, but it happens infrequently enough that the average cost of `push_back()`
remains constant time. This design allows vectors to avoid reallocating memory on
every insertion while still providing dynamic sizing. If you know ahead of time
how many elements you'll need, you can use `reserve()` to pre-allocate the capacity
and avoid any reallocations entirely:

```cpp
#include <iostream>
#include <vector>

int main() {
  std::vector<int> numbers;
  numbers.reserve(5); // pre-allocate space for 5 elements

  // vectors track the size (elements) & capacity (allocated space)
  std::cout << "initial size: " << numbers.size() << "\n";
  std::cout << "initial capacity: " << numbers.capacity() << "\n\n";

  // add elements one by one
  for (int index = 1; index <= 10; index++) {
    // when size exceeds capacity, vector reallocates with more space
    // this reallocation is expensive, but happens infrequently
    numbers.push_back(index * 10);
    std::cout << "added " << index * 10
              << " | size: " << numbers.size()
              << " | capacity: " << numbers.capacity() << "\n";
  }

  std::cout << "\n";

  return 0;
}
```

This would be the output of that program:
```
initial size: 0
initial capacity: 5

added 10 | size: 1 | capacity: 5
added 20 | size: 2 | capacity: 5
added 30 | size: 3 | capacity: 5
added 40 | size: 4 | capacity: 5
added 50 | size: 5 | capacity: 5
added 60 | size: 6 | capacity: 10 <- capacity doubled
added 70 | size: 7 | capacity: 10
added 80 | size: 8 | capacity: 10
added 90 | size: 9 | capacity: 10
added 100 | size: 10 | capacity: 10
```


### What the fuck is a linked list?
Welcome to linked lists! You will use these exactly 3 more times
for the remainder of your career.

Linked lists are another type of sequential container that store
elements in a linear sequence. However, unlike arrays and vectors,
which store elements in contiguous memory locations, linked lists
store elements in non-contiguous memory locations, which we call
`nodes`. A node is just a single unit that contains the data, often
called a `datum`, & pointer(s) to other nodes in the structure that
are connected via pointers.

This is very simple conceptually, but it can be difficult to remember
all of the rules needed for linked lists. Here is a diagram to help
demonstrate a **REGULAR** linked list first, not a doubly linked list,
which is what C++'s `std::list` is.

#### Singly Linked List
```cpp
#include <iostream>

struct Node {
  int datum;
  Node* next;
};

int main() {
  Node* head = new Node{10, nullptr};
  head->next = new Node{20, nullptr};
  head->next->next = new Node{30, nullptr};
  head->next->next->next = new Node{40, nullptr};

    /*
  (Front)                                         (Back)
  ┌────┬────┐    ┌────┬────┐    ┌────┬────┐    ┌────┬────┐
  │ 10 │  ──┼───>│ 20 │  ──┼───>│ 30 │  ──┼───>│ 40 │null│
  └────┴────┘    └────┴────┘    └────┴────┘    └────┴────┘
  data  next     data  next     data  next     data  next
  */

  Node* cursor = head;

  while (cursor != nullptr) {
    std::cout << cursor->datum << "\n";
    cursor = cursor->next;
  }

  return 0;
}
```

As usual, I recommend reading what's happening out loud:
- We establish what a struct called `Node`, which has fields for a `datum`
and then a pointer (with the `Node` type), which we call `next`, *literally*
refers to the next `Node` that will be in our linked list.
- We establish the `head` of the list (the first object in the list), which
has `10` & `nullptr` as values.
- When establish our next `Node`, we actually wire the `head`'s `next` pointer
to point to the node we are about to assign. At this point, it looks like [10] -> [20]
- Next, we want to iterate through the entire list & just print all of the values.
The only problem is that because this is a custom data structure, we don't have
any native ways for us to iterate through it, so we need to manually walk through
the list by following the `next` pointers until we hit `nullptr`, which indicates
the end of the list (because if the last value is nullptr, that implies that there is no next node).
- We need to have a `cursor` for us to walk through the list. We assign this to the
beginning (`head`) of the list, and then we just keep following the `next` pointers
until we hit `nullptr`.


#### Doubly Linked Lists
A doubly linked list is similar to a singly linked list, but each node contains
pointers to both the next and previous nodes in the sequence. This allows for
bidirectional traversal of the list, making it easier to navigate both forwards
and backwards.

```cpp
#include <iostream>

struct Node {
  int datum;
  Node* prev;
  Node* next;
};

int main() {
  Node* head = new Node{10, nullptr, nullptr};
  head->next = new Node{20, head, nullptr};
  head->next->next = new Node{30, head->next, nullptr};
  head->next->next->next = new Node{40, head->next->next, nullptr};

  Node* cursor = head;

  // this loop previously would assign
  // the cursor to 1 past the end of the list.
  // we can avoid that in this case by breaking
  // out of the loop early.
  while (cursor != nullptr) {
    std::cout << cursor->datum << "\n";

    if (cursor->next == nullptr) {
      break;
    }

    cursor = cursor->next;
  }

  // this is the less clean way to loop through
  // a linked list. for this example, we're going
  // to traverse backwards through the list. our
  // old cursor is currently pointed at the end of
  // the list, so this works out.
  for (
      /* no precondition here */;
      cursor != nullptr;
      cursor = cursor->prev
  ) {
    std::cout << cursor->datum << "\n";
  }
  return 0;
}
```

I'd also like to point out my intentional usage of the word `cursor`. If you know what a cursor is, then this probably already clicked for you when you see how we move the cursor from one node to another. When you type out text anywhere, you literally have a cursor that types wherever it's currently located. This is exactly the same concept. Text editors are actually one of like 5 places on earth where you will ever use doubly linked lists (I'm kidding, there's probably like 6). In another later post, I'll give a much better linked list implementation that includes methods to add/remove nodes, etc. This is fine for now.


### Back to std::list
Now that you understand how doubly linked lists work under the hood, let's talk about `std::list` from the C++ Standard Library. **`std::list` is literally a doubly-linked list** - it's implemented exactly like what we just coded above, but with a lot more features and safety checks:
```cpp
#include <iostream>
#include <list>

int main() {
  std::list<int> myList = {10, 20, 30, 40};

  // you can't do this - no random access!
  // std::cout << myList[2] << "\n";  // ERROR

  // why? because to get to index 2, std::list would have to
  // start at head and follow next pointers: head -> 10 -> 20 -> 30
  // that's O(n) time complexity; the [] operator isn't provided

  // instead, you iterate with iterators or range-based for loops
  for (int value : myList) {
    std::cout << value << "\n";
  }

  // but insertion/deletion at any position is O(1)
  // (once you have an iterator to that position)
  auto it = myList.begin();
  ++it;  // move to second element
  myList.insert(it, 15);  // just rewire a few pointers!

  // prints: 10, 15, 20, 30, 40
  for (int value : myList) {
    std::cout << value << " ";
  }

  std::cout << std::endl;

  return 0;
}
```

Why use `std::list` over `std::vector`?
- You need efficient insertions/deletions in the front/back of the list
- You need efficient insertions/deletions in the middle of the list
- You don't need random access by index
- You're okay with slower iteration and higher memory overhead (each node needs extra pointers)

In practice, `std::vector` is almost always the better choice because:
- CPU caching loves contiguous memory (vectors are FAST to iterate)
- Random access is incredibly useful
- Most "insert in middle" operations happen rarely enough that O(n) is fine


## Associative Containers
Associative containers are by far the easiest to understand conceptually.
They store elements in whats called a "key-value pair" format. This means
that each element in the container is associated with a unique key that
can be used to quickly access the corresponding value. That's a lot of CS
jargon, so let me introduce you to a file type called `json`, which is literally
just a key-value pair storage format. Here is an example of a json object, which work almost identically to maps in C++:

```json
{
  "name": "John Doe",
  "age": 30,
  "is_student": false,
  "courses": ["Math", "Science", "History"]
}
```

Sets are actually an exception to this key-value rule though, because a set is just a data structure that is comprised entirely of keys, but I'll get to that later.


### Map
As you can see from the above json object, all of the objects on the left side of the colon are the "keys", and the objects on the right side of the colon are the "values". You can use the keys to quickly access the corresponding values. For example, if you wanted to get the value associated with the key "name", you would simply look it up using that key.

Okay, but what does that look like in C++?

```cpp
#include <iostream>
#include <map>
#include <string>

// pretty common - arrow operator on iterator
void iterator_one(std::map<std::string, int>& mappp) {
  for (
    auto iter = mappp.begin();
    iter != mappp.end();
    ++iter
  ) {
    // this is because the arrow operator dereferences
    // the iterator and gives us access to the
    // members of the underlying object directly
    std::cout << iter->first << " : " << iter->second << std::endl;
  }
}

// less common - explicit dereference to pair
void iterator_two(std::map<std::string, int>& mappp) {
  for (
    auto iter = mappp.begin();
    iter != mappp.end();
    ++iter
  ) {
    // since each entry in a map is actually
    // just an instance of std::pair, we need
    // to declare that in order to get the value
    // of whatever entry we're looking for:
    std::pair<const std::string, int>& entry = *iter;

    // alternatively, you can be super lazy and just:
    // auto& entry = *iter;
    std::cout << entry.first << " : " << entry.second << std::endl;
  }
}

// most common - range-based for loop with pair
void iterator_three(std::map<std::string, int>& mappp) {
  for (const auto& entry : mappp) {
    std::cout << entry.first << " : " << entry.second << std::endl;
  }
}

// this is by far the cleanest way to do it
void iterator_four(std::map<std::string, int>& mappp) {
  // in C++ 17, you can actually do structured bindings
  // to unpack the pair directly into two variables:
  for (const auto& [key, value] : mappp) {
    std::cout << key << " : " << value << std::endl;
  }
}

int main() {
  // this gets sorted alphabetically by key automatically
  std::map <std::string, int> cat_ratings = {
    {"british shorthair", 10},
    {"calico", 10},
    {"siamese", 10},
    {"maine coon", 10},
    {"sphynx", 0}
  };

  // we can also insert after declaration
  cat_ratings["scottish fold"] = 10;

  iterator_one(cat_ratings);
  std::cout << "-----" << std::endl;
  iterator_two(cat_ratings);
  std::cout << "-----" << std::endl;
  iterator_three(cat_ratings);
  std::cout << "-----" << std::endl;
  // just do this where you can lol. it's the easiest
  iterator_four(cat_ratings);

  // this is unrelated, but demonstrates find()
  std::cout << "-----" << std::endl;
  auto iter = cat_ratings.find("maine coon");
  if (iter != cat_ratings.end()) {
    std::cout << "Found: " << iter->second << "\n";
  }

  return 0;
}
```

In std::map, you CANNOT *modify* the keys. This is because they're sorted by key. If you changed a key to something else, the lookups & sorting would break. You can, however, erase keys from the map, and as you saw above, insert new key-value pairs as needed.

The methods for that are `insert()` and `erase()`, respectively. You can also perform lookups using the `find()` method, which returns an iterator to the key-value pair if found, or `map.end()` if not found (more on iterators later).

Note how I did use the `[]` operator above to insert new key-value pairs. This is because the `[]` operator in std::map will create a new entry if the key does not already exist. If the key does exist, it will return a reference to the existing value, allowing you to modify it directly.


### Set
Sets are very self explanatory, and you can use them whenever you need to
store unique items without caring about order. They just care about uniqueness and are self-sorting; they handle all of that for you.

```cpp
#include <iostream>
#include <set>

int main() {
  std::set<int> set_me_on_fire = {30, 40, 50};

  set_me_on_fire.insert(10);
  set_me_on_fire.insert(20);
  set_me_on_fire.insert(30); // duplicate, won't be added

  for (const auto& value : set_me_on_fire) {
    std::cout << value << " ";
    // 10 20 30 40 50
  }

  std::cout << "\n";
  std::set<std::string> letters = {"c", "b", "a"};

  for (const auto& value : letters) {
    std::cout << value << " ";
    // a b c
  }

  std::cout << std::endl;
  return 0;
}
```


## Iterators
Iterators are objects provided by the standard library that allow you to traverse
the elements of a container (like vectors, lists, maps, and sets) in a uniform way,
regardless of the underlying data structure.

You're actually already using iterators when you do for loops over STL containers,
but this was just something that I needed to point out separately because of it's just a weirdly separate explicit part of C++. Up until now, it's all been under the hood:

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <map>

template<typename IterType1, typename IterType2>
void increment(
  IterType1& v_iter,
  IterType2& m_iter
) {
  // increment to next element
  ++v_iter;
  ++m_iter;
}

int main() {
  std::vector<int> my_vector = {1, 2, 3};
  std::vector<int>::iterator v_iter = my_vector.begin();
  // v_iter now points to the beginning of
  // the vector. defining iterators this way
  // allows us to use the ++i or i++ (prefix vs postfix)
  // on the iterator element to allow us to traverse
  // the object.

  std::map<std::string, int> my_map = {
    {"a", 1}, {"b", 2}, {"c", 3}
  };
  std::map<std::string, int>::iterator m_iter = my_map.begin();

  std::cout << "Vector first element: " << *v_iter << "\n";
  std::cout << "Map first element value: " << m_iter->second << "\n";

  increment(v_iter, m_iter);

  std::cout << "Vector second element: " << *v_iter << "\n";
  std::cout << "Map second element value: " << m_iter->second << "\n";

  increment(v_iter, m_iter);
  std::cout << "Vector third element: " << *v_iter << "\n";
  std::cout << "Map third element value: " << m_iter->second;

  std::cout << std::endl;
  return 0;
}
```

Iterators can also be at the end of a container, which is represented by the `end()` method. This is useful for checking if you've reached the end of the container while iterating through it.

A quick footnote is that `.begin()` and `.end()` are methods that return iterators to the beginning and end of the container, respectively. If we wanted to write our above increment function to follow a pattern that's a little bit more common, we
could do that with templates.

## ++i vs i++
A quick note on the difference between `++i` (prefix increment) and `i++` (postfix increment) when used with iterators:
- `++i` increments the iterator and returns the incremented iterator. It's generally more efficient
- `i++` increments the iterator but returns a copy of the iterator before it was incremented. This can be less efficient because it involves creating a temporary copy.

When iterating through containers, prefer using `++i` for better performance, especially with complex iterators like those in linked lists or maps. Here's a quick example to illustrate the difference:

```cpp
#include <iostream>
#include <vector>

int main() {
  std::vector<int> my_vector = {1, 2, 3};
  std::vector<int>::iterator v_iter = my_vector.begin();

  // prefix
  int prefix = *(++v_iter);
  // v_iter now points to 2,
  // prefix is 2

  v_iter = my_vector.begin(); // reset iterator

  // this increments the iterator, but
  // returns the old (iterator) value
  int postfix = *(v_iter++);
  // v_iter now points to 2
  // postfix is 1,

  std::cout << "Prefix increment result: " << prefix << std::endl;
  std::cout << "Postfix increment result: " << postfix << std::endl;
  std::cout << std::endl;
  return 0;
}
```

If we're defining custom iterators for our own data structures, we can implement both versions of the increment operator to provide flexibility to users of our iterators. Here's a very complete example with a custom linked list bidirectional iterator that supports both prefix and postfix increment:

```cpp
#include <iostream>

struct Node {
  int data;
  Node* next;
  Node* prev;
};

class LinkedListIterator {
  private:
    Node* current;  // pointer to current node

  public:
    // constructor
    LinkedListIterator(Node* node) : current(node) {}

    // dereference operator - get the data
    int& operator*() {
      return current->data;
    }

    // prefix increment (++iter)
    // returns reference to the incremented iterator
    LinkedListIterator& operator++() {
      current = current->next;  // move to next node
      return *this;             // return reference to this
    }

    // postfix increment (iter++)
    // note: int parameter is a dummy to distinguish from prefix
    LinkedListIterator operator++(int) {
      LinkedListIterator temp = *this;  // copy current state
      current = current->next;          // move to next node
      return temp;                      // return OLD state (the copy)
    }

    // prefix decrement (--iter)
    // returns reference to the decremented iterator
    LinkedListIterator& operator--() {
      current = current->prev;  // move to previous node
      return *this;             // return reference to this
    }

    // postfix decrement (iter--)
    // note: int parameter is a dummy to distinguish from prefix
    LinkedListIterator operator--(int) {
      LinkedListIterator temp = *this;  // copy current state
      current = current->prev;          // move to previous node
      return temp;                      // return OLD state (the copy)
    }

    // equality comparison
    bool operator!=(const LinkedListIterator& other) const {
      return current != other.current;
    }

    bool operator==(const LinkedListIterator& other) const {
      return current == other.current;
    }
};

class LinkedList {
  private:
    Node* head;
    Node* tail;

  public:
    LinkedList() : head(nullptr), tail(nullptr) {}

    void push_back(int value) {
      Node* new_node = new Node{value, nullptr, tail};
      if (tail) {
        tail->next = new_node;
      } else {
        head = new_node;
      }
      tail = new_node;
    }

    // begin returns iterator to first element
    LinkedListIterator begin() {
      return LinkedListIterator(head);
    }

    // end returns iterator past the last element
    LinkedListIterator end() {
      return LinkedListIterator(nullptr);
    }
};

int main() {
  LinkedList list;
  list.push_back(10);
  list.push_back(20);
  list.push_back(30);

  auto iter = list.begin();

  std::cout << "using prefix increment:" << "\n";
  std::cout << *iter << "\n";      // 10
  std::cout << *(++iter) << "\n";  // 20 (increments first, then returns)

  // reset
  iter = list.begin();

  std::cout << "\n" << "using postfix increment:" << "\n";
  std::cout << *iter << "\n";      // 10
  std::cout << *(iter++) << "\n";  // 10 (returns old value, then increments)
  std::cout << *iter << "\n";      // 20 (now pointing to next node)

  std::cout << "\n" <<  "using decrement operators:" << "\n";
  std::cout << *(--iter) << "\n";  // 10 (prefix: decrements first)
  ++iter;  // back to 20
  std::cout << *(iter--) << "\n";  // 20 (postfix: returns old value)
  std::cout << *iter << "\n";      // 10 (now pointing to previous node)
  std::cout << "\niterating with begin() and end():" << "\n";
  for (auto iter = list.begin(); iter != list.end(); ++iter) {
    std::cout << *iter << " ";  // 10 20 30
  }
  std::cout << std::endl;

  return 0;
}
```