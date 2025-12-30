---
title: Variables
layout: default
---

## Overview

Clarity provides two primary ways to store mutable data in your smart contracts:
- **Data Variables** - Mutable single values that can be updated
- **Maps** - Key-value storage for multiple entries

For immutable values, see [Constants](./constants.md).

Understanding these storage mechanisms is essential for building stateful smart contracts on Stacks.

## Data Variables (`define-data-var`)

Data variables are mutable values that can be read and updated during contract execution.

### Basic Syntax

```lisp
(define-data-var var-name var-type initial-value)
```

### Defining Variables

```lisp
;; Unsigned integer variable
(define-data-var counter uint u0)

;; Boolean variable
(define-data-var is-paused bool false)

;; String variable
(define-data-var message (string-ascii 100) "Welcome!")

;; Optional principal
(define-data-var beneficiary (optional principal) none)

;; Tuple variable
(define-data-var config
    {
        min-amount: uint,
        max-amount: uint,
        enabled: bool
    }
    {
        min-amount: u1,
        max-amount: u1000,
        enabled: true
    }
)
```

### Reading Variables with `var-get`

Use `var-get` to read the current value of a variable:

```lisp
(define-data-var counter uint u0)

;; Read the counter value
(var-get counter)  ;; Returns u0

;; Use in a function
(define-read-only (get-counter)
    (var-get counter)
)
```

### Updating Variables with `var-set`

Use `var-set` to update a variable's value:

```lisp
(define-data-var counter uint u0)

;; Set the counter to a new value
(var-set counter u10)

;; Update based on current value
(var-set counter (+ (var-get counter) u1))  ;; Increment by 1
```

### Complete Variable Example

```lisp
(define-data-var total-supply uint u0)
(define-data-var is-active bool true)

;; Read-only function to get current supply
(define-read-only (get-supply)
    (var-get total-supply)
)

;; Public function to mint (increases supply)
(define-public (mint (amount uint))
    (let
        ((current-supply (var-get total-supply)))
        (var-set total-supply (+ current-supply amount))
        (ok (var-get total-supply))
    )
)

;; Public function to toggle active status
(define-public (toggle-active)
    (begin
        (var-set is-active (not (var-get is-active)))
        (ok (var-get is-active))
    )
)
```

### Variables in Let Bindings

Variables can be used in `let` expressions for temporary local values:

```lisp
(define-public (calculate-total (quantity uint) (price uint))
    (let
        (
            (subtotal (* quantity price))
            (tax (* subtotal u10))  ;; 10% tax
            (total (+ subtotal (/ tax u100)))
        )
        (ok total)
    )
)
```

### Important Variable Rules

1. **Top-level only**: `define-data-var` must be at the contract's top level
2. **Not in read-only functions**: Cannot use `var-set` in read-only functions
3. **Single value**: Each variable stores exactly one value
4. **Type safety**: Value must match the declared type
5. **Gas costs**: Reading is cheap, writing costs gas

## Maps (`define-map`)

Maps are key-value storage structures that allow you to store multiple entries indexed by keys.

### Basic Syntax

```lisp
(define-map map-name key-type value-type)
```

### Simple Maps

```lisp
;; Map principal to uint (balances)
(define-map balances principal uint)

;; Map uint to string (names by ID)
(define-map names uint (string-ascii 50))

;; Map string to principal (usernames to addresses)
(define-map usernames (string-ascii 20) principal)
```

### Maps with Tuple Keys

```lisp
;; Map with composite key
(define-map allowances
    {owner: principal, spender: principal}
    uint
)

;; Map with tuple key and tuple value
(define-map orders
    {order-id: uint}
    {maker: principal, amount: uint, filled: bool}
)
```

### Map Operations

#### Setting Values with `map-set`

`map-set` inserts or updates an entry (overwrites if exists):

```lisp
(define-map balances principal uint)

;; Set a balance
(map-set balances tx-sender u1000)

;; Update an existing balance (overwrites)
(map-set balances tx-sender u2000)  ;; Now u2000, not u3000
```

#### Inserting with `map-insert`

`map-insert` only inserts if the key doesn't exist (returns true/false):

```lisp
(define-map scores principal uint)

;; Insert succeeds (returns true)
(map-insert scores tx-sender u100)

;; Insert fails - key exists (returns false)
(map-insert scores tx-sender u200)  ;; Does nothing

;; Value is still u100
(map-get? scores tx-sender)  ;; Returns (some u100)
```

#### Getting Values with `map-get?`

`map-get?` returns an optional - `(some value)` if exists, `none` if not:

```lisp
(define-map balances principal uint)

(map-set balances tx-sender u500)

;; Get existing value
(map-get? balances tx-sender)  ;; Returns (some u500)

;; Get non-existent value
(map-get? balances 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE)  ;; Returns none
```

#### Using Default Values

Use `default-to` to provide a fallback for missing entries:

```lisp
(define-read-only (get-balance (account principal))
    (default-to u0 (map-get? balances account))
)

;; Returns u0 if account has no balance
(get-balance 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE)
```

#### Deleting Entries with `map-delete`

```lisp
(define-map temp-data principal uint)

;; Add data
(map-set temp-data tx-sender u100)

;; Delete data
(map-delete temp-data tx-sender)

;; Now returns none
(map-get? temp-data tx-sender)  ;; Returns none
```

