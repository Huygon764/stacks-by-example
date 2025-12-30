---
title: Constants
layout: default
---

## Overview

Constants are immutable values that are set once when the contract is deployed and cannot be changed afterward. They are essential for storing configuration values, error codes, and contract metadata.

## What are Constants?

Constants in Clarity are:
- **Immutable** - Cannot be changed after deployment
- **Set at compile-time** - Evaluated when the contract is analyzed
- **Gas-free** - No runtime cost to access
- **Global** - Accessible from any function in the contract

## Basic Syntax

```lisp
(define-constant constant-name expression)
```

The expression is evaluated at analysis time and the result is stored permanently.

## Simple Constants

### Numeric Constants

```lisp
;; Unsigned integers
(define-constant MAX-SUPPLY u1000000)
(define-constant MIN-PURCHASE u1)
(define-constant FEE-PERCENTAGE u250)  ;; 2.5% in basis points

;; Signed integers
(define-constant INITIAL-BALANCE 0)
(define-constant ADJUSTMENT-FACTOR -100)
```

### String Constants

```lisp
;; ASCII strings
(define-constant CONTRACT-NAME "MyAwesomeContract")
(define-constant TOKEN-SYMBOL "MAT")
(define-constant VERSION "1.0.0")

;; UTF-8 strings
(define-constant WELCOME-MESSAGE u"Welcome to our platform")
(define-constant DESCRIPTION u"A decentralized marketplace")
```

### Boolean Constants

```lisp
(define-constant ENABLED true)
(define-constant REQUIRE-VERIFICATION false)
(define-constant ALLOW-TRANSFERS true)
```

### Principal Constants

```lisp
;; Contract owner (set to deployer)
(define-constant CONTRACT-OWNER tx-sender)

;; Hardcoded admin address
(define-constant ADMIN 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE)

;; Contract principal
(define-constant TREASURY 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.treasury)
```

### Buffer Constants

```lisp
;; Hash values
(define-constant GENESIS-HASH 0x0000000000000000000000000000000000000000000000000000000000000000)

;; Fixed data
(define-constant SIGNATURE-PREFIX 0x1234)
```

## Dependent Constants

Constants can reference other constants that were defined earlier:

```lisp
;; Base values
(define-constant BASE-FEE u100)
(define-constant MULTIPLIER u3)

;; Derived from base values
(define-constant PREMIUM-FEE (* BASE-FEE MULTIPLIER))  ;; u300
(define-constant TOTAL-FEE (+ BASE-FEE PREMIUM-FEE))   ;; u400

;; String concatenation
(define-constant GREETING "Hello")
(define-constant FULL-GREETING (concat GREETING " World!"))

;; Complex expressions
(define-constant PERCENTAGE-DIVISOR u10000)
(define-constant FEE-RATE u250)
(define-constant FEE-MULTIPLIER (/ FEE-RATE PERCENTAGE-DIVISOR))
```

## Error Code Constants

One of the most common uses of constants is defining error codes:

### Basic Error Codes

```lisp
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-AMOUNT (err u101))
(define-constant ERR-INSUFFICIENT-BALANCE (err u102))
(define-constant ERR-ALREADY-EXISTS (err u103))
(define-constant ERR-NOT-FOUND (err u104))
```

### Organized Error Codes

Group error codes by category for better organization:

```lisp
;; Authorization errors (100-199)
(define-constant ERR-OWNER-ONLY (err u100))
(define-constant ERR-NOT-AUTHORIZED (err u101))
(define-constant ERR-FORBIDDEN (err u102))

;; Validation errors (200-299)
(define-constant ERR-INVALID-AMOUNT (err u200))
(define-constant ERR-AMOUNT-TOO-LOW (err u201))
(define-constant ERR-AMOUNT-TOO-HIGH (err u202))
(define-constant ERR-INVALID-ADDRESS (err u203))

;; State errors (300-399)
(define-constant ERR-ALREADY-EXISTS (err u300))
(define-constant ERR-NOT-FOUND (err u301))
(define-constant ERR-PAUSED (err u302))
(define-constant ERR-EXPIRED (err u303))

;; Operation errors (400-499)
(define-constant ERR-TRANSFER-FAILED (err u400))
(define-constant ERR-MINT-FAILED (err u401))
(define-constant ERR-BURN-FAILED (err u402))
```

### Using Error Constants

```lisp
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-AMOUNT (err u200))

(define-public (protected-function (amount uint))
    (begin
        ;; Check authorization
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)

        ;; Check amount
        (asserts! (> amount u0) ERR-INVALID-AMOUNT)

        ;; Function logic
        (ok true)
    )
)
```

