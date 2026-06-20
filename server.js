const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { db, init, calculateBalances, calculateSettlements } = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

init();

// ── Trips ─────────────────────────────────────────────────────────────────

app.get('/api/trips', (req, res) => {
  const trips = db.prepare(
    'SELECT * FROM trips ORDER BY created_at DESC'
  ).all();

  const result = trips.map(trip => {
    const members  = db.prepare('SELECT * FROM trip_members WHERE trip_id = ?').all(trip.id);
    const expenses = db.prepare('SELECT * FROM expenses WHERE trip_id = ?').all(trip.id);
    const balances = calculateBalances(trip.id);
    const myBal    = balances.find(b => b.name === 'You');
    return { ...trip, members, expenseCount: expenses.length, myBalance: myBal?.balance ?? 0 };
  });
  res.json(result);
});

app.post('/api/trips', (req, res) => {
  const { name, startDate, endDate, people = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  const id = uuidv4();
  db.prepare('INSERT INTO trips VALUES (?,?,?,?,?)').run(
    id, name.trim(), startDate || null, endDate || null, new Date().toISOString()
  );
  const allPeople = ['You', ...people.filter(p => p !== 'You')];
  allPeople.forEach(name => {
    db.prepare('INSERT INTO trip_members VALUES (?,?,?)').run(uuidv4(), id, name.trim());
  });
  res.status(201).json({ id });
});

app.get('/api/trips/:id', (req, res) => {
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Not found' });

  const members  = db.prepare('SELECT * FROM trip_members WHERE trip_id = ?').all(trip.id);
  const balances = calculateBalances(trip.id);
  const expenses = db.prepare(
    'SELECT * FROM expenses WHERE trip_id = ? ORDER BY date DESC, created_at DESC'
  ).all(trip.id);

  const expenseDetails = expenses.map(exp => {
    const payer  = db.prepare('SELECT * FROM trip_members WHERE id = ?').get(exp.paid_by_id);
    const splits = db.prepare(
      `SELECT es.*, tm.name AS person_name
       FROM expense_splits es
       JOIN trip_members tm ON es.person_id = tm.id
       WHERE es.expense_id = ?`
    ).all(exp.id);
    return { ...exp, payer, splits };
  });

  res.json({ ...trip, members, balances, expenses: expenseDetails });
});

// ── Expenses ──────────────────────────────────────────────────────────────

app.post('/api/trips/:id/expenses', (req, res) => {
  const trip = db.prepare('SELECT id FROM trips WHERE id = ?').get(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const { description, amount, paidById, date, splits } = req.body;
  if (!description || !amount || !paidById || !date || !splits?.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const expId = uuidv4();
  db.prepare('INSERT INTO expenses VALUES (?,?,?,?,?,?,?)').run(
    expId, req.params.id, description, parseFloat(amount), paidById, date, new Date().toISOString()
  );
  splits.forEach(s => {
    db.prepare('INSERT INTO expense_splits VALUES (?,?,?,?)').run(
      uuidv4(), expId, s.personId, parseFloat(s.amount)
    );
  });
  res.status(201).json({ id: expId });
});

// ── Person detail ─────────────────────────────────────────────────────────

app.get('/api/trips/:tripId/members/:memberId/detail', (req, res) => {
  const { tripId, memberId } = req.params;
  const member = db.prepare(
    'SELECT * FROM trip_members WHERE id = ? AND trip_id = ?'
  ).get(memberId, tripId);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  const expenses = db.prepare(
    'SELECT * FROM expenses WHERE trip_id = ? ORDER BY date DESC, created_at DESC'
  ).all(tripId);

  const rows = expenses.map(exp => {
    const split = db.prepare(
      'SELECT * FROM expense_splits WHERE expense_id = ? AND person_id = ?'
    ).get(exp.id, memberId);
    if (!split) return null;

    const payer     = db.prepare('SELECT * FROM trip_members WHERE id = ?').get(exp.paid_by_id);
    const allSplits = db.prepare('SELECT * FROM expense_splits WHERE expense_id = ?').all(exp.id);
    const isPayer   = exp.paid_by_id === memberId;
    const net       = Math.round(((isPayer ? exp.amount : 0) - split.amount) * 100) / 100;
    return { expense: exp, payer, split, net, isPayer, ways: allSplits.length };
  }).filter(Boolean);

  const totalPaid  = rows.filter(r => r.isPayer).reduce((s, r) => s + r.expense.amount, 0);
  const totalShare = rows.reduce((s, r) => s + r.split.amount, 0);
  const netBalance = Math.round((totalPaid - totalShare) * 100) / 100;

  res.json({ member, rows, totalPaid, totalShare, netBalance });
});

// ── Settlements ───────────────────────────────────────────────────────────

app.get('/api/trips/:id/settle', (req, res) => {
  const trip = db.prepare('SELECT id FROM trips WHERE id = ?').get(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Not found' });

  const payments = calculateSettlements(req.params.id);
  const records  = db.prepare(
    'SELECT * FROM settlement_records WHERE trip_id = ?'
  ).all(req.params.id);

  const result = payments.map(p => {
    const record = records.find(r =>
      r.from_person_id === p.from.id &&
      r.to_person_id   === p.to.id &&
      Math.abs(r.amount - p.amount) < 0.005
    );
    return {
      id:       record?.id ?? null,
      from:     p.from,
      to:       p.to,
      amount:   p.amount,
      recorded: record ? !!record.recorded_at : false,
    };
  });
  res.json(result);
});

app.post('/api/trips/:id/settle', (req, res) => {
  const { fromPersonId, toPersonId, amount } = req.body;
  if (!fromPersonId || !toPersonId || !amount) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const existing = db.prepare(
    `SELECT * FROM settlement_records
     WHERE trip_id = ? AND from_person_id = ? AND to_person_id = ?
       AND ABS(amount - ?) < 0.005`
  ).get(req.params.id, fromPersonId, toPersonId, parseFloat(amount));

  if (existing) {
    db.prepare('UPDATE settlement_records SET recorded_at = ? WHERE id = ?').run(
      new Date().toISOString(), existing.id
    );
    return res.json({ id: existing.id });
  }

  const id = uuidv4();
  db.prepare('INSERT INTO settlement_records VALUES (?,?,?,?,?,?)').run(
    id, req.params.id, fromPersonId, toPersonId, parseFloat(amount), new Date().toISOString()
  );
  res.status(201).json({ id });
});

app.delete('/api/trips/:tripId/settle/:recordId', (req, res) => {
  db.prepare(
    'UPDATE settlement_records SET recorded_at = NULL WHERE id = ? AND trip_id = ?'
  ).run(req.params.recordId, req.params.tripId);
  res.json({ ok: true });
});

// ── SPA fallback ──────────────────────────────────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Driftlog running at http://localhost:${PORT}`);
});
