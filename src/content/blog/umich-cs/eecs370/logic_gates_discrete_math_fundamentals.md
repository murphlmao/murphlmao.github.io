---
title: "Logic Gates & Discrete Math Foundation"
date: '2026-01-08'
order: 1
description: "The math that makes your computer go brrrrr. Boolean algebra, logic gates, and why true + true = true."
tags: ['c', 'programming', 'binary', 'computer science', 'isa', 'assembly', 'logic gates', 'discrete math']
---

## Why Do I Need To Know This?

Your computer doesn't understand English, Python, or even assembly. At the lowest level, it only understands two things: **on** and **off**. 1 and 0. True and false. Every single thing your computer does - running Chrome, playing games, calculating your GPA - boils down to billions of tiny switches flipping between these two states.

Logic gates are *how* those switches combine to actually do useful shit. They're the building blocks of every circuit in your CPU. Understanding them is like understanding atoms before you study chemistry - you can't really get what's happening at higher levels without knowing this foundation.


## Boolean Algebra: Math, But Make It Binary

Before we get to the physical gates, let's talk about the math behind them. **Boolean algebra** is algebra where variables can only be **true** or **false** (1 or 0). That's it. No fractions, no decimals, no imaginary numbers. Just yes or no.

You'll see this written in a few different ways depending on who's teaching:

| Operation | Math/Philosophy | Engineering | Programming | Plain English |
|-----------|-----------------|-------------|-------------|---------------|
| AND | A ∧ B | A · B or AB | A && B | Both must be true |
| OR | A ∨ B | A + B | A \|\| B | At least one is true |
| NOT | ¬A | A' or Ā | !A | Flip the value |
| XOR | A ⊕ B | A ⊕ B | A ^ B | Exactly one is true |

Don't let the notation confuse you. `A ∧ B`, `A · B`, `AB`, and `A && B` all mean the exact same thing: "A AND B."


## The Four Horsemen of Logic Gates

### AND Gate

**"Both inputs must be true for output to be true."**

Think of it like a strict bouncer at a club: you need a valid ID **AND** you need to be on the list. Missing either one? You're not getting in.

```
A ───┬───
     │ AND ──── Output
B ───┴───
```

**Truth Table:**
| A | B | A AND B |
|---|---|---------|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

Only the last row outputs 1. Both inputs have to be 1.


### OR Gate

**"At least one input must be true for output to be true."**

This is the chill bouncer: got an ID? Cool, come in. On the list? Also cool, come in. Got both? Even better, come in. The only way you're NOT getting in is if you have neither.

```
A ───┬───
     │ OR ──── Output
B ───┴───
```

**Truth Table:**
| A | B | A OR B |
|---|---|--------|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 1 |

Only the first row outputs 0. Everything else is a 1.

**Important:** This is "inclusive or" - both being true still gives you true. This is different from how we sometimes use "or" in English ("you can have cake or ice cream" often implies not both).


### NOT Gate (Inverter)

**"Flip the input."**

This one's dead simple. 1 becomes 0. 0 becomes 1. It only takes one input.

```
A ─── NOT ─── Output (which is just "not A")
```

**Truth Table:**
| A | NOT A |
|---|-------|
| 0 | 1 |
| 1 | 0 |

That's it. That's the whole thing.


### XOR Gate (Exclusive OR)

**"Exactly one input must be true - not both, not neither."**

This is "exclusive or" - the way you actually meant "or" when you told your sibling "you can sit in the front seat or the back seat." You didn't mean they could sit in both.

```
A ───┬───
     │ XOR ──── Output
B ───┴───
```

**Truth Table:**
| A | B | A XOR B |
|---|---|---------|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

Notice the difference from OR: when both are 1, XOR outputs 0. XOR is asking "are these different?"

XOR is super useful in computing. It's used in encryption, error checking, and swapping two variables without a temp variable (Google "XOR swap" if you're curious).


## Combining Gates: Boolean Expressions

Here's where it gets interesting. You can chain these gates together to build more complex logic.

**Example:** "I'll go to the party if I get an apple AND either grapes OR a banana."

Let's define:
- A = got an apple
- G = got grapes
- B = got a banana
- X = going to the party

The expression is: **X = A AND (G OR B)**

Or in different notations:
- Math: X = A ∧ (G ∨ B)
- Engineering: X = A · (G + B)
- Code: X = A && (G || B)

**Truth Table for this expression:**

| A | G | B | G OR B | X = A AND (G OR B) |
|---|---|---|--------|-------------------|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 1 | 0 |
| 0 | 1 | 0 | 1 | 0 |
| 0 | 1 | 1 | 1 | 0 |
| 1 | 0 | 0 | 0 | 0 |
| 1 | 0 | 1 | 1 | 1 |
| 1 | 1 | 0 | 1 | 1 |
| 1 | 1 | 1 | 1 | 1 |

Notice how every row where A = 0 results in X = 0 (no apple = no party). And when A = 1, you still need at least one of G or B to be 1.


## NAND and NOR: The Universal Gates

There are two more gates you should know about: **NAND** (NOT AND) and **NOR** (NOT OR). They're just AND and OR with the output inverted.

**NAND Truth Table:**
| A | B | A NAND B |
|---|---|----------|
| 0 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

It's literally the opposite of AND.

Here's the wild part: **NAND gates are "universal."** This means you can build ANY other gate (AND, OR, NOT, XOR, whatever) using only NAND gates. Same goes for NOR. This is why CPUs are often built primarily out of NAND gates - you only need to manufacture one type of gate and you can build anything.



## Quick Reference: Boolean Algebra Laws

These are some identities that'll help you simplify expressions:

| Law | AND version | OR version |
|-----|-------------|------------|
| Identity | A · 1 = A | A + 0 = A |
| Null | A · 0 = 0 | A + 1 = 1 |
| Idempotent | A · A = A | A + A = A |
| Complement | A · A' = 0 | A + A' = 1 |
| Double Negation | (A')' = A | |
| Commutative | A · B = B · A | A + B = B + A |
| Associative | (A · B) · C = A · (B · C) | (A + B) + C = A + (B + C) |
| Distributive | A · (B + C) = (A · B) + (A · C) | A + (B · C) = (A + B) · (A + C) |

### De Morgan's Laws (The Important Ones)

These come up ALL the time:

- **(A · B)' = A' + B'** → "NOT (A AND B)" is the same as "NOT A OR NOT B"
- **(A + B)' = A' · B'** → "NOT (A OR B)" is the same as "NOT A AND NOT B"

In plain English: when you push a NOT through parentheses, ANDs become ORs and vice versa.


## Why This Matters For Computer Organization

Everything in your CPU is built from these gates:
- **Adders** (adding two numbers) = combinations of XOR and AND gates
- **Multiplexers** (selecting between inputs) = combinations of AND, OR, and NOT
- **Flip-flops** (memory storage) = combinations of NAND or NOR gates
- **ALU** (the thing that does math) = tons of gates working together

When you write `int x = 5 + 3;` in C, somewhere deep down, that addition is happening through a circuit made of these exact logic gates. Understanding this level helps you understand *why* computers work the way they do, not just *that* they work.

