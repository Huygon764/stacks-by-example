---
title: Hello World
layout: default
---

## Overview

This tutorial walks you through creating a simple "Hello World" smart contract in Clarity, the smart contract language for Stacks. You'll learn the basics of Clarity syntax, how to define functions, and how to interact with your contract.

## What You'll Build

A simple smart contract with two functions:
- `hello-world`: Returns a greeting message
- `say-hello`: Takes a name parameter and returns a personalized greeting

## Prerequisites

Before you begin, ensure you have:
- [Clarinet](https://github.com/hirosystems/clarinet) installed (Clarity development tool)
- Basic understanding of smart contracts
- A code editor (VS Code recommended with Clarity extension)

## Installation

Install Clarinet if you haven't already:

```bash
brew install clarinet
```

## Project Setup

Create a new Clarinet project:

```bash
clarinet new hello-world-project
cd hello-world-project
```

Create a new contract:

```bash
clarinet contract new hello-world
```

This creates:
- `contracts/hello-world.clar` - Your contract file
- `tests/hello-world.test.ts` - Test file
- Updates `Clarinet.toml` with your contract configuration

## The Contract

Open `contracts/hello-world.clar` and add the following code:

```lisp
;; Hello World Smart Contract
;; A simple contract demonstrating basic Clarity syntax

;; Public function that returns a greeting
(define-public (hello-world)
    (ok "Hello World!")
)

;; Public function that takes a name and returns a personalized greeting
(define-public (say-hello (name (string-ascii 50)))
    (ok (concat "Hello, " (concat name "!")))
)

;; Read-only function to get a greeting without modifying state
(define-read-only (get-greeting)
    "Hello from the Stacks blockchain!"
)

;; Private helper function (only callable within this contract)
(define-private (create-greeting (prefix (string-ascii 20)) (name (string-ascii 50)))
    (concat prefix (concat " " name))
)

;; Public function using the private helper
(define-public (custom-greeting (prefix (string-ascii 20)) (name (string-ascii 50)))
    (ok (create-greeting prefix name))
)
```

## Understanding the Code

### Function Types

Clarity has three types of functions:

#### 1. Public Functions (`define-public`)

```lisp
(define-public (hello-world)
    (ok "Hello World!")
)
```

- Can be called by users or other contracts
- Can modify contract state
- Must return a `response` type: `(ok value)` or `(err value)`
- Costs transaction fees to execute

#### 2. Read-Only Functions (`define-read-only`)

```lisp
(define-read-only (get-greeting)
    "Hello from the Stacks blockchain!"
)
```

- Cannot modify contract state
- Free to call (no transaction fees)
- Returns values directly (no `response` wrapper needed)
- Useful for querying contract data

#### 3. Private Functions (`define-private`)

```lisp
(define-private (create-greeting (prefix (string-ascii 20)) (name (string-ascii 50)))
    (concat prefix (concat " " name))
)
```

- Only callable within the contract itself
- Cannot be invoked externally
- Used for internal logic and code organization

### Response Types

Public functions must return a `response` type:
- `(ok value)` - Success with a value
- `(err value)` - Error with an error value

### String Types

Clarity supports two string types:
- `string-ascii` - ASCII strings with defined max length
- `string-utf8` - UTF-8 strings with defined max length

Example: `(string-ascii 50)` means an ASCII string up to 50 characters.

## Testing Your Contract

Clarinet provides an interactive console for testing. Start it with:

```bash
clarinet console
```

Once in the console, try these commands:

```lisp
;; Call the hello-world function
(contract-call? .hello-world hello-world)
;; Returns: (ok "Hello World!")

;; Call say-hello with your name
(contract-call? .hello-world say-hello "Alice")
;; Returns: (ok "Hello, Alice!")

;; Call the read-only function
(contract-call? .hello-world get-greeting)
;; Returns: "Hello from the Stacks blockchain!"

;; Call custom-greeting
(contract-call? .hello-world custom-greeting "Welcome" "Bob")
;; Returns: (ok "Welcome Bob")
```

## Writing Unit Tests

Edit `tests/hello-world.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;

describe("hello-world contract tests", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("hello-world returns the correct greeting", () => {
    const { result } = simnet.callPublicFn(
      "hello-world",
      "hello-world",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.stringAscii("Hello World!"));
  });

  it("say-hello returns personalized greeting", () => {
    const { result } = simnet.callPublicFn(
      "hello-world",
      "say-hello",
      [Cl.stringAscii("Alice")],
      deployer
    );
    expect(result).toBeOk(Cl.stringAscii("Hello, Alice!"));
  });

  it("say-hello works with different names", () => {
    const { result } = simnet.callPublicFn(
      "hello-world",
      "say-hello",
      [Cl.stringAscii("Bob")],
      address1
    );
    expect(result).toBeOk(Cl.stringAscii("Hello, Bob!"));
  });

  it("get-greeting returns read-only greeting", () => {
    const { result } = simnet.callReadOnlyFn(
      "hello-world",
      "get-greeting",
      [],
      deployer
    );
    expect(result).toBeAscii("Hello from the Stacks blockchain!");
  });

  it("custom-greeting creates correct message", () => {
    const { result } = simnet.callPublicFn(
      "hello-world",
      "custom-greeting",
      [Cl.stringAscii("Welcome"), Cl.stringAscii("Bob")],
      deployer
    );
    expect(result).toBeOk(Cl.stringAscii("Welcome Bob"));
  });

  it("custom-greeting works with different prefixes", () => {
    const { result } = simnet.callPublicFn(
      "hello-world",
      "custom-greeting",
      [Cl.stringAscii("Greetings"), Cl.stringAscii("Alice")],
      address1
    );
    expect(result).toBeOk(Cl.stringAscii("Greetings Alice"));
  });
});
```

Install dependencies and run the tests:

```bash
npm install
npm test
```

## Key Clarity Concepts

### 1. Polish Notation (Prefix Notation)

Clarity uses prefix notation where the operator comes first:

```lisp
(+ 4 5)           ;; Returns 9
(* 3 (+ 2 1))     ;; Returns 9 (3 * (2 + 1))
(concat "Hello" " World")  ;; Returns "Hello World"
```

### 2. Immutability

Values in Clarity are immutable by default. To maintain state, use:
- `define-data-var` - Mutable variables
- `define-map` - Key-value storage
- `define-non-fungible-token` - NFTs
- `define-fungible-token` - Fungible tokens

### 3. Decidability

Clarity is "decidable" - you can know what a program will do before executing it. This is achieved through:
- No recursion (use `map`, `fold`, `filter` instead)
- All loops have fixed bounds
- No unbounded operations

## Deployment

### Deploy to Testnet

1. Check your contract:
```bash
clarinet check
```

2. Generate deployment plan:
```bash
clarinet deployment generate --testnet
```

3. Deploy using Clarinet or the [Stacks Explorer](https://explorer.stacks.co/):
```bash
clarinet deployment apply --testnet
```

### Deploy to Mainnet

Follow the same steps but use `--mainnet` flag:

```bash
clarinet deployment generate --mainnet
clarinet deployment apply --mainnet
```
