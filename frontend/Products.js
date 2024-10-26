export class Products{

    /*Load all the products from the database and return them
      to a {title,price,id,image,quantity} form */
    static async getProducts(){
        try{
            //let result= await fetch('products2.json');
            let result = await fetch('http://localhost:5000/products'); // by default it's a GET request
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

    static async insertNewProduct(productData){
        // Insert the product into the database
        // `productData` should be a json object!
        try{
            const response = await fetch('http://localhost:5000/products', {
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
            await fetch(`http://localhost:5000/products/${productId}`, {
                method: 'DELETE'
            });

        }catch{
            console.error('Error at deleting product with id:' , productId);
        }
    }

    static async updateProduct(id , updatedProductData){

        try{
            await fetch(`http://localhost:5000/products/${id}`, {
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