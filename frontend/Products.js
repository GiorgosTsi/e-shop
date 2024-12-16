export class Products{

    /*Load all the products from the database and return them
      to a {title,price,id,image,quantity} form */
    static async getProducts(){
        try{
            //let result= await fetch('products2.json');
            let result = await fetch(`${window.config.productsServiceHost}:${window.config.productsServicePort}/products`); // by default it's a GET request
            let products = await result.json();
           
            //let products = data.items; // get the products list of json object // doesnt need anymore on real fetch call

           products = products.map( item => {
            let { id, title, price, image ,quantity } = item;
            id = id.toString(); // convert product id from int to string so you can compare it with DOM id in the html code which is in string format!!
            return {title,price,id,image,quantity};
           });

            return products;
        } catch(error){
            console.error(error); // if data not in json
        }
        
    }


    static async getSellerProducts(seller_username) {
        try {
            const result = await fetch(`${window.config.productsServiceHost}:${window.config.productsServicePort}/products/username/${seller_username}`);
            let products = await result.json();
    
            // Check if the products list is null or undefined
            if (!products || !Array.isArray(products)) {
                console.warn(`No products found for seller: ${seller_username}`);
                return []; // Return an empty array to avoid errors downstream
            }
    
            products = products.map(item => {
                let { id, title, price, image, quantity } = item;
                id = id.toString(); // Convert product id from int to string to match DOM ids
                return { title, price, id, image, quantity };
            });
    
            return products;
        } catch (error) {
            console.error("Error fetching seller's products:", error);
            return []; // Return an empty array in case of any errors
        }
    }

    static async insertNewProduct(productData){
        // Insert the product into the database
        // `productData` should be a json object!
        try{
            const response = await fetch(`${window.config.productsServiceHost}:${window.config.productsServicePort}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            const result = await response.json();
            console.log('Product added successfully:', result);
            return result;

        } catch(error){
            console.log(error);
        }
    }

    static async deleteProduct(productId){

        try{
            await fetch(`${window.config.productsServiceHost}:${window.config.productsServicePort}/products/${productId}`, {
                method: 'DELETE'
            });

        }catch{
            console.error('Error at deleting product with id:' , productId);
        }
    }

    static async updateProduct(id , updatedProductData){

        try{
            await fetch(`${window.config.productsServiceHost}:${window.config.productsServicePort}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedProductData)
            });

        }catch{
            console.error('Error at updating product with id:' , id);
        }
    }

    
}