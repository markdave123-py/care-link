import { Rabbitmq } from ".";
import { env } from "../../auth";

type Data = {
    email: string,
    token: string,
    type?: string,
}

export class PublishToQueue {
    static email = async (key: string, data: Data) => { // key --> <domain>.<model>.<action>
        try {
            console.log(`[amqp-producer] Publishing message with key: ${key}`);

            const channel = await Rabbitmq.getChannel();
            const exchange = "email_service";

            console.log(`[amqp-producer] Asserting exchange: ${exchange} (topic, durable: true)`);
            channel.assertExchange(exchange, 'topic', { durable: true }); // Using topic exchange

            console.log(`[amqp-producer] Publishing to exchange: ${exchange} with routing key: ${key}`);
            const published = channel.publish(exchange, key, Buffer.from(JSON.stringify(data)), { persistent: true });

            if (published) {
                console.log(`[amqp-producer] Message published successfully to ${exchange} with key ${key}`);
            } else {
                console.error(`[amqp-producer] Failed to publish message - channel buffer full or connection issue`);
            }
        } catch (err) {
            console.error("[amqp-producer] Error publishing message:", err);
            console.error("[amqp-producer] RABBITMQ_URL:", env.RABBITMQ_URL);
        }
    }
}