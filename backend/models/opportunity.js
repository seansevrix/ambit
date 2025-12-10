// backend/models/opportunity.js

// Demo in-memory opportunities
const opportunities = [
  {
    id: 1,
    title: 'USACE – Small Construction & Site Work IDIQ',
    agency: 'USACE Rock Island District',
    location: 'Midwest (various sites)',
    naicsCodes: ['237310', '236220'],
    valueEstimate: 250000,
    samLink: 'https://sam.gov/example-idiq-1',
    notes:
      'Typical small construction/site work IDIQ; task orders for grading, concrete, small structures. Good fit for GC / civil subs.',
  },
  {
    id: 2,
    title: 'VA – HVAC Preventive Maintenance BPA',
    agency: 'Department of Veterans Affairs',
    location: 'Phoenix, AZ',
    naicsCodes: ['238220'],
    valueEstimate: 120000,
    samLink: 'https://sam.gov/example-hvac-1',
    notes:
      'Multi-year BPA for preventive maintenance on HVAC systems at a VA facility. Strong fit for commercial HVAC contractors.',
  },
];

function getAll() {
  return opportunities;
}

function getById(id) {
  return opportunities.find((o) => o.id === Number(id));
}

function createOpportunity(data) {
  const nextId = opportunities.length
    ? opportunities[opportunities.length - 1].id + 1
    : 1;

  const newOpp = {
    id: nextId,
    title: data.title,
    agency: data.agency,
    location: data.location || '',
    naicsCodes: data.naicsCodes || [],
    valueEstimate:
      typeof data.valueEstimate === 'number'
        ? data.valueEstimate
        : data.valueEstimate
        ? Number(data.valueEstimate)
        : null,
    samLink: data.samLink || '',
    notes: data.notes || '',
  };

  opportunities.push(newOpp);
  return newOpp;
}

module.exports = {
  getAll,
  getById,
  createOpportunity,
};
