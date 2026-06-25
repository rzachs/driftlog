// spec: specs/business-rules/balance-calculation.md
import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { calculateBalancesFromData } = require('../server/calc.js');

describe('calculateBalancesFromData', () => {

  it('payer balance increases by the full expense amount [row 1]', () => {
    // spec row 1: "Expense $120, paid by Alice → Alice balance +$120"
    const members  = [{ id: 'alice', name: 'Alice' }];
    const expenses = [{ id: 'e1', amount: 120, paid_by_id: 'alice', splits: [] }];
    const result = calculateBalancesFromData(members, expenses);
    expect(result.find(b => b.id === 'alice').balance).toBe(120);
  });

  it('each participant balance decreases by their split amount [row 2]', () => {
    // spec row 2: "Expense split: Alice $40, Bob $40, Carol $40 → each balance −$40"
    const members  = [
      { id: 'alice', name: 'Alice' },
      { id: 'bob',   name: 'Bob'   },
      { id: 'carol', name: 'Carol' },
      { id: 'dave',  name: 'Dave'  },
    ];
    const expenses = [{
      id: 'e1', amount: 120, paid_by_id: 'dave',
      splits: [
        { person_id: 'alice', amount: 40 },
        { person_id: 'bob',   amount: 40 },
        { person_id: 'carol', amount: 40 },
      ],
    }];
    const result = calculateBalancesFromData(members, expenses);
    expect(result.find(b => b.id === 'alice').balance).toBe(-40);
    expect(result.find(b => b.id === 'bob').balance).toBe(-40);
    expect(result.find(b => b.id === 'carol').balance).toBe(-40);
  });

  it('payer who is also a participant nets out [row 3]', () => {
    // spec row 3: "Alice pays $120, split 3 ways $40 each → Alice net: +$80"
    const members  = [
      { id: 'alice', name: 'Alice' },
      { id: 'bob',   name: 'Bob'   },
      { id: 'carol', name: 'Carol' },
    ];
    const expenses = [{
      id: 'e1', amount: 120, paid_by_id: 'alice',
      splits: [
        { person_id: 'alice', amount: 40 },
        { person_id: 'bob',   amount: 40 },
        { person_id: 'carol', amount: 40 },
      ],
    }];
    const result = calculateBalancesFromData(members, expenses);
    expect(result.find(b => b.id === 'alice').balance).toBe(80);
  });

  it('non-payer participant balance is negative [row 4]', () => {
    // spec row 4: "Bob splits $40 on an expense he didn't pay → Bob net: −$40"
    const members  = [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }];
    const expenses = [{
      id: 'e1', amount: 120, paid_by_id: 'alice',
      splits: [
        { person_id: 'alice', amount: 80 },
        { person_id: 'bob',   amount: 40 },
      ],
    }];
    const result = calculateBalancesFromData(members, expenses);
    expect(result.find(b => b.id === 'bob').balance).toBe(-40);
  });

  it('member with no expenses has balance zero [row 5]', () => {
    // spec row 5: "Member has no payments, no splits → Balance = $0"
    const members  = [
      { id: 'alice', name: 'Alice' },
      { id: 'bob',   name: 'Bob'   },
      { id: 'carol', name: 'Carol' },
    ];
    const expenses = [{
      id: 'e1', amount: 80, paid_by_id: 'alice',
      splits: [
        { person_id: 'alice', amount: 40 },
        { person_id: 'bob',   amount: 40 },
      ],
    }];
    const result = calculateBalancesFromData(members, expenses);
    expect(result.find(b => b.id === 'carol').balance).toBe(0);
  });

  it('balance is rounded to 2 decimal places [row 6]', () => {
    // spec row 6: "Raw balance $10.336667 → Displayed as $10.34"
    // Alice pays $20.67, split portion $10.333333 → raw net = $10.336667
    const members  = [{ id: 'alice', name: 'Alice' }];
    const expenses = [{
      id: 'e1', amount: 20.67, paid_by_id: 'alice',
      splits: [{ person_id: 'alice', amount: 10.333333 }],
    }];
    const result = calculateBalancesFromData(members, expenses);
    expect(result.find(b => b.id === 'alice').balance).toBe(10.34);
  });

  it('positive balance means others owe you (creditor) [row 7]', () => {
    // spec row 7: "Balance +$80 → Person is a creditor"
    const members  = [
      { id: 'alice', name: 'Alice' },
      { id: 'bob',   name: 'Bob'   },
      { id: 'carol', name: 'Carol' },
    ];
    const expenses = [{
      id: 'e1', amount: 120, paid_by_id: 'alice',
      splits: [
        { person_id: 'alice', amount: 40 },
        { person_id: 'bob',   amount: 40 },
        { person_id: 'carol', amount: 40 },
      ],
    }];
    const result = calculateBalancesFromData(members, expenses);
    expect(result.find(b => b.id === 'alice').balance).toBeGreaterThan(0);
  });

  it('negative balance means you owe others (debtor) [row 8]', () => {
    // spec row 8: "Balance −$40 → Person is a debtor"
    const members  = [
      { id: 'alice', name: 'Alice' },
      { id: 'bob',   name: 'Bob'   },
      { id: 'carol', name: 'Carol' },
    ];
    const expenses = [{
      id: 'e1', amount: 120, paid_by_id: 'alice',
      splits: [
        { person_id: 'alice', amount: 40 },
        { person_id: 'bob',   amount: 40 },
        { person_id: 'carol', amount: 40 },
      ],
    }];
    const result = calculateBalancesFromData(members, expenses);
    expect(result.find(b => b.id === 'bob').balance).toBeLessThan(0);
  });

  it('recorded settlement offsets both parties balances [row 10]', () => {
    // spec row 10: "Settlement of $50 recorded: Bob paid Alice → Bob balance +$50; Alice balance −$50"
    const members  = [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }];
    const expenses = [{
      id: 'e1', amount: 100, paid_by_id: 'alice',
      splits: [{ person_id: 'alice', amount: 50 }, { person_id: 'bob', amount: 50 }],
    }];
    // Before settlement: Alice +50, Bob -50
    const before = calculateBalancesFromData(members, expenses);
    expect(before.find(b => b.id === 'alice').balance).toBe(50);
    expect(before.find(b => b.id === 'bob').balance).toBe(-50);

    // After Bob's recorded payment to Alice
    const settlements = [{ from_person_id: 'bob', to_person_id: 'alice', amount: 50 }];
    const after = calculateBalancesFromData(members, expenses, settlements);
    expect(after.find(b => b.id === 'alice').balance).toBe(0);
    expect(after.find(b => b.id === 'bob').balance).toBe(0);
  });

  it('zero balance means nothing to settle [row 9]', () => {
    // spec row 9: "Balance $0.00 → No payment required"
    const members  = [
      { id: 'alice', name: 'Alice' },
      { id: 'bob',   name: 'Bob'   },
      { id: 'carol', name: 'Carol' },
    ];
    const expenses = [{
      id: 'e1', amount: 80, paid_by_id: 'alice',
      splits: [
        { person_id: 'alice', amount: 40 },
        { person_id: 'bob',   amount: 40 },
      ],
    }];
    const result = calculateBalancesFromData(members, expenses);
    expect(result.find(b => b.id === 'carol').balance).toBe(0);
  });

});
