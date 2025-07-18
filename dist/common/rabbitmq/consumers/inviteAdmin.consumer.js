"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteAdminConsumer = void 0;
const __1 = require("..");
const adminInvite_service_1 = require("../../../auth/services/adminInvite.service");
class InviteAdminConsumer {
}
exports.InviteAdminConsumer = InviteAdminConsumer;
_a = InviteAdminConsumer;
InviteAdminConsumer.consume = async () => {
    const channel = __1.Rabbitmq.getChannel();
    const exchange = "email_service";
    const queue = "invite-admin";
    channel.assertExchange(exchange, 'topic', { durable: true });
    channel.assertQueue(queue, { exclusive: true });
    channel.bindQueue(queue, exchange, "*.*.invite");
    channel.prefetch(1);
    console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);
    channel.consume(queue, async (msg) => {
        if (msg) {
            const data = JSON.parse(msg.content.toString());
            const { token, email } = data;
            try {
                await adminInvite_service_1.AdminInviteLink.send(token, email);
                console.log(`Sent Admin-invite to email: ${email}`);
                channel.ack(msg);
            }
            catch (err) {
                console.log("Failed to send email: ", err);
            }
        }
    });
};
//# sourceMappingURL=inviteAdmin.consumer.js.map