## Common Constant Patterns

### Access Control Pattern

```lisp
;; Store contract deployer
(define-constant CONTRACT-OWNER tx-sender)

;; Store multiple admins
(define-constant ADMIN-1 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE)
(define-constant ADMIN-2 'ST2HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QF)

;; Helper function
(define-private (is-admin (caller principal))
    (or
        (is-eq caller CONTRACT-OWNER)
        (is-eq caller ADMIN-1)
        (is-eq caller ADMIN-2)
    )
)

(define-public (admin-action)
    (begin
        (asserts! (is-admin tx-sender) ERR-NOT-AUTHORIZED)
        (ok true)
    )
)
```

### Configuration Pattern

```lisp
;; Token configuration
(define-constant TOKEN-NAME "MyToken")
(define-constant TOKEN-SYMBOL "MTK")
(define-constant TOKEN-DECIMALS u6)
(define-constant MAX-SUPPLY u1000000000000)  ;; 1 million tokens with 6 decimals

;; Fee configuration
(define-constant TRANSFER-FEE u100)     ;; 1% in basis points
(define-constant MINT-FEE u50)          ;; 0.5% in basis points
(define-constant BASIS-POINTS u10000)   ;; 100% = 10000 basis points

;; Limits
(define-constant MIN-TRANSFER u1000)
(define-constant MAX-TRANSFER u1000000)
(define-constant MIN-MINT u100)
```

### Contract References Pattern

```lisp
;; Reference other contracts
(define-constant TOKEN-CONTRACT 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.my-token)
(define-constant ORACLE-CONTRACT 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.price-oracle)
(define-constant VAULT-CONTRACT 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.vault)
```

### Time-based Constants

```lisp
;; Block heights and durations
(define-constant BLOCKS-PER-DAY u144)           ;; ~10 min blocks
(define-constant BLOCKS-PER-WEEK u1008)         ;; 144 * 7
(define-constant LOCK-PERIOD BLOCKS-PER-WEEK)   ;; 1 week lock

;; Deadlines (specific block heights)
(define-constant SALE-START u1000000)
(define-constant SALE-END u1100000)
```

## Best Practices

### 1. Use UPPERCASE Naming

By convention, constants use UPPERCASE with hyphens:

```lisp
;; Good
(define-constant MAX-SUPPLY u1000000)
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-FOUND (err u404))

;; Bad (avoid lowercase for constants)
(define-constant max-supply u1000000)
(define-constant contractOwner tx-sender)
```

### 2. Store Contract Owner

Always store the contract deployer for access control:

```lisp
(define-constant CONTRACT-OWNER tx-sender)

;; Use in functions
(define-public (owner-only-function)
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        ;; Owner logic here
        (ok true)
    )
)
```

### 3. Use Meaningful Names

Make constants self-documenting:

```lisp
;; Good - clear purpose
(define-constant MAX-TOKENS-PER-WALLET u100)
(define-constant LISTING-FEE-PERCENTAGE u5)
(define-constant ERR-INSUFFICIENT-BALANCE (err u102))

;; Bad - unclear purpose
(define-constant MAX u100)
(define-constant FEE u5)
(define-constant E1 (err u102))
```

### 4. Group Related Constants

Organize constants by category with comments:

```lisp
;; ===== CONTRACT CONFIGURATION =====
(define-constant CONTRACT-OWNER tx-sender)
(define-constant CONTRACT-NAME "MyContract")
(define-constant VERSION u1)

;; ===== TOKEN SETTINGS =====
(define-constant MAX-SUPPLY u1000000)
(define-constant DECIMALS u6)

;; ===== FEE STRUCTURE =====
(define-constant TRANSFER-FEE u100)
(define-constant MINT-FEE u50)

;; ===== ERROR CODES =====
;; Authorization
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-OWNER-ONLY (err u101))

;; Validation
(define-constant ERR-INVALID-AMOUNT (err u200))
```

### 5. Define Error Constants

Always use named constants instead of inline error values:

```lisp
;; Good
(define-constant ERR-NOT-FOUND (err u404))
(asserts! (is-some item) ERR-NOT-FOUND)

;; Bad
(asserts! (is-some item) (err u404))  ;; Magic number
```

### 6. Document Complex Constants

Add comments to explain non-obvious values:

