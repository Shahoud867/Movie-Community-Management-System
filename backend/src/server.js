require('dotenv').config();
const app = require('./app');
const { dbHealthcheck } = require('./config/db');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
  try {
    await dbHealthcheck();
    // eslint-disable-next-line no-console
    console.log('MySQL: connected');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('MySQL connection failed:', e.message);
  }
});
