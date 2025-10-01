import { VerificationMailer } from "../../../auth";
import { Rabbitmq } from ".."

export class EmailVerification {
    static consume = async () => {
        const channel = await Rabbitmq.getChannel();
        const exchange = "email_service";
        const queue = "verify_email";

        channel.assertExchange(exchange, 'topic', { durable: true });
        channel.assertQueue(queue, { durable: true, exclusive: false, autoDelete: false });
        channel.bindQueue(queue, exchange, "auth.hp.register")
        channel.bindQueue(queue, exchange, "auth.patient.register")
        console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

        channel.consume(queue, async (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                const { email, token, type } = data;

                try {
                    await VerificationMailer.send(token, email, type);
                    console.log(`Sent verification email to ${email}`);
                    channel.ack(msg);
                } catch (err) {
                    console.log("Failed to send email: ", err);
                    channel.nack(msg, false, false);
                }
            }
        }, {noAck: false})
    }
}