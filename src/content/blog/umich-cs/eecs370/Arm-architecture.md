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