const express = require('express');
const router = express.Router();

// Example: List all users (static for now)
router.get('/', (req, res) => {
  res.json({
    users: [
      { id: 1, name: "Sean" },
      { id: 2, name: "Test User" }
    ]
  });
});

module.exports = router;
