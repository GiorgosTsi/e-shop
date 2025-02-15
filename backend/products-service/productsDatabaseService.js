const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

let instance = null;

let client = new Client({
    host: process.env.PGHOST, // Access environment variables using process.env
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT
});

// Connect to the PostgreSQL database
client.connect((err) => {
    if (err) {
        console.error('Connection error', err.stack); // Log any connection errors
    } else {
        console.log('Connected to the database'); // Log successful connection
    }
});




/* All functionality of the database is offered by the DbService class */

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async initialize(){
        try {

            // Create the products table IF does not exist:
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS products (
                    id SERIAL PRIMARY KEY, 
                    title VARCHAR(255) NOT NULL, 
                    price REAL NOT NULL, 
                    image VARCHAR(255), 
                    quantity INT NOT NULL,
                    seller_username VARCHAR(255) NOT NULL
                );
            `;

            const tableExistsQuery = `
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'products'
            );`;

            const exist_result = await client.query(tableExistsQuery);

            if (!exist_result.rows[0].exists) {
                // Create 'products' table because doesnt exist
                await client.query(createTableQuery);
                console.log("Table 'products' created!");
    
                // Insert initial data into the 'products' table
                const insertProductsQuery = `
                    INSERT INTO products (title, price, image, quantity, seller_username) VALUES 
                    ('Macbook Air M1', 1100.00, './images/prod1.jpeg', 1 , 'giwrghs tsik'),
                    ('Macbook Air M2', 1300.00, './images/prod2.jpg', 0, 'giwrghs tsik'),
                    ('Macbook Air M3', 1400.00, './images/prod3.jpg', 2, 'giwrghs tsik'),
                    ('Lenovo IdeaPad', 500.00, './images/prod4.jpg', 10, 'giwrghs tsik'),
                    ('Lenovo ThinkPad', 890.00, './images/prod5.png', 10, 'giwrghs tsik'),
                    ('HP ProBook', 1000.00, './images/prod6.jpg', 10, 'giwrghs tsik'),
                    ('MSI noteBook', 1399.99, './images/prod7.jpg', 10, 'giwrghs tsik'),
                    ('MSI gaming laptop', 2000.00, './images/prod8.jpg', 10, 'giwrghs tsik'),
                    ('Asus ZenBook', 950.00, './images/prod9.jpeg', 5, 'giwrghs tsik'),
                    ('Lenovo Gaming', 1560.55, './images/prod10.jpeg', 15, 'giwrghs tsik'),
                    ('Asus TUF', 1200.00, './images/prod11.jpeg', 20, 'giwrghs tsik'),
                    ('Huawei Matebook', 849.99, './images/prod12.jpeg', 30, 'giwrghs tsik');
                `;
                await client.query(insertProductsQuery);
                console.log("Initial products added to the database!");
            } else {
                console.log("Table 'products' already exists. Skipping initialization.");
            }

            const res = await this.getAllData(); 
            console.log(res);
      
        } catch(error){
            console.log("Error at creation of products table!", error);
            throw error;
        }
    }

    // 1. Get all data from the 'products' table
    //use async to make it a non blocking call
    async getAllData() {
        try {
            const res = await client.query('SELECT * FROM products'); //use await to wait the query to return result(blocking call)
            return res.rows;
        } catch (error) {
            console.log("Error fetching data", error);
            throw error;
        }
    }

    // 2. Insert a new record into 'products' table
    async insertNewProduct(title , price , image , quantity , seller_username) {
        try {
            const res = await client.query(
                'INSERT INTO products (title, price , image , quantity, seller_username) VALUES ($1, $2 , $3 , $4 , $5) RETURNING *',
                [title , price , image , quantity , seller_username]
            );
            return res.rows[0];
        } catch (error) {
            console.log("Error inserting data", error);
            throw error;
        }
    }

    // 3. Delete a record by ID from 'products' table
    async deleteById(id) {
        try {
            const res = await client.query(
                'DELETE FROM products WHERE id = $1 RETURNING *',
                [id]
            );
            return res.rowCount > 0 ? res.rows[0] : null;
        } catch (error) {
            console.log("Error deleting product", error);
            throw error;
        }
    }

    // 4. Update a record by ID in 'products' table
    async updateProduct(id, updates) {
        try {
            // Destructure the updates object to get the fields that need to be updated
            const { title, price, quantity, image } = updates;

            // Build the query dynamically based on which fields are provided
            let updateFields = [];
            let values = [];

            if (title) {
                updateFields.push('title = $' + (values.length + 1));
                values.push(title);
            }
            if (price) {
                updateFields.push('price = $' + (values.length + 1));
                values.push(price);
            }
            if (quantity !== null) {
                updateFields.push('quantity = $' + (values.length + 1));
                values.push(quantity);
            }
            if (image) {
                updateFields.push('image = $' + (values.length + 1));
                values.push(image);
            }

            // If there are no fields to update, return an error
            if (updateFields.length === 0) {
                throw new Error('No valid fields provided for update.');
            }

            // Add the ID to the values array and build the final query
            const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${values.length + 1} RETURNING *`;
            values.push(id); // Add product ID as the last value

            // Execute the query and return the updated row
            const result = await client.query(query, values);

            if (result.rowCount === 0) {
                throw new Error('Product not found.');
            }

            return result.rows[0]; // Return the updated product
        } catch (error) {
            console.error('Error updating product', error);
            throw error; // Re-throw the error to be handled by the route
        }
    }

    // 5. Get a specific record by ID
    async getById(id) {
        try {
            const res = await client.query('SELECT * FROM products WHERE id = $1', [id]);
            return res.rows.length ? res.rows[0] : null;
        } catch (error) {
            console.log("Error fetching product by ID", error);
            throw error;
        }
    }

    // 6. Get record(s) by title
    async getByTitle(title) {
        try {
            const res = await client.query('SELECT * FROM products WHERE title = $1', [title]);
            return res.rows.length ? res.rows[0] : null;
        } catch (error) {
            console.log("Error fetching products by title", error);
            throw error;
        }
    }

    // 7. Get record(s) by seller_username
    async getByUsername(seller_username) {
        try {
            const res = await client.query('SELECT * FROM products WHERE seller_username = $1', [seller_username]);
            return res.rows.length ? res.rows : null;
        } catch (error) {
            console.log("Error fetching products by username", error);
            throw error;
        }
    }

    // 8. Check product quantities for an order and update them if possible
    async checkAndProcessOrder(order) {
        try {
            // Extract the products array from the order
            const { products } = order;

            // Iterate over each product in the order
            for (const item of products) {
                const { product_id, amount } = item;

                // Fetch the current quantity of the product from the database
                const product = await this.getById(product_id);

                if (!product) {
                    console.log(`Product with ID ${product_id} not found.`);
                    return false; // Product doesn't exist
                }

                if (product.quantity < amount) {
                    console.log(`Insufficient stock for product ID ${product_id}. Requested: ${amount}, Available: ${product.quantity}`);
                    return false; // Not enough quantity
                }

                // Calculate the new quantity and update the database
                const newQuantity = product.quantity - amount;
                console.log('newQuantity is ', newQuantity);
                await this.updateProduct(product_id, { quantity: newQuantity });
            }

            // If all products were successfully updated, return true
            console.log("Order processed successfully.");
            return true;
        } catch (error) {
            console.error("Error processing order", error);
            throw error; // Re-throw error to be handled by calling function
        }
    }


    // close the client connection when you're done
    async closeConnection() {
        try {
            await client.end();
            console.log("Database connection closed");
        } catch (error) {
            console.error("Error closing the connection", error);
        }
    }
}

module.exports = DbService;