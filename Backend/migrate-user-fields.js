const mysql = require('mysql2/promise');

const migrateUserFields = async () => {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Lightholdbossamuelebiloma4321$$',
    database: 'devapp',
  });

  try {
    console.log('🔄 Starting user fields migration...');

    // Add phone column if it doesn't exist
    try {
      await db.query('ALTER TABLE users ADD COLUMN phone VARCHAR(50)');
      console.log('✅ Added phone column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('📋 Phone column already exists');
      } else {
        console.log('❌ Error adding phone column:', err.message);
      }
    }

    // Check if next_of_kin_number exists and rename it to next_of_kin_phone
    try {
      const [columns] = await db.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'devapp' 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'next_of_kin_number'
      `);

      if (columns.length > 0) {
        await db.query('ALTER TABLE users CHANGE next_of_kin_number next_of_kin_phone VARCHAR(50)');
        console.log('✅ Renamed next_of_kin_number to next_of_kin_phone');
      } else {
        // Column doesn't exist, try to add it
        try {
          await db.query('ALTER TABLE users ADD COLUMN next_of_kin_phone VARCHAR(50)');
          console.log('✅ Added next_of_kin_phone column');
        } catch (addErr) {
          if (addErr.code === 'ER_DUP_FIELDNAME') {
            console.log('📋 next_of_kin_phone column already exists');
          } else {
            console.log('❌ Error adding next_of_kin_phone column:', addErr.message);
          }
        }
      }
    } catch (err) {
      console.log('❌ Error checking/renaming next_of_kin_number:', err.message);
    }

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await db.end();
  }
};

migrateUserFields();
