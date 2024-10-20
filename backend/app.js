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
dotenv.config();

const app = express(); //initialize the app
app.use(express.json());
app.use(cors());


const productsDbService = require('./productsDatabaseService');
const pdb = productsDbService.getDbServiceInstance();
pdb.initialize() //initialize products table



/************************************************************** CREATE ENDPOINTS-ROUTES FOR PRODUCTS DB **************************************************************/

/* 1) Get all products */
app.get('/products', async (req, res) => {
    console.log('get all products request');
    try {
        const allData = await pdb.getAllData(); // Call the method to fetch all data
        res.status(200).json(allData);
        //console.log(allData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve data' });
    }

});


/* 2) Insert new product */
app.post('/products' , (req,resp) => {
    console.log('insert request');
    const { title , price , image , quantity } = req.body; 
    console.log(title);
    pdb.insertNewProduct(title , price , image , quantity)
        .then(result => {
            resp.status(201).json({
                message: "Data inserted successfully",
                data: result
            });
        })
        .catch(err => {
            console.error(err);
            resp.status(500).json({
                message: "Error inserting data",
                error: err
            });
        }); 
});

/* 3) Get product by id */
app.get('/products/:id', async (req, res) => {
    console.log('get by id route')
    
    try {
        const { id } = req.params; // Get id from the route parameter
        
        const product = await pdb.getById(id);
        
        if (product) {
            res.json({ success: true, data: product });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        console.error("Error fetching product by ID", error);
        res.status(500).json({ success: false, message: 'Server error occurred' });
    }
});


/* 4) Get product by title */
app.get('/products/title/:title', async (req, res) => {
    console.log('get by title route')

    try {
        const { title } = req.params; // Get title from the route parameter.For multiword title you write in the url :Macbook%20Air%20M1.Use %20 for space encoding

        const product = await pdb.getByTitle(title);
        
        if (product) {
            res.json({ success: true, data: product });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        console.error("Error fetching product by title", error);
        res.status(500).json({ success: false, message: 'Server error occurred' });
    }
});


/* 5) Update product's info by id */
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;  // Extract the product ID from the URL
    const updates = req.body;   // The fields you want to update come from the request body

    try {
        // Call the update method.The query will be constructed dynamically , based on the fields given!
        const updatedProduct = await pdb.updateProduct(id, updates);

        res.json({ success: true, message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        console.error('Error updating product', error);
        res.status(500).json({ success: false, message: 'Error updating product', error: error.message });
    }
});


/* 6) Delete product by id */
app.delete('/products/:id', async (req, res) => {
    console.log('Delete product route');

    try {
        const { id } = req.params; // Extract the ID from the route parameters
        
        const result = await pdb.deleteById(id);

        if (result) {
            res.json({ success: true, message: 'Record deleted successfully!' });
        } else {
            res.json({ success: false, message: 'Record not found or deletion failed.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error occurred.' });
    }
});


/******************************* INITIALIZE APP , TO LISTEN ON 5000 PORT *************************/
app.listen(process.env.PORT , () => console.log("app is running"));