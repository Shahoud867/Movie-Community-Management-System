/**
 * Fix participant count inconsistencies
 * This script recalculates current_participants for all events
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixParticipantCounts() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'movie_community',
    waitForConnections: true,
    connectionLimit: 10
  });

  try {
    console.log('Checking participant counts...\n');

    // Get current state of ALL events
    const [allEvents] = await pool.query(`
      SELECT 
        e.event_id,
        e.title,
        e.current_participants AS stored_count,
        COUNT(p.participation_id) AS actual_count
      FROM Event e
      LEFT JOIN Participation p ON e.event_id = p.event_id
      GROUP BY e.event_id, e.title, e.current_participants
      ORDER BY e.event_id
    `);

    console.log('All events:\n');
    allEvents.forEach(row => {
      const status = row.stored_count === row.actual_count ? '✓' : '✗';
      console.log(`${status} Event #${row.event_id}: ${row.title}`);
      console.log(`   Stored: ${row.stored_count}, Actual: ${row.actual_count}\n`);
    });

    // Get only mismatches
    const [before] = await pool.query(`
      SELECT 
        e.event_id,
        e.title,
        e.current_participants AS stored_count,
        COUNT(p.participation_id) AS actual_count
      FROM Event e
      LEFT JOIN Participation p ON e.event_id = p.event_id
      GROUP BY e.event_id, e.title, e.current_participants
      HAVING stored_count != actual_count
    `);

    if (before.length === 0) {
      console.log('✓ All participant counts are correct!');
      return;
    }

    console.log('\nFound inconsistencies to fix:\n');

    console.log('\nFound inconsistencies to fix:\n');
    before.forEach(row => {
      console.log(`Event: ${row.title}`);
      console.log(`  Stored: ${row.stored_count}, Actual: ${row.actual_count}\n`);
    });

    // Fix the counts
    await pool.query(`
      UPDATE Event e
      SET current_participants = (
        SELECT COUNT(*)
        FROM Participation p
        WHERE p.event_id = e.event_id
      )
    `);

    // Verify the fix
    const [after] = await pool.query(`
      SELECT 
        e.event_id,
        e.title,
        e.current_participants AS stored_count,
        COUNT(p.participation_id) AS actual_count
      FROM Event e
      LEFT JOIN Participation p ON e.event_id = p.event_id
      GROUP BY e.event_id, e.title, e.current_participants
      HAVING stored_count != actual_count
    `);

    console.log(`\n✓ Fixed ${before.length} event(s)`);
    
    if (after.length === 0) {
      console.log('✓ All counts are now correct!\n');
    } else {
      console.log('⚠ Some inconsistencies remain:\n');
      after.forEach(row => {
        console.log(`Event: ${row.title}`);
        console.log(`  Stored: ${row.stored_count}, Actual: ${row.actual_count}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the fix
fixParticipantCounts()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
