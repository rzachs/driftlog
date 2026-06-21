// spec: specs/business-rules/settlement-calculation.md
import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { calculateSettlementsFromBalances } = require('../calc.js');

describe('calculateSettlementsFromBalances', () => {

  it('simple 2-person trip: debtor pays creditor the full shared amount [row 1]', () => {
    // spec row 1: "Alice paid $100, Bob's share $50 → Bob pays Alice $50"
    const balances = [
      { id: 'alice', name: 'Alice', balance:  50 },
      { id: 'bob',   name: 'Bob',   balance: -50 },
    ];
    const payments = calculateSettlementsFromBalances(balances);
    expect(payments).toHaveLength(1);
    expect(payments[0].from.id).toBe('bob');
    expect(payments[0].to.id).toBe('alice');
    expect(payments[0].amount).toBe(50);
  });

  it('near-zero balances are ignored and generate no payment [row 2]', () => {
    // spec row 2: "Balance of $0.004 or −$0.004 → Treated as settled, no payment generated"
    const balances = [
      { id: 'alice', name: 'Alice', balance:  0.004 },
      { id: 'bob',   name: 'Bob',   balance: -0.004 },
    ];
    const payments = calculateSettlementsFromBalances(balances);
    expect(payments).toHaveLength(0);
  });

  it('greedy match: largest creditor meets largest debtor first → fewest payments [row 3]', () => {
    // spec row 3: "Multiple creditors and debtors → Fewest possible payments"
    // Alice +$60, Bob +$40, Carol −$60, Dave −$40
    // Greedy pairs each creditor with their exact match → 2 payments (minimum for 2C/2D)
    const balances = [
      { id: 'alice', name: 'Alice', balance:  60 },
      { id: 'bob',   name: 'Bob',   balance:  40 },
      { id: 'carol', name: 'Carol', balance: -60 },
      { id: 'dave',  name: 'Dave',  balance: -40 },
    ];
    const payments = calculateSettlementsFromBalances(balances);
    expect(payments).toHaveLength(2);
    expect(payments.find(p => p.from.id === 'carol' && p.to.id === 'alice')?.amount).toBe(60);
    expect(payments.find(p => p.from.id === 'dave'  && p.to.id === 'bob'  )?.amount).toBe(40);
  });

  it('partial settlement: debtor owes less than creditor is owed [row 4]', () => {
    // spec row 4: "Creditor owed $80, debtor owes $30 → One payment of $30; creditor still owed $50"
    const balances = [
      { id: 'alice', name: 'Alice', balance:  80 },
      { id: 'bob',   name: 'Bob',   balance: -30 },
    ];
    const payments = calculateSettlementsFromBalances(balances);
    expect(payments).toHaveLength(1);
    expect(payments[0].from.id).toBe('bob');
    expect(payments[0].to.id).toBe('alice');
    expect(payments[0].amount).toBe(30);
  });

  it('partial settlement: creditor is owed less than debtor owes [row 5]', () => {
    // spec row 5: "Creditor owed $30, debtor owes $80 → One payment of $30; debtor still owes $50"
    const balances = [
      { id: 'alice', name: 'Alice', balance:  30 },
      { id: 'bob',   name: 'Bob',   balance: -80 },
    ];
    const payments = calculateSettlementsFromBalances(balances);
    expect(payments).toHaveLength(1);
    expect(payments[0].from.id).toBe('bob');
    expect(payments[0].to.id).toBe('alice');
    expect(payments[0].amount).toBe(30);
  });

  it('payment amounts rounded to 2 decimal places [row 6]', () => {
    // spec row 6: "Calculated payment $33.3333 → Payment = $33.33"
    // Pass raw non-2dp balances to directly exercise Math.round in the algorithm
    const balances = [
      { id: 'alice', name: 'Alice', balance:  100 / 3 },  // 33.333...
      { id: 'bob',   name: 'Bob',   balance: -100 / 3 },
    ];
    const payments = calculateSettlementsFromBalances(balances);
    expect(payments).toHaveLength(1);
    expect(payments[0].amount).toBe(33.33);
  });

});