### Complete Map Example

```lisp
;; Token balance system
(define-map balances principal uint)
(define-data-var total-supply uint u0)

(define-read-only (get-balance (account principal))
    (default-to u0 (map-get? balances account))
)

(define-read-only (get-total-supply)
    (var-get total-supply)
)

(define-public (transfer (amount uint) (recipient principal))
    (let
        (
            (sender-balance (get-balance tx-sender))
            (recipient-balance (get-balance recipient))
        )
        ;; Check sufficient balance
        (asserts! (>= sender-balance amount) (err u1))

        ;; Update balances
        (map-set balances tx-sender (- sender-balance amount))
        (map-set balances recipient (+ recipient-balance amount))

        (ok true)
    )
)

(define-public (mint (amount uint) (recipient principal))
    (let
        (
            (current-balance (get-balance recipient))
            (current-supply (var-get total-supply))
        )
        ;; Update balance and supply
        (map-set balances recipient (+ current-balance amount))
        (var-set total-supply (+ current-supply amount))

        (ok true)
    )
)
```

### Working with Tuple Values

```lisp
(define-map user-profiles
    principal
    {
        username: (string-ascii 20),
        created-at: uint,
        reputation: uint
    }
)

;; Set a profile
(map-set user-profiles tx-sender
    {
        username: "alice",
        created-at: block-height,
        reputation: u100
    }
)

;; Get specific field from tuple
(define-read-only (get-username (user principal))
    (match (map-get? user-profiles user)
        profile (some (get username profile))
        none
    )
)

;; Update specific field using merge
(define-public (update-reputation (user principal) (new-rep uint))
    (match (map-get? user-profiles user)
        profile (begin
            (map-set user-profiles user
                (merge profile {reputation: new-rep})
            )
            (ok true)
        )
        (err u404)
    )
)
```
## Best Practices

### 1. Choose the Right Storage Type

```lisp
;; Use constants for immutable values (see constants.md)
(define-constant MAX-SUPPLY u1000000)

;; Use variables for single mutable values
(define-data-var total-minted uint u0)

;; Use maps for multiple entries
(define-map balances principal uint)
```

**When to use:**
- **Variables**: For single mutable values (counters, flags, totals)
- **Maps**: For collections of data indexed by keys (balances, user profiles, records)

### 2. Provide Default Values for Maps

```lisp
;; Always handle missing map entries
(define-read-only (get-balance (account principal))
    (default-to u0 (map-get? balances account))
)
```

### 3. Use Meaningful Names

```lisp
;; Good
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-data-var total-supply uint u0)
(define-map user-balances principal uint)

;; Bad
(define-constant E1 (err u100))
(define-data-var ts uint u0)
(define-map ub principal uint)
```

### 4. Group Related Storage

```lisp
;; Group constants by purpose
;; Error codes
(define-constant ERR-NOT-FOUND (err u100))
(define-constant ERR-UNAUTHORIZED (err u101))

;; Configuration
(define-constant MAX-SUPPLY u1000000)
(define-constant FEE-RATE u250)

;; Group related maps
(define-map balances principal uint)
(define-map allowances {owner: principal, spender: principal} uint)
```

### 5. Use Tuples for Complex Data

```lisp
;; Instead of multiple maps
(define-map user-profiles
    principal
    {
        name: (string-ascii 50),
        created-at: uint,
        reputation: uint,
        active: bool
    }
)
```

### 6. Safe Updates

```lisp
;; Always check before updating
(define-public (safe-update (amount uint))
    (let
        ((current (var-get counter)))
        (asserts! (> amount u0) (err u1))
        (var-set counter (+ current amount))
        (ok true)
    )
)
```

## Common Patterns

### Access Control with Constants

```lisp
(define-constant CONTRACT-OWNER tx-sender)

(define-public (admin-function)
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        ;; Admin logic here
        (ok true)
    )
)
```

### Counter Pattern with Variables

```lisp
(define-data-var next-id uint u0)

(define-public (generate-id)
    (let
        ((current-id (var-get next-id)))
        (var-set next-id (+ current-id u1))
        (ok current-id)
    )
)
```

### Balance Tracking with Maps

```lisp
(define-map balances principal uint)

(define-public (transfer (amount uint) (recipient principal))
    (let
        (
            (sender-bal (default-to u0 (map-get? balances tx-sender)))
            (recipient-bal (default-to u0 (map-get? balances recipient)))
        )
        (asserts! (>= sender-bal amount) (err u1))
        (map-set balances tx-sender (- sender-bal amount))
        (map-set balances recipient (+ recipient-bal amount))
        (ok true)
    )
)
```

## Variables vs Maps Comparison

| Feature | Variables | Maps |
|---------|-----------|------|
| **Purpose** | Single mutable value | Multiple key-value pairs |
| **Entries** | One value | Many entries |
| **Read** | `var-get` | `map-get?` |
| **Write** | `var-set` | `map-set`, `map-insert` |
| **Delete** | N/A (set to default) | `map-delete` |
| **Returns** | Direct value | Optional (`some` or `none`) |
| **Use case** | Counters, flags, totals | Balances, profiles, records |
