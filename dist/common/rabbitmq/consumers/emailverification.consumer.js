"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerification = void 0;
const auth_1 = require("../../../auth");
const __1 = require("..");
class EmailVerification {
}
exports.EmailVerification = EmailVerification;
_a = EmailVerification;
EmailVerification.consume = async () => {
    const channel = await __1.Rabbitmq.getChannel();
    const exchange = "email_service";
    const queue = "verify_email";
    channel.assertExchange(exchange, 'topic', { durable: true });
    channel.assertQueue(queue, { exclusive: true });
    channel.bindQueue(queue, exchange, "auth.hp.register");
    channel.bindQueue(queue, exchange, "auth.patient.register");
    channel.prefetch(1);
    console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);
    channel.consume(queue, async (msg) => {
        if (msg) {
            const data = JSON.parse(msg.content.toString());
            const { email, token, type } = data;
            try {
                await auth_1.VerificationMailer.send(token, email, type);
                console.log(`Sent verification email to ${email}`);
                channel.ack(msg);
            }
            catch (err) {
                console.log("Failed to send email: ", err);
            }
        }
    });
};
//# sourceMappingURL=emailverification.consumer.js.map