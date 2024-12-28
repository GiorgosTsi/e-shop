const { Kafka, Partitioners } = require('kafkajs');
const productsDbService = require('./productsDatabaseService');

const kafka = new Kafka({
  clientId: 'products-app',
  brokers: ['kafka:19092'],
  retry: {
    initialRetryTime: 2000,
    retries: 5
  }
});


/***********  PRODUCTS_SERVICE AS PRODUCER (send response to ORDERS_SERVICE with success or failure) ***********/
const producer = kafka.producer({
  allowAutoTopicCreation: true,
  createPartitioner: Partitioners.LegacyPartitioner
});



// Function to send messages to the Kafka topic
const sendOrders = async (msg) => {
  try {
    await producer.connect();
    await producer.send({
      topic: 'productsProducer',
      messages: [{
        value: JSON.stringify(msg)
      }]
    });
  } catch (error) {
    console.error("Error sending message to Kafka", error);
  } finally {
    await producer.disconnect();
  }
};


/***********  PRODUCTS_SERVICE AS CONSUMER (get order from ORDERS_SERVICE) ***********/

const consumer = kafka.consumer({
    groupId: "products-group",
    allowAutoTopicCreation: true,
  });

// Function to handle incoming messages from ordersProducer topic
const fetchProductsFromOrderTopic = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topics: ["ordersProducer"] });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`Received message: ${message.value.toString()}`);
        const jsonMsg = JSON.parse(message.value);

        // Handle products in the order using the database service
        const result = await handleProducts(jsonMsg);

        // Send a response to the productsProducer topic based on the result
        if (result) {
          const successMsg = {
            orderId: jsonMsg.id,
            status: "Success",
            message: "Order processed successfully"
          };
          console.log("Order processed successfully. Sending success response.");
          await sendOrders(successMsg);
        } else {
          const failureMsg = {
            orderId: jsonMsg.id,
            status: "Reject",
            message: "Order could not be processed due to insufficient stock"
          };
          console.log("Order processing failed. Sending failure response.");
          await sendOrders(failureMsg);
        }
      }
    });
  } catch (error) {
    console.error("Error in Kafka consumer", error);
    await consumer.disconnect();
  }
};

// Function to handle products in the order using the database service
const handleProducts = async (order) => {
  const dbService = productsDbService.getDbServiceInstance();
  try {
    // Use the previously defined checkAndProcessOrder method from the database service
    const result = await dbService.checkAndProcessOrder(order);
    return result; // Returns true if successful, false otherwise
  } catch (error) {
    console.error("Error handling products in order", error);
    return false; // Return false in case of any error
  }
};

// Start consuming messages from Kafka
setTimeout(async () => {
  try {
    console.log("Starting Kafka consumer...");
    await fetchProductsFromOrderTopic();
  } catch (error) {
    console.error("Error starting Kafka consumer", error);
  }
}, 2000);
