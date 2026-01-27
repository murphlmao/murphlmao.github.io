---
title: "Introduction to Instruction Set Architecture"
date: '2026-01-13'
order: 2
description: "Basics of instruction set architecture, with LC2K & ARM as examples"
tags: ['c', 'programming', 'binary', 'hexadecimal', 'isa', 'assembly', 'twos complement']
---

## ISA: The Contract Between Hardware and Software

An **ISA (Instruction Set Architecture)** is the interface between software and hardware - it defines what instructions a CPU understands and how programs communicate with the processor.

Different ISAs exist for different purposes:
- **x86/x64** - Intel/AMD desktop and laptop processors
- **ARM** - Mobile devices, Apple Silicon, embedded systems
- **RISC-V** - Open-source, used in education and increasingly in industry

The ISA you're using determines what assembly language looks like and what operations are available.

### The Von Neumann Model

Almost every computer you'll use follows this architecture:

```
┌─────────────────────────────────────────┐
│              PROCESSOR                  │
│  ┌─────────┐         ┌──────────────┐   │
│  │ Control │         │     ALU      │   │
│  │  Unit   │         │ (Arithmetic  │   │
│  │         │         │  Logic Unit) │   │
│  └─────────┘         └──────────────┘   │
│          ┌───────────────┐              │
│          │   Registers   │              │
│          └───────────────┘              │
└─────────────────────────────────────────┘
                    ↕
            ┌───────────────┐
            │    Memory     │
            │ (Instructions │
            │   + Data)     │
            └───────────────┘
```

Key insight: **instructions and data live in the same memory**. Your program is just numbers that the CPU interprets as instructions. This is why buffer overflows are so dangerous - overwrite the right memory and you can inject your own instructions.

### Registers: The CPU's Scratchpad

Here's the thing about memory: it's slow as shit compared to the CPU. Memory access takes ~50-100 nanoseconds. CPU operations take ~1 nanosecond. If the CPU had to go to memory for every value, it would spend most of its time waiting.

**Registers** are the solution - tiny, blazing-fast storage locations directly inside the CPU.

| | Registers | Memory |
|---|-----------|--------|
| Speed | ~1 nanosecond | ~50-100 nanoseconds |
| Size | Tiny (8-32 registers) | Huge (gigabytes) |
| Access | By name (R0, R1, etc.) | By address |

Most ISAs have 8-32 **General Purpose Registers (GPRs)** with names like `r0`, `r1`, ... or `eax`, `ebx`, etc. depending on the architecture.

In a **load-store architecture** (what we'll assume):
1. **Load** values from memory into registers
2. **Operate** on values in registers (add, subtract, compare, etc.)
3. **Store** results back to memory

The CPU can only do math on values that are in registers. Variables in your C code eventually become loads, operations, and stores.


### Control Flow: What Runs Next?

In C/C++, execution flows line by line until you hit:
- A function call
- A return statement
- An if/else branch
- A loop (for, while)

In assembly, the **Program Counter (PC)** tracks which memory address contains the next instruction. After each instruction, PC increments to the next address... unless you hit a **branch** or **jump** instruction that changes control flow.

This is how loops and conditionals work at the hardware level - they're just instructions that modify the PC.


### The Fetch-Decode-Execute Cycle

Every single instruction goes through this loop:

1. **Fetch:** Read the instruction from memory at the address in PC
2. **Decode:** Figure out what operation the instruction wants (add? load? branch?)
3. **Execute:** Actually do it using the ALU, registers, and/or memory
4. **Update PC:** Move to the next instruction (or jump somewhere else)
5. **Repeat forever**

This cycle runs billions of times per second. When you hear "3 GHz processor," that means roughly 3 billion cycles per second - each cycle potentially completing one stage of this pipeline.


### Bits is Bits

Here's something that trips people up: **memory doesn't know what type of data it's storing**. It's all just 0s and 1s.

The bit pattern `01000001` could be:
- The integer 65
- The character 'A' (ASCII)
- Part of a floating-point number
- Part of an instruction
- Part of a memory address

The *interpretation* depends entirely on how your program uses it. The CPU doesn't care - it just moves bits around. This is why C lets you cast between types so freely (and dangerously).


---
LC2K lecture

---
title: "What is LC2K?"
date: '2026-01-15'
order: 1
description: "An overview of LC2K, a simplified computer architecture used in EECS 370 at the University of Michigan."
tags: ['C++', 'cpp', 'C-lang', 'C', 'programming', 'stacks', 'big O', 'time complexity', 'data structures', 'algorithms']
---

https://drive.google.com/file/d/1-2KK48EUjf2KShuzDnkBo7xjc51PaWjT/view




----
ARM Architecture lecture:
---
title: "ARM (Architecture)"
date: '2026-01-20'
order: 1
description: "An overview of ARM architecture and its use in modern computing systems."
tags: ['c', 'clang', 'gcc', 'programming', 'binary', 'arm', 'isa', 'assembly']
---

## lecture notes
https://drive.google.com/file/d/1jp8P4QLpoMXeQIXIsBWUrIzS4vXj62T3/view
https://eecs370.github.io/resources/armrefsheet.pdf
^ leg subset of arm

--

- addressability

--

Instruction set - legv8 subset: slide 17

- instruction encoding : slide 19

- psuedo instructions: slide 23
Instructions that use a shorthand “mnemonic” that expands to pre-
existing assembly instruction
  - MOV x12, x2 // the contents of X2 copied to X12—X2 unchanged
  expanded to: ORR x12, xzr, x2

slide 24 example, understand

--

word vs byte addressing slide 26


--
handling multiple data widths: slide 30
- sign significance/extension? / sign bit / sign displacement - memory address offset is pos or neg


--
loading instructions in action slide 32

address calculation?

store instructions: slide 36
- no sign/zero extension to consider

---
endian notation: slide 35


-- examples
slide 39:
LDUR -> 8 bytes
LDURB -> 1 byte



