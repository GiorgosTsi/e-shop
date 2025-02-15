# 🛒 E-Commerce Microservices Application  

## 📌 Overview  
This is a **fully dockerized** E-commerce application built using a **microservices architecture**. The system allows users to browse products, place orders,add new products and manage authentication through **Keycloak**. The services communicate using **Kafka** for asynchronous messaging, ensuring scalability and fault tolerance.

## 🏗️ **Project Architecture**  
The application consists of the following **independent services**, each running in a separate container:  

1. **Frontend Service (Vanilla JS, HTML, CSS)**
   - Provides a user-friendly interface for browsing products and placing orders.
   - Communicates with the backend via REST API.

2. **Orders Service (Node.js, Express, PostgreSQL, Kafka)**
   - Handles customer orders (placing orders, updating status, fetching order history).
   - Sends order messages to the **Products Service** via Kafka.
   - Listens to Kafka for responses about order success or failure.

3. **Products Service (Node.js, Express, PostgreSQL, Kafka)**
   - Manages product inventory (CRUD operations).
   - Listens for incoming order requests from **Orders Service**.
   - Validates stock availability and updates product quantities accordingly.
   - Sends back success/rejection messages via Kafka.

4. **Authentication Service (Keycloak)**
   - Manages user authentication and authorization.
   - Integrated with frontend for secure login/logout.

5. **Database (PostgreSQL)**
   - Stores user accounts, product listings, and orders.
   - Each service has its own database.

6. **Message Broker (Kafka)**
   - Ensures smooth communication between services.
   - Used for event-driven updates between **Orders Service** and **Products Service**.

7. **Docker & Docker Compose**
   - Every service runs inside its own **Docker container**.
   - **Docker Compose** simplifies service orchestration.

---

## 🚀 **Technologies Used**  

| Technology    | Purpose | \
| **Docker** & **Docker Compose** | Containerization & Orchestration |\
| **Node.js** & **Express** | Backend for Orders & Products Services |\
| **PostgreSQL** | Database for storing users, products, and orders |\
| **Kafka** | Event-driven messaging between microservices |\
| **Keycloak** | Authentication and authorization (customer/seller) |\
| **Vanilla JS, HTML, CSS** | Frontend user interface |

---

## 🛠️ **How It Works**  

1. **User Authentication (Keycloak)**
   - Users sign up or log in.
   - User registers as customer or seller
   - Only customers can add to cart and buy products
   - Only sellers can add and manage products
   - Non authenticated users can only browse products.
![log in/sign in UI](/images/login.png)

2. **Add to cart**
   - User comminicates via Frontend and adds products to cart.
![main page UI](/images/main.png)
![cart UI](/images/cart.png)

3. **Placing an Order**
   - Frontend sends order details to the **Orders Service**.
   - The **Orders Service** publishes an event via Kafka to the **Products Service**.

4. **Processing an Order**
   - The **Products Service** checks product availability.
   - If stock is available:
     - Reduces inventory and sends a **success message** to Kafka.
   - If stock is unavailable:
     - Sends a **rejection message** to Kafka.
   - The **Orders Service** listens for Kafka messages.
   - Updates order status to **success** or **rejected**.
![orders UI](/images/orders.png)

5. **Managing existing products**
   - As a seller you can manage existing products (change price/name/photo/quantity) and add new products.
![manage products UI](/images/manageProducts.png)


---

## 🏗️ **How to Run the Project**  

### 🚢 **Using Docker Compose**  
To start the entire application, simply run:  

```sh
docker-compose up --build
```

Then go to `127.0.0.1:3000` at the frontend page and enjoy!

