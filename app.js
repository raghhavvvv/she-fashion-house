const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Setup database connection
const db = new sqlite3.Database('./bookings.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error("Error connecting to database:", err.message);
    console.log('Connected to the SQLite database.');
});

// Middleware
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

// =============================================================================
//  PAGE RENDERING ROUTES (GET)
// =============================================================================

// 1. Dashboard / Add New Booking Page
app.get('/', (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const sql = `SELECT * FROM bookings WHERE delivery_date = ? AND is_deleted = 0 ORDER BY is_emergency DESC`;
    db.all(sql, [today], (err, todaysDeliveries) => {
        if (err) {
            console.error("Error fetching today's deliveries:", err.message);
            res.status(500).send("Server error");
            return;
        }
        res.render('index', { todaysDeliveries });
    });
});

// 2. All Bookings Page (with Search and Filter)
app.get('/bookings', (req, res) => {
    // ================== DEBUGGING START ==================
    console.log("--- NEW /bookings REQUEST ---");
    console.log("Filters Received from URL:", req.query);
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);
    // =================== DEBUGGING END ===================

    let sql = `SELECT * FROM bookings WHERE is_deleted = 0`;
    const params = [];
    const whereClauses = [];
    const query = req.query || {};

    const { 
        search_query, booking_date, delivery_date, phone_number,
        cloth_color, emergency, delivery_status, delivery_date_status 
    } = query;

    // Build WHERE clauses dynamically
    if (search_query) {
        whereClauses.push(`customer_name LIKE ?`);
        params.push(`%${search_query}%`);
    }
    if (booking_date) {
        whereClauses.push(`booking_date = ?`);
        params.push(booking_date);
    }
    if (delivery_date) {
        whereClauses.push(`delivery_date = ?`);
        params.push(delivery_date);
    }
    if (phone_number) {
        // Remove any non-digit characters for phone search
        const cleanPhone = phone_number.replace(/\D/g, '');
        if (cleanPhone.length > 0) {
            // Use a simpler approach for phone search
            whereClauses.push(`phone_number LIKE ?`);
            params.push(`%${phone_number}%`);
        }
    }
    if (cloth_color) {
        whereClauses.push(`LOWER(cloth_color) = LOWER(?)`);
        params.push(cloth_color);
    }
    if (emergency === '1' || emergency === '0') {
        whereClauses.push(`is_emergency = ?`);
        params.push(emergency);
    }
    if (delivery_status) {
        whereClauses.push(`delivery_status = ?`);
        params.push(delivery_status);
    }
    if (delivery_date_status) {
        const today = new Date().toISOString().slice(0, 10);
        if (delivery_date_status === 'past') {
            whereClauses.push(`delivery_date < ?`);
            params.push(today);
        } else if (delivery_date_status === 'today') {
            whereClauses.push(`delivery_date = ?`);
            params.push(today);
        } else if (delivery_date_status === 'upcoming') {
            whereClauses.push(`delivery_date > ?`);
            params.push(today);
        }
    }

    if (whereClauses.length > 0) {
        sql += ` AND ${whereClauses.join(' AND ')}`;
    }

    sql += ` ORDER BY delivery_date ASC`;

    // ================== DEBUGGING START ==================
    console.log("Final SQL Query:", sql);
    console.log("Parameters for SQL:", params);
    console.log("-----------------------------\n");
    // =================== DEBUGGING END ===================

    db.all(sql, params, (err, bookings) => {
        if (err) {
            console.error("Database error:", err.message);
            console.error("SQL query:", sql);
            console.error("Parameters:", params);
            return res.status(500).render('all-bookings', { 
                bookings: [], 
                filters: query,
                error: "Database error occurred. Please try again."
            });
        }
        
        // Log results for debugging
        console.log(`Found ${bookings.length} bookings matching criteria`);
        console.log("Sample booking data:", bookings.length > 0 ? bookings[0] : "No bookings");
        
        res.render('all-bookings', { 
            bookings, 
            filters: query,
            totalResults: bookings.length
        });
    });
});

