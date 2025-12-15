const express = require("express");
const router = express.Router();

// POST /track → save tracking event
router.post("/", (req, res) => {
  const data = req.body;

  console.log("Incoming tracking event:", data);

  res.json({
    success: true,
    received: data
  });
});

module.exports = router;
