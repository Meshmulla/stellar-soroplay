/**
 * Example Soroban contracts for learning
 */

export interface ContractExample {
  id: string
  title: string
  description: string
  code: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export const CONTRACT_EXAMPLES: ContractExample[] = [
  {
    id: 'hello-world',
    title: 'Hello World',
    description: 'The simplest contract - returns a greeting built from Symbols',
    difficulty: 'beginner',
    code: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec};

#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    /// Returns ["Hello", <to>] as a vector of symbols.
    pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
        vec![&env, symbol_short!("Hello"), to]
    }
}`,
  },
  {
    id: 'counter',
    title: 'Counter Contract',
    description: 'A contract that maintains a counter state and allows incrementing',
    difficulty: 'beginner',
    code: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

const COUNTER: Symbol = symbol_short!("COUNTER");

#[contract]
pub struct IncrementContract;

#[contractimpl]
impl IncrementContract {
    /// Increment the persistent counter and return the new value.
    pub fn increment(env: Env) -> u32 {
        let mut count: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&COUNTER, &count);
        // Keep the contract's instance storage alive.
        env.storage().instance().extend_ttl(50, 100);
        count
    }

    /// Return the current counter value.
    pub fn get_count(env: Env) -> u32 {
        env.storage().instance().get(&COUNTER).unwrap_or(0)
    }
}`,
  },
  {
    id: 'token-transfer',
    title: 'Token Transfer',
    description: 'Basic token transfer contract demonstrating ledger operations',
    difficulty: 'intermediate',
    code: `#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
    /// Transfer \`amount\` from \`from\` to \`to\`. Requires \`from\`'s auth.
    /// Balances are keyed per-Address in persistent storage.
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) -> bool {
        from.require_auth();

        let from_balance = Self::balance(env.clone(), from.clone());
        if from_balance < amount {
            return false;
        }
        let to_balance = Self::balance(env.clone(), to.clone());

        env.storage().persistent().set(&from, &(from_balance - amount));
        env.storage().persistent().set(&to, &(to_balance + amount));
        true
    }

    /// Read the stored balance for \`who\` (0 if never set).
    pub fn balance(env: Env, who: Address) -> i128 {
        env.storage().persistent().get(&who).unwrap_or(0)
    }
}`,
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci Generator',
    description: 'Calculate Fibonacci numbers with memoization',
    difficulty: 'intermediate',
    code: `#[soroban_contract]
pub mod fibonacci {
    use soroban_sdk::{contract, contractimpl, Env, Symbol};

    #[contract]
    pub struct Fibonacci;

    #[contractimpl]
    impl Fibonacci {
        /// Calculate fibonacci number at position n
        pub fn fib(env: Env, n: u32) -> u64 {
            let key = Symbol::short("fib");
            
            if n <= 1 {
                return n as u64;
            }
            
            let mut a = 0u64;
            let mut b = 1u64;
            
            for _ in 2..=n {
                let next = a + b;
                a = b;
                b = next;
            }
            
            b
        }

        /// Get fibonacci sequence up to n
        pub fn sequence(env: Env, count: u32) -> u64 {
            let mut sum = 0u64;
            for i in 0..count {
                sum += Self::fib(env, i);
            }
            sum
        }
    }
}`,
  },
]

export function getExampleById(id: string): ContractExample | undefined {
  return CONTRACT_EXAMPLES.find((ex) => ex.id === id)
}

export function getExamplesByDifficulty(difficulty: string): ContractExample[] {
  return CONTRACT_EXAMPLES.filter((ex) => ex.difficulty === difficulty)
}
