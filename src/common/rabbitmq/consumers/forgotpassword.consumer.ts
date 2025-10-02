import { ForgotPasswordLink } from "../../../auth";
import { Rabbitmq } from ".."

export class ForgotPasswordConsumer {
    static consume = async () => {
        try {
            console.log(`[amqp-consumer] Starting forgot password consumer`);
            const channel = await Rabbitmq.getChannel();
            const exchange = "email_service";
            const queue = "forgot-password";

            console.log(`[amqp-consumer] Asserting exchange: ${exchange} (topic, durable: true)`);
            channel.assertExchange(exchange, 'topic', { durable: true });

            console.log(`[amqp-consumer] Asserting queue: ${queue} (durable: true)`);
            channel.assertQueue(queue, { durable: true, exclusive: false, autoDelete: false });

            console.log(`[amqp-consumer] Binding queue ${queue} to exchange ${exchange}`);
            channel.bindQueue(queue, exchange, "auth.admin.forgotpassword")
            channel.bindQueue(queue, exchange, "auth.hp.forgotpassword")
            channel.bindQueue(queue, exchange, "auth.patient.forgotpassword")
            console.log(`[amqp-consumer] Queue bindings completed for routing keys: auth.admin.forgotpassword, auth.hp.forgotpassword, auth.patient.forgotpassword`);

            // Note: Main connection already sets prefetch to 5, no need to override
            console.log(`[amqp-consumer] Using global prefetch setting (5) for queue ${queue}`);

            console.log(`[amqp-consumer] Waiting for messages in ${queue}. To exit press CTRL+C`);

            channel.consume(queue, async (msg) => {
                if (msg) {
                    console.log(`[amqp-consumer] Received message from queue ${queue}`);
                    const data = JSON.parse(msg.content.toString());
                    const { token, email, type } = data;
                    console.log(`[amqp-consumer] Processing message data:`, { email, token: '[HIDDEN]', type });

                    try {
                        await ForgotPasswordLink.send(token, email, type);
                        console.log(`[amqp-consumer] Successfully sent forgot password email to ${email}`);
                        channel.ack(msg);
                        console.log(`[amqp-consumer] Message acknowledged`);
                    } catch (err) {
                        console.error(`[amqp-consumer] Failed to send forgot password email to ${email}:`, err);
                        // Check if this is a temporary error that should be retried
                        const isRetryableError = err.message && (
                            err.message.includes('ECONNRESET') ||
                            err.message.includes('ETIMEDOUT') ||
                            err.message.includes('ENOTFOUND') ||
                            err.code === 'ECONNRESET' ||
                            err.code === 'ETIMEDOUT'
                        );

                        if (isRetryableError) {
                            console.log(`[amqp-consumer] Retryable error detected, requeuing message`);
                            channel.nack(msg, false, true); // Requeue for retry
                        } else {
                            console.log(`[amqp-consumer] Permanent error, not requeuing`);
                            channel.nack(msg, false, false); // Don't requeue
                        }
                    }
                } else {
                    console.log(`[amqp-consumer] Received null message`);
                }
            }, {noAck: false})
        } catch (err) {
            console.error(`[amqp-consumer] Error starting forgot password consumer:`, err);
            throw err;
        }
    }
}