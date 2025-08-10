const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('bookings.db');

db.serialize(() => {
  console.log('Creating bookings table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      cloth_color TEXT,
      booking_date TEXT NOT NULL,
      delivery_date TEXT NOT NULL,
      total_amount REAL DEFAULT 0,
      amount_paid REAL DEFAULT 0,
      is_emergency INTEGER DEFAULT 0,
      delivery_status TEXT DEFAULT 'Not Delivered',
      payment_status TEXT DEFAULT 'Pending',
      is_deleted INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Bookings table created successfully.');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Database connection closed.');
});