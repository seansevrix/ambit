const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Allow JSON body parsing
app.use(express.json());

// Import routes
const indexRoutes = require('./routes/index');
const trackingRoutes = require('./routes/tracking');
const userRoutes = require('./routes/users');

// Register routes
app.use('/', indexRoutes);
app.use('/tracking', trackingRoutes);
app.use('/users', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Ambit server running on http://localhost:${PORT}`);
});