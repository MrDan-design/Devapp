const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

(async () => {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Lightholdbossamuelebiloma4321$$',
    database: 'Devapp',
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await db.query(
    'INSERT INTO users (fullname, email, password, balance, is_admin) VALUES (?, ?, ?, ?, ?)',
    ['Tesla Wallet Admin', 'teslawallet.tco@gmail.com', hashedPassword, 0, 1]
  );

  console.log('Admin user inserted.');
  db.end();
})();