const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// ==================== MIDDLEWARE ====================

// Get allowed origins - include Render URL
const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:3000',
    'http://localhost:5000',
    process.env.FRONTEND_URL,
    process.env.RENDER_EXTERNAL_URL,
    'https://' + (process.env.RENDER_EXTERNAL_HOSTNAME || ''),
].filter(Boolean);

console.log('📋 Allowed CORS origins:', allowedOrigins);

// CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            console.log('🚫 Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== SERVE STATIC FRONTEND FILES ====================

// For Render: Files are in the parent directory (TreeViz folder)
const frontendPath = path.join(__dirname, '..');
console.log('📁 Serving frontend from:', frontendPath);

// Check if frontend files exist
const indexPath = path.join(frontendPath, 'index.html');
if (fs.existsSync(indexPath)) {
    console.log('✅ Found index.html at:', indexPath);
    app.use(express.static(frontendPath));
} else {
    console.error('❌ Could not find index.html at:', indexPath);
    console.log('📁 Files in parent directory:', fs.readdirSync(frontendPath));
}

// ==================== DATABASE CONNECTION ====================

console.log('🔄 Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
.then(() => console.log('✅ MongoDB Connected successfully'))
.catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Don't exit, just log the error
    console.log('⚠️ Server will continue running but database features won\'t work');
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

// ==================== API ROUTES ====================

// Health check endpoint (IMPORTANT for Render)
app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is healthy',
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        port: process.env.PORT || 5000
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
            health: 'GET /health'
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
        console.error('❌ Signup error:', error.message);
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
        console.error('❌ Login error:', error.message);
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
        console.error('❌ Get user error:', error.message);
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
        console.error('❌ Check email error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// Debug route - Only in development
app.get('/api/debug/users', async (req, res) => {
    try {
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
        console.error('❌ Debug route error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// ==================== FRONTEND ROUTES ====================

// Serve HTML files
app.get('/', (req, res) => {
    const htmlPath = path.join(frontendPath, 'index.html');
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else {
        res.status(404).send('Frontend files not found');
    }
});

app.get('/tree.html', (req, res) => {
    const htmlPath = path.join(frontendPath, 'tree.html');
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else {
        res.status(404).send('Tree visualizer page not found');
    }
});

app.get('/graph.html', (req, res) => {
    const htmlPath = path.join(frontendPath, 'graph.html');
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else {
        res.status(404).send('Graph visualizer page not found');
    }
});

app.get('/signup.html', (req, res) => {
    const htmlPath = path.join(frontendPath, 'signup.html');
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else {
        res.status(404).send('Signup page not found');
    }
});

app.get('/login.html', (req, res) => {
    const htmlPath = path.join(frontendPath, 'login.html');
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else {
        res.status(404).send('Login page not found');
    }
});

// ==================== 404 HANDLER ====================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err.message);
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
    console.log(`📍 Frontend path:   ${frontendPath}`);
    console.log(`📍 Health check:    ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/health`);
    console.log(`📍 API URL:         ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/api`);
    console.log('='.repeat(60));
    console.log(`\n📝 Available Pages:`);
    console.log(`   • Home:         ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/`);
    console.log(`   • Tree Visualizer: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/tree.html`);
    console.log(`   • Graph Visualizer: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/graph.html`);
    console.log(`   • Sign Up:      ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/signup.html`);
    console.log(`   • Log In:       ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/login.html`);
    console.log('='.repeat(60));
});
