require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const { v4: uuidv4 } = require('uuid');
const { db, init, calculateBalances, calculateSettlements, upsertUser } = require('./db');
const { calculatePersonDetail } = require('./calc');

const app = express();
app.use(express.json());

// spec row 6: session middleware — 7-day expiry, httpOnly, sameSite=lax
app.use(session({
  store: new FileStore({ path: './sessions', ttl: 7 * 24 * 60 * 60, reapInterval: 3600 }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

app.use(express.static(path.join(__dirname, 'dist')));

init();

const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ── Auth ──────────────────────────────────────────────────────────────────

// spec row 7: return current user for frontend auth checks
app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  res.json(req.session.user);
});

// spec row 1: initiate Google OAuth
app.get('/auth/google', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'email profile',
    response_type: 'code',
    state,
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// spec rows 2–5, 8–10: handle OAuth callback
app.get('/auth/google/callback', async (req, res) => {
  // spec row 3: Google returned an error
  if (req.query.error) return res.redirect('/login?error=oauth_failed');

  // spec row 2: state mismatch (CSRF check)
  if (!req.query.state || req.query.state !== req.session.oauthState) {
    return res.redirect('/login?error=csrf');
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: req.query.code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.id_token) return res.redirect('/login?error=oauth_failed');

    const payload = JSON.parse(
      Buffer.from(tokenData.id_token.split('.')[1], 'base64url').toString()
    );
    const { sub, email, name } = payload;
    if (!sub || !email) return res.redirect('/login?error=oauth_failed');

    // spec rows 4–5: upsert user (insert on first login, update on return)
    const user = upsertUser(sub, email, name || email);

    // spec row 6: establish session — save explicitly before redirect so the
    // file store flushes to disk before the browser follows the redirect
    req.session.userId = user.id;
    req.session.user = { displayName: user.display_name, email: user.email };

    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('/login?error=server_error');
      }
      res.redirect('/trips');
    });
  } catch (e) {
    // spec row 8: DB or network error
    console.error('OAuth callback error:', e);
    res.redirect('/login?error=server_error');
  }
});

// Test-only: establishes a session without going through Google OAuth.
// Gated on SKIP_SEED so this route is never reachable in production.
if (process.env.SKIP_SEED === 'true') {
  app.get('/auth/test-login', (req, res) => {
    const { sub, name, email } = req.query;
    if (!sub) return res.status(400).json({ error: 'sub required' });
    const user = upsertUser(sub, email || `${sub}@test.example`, name || sub);
    req.session.userId = user.id;
    req.session.user = { displayName: user.display_name, email: user.email };
    req.session.save(err => {
      if (err) return res.status(500).json({ error: 'session save failed' });
      res.redirect('/trips');
    });
  });
}

// ── Trips ─────────────────────────────────────────────────────────────────

// spec rows 11–12: return only the logged-in user's trips; use their display_name for myBalance
app.get('/api/trips', requireAuth, (req, res) => {
  const trips = db.prepare(
    'SELECT * FROM trips WHERE created_by = ? ORDER BY created_at DESC'
  ).all(req.session.userId);

  const result = trips.map(trip => {
    const members  = db.prepare('SELECT * FROM trip_members WHERE trip_id = ?').all(trip.id);
    const expenses = db.prepare('SELECT * FROM expenses WHERE trip_id = ?').all(trip.id);
    const balances = calculateBalances(trip.id);
    const myBal    = balances.find(b => b.name === req.session.user.displayName);
    return { ...trip, members, expenseCount: expenses.length, myBalance: myBal?.balance ?? 0 };
  });
  res.json(result);
});

// spec rows 11–12: set created_by; use display_name as the "you" member
app.post('/api/trips', requireAuth, (req, res) => {
  const { name, startDate, endDate, people = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  const id = uuidv4();
  db.prepare('INSERT INTO trips VALUES (?,?,?,?,?,?)').run(
    id, name.trim(), startDate || null, endDate || null, new Date().toISOString(), req.session.userId
  );
  const displayName = req.session.user.displayName;
  const allPeople = [displayName, ...people.filter(p => p !== displayName)];
  allPeople.forEach(name => {
    db.prepare('INSERT INTO trip_members VALUES (?,?,?)').run(uuidv4(), id, name.trim());
  });
  res.status(201).json({ id });
});

app.get('/api/trips/:id', requireAuth, (req, res) => {
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

app.patch('/api/trips/:id', requireAuth, (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const result = db.prepare('UPDATE trips SET name = ? WHERE id = ?').run(name.trim(), req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

app.delete('/api/trips/:id', requireAuth, (req, res) => {
  const result = db.prepare('DELETE FROM trips WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ── Expenses ──────────────────────────────────────────────────────────────

app.post('/api/trips/:id/expenses', requireAuth, (req, res) => {
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

app.get('/api/trips/:tripId/members/:memberId/detail', requireAuth, (req, res) => {
  const { tripId, memberId } = req.params;
  const member = db.prepare(
    'SELECT * FROM trip_members WHERE id = ? AND trip_id = ?'
  ).get(memberId, tripId);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  const expenses = db.prepare(
    'SELECT * FROM expenses WHERE trip_id = ? ORDER BY date DESC, created_at DESC'
  ).all(tripId).map(exp => ({
    ...exp,
    payer:  db.prepare('SELECT * FROM trip_members WHERE id = ?').get(exp.paid_by_id),
    splits: db.prepare('SELECT * FROM expense_splits WHERE expense_id = ?').all(exp.id),
  }));

  const { rows, totalPaid, totalShare, netBalance } = calculatePersonDetail(memberId, expenses);
  res.json({ member, rows, totalPaid, totalShare, netBalance });
});

// ── Settlements ───────────────────────────────────────────────────────────

app.get('/api/trips/:id/settle', requireAuth, (req, res) => {
  const trip = db.prepare('SELECT id FROM trips WHERE id = ?').get(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Not found' });

  const payments = calculateSettlements(req.params.id);
  res.json(payments.map(p => ({ id: null, from: p.from, to: p.to, amount: p.amount, recorded: false })));
});

app.post('/api/trips/:id/settle', requireAuth, (req, res) => {
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

app.delete('/api/trips/:tripId/settle/:recordId', requireAuth, (req, res) => {
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
