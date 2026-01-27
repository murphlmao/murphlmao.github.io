---
title: "Binary & Hex"
date: '2026-01-13'
order: 2
description: "How to count like a computer and why your CPU doesn't speak English. Binary, hexadecimal, two's complement, bitwise shifting, stuff like that."
tags: ['c', 'programming', 'binary', 'hexadecimal', 'isa', 'assembly', 'twos complement']
---

## Number Systems: Counting Like a Computer

Humans have 10 fingers, so we invented base-10 (decimal). Computers have switches that are either on or off, so they use base-2 (binary). And because binary gets really long really fast, programmers use base-16 (hexadecimal) as a convenient shorthand.


### Decimal (Base-10) - What You Already Know

You've been doing this since kindergarten:

```
472 = 4×10² + 7×10¹ + 2×10⁰
    = 4×100 + 7×10 + 2×1
    = 400 + 70 + 2
    = 472
```

Each digit position represents a power of 10. The rightmost digit is 10⁰ (which is 1), then 10¹ (10), then 10² (100), etc.


### Binary (Base-2) - How Computers Actually Think

Same concept, but each position is a power of 2:

```
1011 in binary = 1×2³ + 0×2² + 1×2¹ + 1×2⁰
               = 1×8  + 0×4  + 1×2  + 1×1
               = 8 + 0 + 2 + 1
               = 11 in decimal
```

Here's your cheat sheet for powers of 2 (memorize these, seriously):

| 2⁰ | 2¹ | 2² | 2³ | 2⁴ | 2⁵ | 2⁶ | 2⁷ | 2⁸ | 2⁹ | 2¹⁰ |
|----|----|----|----|----|----|----|----|----|----|-----|
| 1  | 2  | 4  | 8  | 16 | 32 | 64 | 128| 256| 512| 1024|

**Quick terminology:**
- **Bit** = a single 0 or 1
- **Byte** = 8 bits
- **Word** = typically 4 bytes (32 bits), though this varies by architecture

**Converting Decimal → Binary:**

Repeatedly divide by 2 and track the remainders (read bottom to top):

```
13 ÷ 2 = 6 remainder 1  ↑
6  ÷ 2 = 3 remainder 0  │
3  ÷ 2 = 1 remainder 1  │  Read upward: 1101
1  ÷ 2 = 0 remainder 1  │
```

So 13 in decimal = `1101` in binary.

**Verification:** 1×8 + 1×4 + 0×2 + 1×1 = 8 + 4 + 0 + 1 = 13 ✓


### Hexadecimal (Base-16) - The Programmer's Shorthand

Binary is verbose as hell. The number 255 is `11111111` in binary - that's 8 digits for a pretty small number. Hexadecimal fixes this by using 16 symbols: 0-9 plus A-F.

| Decimal | Binary | Hex | | Decimal | Binary | Hex |
|---------|--------|-----|---|---------|--------|-----|
| 0 | 0000 | 0 | | 8 | 1000 | 8 |
| 1 | 0001 | 1 | | 9 | 1001 | 9 |
| 2 | 0010 | 2 | | 10 | 1010 | A |
| 3 | 0011 | 3 | | 11 | 1011 | B |
| 4 | 0100 | 4 | | 12 | 1100 | C |
| 5 | 0101 | 5 | | 13 | 1101 | D |
| 6 | 0110 | 6 | | 14 | 1110 | E |
| 7 | 0111 | 7 | | 15 | 1111 | F |

**The Magic Trick:** Each hex digit represents exactly 4 binary bits. Since 2⁴ = 16, one hex digit perfectly encodes 4 bits. This makes conversion dead simple - no math required, just pattern matching.

**Binary → Hex:** Group bits into chunks of 4 (from the right), convert each chunk:

```
Binary:  0010 0101 1010 1011
Hex:       2    5    A    B

So 0b0010010110101011 = 0x25AB
```

**Hex → Binary:** Expand each hex digit into 4 bits:

```
Hex: 0x3F
     3    F
   0011 1111

So 0x3F = 0b00111111 = 63 in decimal
```

