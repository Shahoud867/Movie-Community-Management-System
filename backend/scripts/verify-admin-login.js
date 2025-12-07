/**
 * Verify admin login credentials
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function verifyAdmin(email, password) {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'movie_community',
    waitForConnections: true,
    connectionLimit: 10
  });

  try {
    console.log(`\nVerifying admin: ${email}`);
    console.log('Password to test:', password);
    console.log('='.repeat(50));

    // Get admin from database
    const [admins] = await pool.query(
      'SELECT admin_id, email, password, name, role FROM Admin WHERE email = ?',
      [email]
    );

    if (admins.length === 0) {
      console.log('\n❌ Admin not found in database!');
      return;
    }

    const admin = admins[0];
    console.log('\n✓ Admin found:');
    console.log('  ID:', admin.admin_id);
    console.log('  Name:', admin.name);
    console.log('  Email:', admin.email);
    console.log('  Role:', admin.role);
    console.log('\nStored password hash:', admin.password);
    console.log('Hash length:', admin.password.length);
    console.log('Is bcrypt hash?', admin.password.startsWith('$2') && admin.password.length === 60 ? 'Yes ✓' : 'No ❌');

    // Test password comparison
    console.log('\n' + '='.repeat(50));
    console.log('Testing password...');
    
    const isValid = await bcrypt.compare(password, admin.password);
    
    if (isValid) {
      console.log('\n✅ PASSWORD MATCH! Login should work.');
    } else {
      console.log('\n❌ PASSWORD MISMATCH! Login will fail.');
      
      // Try to see if it's a plain text match
      if (admin.password === password) {
        console.log('\n⚠ WARNING: Password is stored as plain text!');
        console.log('Running fix...');
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
          'UPDATE Admin SET password = ? WHERE admin_id = ?',
          [hashedPassword, admin.admin_id]
        );
        
        console.log('✓ Password has been hashed. Try logging in now.');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Get email and password from command line or use defaults
const email = process.argv[2] || 'fasdfas@gmail.com';
const password = process.argv[3] || 'password123';

verifyAdmin(email, password)
  .then(() => {
    console.log('\nDone!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
