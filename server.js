const express = require('express');
const app = express();

const PORT = 3000;

// Import routes
const routes = require('./routes/index');

// Use routes
app.use('/', routes);

app.listen(PORT, () => {
    console.log(`Ambit server running on http://localhost:${PORT}`);
});
