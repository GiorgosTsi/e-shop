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
                    quantity INT NOT NULL
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
                    INSERT INTO products (title, price, image, quantity) VALUES 
                    ('Macbook Air M1', 1100.00, './images/prod1.jpeg', 1),
                    ('Macbook Air M2', 1300.00, './images/prod2.jpg', 0),
                    ('Macbook Air M3', 1400.00, './images/prod3.jpg', 2),
                    ('Lenovo IdeaPad', 500.00, './images/prod4.jpg', 10),
                    ('Lenovo ThinkPad', 890.00, './images/prod5.png', 10),
                    ('HP ProBook', 1000.00, './images/prod6.jpg', 10),
                    ('MSI noteBook', 1399.99, './images/prod7.jpg', 10),
                    ('MSI gaming laptop', 2000.00, './images/prod8.jpg', 10);
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
    async insertNewProduct(title , price , image , quantity) {
        try {
            const res = await client.query(
                'INSERT INTO products (title, price , image , quantity) VALUES ($1, $2 , $3 , $4) RETURNING *',
                [title , price , image , quantity]
            );
            return res.rows[0];
        } catch (error) {
            console.log("Error inserting data", error);
            throw error;
        }
    }

    // 3. Delete a record by ID from 'names' table
    async deleteById(id) {
        try {
            const res = await client.query(
                'DELETE FROM names WHERE id = $1 RETURNING *',
                [id]
            );
            return res.rowCount > 0 ? res.rows[0] : null;
        } catch (error) {
            console.log("Error deleting data", error);
            throw error;
        }
    }

    // 4. Update a record by ID in 'names' table
    async updateById(id, newName) {
        try {
            const res = await client.query(
                'UPDATE names SET name = $1 WHERE id = $2 RETURNING *',
                [newName, id]
            );
            return res.rows[0];
        } catch (error) {
            console.log("Error updating data", error);
            throw error;
        }
    }

    // 5. Get a specific record by ID
    async getById(id) {
        try {
            const res = await client.query('SELECT * FROM names WHERE id = $1', [id]);
            return res.rows.length ? res.rows[0] : null;
        } catch (error) {
            console.log("Error fetching data by ID", error);
            throw error;
        }
    }

    // 6. Get a specific record(s) by name
    async getByName(name) {
        try {
            const res = await client.query('SELECT * FROM names WHERE name = $1', [name]);
            return res.rows.length ? res.rows[0] : "";
        } catch (error) {
            console.log("Error fetching data by name", error);
            throw error;
        }
    }

    // Optional: close the client connection when you're done
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