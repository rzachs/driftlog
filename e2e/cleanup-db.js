const fs = require('fs');
const path = require('path');

const resolved = path.resolve('driftlog-test.db');
for (const suffix of ['', '-shm', '-wal']) {
  const file = resolved + suffix;
  try { fs.unlinkSync(file); } catch (e) { if (e.code !== 'ENOENT') throw e; }
}
console.log('[cleanup-db] Test DB cleared');