This is why hex is so popular in programming - it's a compact way to write binary. When you see `0xFF`, your brain should immediately think "all 1s in 8 bits" (11111111 = 255).

**Common prefixes:**
- `0x` or `0X` → hexadecimal (C, Python, most languages)
- `0b` or `0B` → binary (C, Python)
- No prefix → usually decimal


### Quick Conversion Practice

Let's do 52 decimal:

```
52 ÷ 2 = 26 r 0  ↑
26 ÷ 2 = 13 r 0  │
13 ÷ 2 = 6  r 1  │
6  ÷ 2 = 3  r 0  │  Read upward: 110100
3  ÷ 2 = 1  r 1  │
1  ÷ 2 = 0  r 1  │
```

52 decimal = `0b00110100` (8-bit) = `0x34` hex

Verify the hex: 3×16 + 4×1 = 48 + 4 = 52 ✓

| Decimal | Binary | Hex |
|---------|--------|-----|
| 15 | 0000 1111 | 0x0F |
| 16 | 0001 0000 | 0x10 |
| 255 | 1111 1111 | 0xFF |
| 256 | 0001 0000 0000 | 0x100 |
| 42 | 0010 1010 | 0x2A |


### Memory Sizes

While we're talking numbers, here's the hierarchy you'll see constantly:

| Unit | Size | Note |
|------|------|------|
| Bit | 1 bit | A single 0 or 1 |
| Byte | 8 bits | The fundamental addressable unit |
| Word | 4 bytes (32 bits) | Architecture-dependent |
| Kilobyte (KB) | 1,024 bytes | 2¹⁰ bytes |
| Megabyte (MB) | 1,024 KB | 2²⁰ bytes ≈ 1 million |
| Gigabyte (GB) | 1,024 MB | 2³⁰ bytes ≈ 1 billion |

Note: Storage manufacturers use 1000 instead of 1024, which is why your "1 TB" drive shows up as ~931 GB in your OS. Sneaky bastards.


## Negative Numbers: Two's Complement

So far we've only talked about positive numbers (unsigned). But computers need to handle negative numbers too. The solution? **Two's complement**.

### Why Not Just Use a Sign Bit?

Your first instinct might be: "Just use the leftmost bit as a sign. 0 = positive, 1 = negative."

This is called **sign-magnitude** and it sucks for two reasons:
1. You get two representations of zero (+0 and -0), wasting a bit pattern
2. Addition hardware becomes complicated - you need special cases

Two's complement solves both problems elegantly.

### How Two's Complement Works

For an n-bit number, the most significant bit (MSB) has a *negative* weight:

```
For 8 bits: -2⁷  2⁶  2⁵  2⁴  2³  2²  2¹  2⁰
           -128  64  32  16   8   4   2   1
```

**Example: What is `0b11010110` in two's complement (8-bit)?**

```
1    1    0    1    0    1    1    0
-128 +64  +0  +16  +0   +4   +2   +0  = -128 + 64 + 16 + 4 + 2 = -42
```

So `0b11010110` = -42 in 8-bit two's complement.

**Example: What is `0b00101010` in two's complement (8-bit)?**

```
0    0    1    0    1    0    1    0
0   +0  +32  +0   +8   +0   +2   +0  = 32 + 8 + 2 = 42
```

When the MSB is 0, it works exactly like unsigned - you just don't add the negative weight.

### The Easy Way to Negate

To flip a number's sign (positive → negative or negative → positive):

1. **Invert all the bits** (0→1, 1→0)
2. **Add 1**

**Example: Convert 42 to -42 in 8-bit**

```
 42 in binary: 00101010
Invert bits:   11010101
Add 1:       + 00000001
             ----------
Result:        11010110  ← This is -42
```

**Verification using the weighted method:**
-128 + 64 + 16 + 4 + 2 = -42 ✓

This trick works both ways - apply it to -42 and you get 42 back.

### Two's Complement Range

For n bits, you can represent:
- **Minimum:** -2^(n-1)
- **Maximum:** 2^(n-1) - 1

