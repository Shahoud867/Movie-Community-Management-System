require('dotenv').config();
const { pool } = require('../src/config/db');

async function testEndpoints() {
  console.log('🧪 Testing Movie Community System - End-to-End\n');

  try {
    // Test 1: Check Users table
    console.log('✓ Testing Users table...');
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`  Found ${users[0].count} users in database`);

    // Test 2: Check Movies table
    console.log('✓ Testing Movie table...');
    const [movies] = await pool.query('SELECT COUNT(*) as count FROM movie');
    console.log(`  Found ${movies[0].count} movies in database`);

    // Test 3: Check Reviews table
    console.log('✓ Testing Review table...');
    const [reviews] = await pool.query('SELECT COUNT(*) as count FROM review');
    console.log(`  Found ${reviews[0].count} reviews in database`);

    // Test 4: Check Watchlist table
    console.log('✓ Testing Watchlist table...');
    const [watchlist] = await pool.query('SELECT COUNT(*) as count FROM watchlist');
    console.log(`  Found ${watchlist[0].count} watchlist items in database`);

    // Test 5: Check Friendship table
    console.log('✓ Testing Friendship table...');
    const [friendships] = await pool.query('SELECT COUNT(*) as count FROM friendship');
    console.log(`  Found ${friendships[0].count} friendships in database`);

    // Test 6: Check Messages table
    console.log('✓ Testing Message table...');
    const [messages] = await pool.query('SELECT COUNT(*) as count FROM message');
    console.log(`  Found ${messages[0].count} messages in database`);

    // Test 7: Check Notification table
    console.log('✓ Testing Notification table...');
    const [notifications] = await pool.query('SELECT COUNT(*) as count FROM notification');
    console.log(`  Found ${notifications[0].count} notifications in database`);

    // Test 8: Sample user with watchlist
    console.log('\n✓ Testing user watchlist integration...');
    const [userWatchlist] = await pool.query(`
      SELECT u.name, COUNT(w.watchlist_id) as watchlist_count
      FROM users u
      LEFT JOIN watchlist w ON u.user_id = w.user_id
      GROUP BY u.user_id
      LIMIT 5
    `);
    userWatchlist.forEach(row => {
      console.log(`  ${row.name}: ${row.watchlist_count} items in watchlist`);
    });

    // Test 9: Sample user with reviews
    console.log('\n✓ Testing user reviews integration...');
    const [userReviews] = await pool.query(`
      SELECT u.name, COUNT(r.review_id) as review_count
      FROM users u
      LEFT JOIN review r ON u.user_id = r.user_id
      GROUP BY u.user_id
      HAVING review_count > 0
      LIMIT 5
    `);
    if (userReviews.length > 0) {
      userReviews.forEach(row => {
        console.log(`  ${row.name}: ${row.review_count} reviews`);
      });
    } else {
      console.log('  No users with reviews found');
    }

    // Test 10: Sample friendships
    console.log('\n✓ Testing friendships integration...');
    const [friendData] = await pool.query(`
      SELECT u1.name as user1, u2.name as user2, f.status
      FROM friendship f
      JOIN users u1 ON f.sender_id = u1.user_id
      JOIN users u2 ON f.receiver_id = u2.user_id
      LIMIT 5
    `);
    if (friendData.length > 0) {
      friendData.forEach(row => {
        console.log(`  ${row.user1} ↔ ${row.user2} (${row.status})`);
      });
    } else {
      console.log('  No friendships found');
    }

    // Test 11: Sample notifications
    console.log('\n✓ Testing notifications integration...');
    const [notifData] = await pool.query(`
      SELECT u.name, n.notification_type, n.message, n.is_seen
      FROM notification n
      JOIN users u ON n.recipient_id = u.user_id
      LIMIT 5
    `);
    if (notifData.length > 0) {
      notifData.forEach(row => {
        const status = row.is_seen ? '✓' : '●';
        console.log(`  ${status} ${row.name}: ${row.notification_type} - "${row.message}"`);
      });
    } else {
      console.log('  No notifications found');
    }

    console.log('\n✅ All database tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - ${users[0].count} users`);
    console.log(`  - ${movies[0].count} movies`);
    console.log(`  - ${reviews[0].count} reviews`);
    console.log(`  - ${watchlist[0].count} watchlist items`);
    console.log(`  - ${friendships[0].count} friendships`);
    console.log(`  - ${messages[0].count} messages`);
    console.log(`  - ${notifications[0].count} notifications`);

  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await pool.end();
  }
}

testEndpoints();
