const request = require('supertest');
const app = require('../serverLocal'); 
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
            p => p.attributes && p.attributes.length
        );

        if (productWithAttributes) {
            const attributes = productWithAttributes.attributes[0];
            expect(attributes).toHaveProperty('name');
            expect(attributes).toHaveProperty('value');
        }
    });

    
    it('calculates totalPages correctly based on pageSize', async () => {
        // First, get all products to determine the total count
        const allProductsResponse = await request(app).get('/items');
        const totalItemCount = allProductsResponse.body.length;

        
        const testPageSize = 5; 
        const response = await request(app).get(`/product?page_size=${testPageSize}`);

        // Calculate expected pages
        const expectedTotalPages = Math.ceil(totalItemCount / testPageSize);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('totalPages');
        expect(response.body.totalPages).toBe(expectedTotalPages);

    
        expect(response.body.products.length).toBeLessThanOrEqual(testPageSize);


        const NegativeTestSize = await request(app).get('/product?page=1&page_size=-1');
        expect(NegativeTestSize.statusCode).toBe(400);
        expect(TestPageZero.body).toHaveProperty("Invalid input:");
    });

    it('formats hierarchical categories correctly with proper parent-child structure', async () => {
        const metadata = readMetaData();
        const categoryMeta = metadata.find(m => m.code === 'cat');
        const response = await request(app).get('/product');


        // Find a product with a hierarchical category (cat_X_Y format)
        const productWithHierarchy = response.body.products.find(p => {
            if (!p.attributes || !p.attributes.cat) return false;
            return p.attributes.cat.match(/_\d+_\d+$/); // Matches cat_X_Y pattern
        });

        console.log("productwithHierarchy", productWithHierarchy)

        if (productWithHierarchy && productWithHierarchy.attributess) {
            // Get the raw category code, in this case ("cat_2_2")
            const categoryCode = productWithHierarchy.attributes.cat;

            // Parse parent and child codes
            const parts = categoryCode.split('_');
            const parentCode = `${parts[0]}_${parts[1]}`;
            
            const parentValue = categoryMeta.values.find(v => v.code === parentCode);
            const childValue = categoryMeta.values.find(v => v.code === categoryCode);

            // Find the formatted category in the response
            const catAttribute = productWithHierarchy.attributess.find(
                a => a.name === 'Category'
            );

            // Verify exact format: "Parent > Child"
            const expectedFormat = `${parentValue.name} > ${childValue.name}`;
            expect(catAttribute).toBeDefined();
            expect(catAttribute.value).toBe(expectedFormat);
        } else {
            
            console.log('No hierarchical categories found in the first page of products');
        }
    });
});