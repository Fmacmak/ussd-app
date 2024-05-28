const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); // For in-memory database; use a file for persistent storage

// Initialize the database
db.serialize(() => {
    db.run(`CREATE TABLE security_numbers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE
    )`);

    db.run(`CREATE TABLE estates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        access_code TEXT,
        valid_until DATE
    )`);

    // Insert some seed data
    db.run(`INSERT INTO security_numbers (phone_number) VALUES ('12345'), ('67890')`);
    db.run(`INSERT INTO estates (access_code, valid_until) VALUES ('ABC123', '2024-12-31'), ('XYZ789', '2023-12-31')`);
});

module.exports = db;
