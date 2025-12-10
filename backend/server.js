// backend/server.js

const express = require('express');
const cors = require('cors');

const customerModel = require('./models/customer');
const opportunityModel = require('./models/opportunity');

const app = express();
const PORT = process.env.PORT || 5001;

// ----- MIDDLEWARE -----
app.use(cors());
app.use(express.json());

// ----- HEALTH CHECK -----
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'AMBIT backend running' });
});

// ----- CUSTOMERS -----

// Internal engine view of all customers
app.get('/engine/customers', (req, res) => {
  const customers = customerModel.getAll();
  res.json(customers);
});

// Public endpoint used by signup form
app.post('/customers', (req, res) => {
  try {
    const {
      name,
      contactEmail,
      industry,
      location,
      minValue,
      maxValue,
      services,
      samUniqueEntityId,
      notes,
    } = req.body;

    if (!name || !contactEmail) {
      return res
        .status(400)
        .json({ error: 'name and contactEmail are required' });
    }

    const newCustomer = customerModel.createCustomer({
      name,
      contactEmail,
      industry,
      location,
      minValue,
      maxValue,
      services,
      samUniqueEntityId,
      notes,
    });

    res.status(201).json(newCustomer);
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// ----- OPPORTUNITIES -----

// Internal engine view of all opportunities
app.get('/engine/opportunities', (req, res) => {
  const opps = opportunityModel.getAll();
  res.json(opps);
});

// Admin UI creates new opportunities here
app.post('/opportunities', (req, res) => {
  try {
    const {
      title,
      agency,
      location,
      naicsCodes,
      valueEstimate,
      samLink,
      notes,
    } = req.body;

    if (!title || !agency) {
      return res.status(400).json({ error: 'title and agency are required' });
    }

    const newOpp = opportunityModel.createOpportunity({
      title,
      agency,
      location,
      naicsCodes,
      valueEstimate,
      samLink,
      notes,
    });

    res.status(201).json(newOpp);
  } catch (err) {
    console.error('Error creating opportunity:', err);
    res.status(500).json({ error: 'Failed to create opportunity' });
  }
});

// ----- SIMPLE MATCH SCORING -----

function calculateMatchScore(customer, opportunity) {
  let score = 0;

  // Industry keyword in title
  if (customer.industry && opportunity.title) {
    const ci = customer.industry.toLowerCase();
    const title = opportunity.title.toLowerCase();
    if (title.includes(ci)) {
      score += 25;
    }
  }

  // Rough location match
  if (customer.location && opportunity.location) {
    const cl = customer.location.toLowerCase();
    const ol = opportunity.location.toLowerCase();
    if (ol.includes(cl) || cl.includes(ol)) {
      score += 25;
    }
  }

  // Value range
  if (
    typeof customer.minValue === 'number' &&
    typeof customer.maxValue === 'number' &&
    typeof opportunity.valueEstimate === 'number'
  ) {
    if (
      opportunity.valueEstimate >= customer.minValue &&
      opportunity.valueEstimate <= customer.maxValue
    ) {
      score += 25;
    }
  }

  // NAICS overlap (optional)
  if (
    Array.isArray(opportunity.naicsCodes) &&
    Array.isArray(customer.naicsCodes) &&
    opportunity.naicsCodes.some((code) => customer.naicsCodes.includes(code))
  ) {
    score += 25;
  }

  // Floor so demos don’t all show 0
  if (score === 0) score = 30;

  return score;
}

// ----- MATCHES API -----

// This is what the frontend calls: GET /api/matches/:customerId
app.get('/api/matches/:customerId', (req, res) => {
  const rawId = req.params.customerId;
  const allCustomers = customerModel.getAll();

  if (!allCustomers || allCustomers.length === 0) {
    return res.status(500).json({ error: 'No customers configured yet' });
  }

  // Try to parse the ID
  const parsed = Number(rawId);
  let customer = Number.isFinite(parsed)
    ? allCustomers.find((c) => c.id === parsed)
    : null;

  // If not found or not numeric, fall back to first customer
  if (!customer) {
    customer = allCustomers[0];
  }

  const allOpps = opportunityModel.getAll();

  const matches = allOpps.map((opp) => ({
    ...opp,
    matchScore: calculateMatchScore(customer, opp),
  }));

  res.json({
    customer,
    matches,
  });
});

// ----- START SERVER -----
app.listen(PORT, () => {
  console.log(`AMBIT backend running on port ${PORT}`);
});
