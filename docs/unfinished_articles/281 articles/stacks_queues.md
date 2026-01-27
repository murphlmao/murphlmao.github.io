---
title: "Stacks & Queues"
date: '2026-01-13'
order: 1
description: "Stacks, Queues, Priority Queues, and Deques, and Permutations! And, oh my god, a bridge to jump off of!"
tags: ['C++', 'cpp', 'clang', 'C', 'programming', 'stacks', 'queues']
---

## Time complexity

Speed vs size tradeoff

singly linked list:
2n + 3
1) access
2) check
n

create node
insert node
update pointer


## Stack ADT
- LIFO
push()
pop()
element& top()
size()
empty()

web browser back
undo
function calls (deals w call stack under the hood)

redo methods use another stack
- not a better way?


--
stack implementation: array/vector
- `top` pointer points to just past the last element

stack implementation: linked list

amortized time complexity: which is better for stack, linked list or array/vector?
- amortized constant (even though worst case is n, it averages out to constant time because most of the time it is.. edge cases are o(n))
- it depends:
https://drive.google.com/drive/folders/1hEEEFyCqH_lhN2ZRRvFBlM49mBu1NZf2


---
stack is an adapter class: underlying classes: deque, [doubly linked] list, vector

## Queues

- FIFO
push(element)
pop()
element& front()
size()
empty()

waiting in line
adding songs to end of playlist


--

queue implementation: circular(ring) buffer
queue implementation: linked list

dequeue - remove from queue
enqueue - add to queue

## Deque (Double-Ended Queue) (not dequeue)

and is usually based on a growable collection of fixed-sized arrays.

- ADT that allows efficient insertion and removal
from the front and the back

6 major methods, 2 minor
– push_front(), pop_front(), front()
– push_back(), pop_back(), back()
- size(), empty()

- constant time operator: [] to access elements by index

- two internal views, map of chunks
when a chunk is full, allocate a new chunk and add it to the map
when a chunk is empty, deallocate it and remove it from the map

https://stackoverflow.com/questions/6292332/what-really-is-a-deque-in-stl

chunk_size, shift

stack/queue like behavior at both ends
random access w/ [] or .at()

## Priority Queue
- Data paired with priority, usually numbers
- should be able to compare priority values
- Supports insertion of data and inspection
- Supports removal of datum with highest priority
”Most important” determined by given ordering

like fastest bikers exit a race first

another ex: emergency call center, operators assign priority


## Permutations
Juggling with Stacks and Queues

- Task: given N elements, generate
all N-element permutations
• Ingredients of a solution
– One recursive function
– One stack
– One queue

Input: {1, 2, 3}
Output: {
{1, 2, 3},
{1, 3, 2},
{2, 3, 1},
{2, 1, 3},
{3, 1, 2},
{3, 2, 1}
}


# Linked lists and double pointer indexing
- two pointer technique
- lab questions from lab2 are very fucking good for examples
- queue with stacks
