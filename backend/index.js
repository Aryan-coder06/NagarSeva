const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Check if Firebase is configured
if (!process.env.FIREBASE_PROJECT_ID) {
  console.warn('⚠️  FIREBASE_PROJECT_ID not configured. Protected routes need Firebase Admin credentials.');
} else {
  console.log('✅ Firebase authentication configured');
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-community')
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Middleware
app.use(express.json());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

app.get('/', (req, res) => {
  res.send('Welcome to NagarSeva');
});

// Use Routes
app.use('/api', require('./routes/issue'));
app.use('/api', require('./routes/logs'));
app.use("/api", require('./routes/upload'));
app.use('/api', require('./routes/ai'));
app.use('/api', require('./routes/officer'));
app.use('/api', require('./routes/profile'));
app.use('/api', require('./routes/notification'));

app.use((err, req, res, next) => {
  if (err?.message === 'Unexpected end of form') {
    console.warn('Multipart upload failed: incomplete form data received.');
    return res.status(400).json({
      error: 'Upload was incomplete. Please retry the file upload.',
    });
  }

  if (err) {
    console.error('Unhandled express error:', err);
    return res.status(500).json({
      error: 'Unexpected server error.',
    });
  }

  next();
});

app.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
});
