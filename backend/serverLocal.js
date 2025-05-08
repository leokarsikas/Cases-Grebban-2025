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
          values.forEach(value => {  //iterates through every color
            const trimmedValue = value.trim();
            if (trimmedValue) {
              // Find the matching value in the metadata
              const codeValue = attributeMeta.values.find(v => v.code === trimmedValue); //maps the {name: "White, code: "white"}
              
              let displayValue;
              
              // Special handling for hierarchical categories (with underscores)
              if (attrKey === 'cat' && trimmedValue.split('_').length === 3) {
                // For codes like cat_2_2, extract parent code (cat_2)
                const parts = trimmedValue.split('_');
                const parentCode = `${parts[0]}_${parts[1]}`;
                
                // Find both category names
                const parentValue = attributeMeta.values.find(v => v.code === parentCode);
                
                if (parentValue && codeValue) {
                  // Format as "Parent > Child"
                  displayValue = `${parentValue.name} > ${codeValue.name}`;
                } else {
                  displayValue = codeValue ? codeValue.name : trimmedValue;
                }
              } else {
                // Normal handling 
                displayValue = codeValue ? codeValue.name : trimmedValue;
              }
              
              transformedAttributes.push({
                name: attributeMeta.name, 
                value: displayValue
              });
            }
          });
        }
      });
      
      // Replace the original attributes with transformed attributes
      transformedProduct.attributes = transformedAttributes;
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

module.exports = app; 