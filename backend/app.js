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
