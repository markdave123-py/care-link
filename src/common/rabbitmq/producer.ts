import { Rabbitmq } from ".";

type Data = {
    email: string,
    token: string,
    type: string,
}

export class PublishToQueue {
    static email = async (key: string, data: Data) => { // key --> <domain>.<model>.<action>
        try {
            const channel = Rabbitmq.getChannel();
            const exchange = "email_service";
    
            channel.assertExchange(exchange, 'topic', { durable: true }); // Using direct type of exchange
            channel.publish(exchange, key, Buffer.from(JSON.stringify(data)), { persistent: true }); // Publishing to queue with binding_key user_type
            console.log(`Producer sent ${data} to queue`);
        } catch (err) {
            console.error("Error creating channel: ", err);
        }
    }
}