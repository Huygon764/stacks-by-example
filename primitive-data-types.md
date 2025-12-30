---
title: Primitive Data Types
layout: default
---

## Overview

Clarity is a strongly-typed language where every value has a specific type. Understanding primitive data types is fundamental to writing Clarity smart contracts. This guide covers all primitive types available in Clarity with practical examples.

## Clarity Type System

Clarity enforces strict type safety:
- **No implicit type conversion** - You cannot mix types in operations
- **Compile-time type checking** - Type errors are caught before deployment
- **128-bit integers** - All integer types are 128-bit for precision
- **Fixed-length sequences** - Strings, buffers, and lists have maximum lengths

## Primitive Types

### 1. Unsigned Integers (`uint`)

Unsigned integers represent non-negative whole numbers from 0 to 2^128 - 1.

**Syntax:** Prefix with `u`

```lisp
u0          ;; Zero
u42         ;; Forty-two
u1000000    ;; One million
```

**Arithmetic Operations:**

```lisp
(+ u10 u5)        ;; Returns u15
(- u20 u8)        ;; Returns u12
(* u3 u7)         ;; Returns u21
(/ u100 u4)       ;; Returns u25 (integer division, no decimals)
(/ u10 u3)        ;; Returns u3 (truncates decimal)
(mod u10 u3)      ;; Returns u1 (remainder/modulo)
```

**Comparison Operations:**

```lisp
(> u10 u5)        ;; Returns true
(< u3 u8)         ;; Returns true
(>= u10 u10)      ;; Returns true
(<= u5 u7)        ;; Returns true
(is-eq u5 u5)     ;; Returns true (equality check)
```

**Common Use Cases:**
- Token amounts
- Counters and indices
- Block heights
- Timestamps
- IDs and identifiers

### 2. Signed Integers (`int`)

Signed integers represent both positive and negative whole numbers from -2^127 to 2^127 - 1.

**Syntax:** No prefix (just the number, with optional `-` for negative)

```lisp
0           ;; Zero
42          ;; Positive forty-two
-100        ;; Negative one hundred
1000000     ;; Positive one million
```

**Arithmetic Operations:**

```lisp
(+ 10 5)          ;; Returns 15
(- 20 30)         ;; Returns -10
(* -3 7)          ;; Returns -21
(/ 100 4)         ;; Returns 25
(/ -10 3)         ;; Returns -3 (truncates toward zero)
```

**Important:** You cannot mix signed and unsigned integers!

```lisp
(+ 2 u3)          ;; ERROR: Type mismatch!
(* u5 10)         ;; ERROR: Type mismatch!
```

**Common Use Cases:**
- Relative changes (deltas)
- Temperature or coordinate systems
- Balance adjustments (positive/negative)

### 3. Booleans (`bool`)

Booleans represent truth values: `true` or `false`.

```lisp
true
false
```

**Logical Operations:**

```lisp
(not true)                    ;; Returns false
(not false)                   ;; Returns true

(and true true)               ;; Returns true
(and true false)              ;; Returns false
(and true true true)          ;; Returns true (multiple arguments)

(or false false)              ;; Returns false
(or true false)               ;; Returns true
(or false true false)         ;; Returns true (multiple arguments)
```

**Comparison Results:**

```lisp
(is-eq u5 u5)                 ;; Returns true
(> u10 u5)                    ;; Returns true
(< 3 8)                       ;; Returns true
```

**Common Use Cases:**
- Feature flags
- Access control checks
- Conditional logic
- State indicators

### 4. Principals

Principals represent Stacks addresses - either standard principals (users) or contract principals.

**Standard Principal:**

```lisp
'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE
```

**Contract Principal:**

```lisp
'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.my-contract
```

**Special Keywords:**

```lisp
tx-sender              ;; The principal that sent the transaction
contract-caller        ;; The principal that called this function
```

**Working with Principals:**

```lisp
;; Check STX balance
(stx-get-balance 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE)

;; Transfer STX
(stx-transfer? u1000 tx-sender 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE)

;; Compare principals
(is-eq tx-sender contract-caller)
```

**Common Use Cases:**
- Ownership and access control
- Token transfers
- User identification
- Contract interactions

### 5. ASCII Strings (`string-ascii`)

ASCII strings contain basic Latin characters with a fixed maximum length.

**Syntax:**

```lisp
"Hello World"
"This is an ASCII string"
```

**Type Declaration:**

```lisp
(string-ascii 50)     ;; ASCII string with max length 50
```

**String Operations:**

