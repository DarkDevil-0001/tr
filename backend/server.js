require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000', 'http://localhost:5000', 'http://localhost:8080', process.env.FRONTEND_URL, process.env.RENDER_EXTERNAL_URL].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// ==================== SERVE FRONTEND ====================
app.use(express.static(path.join(__dirname, '..')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==================== MONGODB CONNECTION ====================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa_visualizer';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas!');
  console.log('📁 Database: dsa_visualizer');
})
.catch((err) => {
  console.log('⚠️  MongoDB Connection Warning:', err.message);
  console.log('💡 If using MongoDB Atlas:');
  console.log('   1. Check your connection string in .env');
  console.log('   2. Add your IP to MongoDB Atlas IP Whitelist');
  console.log('   3. Check your username/password');
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

// ==================== ROUTES ====================

// Home Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Tree Visualizer
app.get('/tree.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'tree.html'));
});

// Graph Visualizer
app.get('/graph.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'graph.html'));
});

// Signup Page
app.get('/signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'signup.html'));
});

// Login Page
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

// Health Check
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    mongodbState: mongoose.connection.readyState
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'DSA Visualizer Backend is running!',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    readyState: mongoose.connection.readyState
  });
});

// API Test route
app.get('/api', (req, res) => {
  res.json({ 
    success: true, 
    message: 'DSA Visualizer API is running',
    endpoints: {
      signup: 'POST /api/signup',
      login: 'POST /api/login',
      user: 'POST /api/user',
      checkEmail: 'POST /api/check-email',
      test: 'GET /api/test',
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

    console.log('✅ User saved to MongoDB:');
    console.log('   ID:', newUser._id);
    console.log('   Email:', newUser.email);

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

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 DSA VISUALIZER BACKEND STARTED!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/api/test`);
  console.log('='.repeat(60));
  console.log('📋 AVAILABLE ENDPOINTS:');
  console.log(`   📝 Signup: http://localhost:${PORT}/api/signup (POST)`);
  console.log(`   🔐 Login: http://localhost:${PORT}/api/login (POST)`);
  console.log(`   👤 User: http://localhost:${PORT}/api/user (POST)`);
  console.log(`   ✅ Check Email: http://localhost:${PORT}/api/check-email (POST)`);
  console.log(`   🔧 Debug: http://localhost:${PORT}/api/debug/users (GET)`);
  console.log(`   💓 Health: http://localhost:${PORT}/health (GET)`);
  console.log('='.repeat(60));
  console.log('📁 AVAILABLE PAGES:');
  console.log(`   🏠 Home: http://localhost:${PORT}/`);
  console.log(`   🌳 Tree Visualizer: http://localhost:${PORT}/tree.html`);
  console.log(`   📊 Graph Visualizer: http://localhost:${PORT}/graph.html`);
  console.log(`   📝 Sign Up: http://localhost:${PORT}/signup.html`);
  console.log(`   🔑 Log In: http://localhost:${PORT}/login.html`);
  console.log('='.repeat(60));
  console.log('💾 DATA SAVED TO MONGODB ATLAS:');
  console.log('   • users - User accounts');
  console.log('='.repeat(60));
});
