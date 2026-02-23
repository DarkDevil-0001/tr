const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// ==================== MIDDLEWARE ====================

// Get allowed origins from environment variable
const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:3000',
    'http://localhost:5000',
    process.env.FRONTEND_URL,
    process.env.RENDER_EXTERNAL_URL,
    'https://' + (process.env.RENDER_EXTERNAL_HOSTNAME || ''),
].filter(Boolean); // Remove undefined values

console.log('📋 Allowed CORS origins:', allowedOrigins);

// CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('🚫 Blocked origin:', origin);
            return callback(null, false);
        }
        console.log('✅ Allowed origin:', origin);
        return callback(null, true);
    },
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== SERVE STATIC FRONTEND FILES ====================

// Find the correct frontend path
const possiblePaths = [
    path.join(__dirname, '..'), // Go up one level (project root)
    path.join(__dirname, 'public'),
    __dirname,
    path.join(process.cwd(), 'public'),
    process.cwd()
];

let frontendPath = null;
for (const p of possiblePaths) {
    const indexPath = path.join(p, 'index.html');
    if (fs.existsSync(indexPath)) {
        frontendPath = p;
        console.log('✅ Found frontend files at:', p);
        break;
    }
}

if (!frontendPath) {
    console.error('❌ Could not find frontend files! Using current directory as fallback');
    frontendPath = __dirname;
}

console.log('📁 Serving frontend from:', frontendPath);
app.use(express.static(frontendPath));

// ==================== DATABASE CONNECTION ====================

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI is not defined in environment variables');
            return;
        }
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB Connected successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        console.log('🔄 Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

connectDB();

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
    console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
    connectDB();
});

// ==================== USER MODEL ====================

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    plainPassword: { type: String, required: false },
    userType: { type: String, default: 'student' },
    lastLogin: { type: Date, default: null }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;

// ==================== API ROUTES ====================

// Health check endpoint (important for Render)
app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is healthy',
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// API Test route
app.get('/api', (req, res) => {
    res.json({ 
        success: true, 
        message: 'DSA Visualizer API is running',
        environment: process.env.NODE_ENV,
        endpoints: {
            signup: 'POST /api/signup',
            login: 'POST /api/login',
            user: 'POST /api/user',
            checkEmail: 'POST /api/check-email',
            debug: 'GET /api/debug/users'
        }
    });
});

// Signup route
app.post('/api/signup', async (req, res) => {
    try {
        console.log('📝 Signup request received:', req.body.email);
        
        const { firstName, lastName, email, password, userType } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
            plainPassword: password,
            userType: userType || 'student',
            lastLogin: new Date()
        });

        await newUser.save();
        console.log('✅ User saved successfully:', newUser.email);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                userType: newUser.userType,
                createdAt: newUser.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during signup'
        });
    }
});

// Login route
app.post('/api/login', async (req, res) => {
    try {
        console.log('🔐 Login request received:', req.body.email);
        
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        user.lastLogin = new Date();
        await user.save();

        console.log('✅ Login successful:', user.email);

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userType: user.userType,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during login'
        });
    }
});

// Get user profile
app.post('/api/user', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userType: user.userType,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('❌ Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// Check email availability
app.post('/api/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        
        res.json({
            success: true,
            available: !existingUser
        });

    } catch (error) {
        console.error('❌ Check email error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// Debug route - PROTECT THIS IN PRODUCTION!
app.get('/api/debug/users', async (req, res) => {
    try {
        // Only allow in development
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                success: false,
                error: 'Debug route disabled in production'
            });
        }

        const users = await User.find({}).select('+plainPassword');
        
        const userList = users.map(user => ({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userType: user.userType,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        }));

        res.json({
            success: true,
            count: users.length,
            users: userList
        });

    } catch (error) {
        console.error('❌ Debug route error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// ==================== FRONTEND ROUTES ====================

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(60));
    console.log(`✅ SERVER STARTED SUCCESSFULLY`);
    console.log('='.repeat(60));
    console.log(`📍 Environment:    ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 PORT:            ${PORT}`);
    console.log(`📍 API URL:         ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/api`);
    console.log(`📍 Health Check:    ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/health`);
    console.log('='.repeat(60));
});
