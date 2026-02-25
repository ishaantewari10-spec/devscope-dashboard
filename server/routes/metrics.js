const express = require('express');
const router = express.Router();
const Metric = require('../models/Metric');

// @route POST /api/metrics
// @desc Save a new metric snapshot
router.post('/', async (req, res) => {
    try {
        const newMetric = new Metric(req.body);
        const savedMetric = await newMetric.save();
        res.json(savedMetric);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route GET /api/metrics/history
// @desc Get historical metric data
router.get('/history', async (req, res) => {
    try {
        const metrics = await Metric.find().sort({ timestamp: -1 }).limit(100);
        res.json(metrics);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
