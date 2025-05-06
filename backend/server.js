// server.js
// A simple REST API using Node.js, Express, and a JSON file as a data store

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3003;

// Middleware to parse JSON bodies
app.use(express.json());

// Path to data file
const DATA_FILE = path.join(__dirname, './data/products.json');
const META_FILE = path.join(__dirname, './data/attribute_meta.json');

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

// Helper: read attribute meta data from JSON file
function readMetaData() {
  try {
    const json = fs.readFileSync(META_FILE, 'utf8');
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

// GET /meta - list attribute metadata
app.get('/meta', (req, res) => {
  const meta = readMetaData();
  res.json(meta);
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

// GET /product - paginated products
app.get('/product', (req, res) => {
  const items = readData();
  const meta = readMetaData(); // Use readMetaData() instead of readData()
  
  // Parse pagination params
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.page_size, 10) || 10;
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const start = (page - 1) * pageSize;
  const end = page * pageSize;
  
  // Get paginated items and transform them
  const paginatedItems = items.slice(start, end).map(product => {
    // Create a copy of the product
    const transformedProduct = { ...product };
    
    /** At the moment this function is for the color */
    if (transformedProduct.attributes) {
      const transformedAttributes = [];
      
      // Process each attribute
      Object.entries(transformedProduct.attributes).forEach(([attrKey, attrValue]) => {
        // Find metadata for this attribute
        const attributeMeta = meta.find(m => m.code === attrKey);
        
        if (attributeMeta && attrValue) {
          // Split comma-separated values
          const values = attrValue.split(',');
          
          // Create an object for each value
          values.forEach(value => {
            if (value.trim()) {
              transformedAttributes.push({
                name: attributeMeta.name, // Use friendly name from metadata
                value: value.trim().charAt(0).toUpperCase() + value.trim().slice(1) // Capitalize first letter
              });
            }
          });
        }
      });
      
      // Replace the original attributes with transformed attributes
      transformedProduct.formattedAttributes = transformedAttributes;
    }
    
    return transformedProduct;
  });
  
  res.json({
    products: paginatedItems,
    page,
    totalPages
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`REST API listening on http://localhost:${PORT}`);
});
