---
title: Memory-Efficient Sieve of Eratosthenes
description: Memory-Efficient Sieve of Eratosthenes in C (with Bit-Level Operations)
date: April 2, 2025
icon: clang
---

Implementation of the Sieve of Eratosthenes using bit-level operations to store and manipulate flags in a compact form.

```c
#include <stdio.h>s
#include <stdlib.h>
#include <math.h>

#define GET_BIT(arr, i) (arr[(i) >> 3] & (1 << ((i) & 7)))
#define SET_BIT(arr, i) (arr[(i) >> 3] |= (1 << ((i) & 7)))

int main() {
    int n = 100; // Find primes up to 100.
    int size = (n >> 3) + 1; // Each bit represents a number.
    unsigned char *sieve = calloc(size, sizeof(unsigned char));
    if (!sieve) return 1;

    int limit = sqrt(n);
    for (int i = 2; i <= limit; i++) {
        if (!GET_BIT(sieve, i)) {
            for (int j = i*i; j <= n; j += i) {
                SET_BIT(sieve, j);
            }
        }
    }

    printf("Primes up to %d:\n", n);
    for (int i = 2; i <= n; i++) {
        if (!GET_BIT(sieve, i))
            printf("%d ", i);
    }
    printf("\n");
    free(sieve);
    return 0;
}
```

By representing the sieve as a bit array, you reduce memory usage dramatically.