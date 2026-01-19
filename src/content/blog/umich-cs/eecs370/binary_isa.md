---
title: "Binary & ISA"
date: '2026-01-13'
order: 1
description: ""
tags: ['c', 'clang', 'gcc', 'programming', 'binary', 'isa', 'assembly']
---

https://drive.google.com/drive/u/3/folders/14RejTyto2PeaMkH4uoGvVnYuz5-z6Dgx


storage types, binary and addressing modes


## Computer Model & Binary
Most programs load value sfrom memory to the processor, operating on those values, writing back to memory

- values are represented in binary


- humans use decimal (base 10)
- computers use binary (base 2)
  - only two symbols: 0 (low voltage) and 1 (high voltage)

- 8 bits -> byte

binary sucks -> base 16 (hexadecimal)


Every 4 bits corresponds to 1 hex digit (since 24=16)

(binary)     0b 0010 0101 1010 1011
(hexadecimal)0x  2    5    A     B

52 in binary/hex?
- 52 decimal
0011 0100 binary (8 bit representation)
0x34 hex



### shift operators
- Shift a value x bits to the left via "<<"
- Inserts "x" zeros to the right (least significant)
- E.g:
int a = 60; // 0b0011_1100
int s = a << 2; // 0b1111_0000

- "a" is still 60, "s" is 240

- Same idea for ">>", but to the right

(slide 15, 02 - isa)

### bitwise operations
- Bitwise operations apply a Boolean operation on each bit of a value (or
each pair of bits across two values)
& – and
| – or
^ – xor
~ – not
- Very different from Boolean &&, ||, etc
  - These operate on entire values, returning true/false

### different data types

How does memory distinguish between different
data types?
- E.g. int, int *, char, float, double

- It doesn't! It's all just 0s and 1s!
- We'll see how to encode each of these later
- Exact length depends on architectures

"bits is bits"

words = 4 bytes = 32 bits
kilobytes = 1024 bytes
megabytes = 1024 kilobytes = 1,048,576 bytes
gigabytes = 1024 megabytes = 1,073,741,824 bytes

## ISAs
(slide 20, 02 - isa)
- ISA = Instruction Set Architecture
- The interface between hardware and software
unique to hardware architecture (arm, x86, etc)

microarchitecture = hardware implementation of an ISA (e.g., Intel i7, AMD Ryzen)

- under microarchitecture this lives circuits, devices, etc
- above ISA is your high level abstractions (OS, applications, etc)

### Registers
- C/C++ instructions operate on variables in memory

- guess that asm operates on addresses?
 - problems: instructions long af
 - memory is slow (50 nanoseconds) compared to CPU (1-3 nanoseconds)

- modern ISAs define registers (on the CPU) to hold values temporarily
  - GPRs = General Purpose Registers small number (~8-32) of  fixed length, hardware variables that have simple names like 'r5'
  - a register is a scalar (?)

In a load-store architecture (what we’ll assume in this
class):
- load instructions bring values from memory into a register
- Other instructions specify register indices (compact and fast)
- store instructions send them back to memory

### Control flow
C/C++: next line of code is executed until you get to:
  - function call
  - return statement
  - if statement or for/while loop
  - etc

- Assembly: a program counter (PC) keeps track of which memory
address has the next instruction, gets incremented until
  - a "branch" or "jump" instruction
    - Used to change control flow (more later)
- This model is called a von Neumann Architecture

hw cycle:
- fetch
- decode
- execute

arithmetic logical unit (ALU)

(sometimes spill things out to memory when we don't have enough registers to get later)

example for register addition for ARM in (slide 32, 02 - isa) (??)


### Representing different values
0/1 does not distinguish between different data types

(slide 35, 02 - isa)

min datatype sizes in c (slide 36, 02 - isa):


#### representing values in hardware

#### negative numbers


two's complement representation (slide 39-40, 02 - isa)

negate a number:
- invert all bits
