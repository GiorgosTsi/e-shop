const { Kafka, Partitioners } = require('kafkajs');
const ordersDbService = require('./ordersDatabaseService'); // Import orders DB service

const kafka = new Kafka({
  clientId: 'order-app',
  brokers: ['kafka:19092'], // Connect to Kafka broker
  retry: {
    initialRetryTime: 2000,
    retries: 5,
  },
});

/***********  ORDERS_SERVICE AS PRODUCER (send order info to PRODUCTS_SERVICE) ***********/

const producer = kafka.producer({
  allowAutoTopicCreation: true,
  createPartitioner: Partitioners.LegacyPartitioner,
});

const sendOrders = async (msg) => {
  try {
    await producer.connect();
    await producer.send({
      topic: 'ordersProducer',
      messages: [{ value: JSON.stringify(msg) }],
    });
    console.log('Message sent to ordersProducer:', msg);
  } catch (error) {
    console.error('Error sending Kafka message:', error);
  } finally {
    await producer.disconnect();
  }
};

/***********  ORDERS_SERVICE AS CONSUMER (handle responses from PRODUCTS_SERVICE) ***********/

const consumer = kafka.consumer({
  groupId: 'orders-group',
  allowAutoTopicCreation: true,
});

const handleProductResponse = async (msg) => {
  const { orderId, status } = msg;

  try {
    console.log(`Received message from productsProducer:`, msg);

    // Update the order status in the database
    const updatedOrder = await new ordersDbService().updateOrderStatus(orderId, status);

    if (updatedOrder) {
      console.log(`Order ${orderId} status updated to: ${status}`);
    } else {
      console.error(`Order ${orderId} not found or failed to update.`);
    }
  } catch (error) {
    console.error('Error handling product response:', error.message);
  }
};

const consumeProductResponses = async () => {
  try {
    await consumer.connect();
    console.log('Connected to Kafka broker for orders service consumer.');

    await consumer.subscribe({ topic: 'productsProducer', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ message }) => {
        const msg = JSON.parse(message.value.toString());
        await handleProductResponse(msg);
      },
    });
  } catch (error) {
    console.error('Error consuming product responses:', error.message);
    await consumer.disconnect();
  }
};

/***********  INITIALIZE CONSUMER ON SERVICE START ***********/

setTimeout(async () => {
  try {
    await consumeProductResponses();
  } catch (error) {
    console.error('Error initializing Kafka consumer:', error.message);
  }
}, 2000);

module.exports = {
  kafkaProducer: sendOrders,
};
