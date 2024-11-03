/*local storage class
* Users data and orders are gonna be stored in Local Storage of the browser.
* You can also use cookies..
*/
export class Storage{

    static saveProducts(products){
        /*Take as parameter the products array */
        localStorage.setItem("products",JSON.stringify(products));
    }

    static getProducts(){
        return localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')) : [];

    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        let product =  products.find(product => product.id === id);
        const { quantity, ...productWithoutQuantity } = product; // Destruct and exclude "quantity"
        return productWithoutQuantity; // Return the modified object
    }

    static getProductQuantity(id){
        let products = JSON.parse(localStorage.getItem('products'));
        let product =  products.find(product => product.id === (id));
        return product.quantity;
    }

    static saveCart(cart){
        localStorage.setItem('cart',JSON.stringify(cart));
    }

    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}