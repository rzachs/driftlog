// Pure business-logic functions — no database I/O.
// db.js fetches the rows and calls these; tests call these directly with plain arrays.

// members:     [{ id, ...}]
// expenses:    [{ id, amount, paid_by_id, splits: [{ person_id, amount }] }]
// settlements: [{ from_person_id, to_person_id, amount }]  (recorded only)
function calculateBalancesFromData(members, expenses, settlements = []) {
  const bal = {};
  members.forEach(m => { bal[m.id] = 0; });

  expenses.forEach(exp => {
    bal[exp.paid_by_id] = (bal[exp.paid_by_id] || 0) + exp.amount;
    exp.splits.forEach(s => {
      bal[s.person_id] = (bal[s.person_id] || 0) - s.amount;
    });
  });

  // spec row 10: recorded settlement offsets both parties' balances
  settlements.forEach(s => {
    bal[s.from_person_id] = (bal[s.from_person_id] || 0) + s.amount;
    bal[s.to_person_id]   = (bal[s.to_person_id]   || 0) - s.amount;
  });

  return members.map(m => ({
    ...m,
    balance: Math.round((bal[m.id] || 0) * 100) / 100,
  }));
}

// balances: [{ id, name, balance }]
function calculateSettlementsFromBalances(balances) {
  const creditors = balances.filter(b => b.balance >  0.005).map(b => ({ ...b }));
  const debtors   = balances.filter(b => b.balance < -0.005).map(b => ({ ...b }));
  const payments  = [];

  while (creditors.length && debtors.length) {
    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => a.balance - b.balance);
    const c = creditors[0], d = debtors[0];
    const amount = Math.min(c.balance, -d.balance);
    payments.push({ from: d, to: c, amount: Math.round(amount * 100) / 100 });
    c.balance -= amount;
    d.balance += amount;
    if (Math.abs(c.balance) < 0.005) creditors.shift();
    if (Math.abs(d.balance) < 0.005) debtors.shift();
  }
  return payments;
}

module.exports = { calculateBalancesFromData, calculateSettlementsFromBalances };
