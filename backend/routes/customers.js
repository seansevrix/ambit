// backend/routes/customers.js
const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

// GET /api/customers
router.get("/", customerController.getAllCustomers);

// GET /api/customers/:id
router.get("/:id", customerController.getCustomerById);

// POST /api/customers
router.post("/", customerController.createCustomer);

module.exports = router;
