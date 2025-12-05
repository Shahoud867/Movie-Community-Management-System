require('dotenv').config();
const app = require('./app');
const { dbHealthcheck } = require('./config/db');
const { startCleanupScheduler } = require('./modules/notifications/notifications.service');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
  try {
    await dbHealthcheck();
    // eslint-disable-next-line no-console
    console.log('MySQL: connected');
    
    // Start the notification cleanup scheduler (removes notifications older than 24 hours)
    startCleanupScheduler();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('MySQL connection failed:', e.message);
  }
});
