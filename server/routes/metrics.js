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

// @route POST /api/metrics/scan
// @desc Scan an external URL for performance metrics
router.post('/scan', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ msg: 'URL is required' });

    try {
        let puppeteer;
        try {
            puppeteer = require('puppeteer');
        } catch (e) {
            return res.status(503).json({
                error: 'Robot Scanner is warming up...',
                details: 'The browser engine (Puppeteer) is still being installed in the background. Please try again in 2-3 minutes.'
            });
        }

        const browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Crucial for Render/Docker to prevent memory crashes
                '--disable-gpu',
                '--no-zygote',
                '--single-process'
            ]
        });
        const page = await browser.newPage();

        const start = Date.now();
        // Increased timeout to 60s and changed waitUntil for heavy sites like YouTube
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const end = Date.now();

        // Use browser performance API from the target page
        const performanceData = await page.evaluate(() => {
            const timing = performance.getEntriesByType('navigation')[0];
            return {
                loadTime: (timing.loadEventEnd / 1000).toFixed(2),
                domReady: (timing.domContentLoadedEventEnd / 1000).toFixed(2)
            };
        });

        await browser.close();

        res.json({
            url,
            loadTime: performanceData.loadTime,
            totalDuration: ((end - start) / 1000).toFixed(2),
            timestamp: new Date()
        });
    } catch (err) {
        console.error('Scan error:', err.message);
        res.status(500).json({ error: 'Failed to scan URL', details: err.message });
    }
});

module.exports = router;
