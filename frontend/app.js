// Global variables

const sidebarBtn = document.querySelector('.menu-icon');
const closeSidebarBtn = document.querySelector('.close-sidebar');
const sidebarOverlay = document.querySelector('.sidebar-overlay');
const sidebarDOM = document.querySelector('.sidebar');

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
const bannerBtn = document.querySelector('.banner-btn');
const prodSection = document.querySelector('.products');

const manageProductsOverlay = document.querySelector(".manage-products-overlay");
const manageProductsDOM = document.querySelector(".manage-products");
const closeManageProductsBtn = document.querySelector(".close-manage-products");
const addProductBtn = document.querySelector(".add-product-btn");
const addProductForm = document.getElementById('addProductForm');
const manageProductsLink = document.querySelector(".sidebar-menu li a[href='#Manage-Products']");
const productsLink = document.querySelector(".sidebar-menu li a[href='#Products']");
const productList = document.getElementById('productList');


let cart = [] // main cart array!
let buttonsDOM = []

//getting products class
class Products{

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
                <div class="quantity">
                    Quantity: <span>${product.quantity}</span>
                </div>
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
            
            if( Storage.getProductQuantity(id) <= 0){
                button.innerText = "Out Of Stock";
                button.disable = true;
            }

            button.addEventListener('click',(event)=>{
                //if the add to cart button is pressed:
                
                let quantity = Storage.getProductQuantity(id);
                
                //redundant if because its not clickable anymore
                if ( quantity <= 0){
                    console.log(quantity);
                    console.log("Out of stock");
                    event.target.innerText = "Out Of Stock";
                    event.target.disabled = true;
                    return;
                }

                // the product is in stock:

                /*0) Decrease quantity both in DOM and products local storage */
                this.updateQuantity(id,-1);

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

                /*6) Reset the info about the product in manage products section: */
                this.renderProductList(Storage.getProducts());

            })
            
         })
    }

    updateQuantity(id, amount) {
        // 1) Update the quantity in the local storage
        

        // Retrieve products from localStorage
        const products = JSON.parse(localStorage.getItem('products'));
        const productIndex = products.findIndex(product => product.id === id);
        
        if (productIndex !== -1) {
            // Update the quantity (increase or decrease based on the amount parameter)
            products[productIndex].quantity += amount;
    
            // Ensure quantity doesn't fall below 0
            if (products[productIndex].quantity < 0) {
                products[productIndex].quantity = 0;
            }
    
            // Save the updated products array to localStorage
            localStorage.setItem('products', JSON.stringify(products));
        }
    
        // 2) Update the quantity DOM element visually:
    
        // Locate the product element with the given id
        const productElement = document.querySelector(`[data-id="${id}"]`).closest('.product');
    
        if (productElement) {
            // Locate the quantity span element in the product card
            const quantityElement = productElement.querySelector('.quantity span');
            
            // Update the displayed quantity
            if (quantityElement) {
                quantityElement.innerText = products[productIndex].quantity; // Update the displayed quantity
            }
        }
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
        document.body.classList.add('no-scroll'); // Disable background scroll
    }

    showSidebar(){
        //to make visible the cart just change visibility to cart overlay
        sidebarOverlay.classList.add('showOverlay');
        sidebarDOM.classList.add('showSidebar');
        document.body.classList.add('no-scroll'); // Disable background scroll
    }

    renderProductList(products){
        productList.innerHTML = ''; // Clear the existing list

        products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.classList.add('product-item');
            productItem.innerHTML = `
            <div class="product-details">
                <img src="${product.image}" alt="${product.title}" class="product-image" />
                <p><strong>${product.title}</strong> - $${product.price} - Qty: ${product.quantity}</p>
            </div>
            <div class="product-actions">
                <button class="manage-btn edit-btn" data-id="${product.id}">Edit</button>
                <button class="manage-btn delete-btn" data-id="${product.id}">Delete</button>
            </div>
        `;
            productList.appendChild(productItem);

            // Add event listeners for Edit and Delete buttons
            const editButton = productItem.querySelector('.edit-btn');
            const deleteButton = productItem.querySelector('.delete-btn');

            editButton.addEventListener('click', () => handleEditProduct(product));
            deleteButton.addEventListener('click', () => handleDeleteProduct(product.id));
        });
    }

    handleDeleteProduct(id){

    }

    handleEditProduct(product){

    }

    setupAPP(){
        /*Method to be used when the dom is loaded.
        * This method setups all the ui , including cart-storage.
        * Get the cart from the local storage if it exists,
        * so the items in the cart will not dissapear when page is reloaded.
        * Also declares event listeners.
        */
        

        /* add event listener to the shop now hero button */
        bannerBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor behavior
        
            // Smooth scroll to the products section
            prodSection.scrollIntoView({
            behavior: 'smooth'
            });
        });

        // Add event listener for click on "Products" link in menu area
        productsLink.addEventListener("click", (event)=> {
            event.preventDefault(); // Prevent the default anchor link behavior
            // Smooth scroll to the products section
            prodSection.scrollIntoView({ behavior: "smooth" });
            this.hideSidebar();
        });

        
    
        // Show manage products panel when "Manage Products" is clicked
        manageProductsLink.addEventListener("click", function(event) {
            event.preventDefault(); // Prevent default anchor link behavior
            manageProductsOverlay.classList.add("transparentBcgManage");
            manageProductsDOM.classList.add("showManageProducts");
            document.body.classList.add('no-scroll'); // Disable background scroll
        });

        // Close manage products panel when close button is clicked
        closeManageProductsBtn.addEventListener("click", function() {
            manageProductsOverlay.classList.remove("transparentBcgManage");
            manageProductsDOM.classList.remove("showManageProducts");
            document.body.classList.remove('no-scroll'); // Re-enable background scroll
        });

        // Add event listener to the new product Form on submit
        addProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            try{
                await this.addNewProduct();
            } catch{
                console.error('Error at product Insertion');
            }
        });
        
        cart = Storage.getCart();
        //set the cart values
        this.setCartValues(cart);
        //Construct again the cart page:
        this.populateCart(cart);
        //add event listener to cart  btn
        cartBtn.addEventListener('click',this.showCart);
        //add evemt listener to close btn
        closeCartBtn.addEventListener('click',this.hideCart);
        //add event listener to sidebar btn
        sidebarBtn.addEventListener('click',this.showSidebar);
        //add evemt listener to close sidebar btn
        closeSidebarBtn.addEventListener('click',this.hideSidebar);
    }

    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
        document.body.classList.remove('no-scroll'); // Disable background scroll
    }

    hideSidebar(){
        sidebarOverlay.classList.remove('showOverlay');
        sidebarDOM.classList.remove('showSidebar');
        document.body.classList.remove('no-scroll'); // Disable background scroll
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

        //add event listener for remove, increase , decrease buttons
        //we are gonna use bubble listener.Listener for the whole cart content.
        cartContent.addEventListener('click' , event=>{
            
            // if remove button is pressed:
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;

                //remove item from the cart(local storage and DOM also!)
                this.removeItem(id);
            }
            //if increase button is pressed:
            else if(event.target.classList.contains('fa-chevron-up')){
                let addBtn = event.target;
                let id = addBtn.dataset.id;

                //increase the amount of product in the cart list
                let tempItem = cart.find( item => item.id === id);//find item with id

                if(Storage.getProductQuantity(id) < 1){
                    return;
                }
                tempItem.amount = tempItem.amount + 1 ; //this changes the amount of the item INSIDE the cart list.So it changes the cart list

                this.updateQuantity(id , -1);

                //save the new cart list in the local storage
                Storage.saveCart(cart);

                //update the cart values
                this.setCartValues(cart);

                //also update the value item-amount in DOM
                // class item-amount object is sibling of chevron up object
                addBtn.nextElementSibling.innerText = tempItem.amount;

                /* Reset the info about the product in manage products section: */
                this.renderProductList(Storage.getProducts());


            }
            else if(event.target.classList.contains('fa-chevron-down')){
                let decBtn = event.target;
                let id = decBtn.dataset.id;

                let tempItem = cart.find( item => item.id === id);//find item with id
                
                
                //if amount = 1 we need to remove it from cart
                if( tempItem.amount === 1){
                    console.log("item need to be removed");
                    this.removeItem(id);
                }

                else{
                    //update the amount of product in the cart:
                    tempItem.amount = tempItem.amount - 1 ;

                    //save the new cart list in the local storage
                    Storage.saveCart(cart);

                    //update the cart values
                    this.setCartValues(cart);

                    //update(increase) the quantity of product
                    this.updateQuantity(id , 1);

                    //also update the value item-amount in DOM
                    // class item-amount object is sibling of chevron up object
                    decBtn.previousElementSibling.innerText = tempItem.amount;

                    /* Reset the info about the product in manage products section: */
                    this.renderProductList(Storage.getProducts());
                }
            }
        });
    }

    clearCart(){
        let cartItems = cart.map( item => item.id);
        cartItems.forEach( itemID => {
            this.removeItem(itemID);
        });
    }

    removeItem(id){
        let productAmountToRemove = cart.filter( item => item.id === id)[0].amount;

        /*1) Remove item from the cart */
        cart = cart.filter( item => item.id !== id); // keep only the items that satisfy the predicate
        
        /*2) Remove also the item from cart Content DOM */
        
        // Find the item element in the cartContent DOM by data-id
        //Note that the cart-item is the grandparent of the item with the given data-id
        //so we need to climb up two parent nodes and delete this item, to delete the item from the DOM
        const itemElement = cartContent.querySelector(`[data-id="${id}"]`);
        
        if (itemElement) {
            // Traverse up to the grandparent (parent of parent)
            const parentElement = itemElement.parentElement.parentElement;
    
            // Remove the parent element from cartContent
            cartContent.removeChild(parentElement);
        } else {
            console.log(`Item with id ${id} not found in cartContent`);
        }

        /*3) Store the new cart list in local storage: */
        Storage.saveCart(cart);

        /*4) Reset the add to cart button of this item: */

        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fa fa-shopping-cart"></i>add to cart`;

        /*5) Update total value in cart */
        this.setCartValues(cart); //set again #items and total cost.

        /*6) Reset the quantity of this product: */

        this.updateQuantity(id , productAmountToRemove); // updates both dom and local storage

        /*7) Reset the info about the product in manage products section: */
        this.renderProductList(Storage.getProducts());

    }

    getSingleButton(id){
        /*Get the product add to cart button by id */
        return buttonsDOM.find( button => button.dataset.id === id);
    }

    async addNewProduct(){
         // Create a new FormData object to handle the image upload
         const formData = new FormData();
         const productImage = document.getElementById('productImage').files[0];
         const productTitle = document.getElementById('productTitle').value;
         const productPrice = document.getElementById('productPrice').value;
         const productQuantity = document.getElementById('productQuantity').value;

         // Append the image to the FormData object
         formData.append('image', productImage);
        
         try {
             // First, upload the image to the backend using the image upload endpoint
             const uploadResponse = await fetch('http://localhost:5000/upload-image', {
                 method: 'POST',
                 body: formData
             });

             if (!uploadResponse.ok) {
                 throw new Error('Image upload failed');
             }

             const uploadData = await uploadResponse.json();
             const imagePath = uploadData.imagePath; // Assuming the server returns the file path

             // Once the image is uploaded, submit the product details to the main API
             const productData = {
                 title: productTitle,
                 price: productPrice,
                 image: imagePath, // Use the path of the uploaded image
                 quantity: productQuantity
             };

             const result = await Products.insertNewProduct(productData);

             //Add the product to the local storage products var and display them
             let prods = Storage.getProducts();
             let {id , title , price , image , quantity} = result.data; 
             id = id.toString();
             prods.push({title , price , id , image , quantity });
             Storage.saveProducts(prods);

             //re-display the products to show the new one also
             this.displayProducts(prods);

             //re render the products in the edit panel
             this.renderProductList(prods);


         } catch (error) {
             console.error('Error:', error);
         }

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

    static getProducts(){
        return localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')) : [];

    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        let product =  products.find(product => product.id === id);
        const { quantity, ...productWithoutQuantity } = product; // Destructure and exclude "quantity"
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


//event listener is activated when page is loaded(DOM loaded)
document.addEventListener("DOMContentLoaded" , ()=>{

    const ui = new UI();
    //const products = new Products();

    /*setupAPP method is used, if cart content is stored in local storage,to setup the app */
    ui.setupAPP();

    
    /*If products exist in local storage, it means
      that we have quantities modified , so we need to 
      load this array on reload and not the json file.
    */
    let products = Storage.getProducts();
    
    if (products.length === 0) {
      // If no products in storage, fetch from Products class (which returns a promise)
      products = Products.getProducts();
      products.then(products => {
        ui.displayProducts(products); //display products in main page
        ui.renderProductList(products);//display products in manage products section
        // Store products in local storage
        Storage.saveProducts(products);
        }).then(() => {
              ui.getBagButtons();
              ui.cartLogic();
          });
    } else {
        // If products are already in local storage
        ui.displayProducts(products);
        ui.renderProductList(products);
        // Call methods directly without waiting for a Promise
        ui.getBagButtons();
        ui.cartLogic();
      }
});