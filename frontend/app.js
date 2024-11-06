import {Storage} from './Storage.js';
import {Products} from './Products.js';
import {Orders} from './Orders.js';

// Global variables
const searchBtn = document.querySelector('.search-icon');
const searchBar = document.getElementById('searchBar');

const sidebarBtn = document.querySelector('.menu-icon');
const closeSidebarBtn = document.querySelector('.close-sidebar');
const sidebarOverlay = document.querySelector('.sidebar-overlay');
const sidebarDOM = document.querySelector('.sidebar');

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const checkoutBtn = document.querySelector('.checkout-btn');
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
const addProductForm = document.getElementById('addProductForm');
const submitButton = addProductForm.querySelector('button');
const manageProductsLink = document.querySelector(".sidebar-menu li a[href='#Manage-Products']");
const productsLink = document.querySelector(".sidebar-menu li a[href='#Products']");
const productList = document.getElementById('productList');
const ordersLink = document.querySelector(".sidebar-menu li a[href='#Orders']");
const ordersOverlay = document.querySelector('.orders-overlay');
const closeOrdersBtn = document.querySelector('.close-orders-btn');
const ordersList = document.getElementById('orders-list');




let cart = [] ;// main cart array!
let buttonsDOM = [];
let productFormEditMode = false ; // To know if product form adds new product or updates one

//getting products class


//ui class - display products
class UI {