| Bits | Min | Max | Unsigned Max |
|------|-----|-----|--------------|
| 8 | -128 | 127 | 255 |
| 16 | -32,768 | 32,767 | 65,535 |
| 32 | -2,147,483,648 | 2,147,483,647 | 4,294,967,295 |

Notice there's one more negative number than positive. That's because zero takes up one of the "positive" slots (MSB = 0).

### Why Two's Complement is Genius

The beautiful thing about two's complement: **addition just works**. You don't need special hardware for signed vs unsigned addition - the same circuit handles both.

```
  42:  00101010
+ -42: 11010110
  ───────────────
       00000000  (with a carry-out that gets discarded)
```

The hardware doesn't need to know if it's adding signed or unsigned numbers. It just adds bits and the right answer falls out.


## Sign Extension: Making Numbers Bigger

What happens when you need to take an 8-bit number and store it in a 32-bit register? You can't just pad with zeros on the left - that would break negative numbers.

**Sign extension** is the solution: copy the sign bit (MSB) to fill the new positions.

**Positive number (8-bit → 16-bit):**
```
 42 =         00101010
Extended: 0000000000101010  ← Fill with 0s (sign bit was 0)
```

**Negative number (8-bit → 16-bit):**
```
-42 =         11010110
Extended: 1111111111010110  ← Fill with 1s (sign bit was 1)
```

Both still represent the same values. The key insight: extending the sign bit doesn't change the value because you're adding terms like -2¹⁵ + 2¹⁴ + 2¹³ + ... + 2⁸ which all cancel out to zero.


## Bit Shifting: Multiplication and Division for Free

Shift operators move all the bits in a value left or right by a specified number of positions. This sounds boring until you realize it's the fastest way to multiply or divide by powers of 2.

### Left Shift (`<<`)

Shifts bits to the left, inserting zeros on the right (least significant side).

```c
int a = 60;       // 0b00111100
int s = a << 2;   // 0b11110000 = 240
```

What happened? Every bit moved 2 positions to the left. The two rightmost positions got filled with zeros. The two leftmost bits fell off the edge and disappeared.

**The math:** Left shifting by n is the same as multiplying by 2ⁿ.

```
60 << 1 = 120   (60 × 2¹ = 60 × 2)
60 << 2 = 240   (60 × 2² = 60 × 4)
60 << 3 = 480   (60 × 2³ = 60 × 8)
```

This is way faster than actual multiplication because the hardware just shuffles bits around - no math required.

**Watch out for overflow:** If you shift bits off the left edge, they're gone. `200 << 1` in an 8-bit context doesn't give you 400 - it gives you 144 because the high bit got yeeted into oblivion.


### Right Shift (`>>`)

Shifts bits to the right. What fills in on the left depends on whether the value is signed or unsigned.

**Logical right shift (unsigned):** Fills with zeros.

```c
unsigned int a = 240;  // 0b11110000
unsigned int s = a >> 2;  // 0b00111100 = 60
```

**Arithmetic right shift (signed):** Fills with copies of the sign bit (preserves the sign).

```c
int a = -16;      // 0b11110000 (in 8-bit two's complement)
int s = a >> 2;   // 0b11111100 = -4
```

The sign bit gets copied to maintain the negative value. This is called "sign extension" during the shift.

**The math:** Right shifting by n is the same as integer division by 2ⁿ (rounds toward negative infinity for negative numbers).

```
240 >> 1 = 120   (240 ÷ 2)
240 >> 2 = 60    (240 ÷ 4)
240 >> 3 = 30    (240 ÷ 8)
```

**Important:** In C, right-shifting a negative signed integer is implementation-defined. Most compilers do arithmetic shift (preserving sign), but technically it's not guaranteed. If you need predictable behavior, use unsigned types.


### Shift Operator Summary