// 3. Payments Page
app.get('/payments', (req, res) => {
    const pendingSql = `SELECT * FROM bookings WHERE payment_status IN ('Pending', 'Partially Paid') AND is_deleted = 0 ORDER BY delivery_date`;
    const completedSql = `SELECT * FROM bookings WHERE payment_status = 'Paid' AND is_deleted = 0 ORDER BY delivery_date DESC`;
    
    db.all(pendingSql, [], (err, pendingPayments) => {
        if (err) return console.error(err.message);
        db.all(completedSql, [], (err, completedPayments) => {
            if (err) return console.error(err.message);
            res.render('payments', { pendingPayments, completedPayments });
        });
    });
});

// 4. View Bin Page
app.get('/bin', (req, res) => {
    const sql = `SELECT * FROM bookings WHERE is_deleted = 1 ORDER BY id DESC`;
    db.all(sql, [], (err, deletedBookings) => {
        if (err) return console.error(err.message);
        res.render('bin', { deletedBookings });
    });
});

// =============================================================================
//  ACTION ROUTES (POST)
// =============================================================================

// Add a new booking
app.post('/add-booking', (req, res) => {
    const { customer_name, phone_number, cloth_color, booking_date, delivery_date, total_amount, emergency } = req.body;
    const sql = `INSERT INTO bookings (customer_name, phone_number, cloth_color, booking_date, delivery_date, total_amount, is_emergency) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const is_emergency = emergency ? 1 : 0;
    
    db.run(sql, [customer_name, phone_number, cloth_color, booking_date, delivery_date, total_amount, is_emergency], (err) => {
        if (err) return console.error(err.message);
        res.redirect('/');
    });
});

// Record a payment for a booking
app.post('/record-payment/:id', (req, res) => {
    const bookingId = req.params.id;
    const { amount_new } = req.body;
    
    const getSql = `SELECT total_amount, amount_paid FROM bookings WHERE id = ?`;
    db.get(getSql, [bookingId], (err, row) => {
        if (err) return console.error(err.message);
        
        const newAmountPaid = parseFloat(row.amount_paid) + parseFloat(amount_new);
        let paymentStatus = 'Partially Paid';
        if (newAmountPaid >= row.total_amount) {
            paymentStatus = 'Paid';
        }

        const updateSql = `UPDATE bookings SET amount_paid = ?, payment_status = ? WHERE id = ?`;
        db.run(updateSql, [newAmountPaid, paymentStatus, bookingId], (err) => {
            if (err) return console.error(err.message);
            res.redirect('/payments');
        });
    });
});

// Toggle the delivery status of a booking
app.post('/toggle-delivery/:id', (req, res) => {
    const getSql = `SELECT delivery_status FROM bookings WHERE id = ?`;
    db.get(getSql, [req.params.id], (err, row) => {
        if (err) return console.error(err.message);
        const newStatus = row.delivery_status === 'Delivered' ? 'Not Delivered' : 'Delivered';
        const updateSql = `UPDATE bookings SET delivery_status = ? WHERE id = ?`;
        db.run(updateSql, [newStatus, req.params.id], (err) => {
            if (err) return console.error(err.message);
            res.redirect('/bookings');
        });
    });
});

// Soft delete a booking (move to bin)
app.post('/delete-booking/:id', (req, res) => {
    const sql = `UPDATE bookings SET is_deleted = 1 WHERE id = ?`;
    db.run(sql, [req.params.id], (err) => {
        if (err) return console.error(err.message);
        res.redirect('/bookings');
    });
});

// Restore a booking from the bin
app.post('/restore-booking/:id', (req, res) => {
    const sql = `UPDATE bookings SET is_deleted = 0 WHERE id = ?`;
    db.run(sql, [req.params.id], (err) => {
        if (err) return console.error(err.message);
        res.redirect('/bin');
    });
});

// Permanently delete a booking from the database
app.post('/delete-permanent/:id', (req, res) => {
    const sql = `DELETE FROM bookings WHERE id = ?`;
    db.run(sql, [req.params.id], (err) => {
        if (err) return console.error(err.message);
        res.redirect('/bin');
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});