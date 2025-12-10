// backend/controllers/customerController.js
const Customer = require("../models/customer");

async function getAllCustomers(req, res) {
  const customers = Customer.getAll();
  res.json(customers);
}

async function getCustomerById(req, res) {
  const id = parseInt(req.params.id, 10);
  const customer = Customer.getById(id);

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  res.json(customer);
}

async function createCustomer(req, res) {
  try {
    const customerData = req.body;

    if (!customerData.name) {
      return res.status(400).json({ message: "name is required" });
    }

    const newCustomer = Customer.add(customerData);
    res.status(201).json(newCustomer);
  } catch (err) {
    console.error("Error creating customer", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer
};
