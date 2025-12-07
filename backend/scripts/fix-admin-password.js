/**
 * Fix admin passwords that were stored without bcrypt hashing
 * This script will find admins with unhashed passwords and hash them
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixAdminPasswords() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'movie_community',
    waitForConnections: true,
    connectionLimit: 10
  });

  try {
    console.log('Checking for unhashed admin passwords...\n');

    // Get all admins
    const [admins] = await pool.query('SELECT admin_id, email, password FROM Admin');

    let fixed = 0;

    for (const admin of admins) {
      // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$ and are 60 chars)
      const isHashed = admin.password && admin.password.startsWith('$2') && admin.password.length === 60;

      if (!isHashed) {
        console.log(`Found unhashed password for: ${admin.email}`);
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        
        // Update in database
        await pool.query(
          'UPDATE Admin SET password = ? WHERE admin_id = ?',
          [hashedPassword, admin.admin_id]
        );
        
        console.log(`✓ Fixed password for: ${admin.email}\n`);
        fixed++;
      }
    }

    if (fixed === 0) {
      console.log('✓ All admin passwords are already hashed!');
    } else {
      console.log(`\n✓ Fixed ${fixed} admin password(s)`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the fix
fixAdminPasswords()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
