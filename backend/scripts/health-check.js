require('dotenv').config();
const { dbHealthcheck } = require('../src/config/db');

(async () => {
  try {
    await dbHealthcheck();
    // eslint-disable-next-line no-console
    console.log('DB healthcheck: OK');
    process.exit(0);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('DB healthcheck: FAILED');
    // eslint-disable-next-line no-console
    console.error(e.message || e);
    process.exit(1);
  }
})();
