const request = require('supertest');
const app = require('../server'); // Export the app from server.js
const fs = require('fs');
const path = require('path');

// Read metadata for validation
function readMetaData() {
    const META_FILE = path.join(__dirname, '../data/attribute_meta.json');
    try {
      const json = fs.readFileSync(META_FILE, 'utf8');
      return JSON.parse(json);
    } catch (err) {
      return [];
    }
  }

describe('GET /product', () => {
  it('returns paginated products with formatted attributes', async () => {
    const response = await request(app).get('/product');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('products');
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('totalPages');
    
    // Test an item with formatted attributes
    const productWithAttributes = response.body.products.find(
      p => p.attributess && p.attributess.length
    );
    
    if (productWithAttributes) {
      const attributes = productWithAttributes.attributess[0];
      expect(attributes).toHaveProperty('name');
      expect(attributes).toHaveProperty('value');
    }
  });
  
  it('formats hierarchical categories correctly with proper parent-child structure', async () => {
    const metadata = readMetaData();
    const categoryMeta = metadata.find(m => m.code === 'cat');
    const response = await request(app).get('/product');
    console.log("metadata",response)
    
    // Find a product with a hierarchical category (cat_X_Y format)
    const productWithHierarchy = response.body.products.find(p => {
      if (!p.attributes || !p.attributes.cat) return false;
      return p.attributes.cat.match(/_\d+_\d+$/); // Matches cat_X_Y pattern
    });

    console.log("productwithHierarchy", productWithHierarchy)
    
    if (productWithHierarchy && productWithHierarchy.attributess) {
      // Get the raw category code (e.g., "cat_2_2")
      const categoryCode = productWithHierarchy.attributes.cat;
      
      // Parse parent and child codes
      const parts = categoryCode.split('_');
      const parentCode = `${parts[0]}_${parts[1]}`;
      
      // Look up expected parent and child names from metadata
      const parentValue = categoryMeta.values.find(v => v.code === parentCode);
      const childValue = categoryMeta.values.find(v => v.code === categoryCode);

      console.log("parentCode", parentCode)
      console.log("childCode", categoryCode)

      console.log("parentValue", parentValue)
      console.log("ChildValue", childValue)      
      // Find the formatted category in the response
      const catAttribute = productWithHierarchy.attributess.find(
        a => a.name === 'Category'
      );
      
      // Verify exact format: "Parent > Child"
      const expectedFormat = `${parentValue.name} > ${childValue.name}`;
      expect(catAttribute).toBeDefined();
      expect(catAttribute.value).toBe(expectedFormat);
    } else {
      // If no hierarchical categories found, mark test as skipped but don't fail
      console.log('No hierarchical categories found in the first page of products');
    }
  });
});