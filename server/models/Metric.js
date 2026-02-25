const mongoose = require('mongoose');

const MetricSchema = new mongoose.Schema({
    loadTime: { type: Number, required: true },
    renders: { type: Number, required: true },
    userEvents: { type: Number, required: true },
    fps: { type: Number, required: true },
    score: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Metric', MetricSchema);
