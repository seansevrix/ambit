const express = require('express');
const router = express.Router();

// Default "/" route
router.get('/', (req, res) => {
    res.send('Ambit API is running...');
});

// "/status" route
router.get('/status', (req, res) => {
    res.json({
        status: "OK",
        service: "Ambit",
        time: new Date().toISOString()
    });
});

module.exports = router;
