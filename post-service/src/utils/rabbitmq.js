import amqplib from 'amqplib';
import logger from '../utils/logger.js';

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'social_events';

export const connectRabbitMQ = async () => {
  try {
    connection = await amqplib.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false });
    logger.info('Connected to RabbitMQ');
    return channel;
  } catch (error) {
    logger.error('Error connecting to RabbitMQ', error);
  }
};

export const publishEvent = async (routingKey, message) => {
  if (!channel) {
    channel = await connectRabbitMQ();
  }
  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
  logger.info(`Event published: ${routingKey}`);
};
