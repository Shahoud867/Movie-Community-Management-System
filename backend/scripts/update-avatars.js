const { pool } = require('../src/config/db');

const maleNames = ['Ahmed Malik', 'Javier Torres', 'Bilal Ahmed', 'Omar Farooq', 'Hassan Raza', 'Pedro Sanchez', 'Robert Miller', 'Marcus Chen'];
const femaleNames = ['Laura Smith', 'Zahra Hosseini', 'Emily Brown', 'Isabella Cruz', 'Natalie Green', 'Fatima Noor', 'Mina Tavakoli', 'Ayesha Karim', 'Sofia Martinez'];

async function updateAvatars() {
  try {
    // Update male avatars
    for (const name of maleNames) {
      await pool.query(
        "UPDATE Users SET profile_picture = 'images/avatars/male-avatar.svg' WHERE name = ?",
        [name]
      );
    }
    
    // Update female avatars
    for (const name of femaleNames) {
      await pool.query(
        "UPDATE Users SET profile_picture = 'images/avatars/female-avatar.svg' WHERE name = ?",
        [name]
      );
    }
    
    console.log('✓ Updated all user avatars successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating avatars:', error.message);
    process.exit(1);
  }
}

updateAvatars();
