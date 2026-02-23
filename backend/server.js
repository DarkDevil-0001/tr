const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ==================== MIDDLEWARE ====================

// CORS configuration
app.use(cors({
    origin: true,
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== SERVE STATIC FRONTEND FILES ====================

const frontendPath = path.join(__dirname, '..');
console.log('📁 Serving frontend from:', frontendPath);
app.use('/api', ...)  // Your API routes

// ==================== DATABASE CONNECTION ====================

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected successfully'))
.catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
});

// ==================== UPDATED USER MODEL ====================

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
   
    plainPassword: {
        type: String,
        required: false
    },
    userType: {
        type: String,
        default: 'student'
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true 
});

const User = mongoose.model('User', userSchema);

// Export the model
module.exports = User;

// ==================== API ROUTES ====================

// API Test route
app.get('/api', (req, res) => {
    res.json({ 
        success: true, 
        message: 'DSA Visualizer API is running',
        endpoints: {
            signup: 'POST /api/signup',
            login: 'POST /api/login',
            user: 'POST /api/user',
            checkEmail: 'POST /api/check-email'
        }
    });
});

// ==================== UPDATED SIGNUP ROUTE ====================

app.post('/api/signup', async (req, res) => {
    try {
        console.log('Signup request received:', req.body);
        
        const { firstName, lastName, email, password, userType } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Hash password
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

        // Log the saved user for debugging
        console.log('✅ User saved to MongoDB:');
        console.log('   ID:', newUser._id);
        console.log('   Email:', newUser.email);
        console.log('   Plain Password:', newUser.plainPassword);
        console.log('   Hashed Password:', newUser.password);
        console.log('   Created At:', newUser.createdAt);

        // Return user data (without password for security in response)
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
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during signup'
        });
    }
});

// ==================== UPDATED LOGIN ROUTE ====================

app.post('/api/login', async (req, res) => {
    try {
        console.log('Login request received:', req.body.email);
        
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        
        // Log password comparison for debugging
        console.log('🔐 Password Check:');
        console.log('   Entered Password:', password);
        console.log('   Stored Plain Password:', user.plainPassword);
        console.log('   Stored Hashed Password:', user.password);
        console.log('   Match Result:', isMatch);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Return user data (without password)
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
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during login'
        });
    }
});

// ==================== GET USER PROFILE ====================

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
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// ==================== CHECK EMAIL AVAILABILITY ====================

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
        console.error('Check email error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// ==================== NEW DEBUG ROUTE ====================


app.get('/api/debug/users', async (req, res) => {
    try {
        const users = await User.find({}).select('+plainPassword');
        
        const userList = users.map(user => ({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            plainPassword: user.plainPassword,
            hashedPassword: user.password,
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
        console.error('Debug route error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// ==================== FRONTEND ROUTES ====================

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// app.get('/tree.html', (req, res) => {
//     res.sendFile(path.join(frontendPath, 'tree.html'));
// });

// app.get('/graph.html', (req, res) => {
//     res.sendFile(path.join(frontendPath, 'graph.html'));
// });

// app.get('/signup.html', (req, res) => {
//     res.sendFile(path.join(frontendPath, 'signup.html'));
// });

// app.get('/login.html', (req, res) => {
//     res.sendFile(path.join(frontendPath, 'login.html'));
// });

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log(`✅ SERVER STARTED SUCCESSFULLY`);
    console.log('='.repeat(60));
    console.log(`📍 API URL:        http://localhost:${PORT}/api`);
    console.log(`🌐 WEBSITE URL:    http://localhost:${PORT}`);
    console.log(`📁 Frontend path:  ${frontendPath}`);
    console.log('='.repeat(60));
    console.log(`\n📝 Available Pages:`);
    console.log(`   • Home:         http://localhost:${PORT}`);
    // console.log(`   • Tree Visualizer: http://localhost:${PORT}/tree.html`);
    // console.log(`   • Graph Visualizer: http://localhost:${PORT}/graph.html`);
    // console.log(`   • Sign Up:      http://localhost:${PORT}/signup.html`);
    // console.log(`   • Log In:       http://localhost:${PORT}/login.html`);
    // console.log('='.repeat(60));
    
});