    //method to display the products on DOM
    displayProducts(products){
        let resultHTML = '';
        const placeholderImage = './images/placeholder.jpg'; // Replace with actual path to your placeholder image

        products.forEach(product => {

            //use string literal for final product html
            resultHTML += `
            <!-- single product-->
             <article class="product">
                <div class="img-container">
                    <img src="${product.image}" alt="product" class="product-img" 
                        onerror="this.onerror=null; this.src='${placeholderImage}';">
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

        //also enable their action listeners , in order to be enabled at every display method call:
        this.initializeAddToBagButtons();
    }

    initializeAddToBagButtons(){
        const btns = [...document.querySelectorAll(".bag-btn")];//get an array of bag btns
        buttonsDOM = btns;

        //add event listener to every button
        btns.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id); // data id is same as product id!
            if(inCart){
                button.innerText = "In Cart";
                button.disabled = true;
            }
            else if( Storage.getProductQuantity(id) <= 0){
                button.innerText = "Out Of Stock";
                button.disabled = true;
            }
            
            /* Event listener should be added to the buttons either way(if in cart or not and if in stock or not),
               so if quantity is updated or the product got removed from the cart,
               add to bag btn to be clickable!!
            */
            button.addEventListener('click',(event)=>{
                event.preventDefault();
                //if the add to cart button is pressed:
                this.handleAddToBag(button , id);

            });
                            
         })
    }

    handleAddToBag(button , itemId){

        // To be here the product is in stock , because if it wasnt the button would not me clickable:

        /*0) Decrease quantity both in DOM and products local storage */
        this.updateQuantity(itemId,-1);

        /*1) Display that its added in cart */
        button.innerText = "In Cart";
        button.disabled = true;

        /*2) Add the product to the cart list(get the prod from localstorage using id) */
        let cartItem = {...Storage.getProduct(itemId) , amount: 1}; //add also amount to this product
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

    showSearchBar(){
        searchBar.style.display = 'block';
        searchBar.focus(); // Set focus to the search bar for user convenience
    }

    hideSearchBar(){
        // Hide the search bar
        searchBar.style.display = 'none';

        // Optionally, clear the search input after hiding
        searchBar.value = '';
    }

    renderOrdersList(orders) {
        // Clear any existing content in the orders list (to prevent duplication)
        ordersList.innerHTML = "";
    
        // Loop through each order and create a table row with order details
        orders.forEach(order => {
            // Create a new table row element
            const row = document.createElement("tr");
    
            // Create table data for each property in the order
            const idCell = document.createElement("td");
            idCell.textContent = order.id;
    
            const productsCell = document.createElement("td");
            productsCell.classList.add("products-order-cell"); 
    
            // Generate HTML for each product, including the image and quantity
            order.products.forEach(p => {
                const productContainer = document.createElement("div");
                productContainer.classList.add("product-order-container"); // For styling each product block
    
                // Retrieve the product data from local storage
                const storedProduct = Storage.getProduct(p.product_id.toString());
                
                // Create an image element for the product
                const productImg = document.createElement("img");
                productImg.src = storedProduct?.image || './images/placeholder.jpg'; // Fallback to placeholder if not found
                productImg.alt = p.title;
                productImg.classList.add("product-order-img");
    
                // Create a span element to show title and amount
                const productInfo = document.createElement("span");
                productInfo.textContent = `${p.title} x${p.amount}`;
    
                // Append image and info to the product container
                productContainer.appendChild(productImg);
                productContainer.appendChild(productInfo);
    
                // Add the product container to the products cell
                productsCell.appendChild(productContainer);
            });
    
            const totalPriceCell = document.createElement("td");
            totalPriceCell.textContent = `$${parseFloat(order.total_price).toFixed(2)}`; // Ensure 2 decimal points
    
            const statusCell = document.createElement("td");
            statusCell.textContent = order.status;
    
            // Append each cell to the row
            row.appendChild(idCell);
            row.appendChild(productsCell);
            row.appendChild(totalPriceCell);
            row.appendChild(statusCell);
    
            // Add the row to the orders list table body
            ordersList.appendChild(row);
        });
    }

    appendOrderList(order) {
        // Create a new table row element
        const row = document.createElement("tr");
    
        // Create table data for each property in the order
        const idCell = document.createElement("td");
        idCell.textContent = order.id;
    
        // Cell for products with images and quantities
        const productsCell = document.createElement("td");
        productsCell.classList.add("products-order-cell");
    
        order.products.forEach(p => {
            const productContainer = document.createElement("div");
            productContainer.classList.add("product-order-container");
    
            // Retrieve product details from local storage
            const storedProduct = Storage.getProduct(p.product_id.toString());
    
            // Create an image element for each product
            const productImg = document.createElement("img");
            productImg.src = storedProduct?.image || './images/placeholder.jpg'; // Use placeholder if no image found
            productImg.alt = p.title;
            productImg.classList.add("product-order-img");
    
            // Create a span element to show the title and amount
            const productInfo = document.createElement("span");
            productInfo.textContent = `${p.title} x${p.amount}`;
    
            // Append the image and info to the product container
            productContainer.appendChild(productImg);
            productContainer.appendChild(productInfo);
    
            // Add the product container to the products cell
            productsCell.appendChild(productContainer);
        });
    
        // Create cell for total price
        const totalPriceCell = document.createElement("td");
        totalPriceCell.textContent = `$${parseFloat(order.total_price).toFixed(2)}`; // Ensure 2 decimal points
    
        // Create cell for order status
        const statusCell = document.createElement("td");
        statusCell.textContent = order.status;
    
        // Append each cell to the row
        row.appendChild(idCell);
        row.appendChild(productsCell);
        row.appendChild(totalPriceCell);
        row.appendChild(statusCell);
    
        // Add the new row to the orders list table body
        ordersList.appendChild(row);
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

            editButton.addEventListener('click', (event) => { event.preventDefault(); this.handleEditProduct(product) ; productFormEditMode = true;});
            deleteButton.addEventListener('click', (event) => {event.preventDefault(); this.handleDeleteProduct(product.id)});
        });
    }

    handleDeleteProduct(id){
        /*1) Remove product from the cart of customer , if exists: */
        let exists = cart.filter(prod => prod.id === id);
        if(exists.length){
            this.removeCartItem(id);
        }
        /*2) Delete product from backend DB */
        Products.deleteProduct(id);

        /*3) Remove the deleted product from products Local Storage */
        let prods = Storage.getProducts();
        prods = prods.filter(prod => prod.id !== id); //keep only the other products
        Storage.saveProducts(prods);

        /*4) Remove the product from products UI */
        this.displayProducts(prods);

        /*5) Remove also the product from manage products section */
        this.renderProductList(prods);

    }

    handleEditProduct(product){
        console.log('On handle edit prod' + product);
        // Pre-fill the form fields with the product details
        document.getElementById('productTitle').value = product.title;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productQuantity').value = product.quantity;
        
        // Remove the 'required' attribute from the image input during update
        document.getElementById('productImage').removeAttribute('required');

        // Change button to update (you can change button text or logic here)
        submitButton.textContent = 'Update Product';

        //Scroll to the form to show user the products info
        addProductForm.scrollIntoView({ behavior: "smooth" });

        // Handle form submission for updating
        addProductForm.onsubmit = async (event) => {
            if(productFormEditMode){
                console.log('On updating method');
                event.preventDefault();

                try {
                    // Capture the updated values from the form
                    const updatedTitle = document.getElementById('productTitle').value;
                    const updatedPrice = document.getElementById('productPrice').value;
                    const updatedQuantity = document.getElementById('productQuantity').value;
                    const productImage = document.getElementById('productImage').files[0];

                     // Validate inputs
                    if (!updatedTitle || updatedPrice <= 0 || updatedQuantity < 0) {
                        alert("Please ensure:\n- Product title is filled in\n- Price is a positive number\n- Quantity is zero or greater");
                        return; // Stop submission if validation fails
                    }

                    let imagePath = product.image; // Keep existing image path unless a new one is uploaded

                    // If a new image is selected, upload it to the server
                    
                    if (productImage) {
                        const formData = new FormData();
                        formData.append('image', productImage);

                        const uploadResponse = await fetch('http://localhost:5000/upload-image', {
                            method: 'POST',
                            body: formData
                        });
                        const uploadData = await uploadResponse.json();
                        imagePath = uploadData.imagePath; // Update the image path with the new one
                    }

                    // Prepare the updated product data
                    const updatedProductData = {
                        title: updatedTitle,
                        price: updatedPrice,
                        quantity: updatedQuantity,
                        image: imagePath
                    };
                  
                    Products.updateProduct(product.id , updatedProductData);

                    // Update the Products list with products new info and re-render the products
                    let storedProducts = Storage.getProducts();
                    updatedProductData.price = Number(updatedProductData.price);
                    updatedProductData.quantity = parseInt(updatedProductData.quantity);
                    let prodId = product.id;
                    const updatedDataDestringed = {
                        title: updatedProductData.title , 
                        price: updatedProductData.price ,
                        id: prodId ,
                        image: updatedProductData.image ,
                        quantity:updatedProductData.quantity};

                    storedProducts = storedProducts.map(p => p.id === product.id ? updatedDataDestringed : p);
                    Storage.saveProducts(storedProducts);

                    //also update the price of the product in the cart array(if existed)
                    const prod = cart.find(item => item.id === prodId);
                    if (prod) {
                        prod.price = updatedProductData.price;
                        this.setCartValues(cart); // Recalculate totals
                        Storage.saveCart(cart);
                    }

                    this.renderProductList(storedProducts); // Re-render the updated list
                    this.displayProducts(storedProducts);

                    this.resetProductForm();

                    //reset the page to view changes:
                    location.reload();
                } catch (error) {
                    console.error('Error updating product:', error);
                }
            }
        };
    }

    resetProductForm(){
        // Reset the form to add new product state
        addProductForm.reset();
        submitButton.textContent = 'Add Product'; // Change the button back to "Add Product"
        productFormEditMode = false //reset the editMode to insert mode
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
            this.displayProducts(Storage.getProducts()); // re-load the products, because maybe before a search is made.
            prodSection.scrollIntoView({ behavior: "smooth" });
            this.hideSidebar();
        });

        
    
        // Show manage products panel when "Manage Products" is clicked
        manageProductsLink.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default anchor link behavior
            manageProductsOverlay.classList.add("transparentBcgManage");
            manageProductsDOM.classList.add("showManageProducts");
            document.body.classList.add('no-scroll'); // Disable background scroll
        });

        // Close manage products panel when close button is clicked
        closeManageProductsBtn.addEventListener("click", () => {
            manageProductsOverlay.classList.remove("transparentBcgManage");
            manageProductsDOM.classList.remove("showManageProducts");
            document.body.classList.remove('no-scroll'); // Re-enable background scroll
            this.resetProductForm(); //reset the form if its not already setted to `add product`.
        });

        // Add event listener to the new product Form on submit
        addProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            // if the editMode var is false , then submit form means add new product!
            if ( ! productFormEditMode){
                try{
                    await this.addNewProduct();
                    this.resetProductForm(); // reset the form after the new insertion.
                    //reset the page to view changes:
                    location.reload();
                } catch{
                    console.error('Error at product Insertion');
                }
            }
        });

        // Show Orders panel when "Orders" in menu is clicked
        ordersLink.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default anchor link behavior
            ordersOverlay.style.display = 'flex';
            document.body.classList.add('no-scroll'); // Disable background scroll
        });

        closeOrdersBtn.addEventListener("click" , (event)=> {
            event.preventDefault(); 
            ordersOverlay.style.display = 'none'; // hide the orders panel
            document.body.classList.remove('no-scroll'); // Re-enable background scroll
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
        //add event listener to checkout btn in the cart section
        checkoutBtn.addEventListener('click',() => {this.handleCheckout();});
        //add event listener to sidebar btn
        sidebarBtn.addEventListener('click',this.showSidebar);
        //add evemt listener to close sidebar btn
        closeSidebarBtn.addEventListener('click',this.hideSidebar);
        //add event listener to search button in navbar
        searchBtn.addEventListener('click', this.showSearchBar);
        //add event listener when enter is pressed in search bar
        searchBar.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') { // Check if the Enter key was pressed
                event.preventDefault(); // Prevent form submission or default Enter behavior
                const prodTitle = event.target.value;
                this.searchProducts(prodTitle); // Call the search function
                this.hideSearchBar();//reset the search input bar
            }
        });
        
    }

    
    async handleCheckout(){
        if(cart.length <= 0){
            console.log('No products added in cart to procceed to checkout');
            return;
        }
        
        console.log('proceed to checkout..');
        const cartItems = Storage.getCart();
            
        /* Now we need to construct the order object:
               
            Order object contains: 
            { products: [list of products] , total_price : price}
        */
        const total_price = parseFloat(cartTotal.innerHTML);

        const products = cartItems.map(item => ({    
        title: item.title,
        amount: item.amount,
        product_id: parseInt(item.id)
        }));
            
        const order = { products , total_price}; //JS object. To be stringified in order to passed as request body.

        try {
            const response = await Orders.insertOrder(order); // Await the promise result
                
            const responseData = await response.json(); // Parse the JSON response

            if (responseData.success) {
                console.log('Order placed successfully');
                //this.clearCart(); // Optional: Clear the cart if the order is successful
                //add order to the OrdersList section
                this.appendOrderList(responseData.order);
                
            } else {
                console.log('Order placement failed:', responseData.message);
            }
        } catch (error) {
            console.error('Error placing order:', error);
        }
        
    }

    searchProducts(title){
        let productsCollection = Storage.getProducts();
        let answer = productsCollection.filter(product => 
            product.title.toLowerCase().includes(title.toLowerCase()));
        this.displayProducts(answer);
        productsDOM.scrollIntoView({ behavior: "smooth" });
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
                this.removeCartItem(id);
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
                    this.removeCartItem(id);
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
            this.removeCartItem(itemID);
        });
    }

    removeCartItem(id){
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
        if( button ){
            button.disabled = false;
            button.innerHTML = `<i class="fa fa-shopping-cart"></i>add to cart`;
        }
        
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
         
          // Validate inputs
         if (!productTitle || productPrice <= 0 || productQuantity < 0) {
            alert("Please ensure:\n- Product title is filled in\n- Price is a positive number\n- Quantity is zero or greater");
            return; // Stop submission if validation fails
         }
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
             console.log(productData);
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
        // Store products in local storage
        Storage.saveProducts(products);
        ui.displayProducts(products); //display products in main page
        ui.renderProductList(products);//display products in manage products section
        }).then(() => {
            ui.cartLogic();
            /*Load the orders from Orders DB and display them in the hidden orders panel */
            let orders = Orders.getAllOrders();
            orders.then(orders => {
                //console.log(orders);
                ui.renderOrdersList(orders);
            });
        });

    } else {
        // If products are already in local storage
        ui.displayProducts(products);
        ui.renderProductList(products);
        // Call methods directly without waiting for a Promise
        ui.cartLogic();
        /*Load the orders from Orders DB and display them in the hidden orders panel */
        let orders = Orders.getAllOrders();
        orders.then(orders => {
            //console.log(orders);
            ui.renderOrdersList(orders);
        });
    }


});