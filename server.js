// ================================
// server.js - Campus Lost & Found
// ================================

// Load dependencies
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const sanitizeHtml = require('sanitize-html');

const app = express();


// ================================
// Middleware
// ================================
app.use(express.json());              // parse JSON body
app.use(express.urlencoded({ extended: true })); // parse form body

//app.use(express.static(path.join(__dirname, 'LostAndFoundSystem')));

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/images', express.static('images'));

// Sessions for login
app.use(session({
    secret: process.env.SESSION_SECRET || "mySecret123",
    resave: false,
    saveUninitialized: false,      // better practice
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));


app.use(express.static("public"));

// ================================
// Database Connection
// ================================
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database!');
});

// ================================
// Routes
// ================================

// ----- Test API -----
app.get('/api', (req, res) => {
    res.send('Campus Lost & Found API is running');
});

// ----- User Registration-----
const saltRounds = 10;

app.post('/api/register', async (req, res) => {
    try {
        let { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Sanitize and trim
        username = sanitizeHtml(username.trim(), { allowedTags: [], allowedAttributes: {} });
        email = sanitizeHtml(email.trim().toLowerCase(), { allowedTags: [], allowedAttributes: {} });
        password = password.trim();

        // Check email exists
        const [rows] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length > 0) {
            return res.status(409).json({ success: false, message: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user
        await db.promise().query(
            "INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())",
            [username, email, hashedPassword, 'student']
        );

        res.json({ success: true, message: "User registered successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ----- User Login -----
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        async (err, results) => {
            if (err) return res.status(500).json({ error: err });
            if (results.length === 0) return res.status(400).json({ error: 'User not found' });

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

        // Save session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.json({ success: true });
        }
    );
});

app.get('/api/session', (req, res) => {
    if (req.session.user) {
        res.json({
            loggedIn: true,
            user: req.session.user
        });
    } else {
        res.json({ loggedIn: false });
    }
});

// ----- User Logout -----
app.get('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});


//Fetch item / Display
app.get('/api/items', (req, res) => {
    const query = `
        SELECT id, image, title, description, category, location, date, contact_info, status, submitted_by
        FROM items
        ORDER BY date DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error fetching items:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});


const multer = require('multer');

// store images in "images/" folder
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/');
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// POST route for submitting report
app.post('/api/items', upload.single('image'), (req, res) => {
    console.log(req.body);
    // Check if user is logged in
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'You must be logged in to submit an item.' });
    }

    const { title, description, category, location, date, contact_info } = req.body;
    const image = req.file ? req.file.filename : null;
    const submittedBy = req.session.user.username; // store username

    if (!title || !description || !category || !location || !date || !contact_info) {
        return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const sql = `
        INSERT INTO items (title, description, category, location, date, contact_info, image, submitted_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [title, description, category, location, date, contact_info, image, submittedBy];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, itemId: result.insertId });
    });
});

// Get items posted by logged-in user
app.get('/api/my-items', (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    const username = req.session.user.username;

    const sql = `
        SELECT id, image, title, description, category, location, date, contact_info, status
        FROM items
        WHERE submitted_by = ?
        ORDER BY date DESC
    `;

    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Update item status
app.put('/api/items/:id/status', (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    const itemId = req.params.id;
    const { status } = req.body;
    const username = req.session.user.username;

    const sql = `
        UPDATE items
        SET status = ?
        WHERE id = ? AND submitted_by = ?
    `;

    db.query(sql, [status, itemId, username], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.affectedRows === 0) {
            return res.status(403).json({ error: 'Not allowed' });
        }

        res.json({ success: true });
    });
});

app.delete('/api/items/:id', (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM items WHERE id = ?", [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }

        res.json({ message: "Item deleted" });
    });
});

// ----- 404 Handler -----
app.use((req, res, next) => {
    res.status(404).send('Page not found');
});

// ================================
// Start Server
// ================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});