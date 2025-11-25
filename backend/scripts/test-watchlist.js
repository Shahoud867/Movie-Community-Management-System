require('dotenv').config();
const { getUserWatchlist } = require('../src/modules/watchlist/watchlist.service');

async function test() {
  try {
    console.log('Testing getUserWatchlist for user 1...');
    const items = await getUserWatchlist(1);
    console.log('Results:', JSON.stringify(items, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();
