//variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

let cart = [] // main cart array!

//getting products class
class Products{

    /*Load all the products from the json file and return them
      to a {title,price,id,image} form */
    async getProducts(){
        try{
            let result= await fetch('products.json');
            let data = await result.json()
            let products = data.items;

            products = products.map(item =>{
                const {title,price} = item.fields;
                const id = item.sys
                const image = item.fields.image.fields.file.url;
                return {title,price,id,image}
            })
            return products;
        } catch(error){
            console.log(error); // if data not in json
        }
        
    }
}

//ui class - display products
class UI {

    //method to display the products on DOM
    displayProducts(products){
        let resultHTML = '';
        products.forEach(product => {

            //use string literal for final product html
            resultHTML += `
            <!-- single product-->
             <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fa fa-shopping-cart"></i>
                        add to bag
                    </button>
                </div>
                <h3 >${product.title}</h3>
                <h4>${product.price}$</h4>
            </article>
            <!-- end of single product-->
            `
            
        });
        //all the above should be placed inside product center dom
        productsDOM.innerHTML = resultHTML;
    }
}

//local storage class
class Storage{

}


//event listener is activated when page is loaded(DOM loaded)
document.addEventListener("DOMContentLoaded" , ()=>{

    const ui = new UI();
    const products = new Products();

    //get all products from json.
    products.getProducts().then(products => ui.displayProducts(products));
})