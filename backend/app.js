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



/******************************* CREATE ENDPOINTS-ROUTES *************************/

//get all products
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


//insert new product
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



/******************************* INITIALIZE APP , TO LISTEN ON 5000 PORT *************************/
app.listen(process.env.PORT , () => console.log("app is running"));