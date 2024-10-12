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
let buttonsDOM = []

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
                const {id} = item.sys
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
                        add to cart
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

    getBagButtons(){
        const btns = [...document.querySelectorAll(".bag-btn")];//get an array of bag btns
        buttonsDOM = btns;

        //add event listener to every button
        btns.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart){
                button.innerText = "In Cart";
                button.disable = true;
            }
            
            button.addEventListener('click',(event)=>{
                //if the add to cart button is pressed:

                /*1) Display that its added in cart */
                event.target.innerText = "In Cart";
                event.target.disabled = true;

                /*2) Add the product to the cart list(get the prod from localstorage using id) */
                let cartItem = {...Storage.getProduct(id) , amount: 1}; //add also amount to this product
                cart = [...cart,cartItem]; // append the product to the cart array
            
                /*3) Save the updated cart in local storage, so its visible after reload the page */
                Storage.saveCart(cart);

                /*4) Set cart values in cart icon and total Value*/
                this.setCartValues(cart);

                /*5) Update(add html) and Display cart content UI*/
                this.updateCartContent(cartItem);
                this.showCart();

            })
            
         })
    }


    setCartValues(cart){
        
        //cart.map(item => {
        //    tempTotal += item.price * item.amount;
        //    itemsTotal += item.amount;
        //});

        let totalMoney = cart.reduce( (acc , item ) => {
            return acc + item.price * item.amount ;
        } , 0); // 0 is the initial value for the accumulator
        cartTotal.innerText = parseFloat(totalMoney.toFixed(2)); // keep only 2 decimals from total and make it float again from string
        
        let itemsTotal = cart.reduce( (acc , item) => {return item.amount + acc ;} , 0);
        cartItems.innerText = itemsTotal;
    }

    updateCartContent(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = ` <img src=${item.image} alt="product">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>${item.price}$</h5>
                        <span class="remove-item" data-id=${item.id}>Remove</span>
                    </div>
                    <div>
                        <i class="fa fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fa fa-chevron-down" data-id=${item.id}></i>
                    </div>`;

        cartContent.appendChild(div);
    }

    showCart(){
        //to make visible the cart just change visibility to cart overlay
        cartOverlay.classList.add('transparentBcg');//transparentBcg cart just make visibility to visible
        cartDOM.classList.add('showCart');
    }

    setupAPP(){
        /*Method to be used when the dom is loaded.
        * Get the cart from the local storage if it exists,
        * so the items in the cart will not dissapear when page is reloaded.
        */
        //
        cart = Storage.getCart();
        //set the cart values
        this.setCartValues(cart);
        //Construct again the cart page:
        this.populateCart(cart);
        //add event listener to cart  btn
        cartBtn.addEventListener('click',this.showCart);
        //add evemt listener to close btn
        closeCartBtn.addEventListener('click',this.hideCart);

    }

    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }

    populateCart(cart){
        cart.forEach( item => this.updateCartContent(item)); 
    }

    cartLogic(){
        /*Method to add all event listeners for cart logic(remove,increase,decrease) */


        /*
        ** First Line (this.clearCart): The this context inside the clearCart method 
        might not point to the class instance because the function reference is passed directly,
        and JavaScript binds this to the DOM element that triggered the event (in this case, clearCartBtn).

        ** Second Line (() => { this.clearCart(); }): The arrow function ensures that
        the this context remains tied to the class instance because it inherits the lexical
        this from the scope where the arrow function is defined. This is generally safer in class-based event handling.

        We need the 'this' reference to the class instance (because we gonna use it inside the clearCart)
        so we use the second way.
        */
        //clearCartBtn.addEventListener('click',this.clearCart);
        clearCartBtn.addEventListener('click',() => { this.clearCart(); });
    }

    clearCart(){
        let cartItems = cart.map( item => item.id);
        cartItems.forEach( itemID => {
            this.removeItem(itemID);
        });
        while( cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();

    }

    removeItem(id){
        cart = cart.filter( item => item.id !== id); // keep only the items that satisfy the predicate
        
        //remove also the item from cart Content DOM
        //cartContent.removeChild()
        //store the new cart list in local storage:
        Storage.saveCart(cart);

        //reset the add to cart button of this item:
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fa fa-shopping-cart"></i>add to cart`;

        //update total value in cart
        this.setCartValues(cart); //set again #items and total cost.
    }

    getSingleButton(id){
        /*Get the product add to cart button by id */
        return buttonsDOM.find( button => button.dataset.id === id);
    }
}

/*local storage class
* Users data and orders are gonna be stored in Local Storage of the browser.
* You can also use cookies..
*/
class Storage{

    static saveProducts(products){
        /*Take as parameter the products array */
        localStorage.setItem("products",JSON.stringify(products));
    }

    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }

    static saveCart(cart){
        localStorage.setItem('cart',JSON.stringify(cart));
    }

    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}


//event listener is activated when page is loaded(DOM loaded)
document.addEventListener("DOMContentLoaded" , ()=>{

    const ui = new UI();
    const products = new Products();

    /*setupAPP method is used, if cart content in stored in local storage,to setup the app */
    ui.setupAPP();

    //get all products from json and then display them in main page.
    products.getProducts().then(products => {
        ui.displayProducts(products);

        //Store products in local storage.
        Storage.saveProducts(products);
    }
    ).then(()=>{
        ui.getBagButtons();

        //add event listeners to cart buttons
        ui.cartLogic();

    });

    
    
});