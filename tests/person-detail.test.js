// spec: specs/business-rules/person-detail.md
import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { calculatePersonDetail } = require('../calc.js');

const ALICE = { id: 'alice', name: 'Alice' };
const BOB   = { id: 'bob',   name: 'Bob'   };

function expense({ id, amount, paidBy, payer, splits }) {
  return { id, description: 'Test', date: '2026-01-01', amount, paid_by_id: paidBy, payer, splits };
}

describe('calculatePersonDetail', () => {

  it('excludes expenses where the member has no split row [row 1]', () => {
    // spec row 1: "Member has no split on an expense → That expense is excluded from the breakdown"
    const expenses = [
      expense({ id: 'e1', amount: 120, paidBy: 'alice', payer: ALICE, splits: [{ person_id: 'alice', amount: 60 }, { person_id: 'bob', amount: 60 }] }),
      expense({ id: 'e2', amount: 80,  paidBy: 'alice', payer: ALICE, splits: [{ person_id: 'alice', amount: 80 }] }),
    ];
    const { rows } = calculatePersonDetail('bob', expenses);
    expect(rows).toHaveLength(1);
    expect(rows[0].expense.id).toBe('e1');
  });

  it('net per expense for payer = amount paid minus split share [row 2]', () => {
    // spec row 2: "Member paid €120, their share €30 → Net = +€90"
    const expenses = [
      expense({ id: 'e1', amount: 120, paidBy: 'alice', payer: ALICE, splits: [{ person_id: 'alice', amount: 30 }, { person_id: 'bob', amount: 90 }] }),
    ];
    const { rows } = calculatePersonDetail('alice', expenses);
    expect(rows[0].net).toBe(90);
  });

  it('net per expense for non-payer = negative of split share [row 3]', () => {
    // spec row 3: "Member did not pay, share €30 → Net = −€30"
    const expenses = [
      expense({ id: 'e1', amount: 120, paidBy: 'alice', payer: ALICE, splits: [{ person_id: 'alice', amount: 90 }, { person_id: 'bob', amount: 30 }] }),
    ];
    const { rows } = calculatePersonDetail('bob', expenses);
    expect(rows[0].net).toBe(-30);
  });

  it('totalPaid = sum of expense amounts where member is payer [row 4]', () => {
    // spec row 4: "Member paid two expenses: €120 and €80 → Total paid = €200"
    const expenses = [
      expense({ id: 'e1', amount: 120, paidBy: 'alice', payer: ALICE, splits: [{ person_id: 'alice', amount: 60 }, { person_id: 'bob', amount: 60 }] }),
      expense({ id: 'e2', amount: 80,  paidBy: 'alice', payer: ALICE, splits: [{ person_id: 'alice', amount: 40 }, { person_id: 'bob', amount: 40 }] }),
    ];
    const { totalPaid } = calculatePersonDetail('alice', expenses);
    expect(totalPaid).toBe(200);
  });

  it('totalShare = sum of all split amounts for the member [row 5]', () => {
    // spec row 5: "Member has shares of €30, €20, €15 → Total share = €65"
    const expenses = [
      expense({ id: 'e1', amount: 60, paidBy: 'alice', payer: ALICE, splits: [{ person_id: 'alice', amount: 30 }, { person_id: 'bob', amount: 30 }] }),
      expense({ id: 'e2', amount: 40, paidBy: 'alice', payer: ALICE, splits: [{ person_id: 'alice', amount: 20 }, { person_id: 'bob', amount: 20 }] }),
      expense({ id: 'e3', amount: 30, paidBy: 'alice', payer: ALICE, splits: [{ person_id: 'alice', amount: 15 }, { person_id: 'bob', amount: 15 }] }),
    ];
    const { totalShare } = calculatePersonDetail('bob', expenses);
    expect(totalShare).toBe(65);
  });

  it('netBalance = totalPaid minus totalShare, rounded to 2 dp [row 6]', () => {
    // spec row 6: "totalPaid €200, totalShare €65 → Net balance = +€135.00"
    const expenses = [
      expense({ id: 'e1', amount: 120, paidBy: 'alice', payer: ALICE, splits: [{ person_id: 'alice', amount: 30 }, { person_id: 'bob', amount: 90 }] }),
      expense({ id: 'e2', amount: 80,  paidBy: 'alice', payer: ALICE, splits: [{ person_id: 'alice', amount: 35 }, { person_id: 'bob', amount: 45 }] }),
    ];
    // Alice totalPaid = 200, totalShare = 65, netBalance = 135.00
    const { totalPaid, totalShare, netBalance } = calculatePersonDetail('alice', expenses);
    expect(totalPaid).toBe(200);
    expect(totalShare).toBe(65);
    expect(netBalance).toBe(135);
  });

  // Rows 7 & 8 ("Settle up" CTA visibility) are UI rules in PersonDetail.jsx — not covered here

});
