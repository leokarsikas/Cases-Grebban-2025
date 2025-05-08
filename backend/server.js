const axios = require('axios')
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3003;


app.use(express.json());


const PRODUCTS_URL = 'https://draft.grebban.com/backend/products.json';
const META_URL = 'https://draft.grebban.com/backend/attribute_meta.json';

async function fetchData() {
  try {
    const response = await axios.get(PRODUCTS_URL);
    return response.data;
  } catch (err) {
    console.error('Error fetching products data:', err.message);
    return []; // Return empty array on error
  }
}

async function fetchMetaData() {
  try {
    const response = await axios.get(META_URL);
    return response.data;
  } catch (err) {
    console.error('Error fetching metadata:', err.message);
    return []; // Return empty array on error
  }
}


// GET /items - list items from product.json
app.get('/items', async (req, res) => {
  try {
    const items = await fetchData();
    res.json(items);
  } catch (err) {
    console.log("Error", err.message)
  }
});

// GET /meta - list attribute metadata_attributes.json
app.get('/meta', async(req, res) => {
  try {
    const meta = await fetchMetaData();
    res.json(meta);
  } catch (err) {
    console.log("Error", err.message)
  }
});

// The logic for the main function
app.get('/product', async (req, res) => {
  const items = await fetchData();
  const meta = await fetchMetaData(); 
  
  const page = parseInt(req.query.page, 10); //extrating from query 
  const pageSize = parseInt(req.query.page_size, 10); //extrating from query 
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const start = (page - 1) * pageSize; //displaying the right items per page
  const end = page * pageSize;

  if(pageSize <= 0){
    return res.status(400).json({
      error: "Invalid input: page_size must be an positive integer"
    });
  }

  if(page < 0){
    return res.status(400).json({
      error: "Invalid input: page must be an positive integer"
    });
  }

  // Get paginated items and transform them
  const paginatedItems = items.slice(start, end).map(product => {  //choosess only products needed for this page
    
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
            const trimmedValue = value.trim();
            if (trimmedValue) {
              // Find the matching value in the metadata
              const codeValue = attributeMeta.values.find(v => v.code === trimmedValue);

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
                // Normal handling for non-hierarchical attributes
                displayValue = codeValue ? codeValue.name : trimmedValue;
              }

              transformedAttributes.push({
                name: attributeMeta.name, // Use friendly name from metadata
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

module.exports = app; //for tests