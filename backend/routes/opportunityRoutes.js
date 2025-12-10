// backend/routes/opportunityRoutes.js

const express = require("express");
const router = express.Router();

const opportunityController = require("../controllers/opportunityController");

// GET /api/opportunities
router.get("/", opportunityController.getAll);

// GET /api/opportunities/:id
router.get("/:id", opportunityController.getOne);

// POST /api/opportunities
router.post("/", opportunityController.create);

module.exports = router;
