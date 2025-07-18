"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordConsumer = void 0;
const auth_1 = require("../../../auth");
const __1 = require("..");
class ForgotPasswordConsumer {
}
exports.ForgotPasswordConsumer = ForgotPasswordConsumer;
_a = ForgotPasswordConsumer;
ForgotPasswordConsumer.consume = async () => {
    const channel = __1.Rabbitmq.getChannel();
    const exchange = "email_service";
    const queue = "forgot-password";
    channel.assertExchange(exchange, 'topic', { durable: true });
    channel.assertQueue(queue, { exclusive: true });
    channel.bindQueue(queue, exchange, "auth.admin.forgotpassword");
    channel.bindQueue(queue, exchange, "auth.hp.forgotpassword");
    channel.bindQueue(queue, exchange, "auth.patient.forgotpassword");
    channel.prefetch(1);
    console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);
    channel.consume(queue, async (msg) => {
        if (msg) {
            const data = JSON.parse(msg.content.toString());
            const { token, email, type } = data;
            try {
                await auth_1.ForgotPasswordLink.send(token, email, type);
                console.log(`Sent Forgot-Password email to ${email}`);
                channel.ack(msg);
            }
            catch (err) {
                console.log("Failed to send email: ", err);
            }
        }
    });
};
//# sourceMappingURL=forgotpassword.consumer.js.map