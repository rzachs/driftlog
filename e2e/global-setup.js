const fs = require('fs');
const path = require('path');

module.exports = async function globalSetup() {
  const resolved = path.resolve('driftlog-test.db');
  for (const suffix of ['', '-shm', '-wal']) {
    const file = resolved + suffix;
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
      } catch (e) {
        if (e.code === 'EBUSY') {
          throw new Error(
            `Cannot delete ${file} — it is locked by a running server.\n` +
            `Run: Stop-Process -Name node -Force   (PowerShell)\n` +
            `Then retry the test.`
          );
        }
        throw e;
      }
    }
  }
};
