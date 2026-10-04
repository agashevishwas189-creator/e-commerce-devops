const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "ecommerce",
    user: process.env.DB_USER || "admin",
    password: process.env.DB_PASSWORD || "admin123"
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "E-Commerce Backend is running!"
    });
});

// Database test
app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "Database connected successfully!",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

// User registration
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // Check existing user
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, created_at`,
            [name, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// User login
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user
        const result = await pool.query(
            "SELECT id, name, email, password FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        // Compare password with bcrypt hash
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET || "development-secret",
            {
                expiresIn: "1h"
            }
        );

        res.json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// Get products
app.get("/api/products", async (req, res) => {
    try {
        const { search } = req.query;

        let result;

        if (search && search.trim() !== "") {
            result = await pool.query(
                `SELECT id, name, description, price, emoji
                 FROM products
                 WHERE name ILIKE $1
                    OR description ILIKE $1
                 ORDER BY id`,
                [`%${search}%`]
            );
        } else {
            result = await pool.query(
                `SELECT id, name, description, price, emoji
                 FROM products
                 ORDER BY id`
            );
        }

        res.json({
            success: true,
            products: result.rows
        });

    } catch (error) {
        console.error("Products error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch products"
        });
    }
});



const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