```lisp
;; Fee is 2.5% represented in basis points (1% = 100bp)
(define-constant MARKETPLACE-FEE u250)

;; Lock period is 1 week (144 blocks/day * 7 days)
(define-constant LOCK-PERIOD u1008)

;; Maximum allowed is 100 tokens (with 6 decimals)
(define-constant MAX-AMOUNT u100000000)
```

## Complete Example

Here's a complete contract demonstrating proper constant usage:

```lisp
;; NFT Marketplace Contract
;; Demonstrates best practices for constants

;; ===== CONTRACT INFO =====
(define-constant CONTRACT-OWNER tx-sender)
(define-constant CONTRACT-NAME "NFT Marketplace")
(define-constant VERSION u1)

;; ===== FEE CONFIGURATION =====
(define-constant MARKETPLACE-FEE u250)      ;; 2.5% in basis points
(define-constant BASIS-POINTS u10000)       ;; 100% = 10000 basis points
(define-constant MIN-LISTING-PRICE u1000)   ;; Minimum 1000 micro-STX

;; ===== TIME CONSTANTS =====
(define-constant BLOCKS-PER-DAY u144)
(define-constant MIN-LISTING-DURATION (* BLOCKS-PER-DAY u1))    ;; 1 day minimum
(define-constant MAX-LISTING-DURATION (* BLOCKS-PER-DAY u30))   ;; 30 days maximum

;; ===== ERROR CODES =====
;; Authorization errors (100-199)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-OWNER-ONLY (err u101))

;; Listing errors (200-299)
(define-constant ERR-LISTING-NOT-FOUND (err u200))
(define-constant ERR-LISTING-EXPIRED (err u201))
(define-constant ERR-PRICE-TOO-LOW (err u202))

;; Transaction errors (300-399)
(define-constant ERR-INSUFFICIENT-PAYMENT (err u300))
(define-constant ERR-TRANSFER-FAILED (err u301))

;; ===== HELPER FUNCTIONS =====
(define-private (calculate-fee (price uint))
    (/ (* price MARKETPLACE-FEE) BASIS-POINTS)
)

(define-private (is-authorized (caller principal))
    (is-eq caller CONTRACT-OWNER)
)

;; ===== PUBLIC FUNCTIONS =====
(define-public (create-listing (price uint) (duration uint))
    (begin
        ;; Validate price using constant
        (asserts! (>= price MIN-LISTING-PRICE) ERR-PRICE-TOO-LOW)

        ;; Validate duration using constants
        (asserts! (>= duration MIN-LISTING-DURATION) (err u400))
        (asserts! (<= duration MAX-LISTING-DURATION) (err u401))

        ;; Create listing logic here
        (ok true)
    )
)

(define-public (admin-function)
    (begin
        ;; Use constant for authorization
        (asserts! (is-authorized tx-sender) ERR-OWNER-ONLY)

        ;; Admin logic here
        (ok true)
    )
)
```

## Constants vs Variables

| Feature | Constants | Variables |
|---------|-----------|-----------|
| **Mutability** | Immutable | Mutable |
| **When set** | Deploy time | Runtime |
| **Gas cost** | Free (compile-time) | Read: low, Write: medium |
| **Use cases** | Config, errors, owner | Counters, flags, state |
| **Syntax** | `define-constant` | `define-data-var` |
| **Access** | Direct reference | `var-get` / `var-set` |

```lisp
;; Constant - never changes
(define-constant MAX-SUPPLY u1000000)

;; Variable - can be updated
(define-data-var total-minted uint u0)
```

## Common Mistakes to Avoid

### 1. Using Variables for Config

```lisp
;; Bad - wastes gas, can be changed
(define-data-var max-supply uint u1000000)

;; Good - free access, immutable
(define-constant MAX-SUPPLY u1000000)
```

### 2. Magic Numbers

```lisp
;; Bad - unclear meaning
(asserts! (< amount u1000000) (err u1))

;; Good - self-documenting
(define-constant MAX-TRANSFER u1000000)
(asserts! (< amount MAX-TRANSFER) ERR-AMOUNT-TOO-HIGH)
```

### 3. Hardcoded Principals

```lisp
;; Bad - hard to update, unclear
(asserts! (is-eq tx-sender 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE) (err u1))

;; Good - clear purpose
(define-constant CONTRACT-OWNER 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE)
(asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
```

### 4. Inline Error Codes

```lisp
;; Bad - magic numbers, hard to maintain
(if (< balance amount) (err u102) (ok true))

;; Good - named constants
(define-constant ERR-INSUFFICIENT-BALANCE (err u102))
(if (< balance amount) ERR-INSUFFICIENT-BALANCE (ok true))
```
