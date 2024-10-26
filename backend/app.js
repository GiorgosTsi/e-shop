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
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express(); //initialize the app
app.use(express.json());
app.use(cors());

// Define storage for images using multer
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../frontend/images'),  // Adjust the path to store in the correct directory
    filename: (req, file, cb) => {
        // Create a unique filename by adding a timestamp
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Initialize multer middleware with the storage configuration
const upload = multer({ storage: storage });


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
        // delete the image of this product from the images folder if new image is provided:
        const product = await pdb.getById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Get the image path and delete the image file
        const oldImagePath = product.image; // Assuming 'image' contains the relative path to the image
        if(updates.image && updates.image !== oldImagePath){ // if new image is provided and its a different one:
            
            const fullImagePath = path.join(__dirname, '../frontend', oldImagePath); // Adjust as per your image storage path

            // Check if the image file exists and delete it
            fs.unlink(fullImagePath, (err) => {
                if (err) {
                    console.error(`Failed to delete image: ${err}`);
                    // You may choose to proceed with the product deletion even if image deletion fails
                } else {
                    console.log('Image deleted successfully');
                }
            });
        }
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
        
        //delete the image of this product from the images folder first:
        const product = await pdb.getById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Get the image path and delete the image file
        const imagePath = product.image; // Assuming 'image' contains the relative path to the image
        const fullImagePath = path.join(__dirname, '../frontend', imagePath); // Adjust as per your image storage path

        // Check if the image file exists and delete it
        fs.unlink(fullImagePath, (err) => {
            if (err) {
                console.error(`Failed to delete image: ${err}`);
                // You may choose to proceed with the product deletion even if image deletion fails
            } else {
                console.log('Image deleted successfully');
            }
        });

        //delete the product from the db
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


/************************************************************** CREATE ENDPOINT-ROUTE FOR UPLOADING IMAGE IN THE SERVER **************************************************************/
// Create a new API endpoint for uploading images
app.post('/upload-image', upload.single('image'), (req, resp) => {
    console.log('Image uploading..');
    if (!req.file) {
        return resp.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get the file path of the uploaded image
    const imagePath = `./images/${req.file.filename}`;
    
    // Respond with the image path, so the frontend can use it
    resp.status(200).json({
        message: "Image uploaded successfully",
        imagePath: imagePath
    });
});

/******************************* INITIALIZE APP , TO LISTEN ON 5000 PORT *************************/
app.listen(process.env.PORT , () => console.log("app is running"));