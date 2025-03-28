const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { google } = require('googleapis');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://apis.google.com", "'unsafe-inline'"],
            frameSrc: [
                "'self'",
                "https://accounts.google.com",              // Google Sign-In
                "https://word-app-59e3f.firebaseapp.com"    // Firebase Auth iframe
            ],
            connectSrc: [
                "'self'",
                "https://www.googleapis.com",               // Google Drive API
                "https://identitytoolkit.googleapis.com"    // Firebase Auth API
            ],
        },
    },
}));

app.use(compression());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://word-app-6xnj.onrender.com']
    : ['http://localhost:3000', 'https://word-app-59e3f.web.app', 'https://word-app-59e3f.firebaseapp.com'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS policy violation'), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

const buildPath = path.join(__dirname, '../../client/build'); // Go up two levels
console.log('Serving static files from:', buildPath); // Debug log
app.use(express.static(buildPath));

// Google Drive API
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI || 'https://word-app-6xnj.onrender.com/auth/google/callback'
);
app.locals.oauth2Client = oauth2Client;

// Token verification middleware
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No access token provided' });
        }
        req.token = token; // Add server-side verification if needed
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', verifyToken, require('./routes/documents'));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error details:', err);
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
        error: 'Something went wrong!',
        details: isProduction ? 'Internal server error' : err.message
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log('Serving static files from:', path.join(__dirname, '../client/build'));
});
