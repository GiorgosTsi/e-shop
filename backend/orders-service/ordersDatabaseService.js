const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file


// Set up database connection
const client = new Client({
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

class OrdersDB {
    constructor() {
        this.initTable();
    }

    // Initialize the orders table
    async initTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                products JSONB NOT NULL,
                total_price NUMERIC(10, 2) NOT NULL,
                status VARCHAR(10) DEFAULT 'Pending'
            );
        `;
        try {
            await client.query(createTableQuery);
            console.log('Orders table created or already exists');
        } catch (error) {
            console.error('Error creating orders table:', error);
        }
    }

    // Insert a new order
    async insertOrder(products, totalPrice) {
        const insertQuery = `
            INSERT INTO orders (products, total_price, status)
            VALUES ($1, $2, $3) RETURNING *;
        `;
        try {
            const result = await client.query(insertQuery, [products, totalPrice, 'Pending']);
            return result.rows[0];
        } catch (error) {
            console.error('Error inserting order:', error);
            throw error;
        }
    }

    // Delete an order by ID
    async deleteOrder(id) {
        const deleteQuery = `DELETE FROM orders WHERE id = $1 RETURNING *;`;
        try {
            const result = await client.query(deleteQuery, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }

    // Get all orders
    async getAllOrders() {
        const selectQuery = `SELECT * FROM orders;`;
        try {
            const result = await client.query(selectQuery);
            return result.rows;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    // Get a specific order by ID
    async getOrderById(id) {
        const selectQuery = `SELECT * FROM orders WHERE id = $1;`;
        try {
            const result = await client.query(selectQuery, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error fetching order by ID:', error);
            throw error;
        }
    }

    // Update order status by ID
    async updateOrderStatus(id, status) {
        const updateQuery = `
            UPDATE orders SET status = $1 WHERE id = $2 RETURNING *;
        `;
        try {
            const result = await client.query(updateQuery, [status, id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }
}

module.exports = OrdersDB;