```lisp
;; Concatenation
(concat "Hello" " World")                    ;; Returns "Hello World"
(concat "Hello, " (concat "Bob" "!"))        ;; Returns "Hello, Bob!"

;; Length
(len "Hello")                                ;; Returns u5

;; Converting to UTF-8
(to-consensus-buff? "Hello")                 ;; Converts to buffer
```

**Common Use Cases:**
- Simple messages
- Names and labels
- ASCII-only data
- Token symbols

### 6. UTF-8 Strings (`string-utf8`)

UTF-8 strings support international characters and special symbols.

**Syntax:** Prefix with `u`

```lisp
u"Hello World"
u"Café"
u"Buenos días"
u"Привет"
```

**Type Declaration:**

```lisp
(string-utf8 100)     ;; UTF-8 string with max length 100
```

**String Operations:**

```lisp
;; Concatenation
(concat u"Hello" u" 世界")

;; Length (in characters, not bytes)
(len u"Hello World")                        ;; Returns u11
```

**Common Use Cases:**
- International applications
- User-generated content
- Multi-language support
- Non-ASCII characters

### 7. Buffers (`buff`)

Buffers represent raw byte sequences with a fixed maximum length.

**Syntax:** Prefix with `0x` followed by hexadecimal

```lisp
0x68656c6c6f        ;; "hello" in hex
0x00                ;; Single zero byte
0x1234567890        ;; Arbitrary bytes
```

**Type Declaration:**

```lisp
(buff 32)           ;; Buffer with max length 32 bytes
```

**Buffer Operations:**

```lisp
;; Length in bytes
(len 0x68656c6c6f)                          ;; Returns u5

;; Concatenation
(concat 0x1234 0x5678)                      ;; Returns 0x12345678

;; Converting strings to buffers
(to-consensus-buff? "hello")                ;; Returns buffer representation
```

**Common Use Cases:**
- Cryptographic operations
- Hash values
- Binary data
- Serialization

## Composite Types (Overview)

While not primitive, these types build on primitives:

### Response Type

Represents success or failure of an operation.

```lisp
(ok u100)                    ;; Success with value u100
(err u404)                   ;; Error with code u404
(ok true)                    ;; Success with boolean
(err "Not found")            ;; Error with message
```

### Optional Type

Represents a value that may or may not exist.

```lisp
(some u42)                   ;; Contains value u42
(some "Hello")               ;; Contains string
(some tx-sender)             ;; Contains principal
none                         ;; No value
```

## Type Safety Examples

### Valid Type Usage

```lisp
;; Same types - OK
(+ u10 u20)              ;; Returns u30
(+ 10 20)                ;; Returns 30
(concat "Hello" " World") ;; Returns "Hello World"
```

### Invalid Type Usage (Will Error)

```lisp
;; Mixing signed and unsigned - ERROR
(+ u10 20)               ;; ERROR: Type mismatch

;; Mixing string types - ERROR
(concat "ASCII" u"UTF8") ;; ERROR: Type mismatch

;; Wrong comparison types - ERROR
(> u10 true)             ;; ERROR: Cannot compare uint with bool
```

## Best Practices

1. **Use Unsigned Integers by Default**
   - Most blockchain values are non-negative (balances, amounts, IDs)
   - Use `uint` unless you specifically need negative numbers

2. **Choose the Right String Type**
   - Use `string-ascii` for simple English text (more efficient)
   - Use `string-utf8` when you need international support

3. **Always Specify Maximum Lengths**
   - Strings: `(string-ascii 100)`
   - Buffers: `(buff 32)`
   - This prevents unbounded growth

4. **Use Constants for Magic Numbers**
   ```lisp
   (define-constant MAX-SUPPLY u1000000)  ;; Good
   ;; Instead of using u1000000 directly   ;; Bad
   ```

5. **Type Annotations in Function Signatures**
   ```lisp
   (define-public (transfer (amount uint) (recipient principal))
       ;; Implementation
   )
   ```

## Common Patterns

### Safe Arithmetic

```lisp
;; Check for overflow before addition
(define-read-only (safe-add (a uint) (b uint))
    (let ((result (+ a b)))
        (asserts! (>= result a) (err u1))
        (ok result)
    )
)
```

### Type Conversion

```lisp
;; Convert string to buffer
(to-consensus-buff? "hello")

;; Note: No direct uint to int conversion
;; Design your contract to use one type consistently
```

### Working with Optionals

```lisp
;; Default value for missing data
(define-read-only (get-balance-safe (account principal))
    (default-to u0 (map-get? balances account))
)

;; Unwrap with panic (use carefully!)
(unwrap-panic (some u42))        ;; Returns u42
```
