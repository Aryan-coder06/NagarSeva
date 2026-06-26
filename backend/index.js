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
app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to NagarSeva');
});

// Use Routes
app.use('/api', require('./routes/issue'));
app.use('/api', require('./routes/logs'));
app.use("/api", require('./routes/upload'));
app.use('/api', require('./routes/officer'));
app.use('/api', require('./routes/profile'));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