| Expression | Operation | Equivalent Math |
|------------|-----------|-----------------|
| `x << n` | Left shift by n | x × 2ⁿ |
| `x >> n` (unsigned) | Logical right shift | x ÷ 2ⁿ (floor) |
| `x >> n` (signed, positive) | Arithmetic right shift | x ÷ 2ⁿ (floor) |
| `x >> n` (signed, negative) | Arithmetic right shift | x ÷ 2ⁿ (toward -∞) |


## Bitwise Operations: Boolean Logic on Steroids

Remember those logic gates from discrete math? AND, OR, NOT, XOR? Bitwise operations apply those same operations to every bit of a value simultaneously.

**Key distinction:** Bitwise operators (`&`, `|`, `^`, `~`) operate on individual bits. Boolean operators (`&&`, `||`, `!`) operate on entire values and return true/false.

```c
// Bitwise AND - compares each bit pair
  0b11001010
& 0b10101100
------------
  0b10001000

// Boolean AND - just checks if both values are non-zero
(0b11001010 && 0b10101100) == 1  // true, because both are non-zero
```


### AND (`&`)

Each output bit is 1 only if BOTH input bits are 1.

```c
int a = 0b11001010;  // 202
int b = 0b10101100;  // 172
int c = a & b;       // 0b10001000 = 136
```

**Common use - masking:** AND is perfect for extracting specific bits. Want just the lower 4 bits of a byte?

```c
int value = 0b11010110;  // 214
int lower4 = value & 0x0F;  // 0b00000110 = 6

// 0x0F = 0b00001111, so it "masks off" the upper bits
```


### OR (`|`)

Each output bit is 1 if EITHER (or both) input bits are 1.

```c
int a = 0b11001010;  // 202
int b = 0b10101100;  // 172
int c = a | b;       // 0b11101110 = 238
```

**Common use - setting bits:** OR is perfect for turning specific bits ON without affecting others.

```c
int flags = 0b00000010;  // some flags set
flags = flags | 0b00001000;  // turn on bit 3
// flags is now 0b00001010
```


### XOR (`^`)

Each output bit is 1 if the input bits are DIFFERENT.

```c
int a = 0b11001010;  // 202
int b = 0b10101100;  // 172
int c = a ^ b;       // 0b01100110 = 102
```

**Common uses:**
- **Toggling bits:** XOR with 1 flips a bit, XOR with 0 leaves it alone
- **Swapping without temp:** `a ^= b; b ^= a; a ^= b;` swaps a and b
- **Encryption:** XOR is reversible - `(x ^ key) ^ key == x`

```c
int flags = 0b00001010;
flags = flags ^ 0b00000010;  // toggle bit 1
// flags is now 0b00001000
```


### NOT (`~`)

Flips every bit. 0 becomes 1, 1 becomes 0.

```c
int a = 0b00001111;  // 15
int b = ~a;          // 0b11110000 = -16 (in signed 8-bit)
```

**Watch out:** In two's complement, `~x` equals `-(x+1)`. So `~0` is -1 (all 1s), not some huge positive number.

```c
~0  == -1   // 0b11111111... (all ones)
~1  == -2
~(-1) == 0
```


### Bitwise Operator Truth Table

| A | B | A & B | A \| B | A ^ B | ~A |
|---|---|-------|--------|-------|-----|
| 0 | 0 | 0 | 0 | 0 | 1 |
| 0 | 1 | 0 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 | 0 |
| 1 | 1 | 1 | 1 | 0 | 0 |


### Practical Bit Manipulation Patterns

**Check if bit n is set:**
```c
if (value & (1 << n)) { /* bit n is set */ }
```

**Set bit n:**
```c
value = value | (1 << n);
// or: value |= (1 << n);
```

**Clear bit n:**
```c
value = value & ~(1 << n);
// or: value &= ~(1 << n);
```

**Toggle bit n:**
```c
value = value ^ (1 << n);
// or: value ^= (1 << n);
```

**Extract bits [high:low]:**
```c
// Get bits 4-7 from a byte
int bits = (value >> 4) & 0x0F;
```

These patterns show up constantly in systems programming - setting flags, parsing packed data structures, implementing protocols, and optimizing the hell out of tight loops.
