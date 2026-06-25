const { DatabaseSync } = require('node:sqlite');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { calculateBalancesFromData, calculateSettlementsFromBalances } = require('./calc');

const db = new DatabaseSync(path.resolve(process.env.DB_PATH || path.join(__dirname, 'driftlog.db')));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id           TEXT PRIMARY KEY,
      google_id    TEXT UNIQUE NOT NULL,
      email        TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at   TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trips (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      start_date TEXT,
      end_date   TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trip_members (
      id      TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      name    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id          TEXT PRIMARY KEY,
      trip_id     TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      amount      REAL NOT NULL,
      paid_by_id  TEXT NOT NULL REFERENCES trip_members(id),
      date        TEXT NOT NULL,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS expense_splits (
      id         TEXT PRIMARY KEY,
      expense_id TEXT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
      person_id  TEXT NOT NULL REFERENCES trip_members(id),
      amount     REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settlement_records (
      id             TEXT PRIMARY KEY,
      trip_id        TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      from_person_id TEXT NOT NULL REFERENCES trip_members(id),
      to_person_id   TEXT NOT NULL REFERENCES trip_members(id),
      amount         REAL NOT NULL,
      recorded_at    TEXT
    );
  `);

  // spec row 11: add created_by column to trips (migration — idempotent)
  const tripsColumns = db.prepare('PRAGMA table_info(trips)').all();
  if (!tripsColumns.some(c => c.name === 'created_by')) {
    db.exec('ALTER TABLE trips ADD COLUMN created_by TEXT REFERENCES users(id)');
  }

  const { c } = db.prepare('SELECT COUNT(*) AS c FROM trips').get();
  if (c === 0 && !process.env.SKIP_SEED) seed();
}

function seed() {
  const seedUserId = uuidv4();
  db.prepare('INSERT INTO users (id, google_id, email, display_name) VALUES (?,?,?,?)').run(
    seedUserId, 'seed-user', 'seed@driftlog.dev', 'You'
  );

  const tripId = uuidv4();
  db.prepare('INSERT INTO trips VALUES (?,?,?,?,?,?)').run(
    tripId, 'Lisbon long weekend', '2026-06-12', '2026-06-15',
    new Date('2026-06-10').toISOString(), seedUserId
  );

  const names = ['You', 'Maya', 'Sam', 'Theo'];
  const ids = {};
  names.forEach(name => {
    ids[name] = uuidv4();
    db.prepare('INSERT INTO trip_members VALUES (?,?,?)').run(ids[name], tripId, name);
  });

  // Also seed a second (past) trip so the list screen has variety
  const trip2Id = uuidv4();
  db.prepare('INSERT INTO trips VALUES (?,?,?,?,?,?)').run(
    trip2Id, 'NYE in Edinburgh', '2025-12-30', '2026-01-02',
    new Date('2025-12-28').toISOString(), seedUserId
  );
  const eNames = ['You', 'Maya', 'Sam', 'Lena', 'Rob', 'Kai'];
  eNames.forEach(name => {
    db.prepare('INSERT INTO trip_members VALUES (?,?,?)').run(uuidv4(), trip2Id, name);
  });

  function addExpense(tripId, desc, amount, paidBy, date, splitAmong) {
    const expId = uuidv4();
    db.prepare('INSERT INTO expenses VALUES (?,?,?,?,?,?,?)').run(
      expId, tripId, desc, amount, ids[paidBy], date, new Date().toISOString()
    );
    const share = amount / splitAmong.length;
    splitAmong.forEach(name => {
      db.prepare('INSERT INTO expense_splits VALUES (?,?,?,?)').run(
        uuidv4(), expId, ids[name], Math.round(share * 100) / 100
      );
    });
  }

  const all4 = ['You', 'Maya', 'Sam', 'Theo'];
  addExpense(tripId, 'Airbnb (3 nights)',       600, 'You',  '2026-06-12', all4);
  addExpense(tripId, 'Rental car',               240, 'Maya', '2026-06-12', all4);
  addExpense(tripId, 'Dinner at Time Out Market',164, 'You',  '2026-06-13', all4);
  addExpense(tripId, 'Groceries',                 88, 'Sam',  '2026-06-13', all4);
  addExpense(tripId, 'Train to Sintra',            36, 'Maya', '2026-06-13', all4);
  addExpense(tripId, 'Surf lessons',             120, 'Theo', '2026-06-14', ['You','Maya','Theo']);
  addExpense(tripId, 'Tarts & coffee',            24, 'Sam',  '2026-06-14', all4);
}

// ── Balance calculation ───────────────────────────────────────────────────

function calculateBalances(tripId) {
  const members  = db.prepare('SELECT * FROM trip_members WHERE trip_id = ?').all(tripId);
  const expenses = db.prepare('SELECT * FROM expenses WHERE trip_id = ?').all(tripId).map(exp => ({
    ...exp,
    splits: db.prepare('SELECT * FROM expense_splits WHERE expense_id = ?').all(exp.id),
  }));
  const settlements = db.prepare(
    'SELECT * FROM settlement_records WHERE trip_id = ? AND recorded_at IS NOT NULL'
  ).all(tripId);
  return calculateBalancesFromData(members, expenses, settlements);
}

// Greedy minimum-payments algorithm
function calculateSettlements(tripId) {
  return calculateSettlementsFromBalances(calculateBalances(tripId));
}

// spec rows 4–5: insert on first login, update profile on subsequent logins
function upsertUser(googleId, email, displayName) {
  db.prepare(
    'INSERT OR IGNORE INTO users (id, google_id, email, display_name) VALUES (?,?,?,?)'
  ).run(uuidv4(), googleId, email, displayName);
  db.prepare(
    'UPDATE users SET email = ?, display_name = ? WHERE google_id = ?'
  ).run(email, displayName, googleId);
  return db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
}

module.exports = { db, init, calculateBalances, calculateSettlements, upsertUser };
