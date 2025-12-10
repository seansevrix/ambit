// backend/controllers/opportunityController.js

const opportunityModel = require("../models/opportunity");

// GET /api/opportunities
function getAll(req, res) {
  const all = opportunityModel.getAll();
  res.json(all);
}

// GET /api/opportunities/:id
function getOne(req, res) {
  const id = Number(req.params.id);
  const opp = opportunityModel.getById(id);

  if (!opp) {
    return res.status(404).json({ message: "Opportunity not found" });
  }

  res.json(opp);
}

// POST /api/opportunities
function create(req, res) {
  const created = opportunityModel.add(req.body || {});
  res.status(201).json(created);
}

module.exports = {
  getAll,
  getOne,
  create
};
