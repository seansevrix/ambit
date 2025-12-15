// backend/models/customer.js

// Demo in-memory customer list
const customers = [
  {
    id: 1,
    name: 'Sample Construction Co.',
    contactEmail: 'owner@example.com',
    industry: 'Construction',
    location: 'San Diego, CA',
    naicsCodes: ['238220', '236220'],
    minValue: 10000,
    maxValue: 200000,
    services: 'HVAC, small construction, maintenance',
    samUniqueEntityId: 'SAMPLE-UEI-123',
    notes: "Demo customer we'll replace with real Sevrix clients.",
  },
  {
    id: 2,
    name: 'Sample HVAC Services LLC',
    contactEmail: 'hvac@example.com',
    industry: 'HVAC',
    location: 'Boston, MA',
    naicsCodes: ['238220'],
    minValue: 5000,
    maxValue: 80000,
    services: 'Commercial HVAC, maintenance',
    samUniqueEntityId: 'SAMPLE-UEI-456',
    notes: 'Second demo customer for matching tests.',
  },
];

function getAll() {
  return customers;
}

function getById(id) {
  return customers.find((c) => c.id === Number(id));
}

// 👇 used by /customers POST route
function createCustomer(data) {
  const nextId = customers.length ? customers[customers.length - 1].id + 1 : 1;

  const newCustomer = {
    id: nextId,
    name: data.name,
    contactEmail: data.contactEmail,
    industry: data.industry || '',
    location: data.location || '',
    naicsCodes: data.naicsCodes || [],
    minValue: data.minValue ?? null,
    maxValue: data.maxValue ?? null,
    services: data.services || '',
    samUniqueEntityId: data.samUniqueEntityId || '',
    notes: data.notes || '',
  };

  customers.push(newCustomer);
  return newCustomer;
}

module.exports = {
  getAll,
  getById,
  createCustomer,
};
