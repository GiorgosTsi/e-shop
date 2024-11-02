export class Orders{

    static async getAllOrders(){
        try {
            const response = await fetch('http://localhost:5001/orders');
            let orders = await response.json();
            return orders; //Beware that total_price of each order is in string format due to PSql representaion of numeric.
        } catch(error) {
            console.error('Fetching all orders error ' ,error);
        }
    }


    static async insertOrder(order){
        try {
            const response = await fetch('http://localhost:5001/orders', {  
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
    
            if (response.ok) {
                alert('Order placed successfully!');
            } else {
                const error = await response.json();
                alert(`Failed to place order: ${error.message}`);
            }

            return response;
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('An error occurred while placing your order. Please try again.');
        }
    }

}