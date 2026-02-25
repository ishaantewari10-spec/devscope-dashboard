const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/metrics', require('./routes/metrics'));

// Health Check
app.get('/health', (req, res) => res.send('API Running'));

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/devscope';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error (History will not be saved):', err.message));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
