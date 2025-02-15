/* *************HTTP METHODS EXPLANATION ************** 

1) GET:
    Purpose: Retrieve data from the server.

2) POST:
    Purpose: Send data to the server to create a new resource.

3) PUT:
    Purpose: Replace an entire resource or create a resource if it doesn't exist.

4) PATCH:
    Purpose: Partially update a resource.

5) DELETE:
    Purpose: Delete a resource.
*/

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const kafka = require('./kafka'); 
dotenv.config();

const app = express(); //initialize the app
app.use(express.json());// use express.json middleware to automatically parse json in req body as Json object.
app.use(cors());


const OrdersDB = require('./ordersDatabaseService'); // Import the class
const odb = new OrdersDB(); // Instantiate it and initialize it

/************************************************************** CREATE ENDPOINTS-ROUTES FOR COMMUNICATION WITH ORDERS DB **************************************************************/

/* 1) Get all orders */
app.get('/orders', async (req, res) => {
    console.log('get all orders request');
    try {
        const allData = await odb.getAllOrders(); // Call the method to fetch all data
        res.status(200).json(allData); 
        //console.log(allData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve data' });
    }

});

/* 2) Insert new order */
app.post('/orders' , async (req,res) => {
    console.log('insert new order');
    
    const { products, total_price , status , username } = req.body;
    // due to the express.json middleware , json is automatically transformed to js object
    console.log(products);
    console.log(typeof products);
    console.log(total_price);
    console.log(typeof total_price);
    // Validate that required fields are provided
    if (!products || !total_price) {
        return res.status(400).json({ success: false, message: 'Missing required fields: products or total_price' });
    }

    try {
        // Insert the order into the database
        const newOrder = await odb.insertOrder(products, total_price , status , username);

        // Send msg to kafka topic
        const msg = {
            id: newOrder.id, // Correctly extract the order ID
            products: products // Extract products array
        }
    
        await kafka.kafkaProducer(msg)
        
        // Respond with the newly created order details
        res.status(201).json({ success: true, message: 'Order created successfully', order: newOrder });
        console.log('Order inserted succesfully!');
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Error creating order', error: error.message });
    }
});

/* 3) Get all orders for a user */
app.get('/orders/:username', async (req, res) => {
    
    try {
        const { username } = req.params; // Get username from the route parameter
        
        const orders = await odb.getAllOrdersByUsername(username);
        res.status(200).json(orders); 
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});


/******************************* INITIALIZE APP , TO LISTEN ON 5001 PORT *************************/
app.listen(process.env.PORT , () => console.log("app is running at port:" + process.env.PORT ));
