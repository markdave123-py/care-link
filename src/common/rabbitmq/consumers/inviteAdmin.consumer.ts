import { Rabbitmq } from ".."
import { AdminInviteLink } from "../../../auth/services/adminInvite.service";

export class InviteAdminConsumer {
    static consume = async () => {
        const channel = await Rabbitmq.getChannel();
        const exchange = "email_service";
        const queue = "invite-admin";

        channel.assertExchange(exchange, 'topic', { durable: true });
        channel.assertQueue(queue, { durable: true, exclusive: false, autoDelete: false });
        channel.bindQueue(queue, exchange, "*.*.invite")
        channel.prefetch(1);
        console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

        channel.consume(queue, async (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                const { token, email } = data;

                try {
                    await AdminInviteLink.send(token, email);
                    console.log(`Sent Admin-invite to email: ${email}`);
                    channel.ack(msg);
                } catch (err) {
                    console.log("Failed to send email: ", err);
                }
            }
        }, {noAck: false})
    }
}