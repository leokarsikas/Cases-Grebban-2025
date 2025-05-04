// server.js
// A simple REST API using Node.js, Express, and a JSON file as a data store

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Path to data file
const DATA_FILE = path.join(__dirname, 'data.json');

// Helper: read data from JSON file
function readData() {
  try {
    const json = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(json);
  } catch (err) {
    if (err.code === 'ENOENT') return []; // file not found => empty list
    throw err;
  }
}

// Helper: write data to JSON file
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET /items - list items, optionally filtered by query parameters
app.get('/items', (req, res) => {
  const items = readData();
  const filters = req.query; // e.g. ?name=foo&category=bar

  // Filter items by matching all provided query fields
  const result = items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      return String(item[key]) === value;
    });
  });

  res.json(result);
});

// GET /items/:id - get a single item by id
app.get('/items/:id', (req, res) => {
  const items = readData();
  const item = items.find(i => String(i.id) === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// POST /items - create a new item
app.post('/items', (req, res) => {
  const items = readData();
  const newItem = req.body;
  // Auto-generate an ID (max existing + 1)
  const maxId = items.reduce((max, i) => Math.max(max, i.id || 0), 0);
  newItem.id = maxId + 1;
  items.push(newItem);
  writeData(items);
  res.status(201).json(newItem);
});

// PUT /items/:id - update an existing item
app.put('/items/:id', (req, res) => {
  const items = readData();
  const idx = items.findIndex(i => String(i.id) === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const updated = Object.assign({}, items[idx], req.body, { id: items[idx].id });
  items[idx] = updated;
  writeData(items);
  res.json(updated);
});

// DELETE /items/:id - remove an item
app.delete('/items/:id', (req, res) => {
  let items = readData();
  const idx = items.findIndex(i => String(i.id) === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const deleted = items.splice(idx, 1)[0];
  writeData(items);
  res.json(deleted);
});

// Start server
app.listen(PORT, () => {
  console.log(`REST API listening on http://localhost:${PORT}`);
});
