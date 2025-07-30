"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rabbitmq = void 0;
const amqp = require("amqplib");
const auth_1 = require("../../auth");
const consumers_1 = require("./consumers");
class Rabbitmq {
    static retryRabbitMQ() {
        setTimeout(async () => {
            if (this.channel || this.connection) {
                return;
            }
            try {
                await this.connect();
                await consumers_1.EmailVerification.consume();
                await consumers_1.ForgotPasswordConsumer.consume();
                await consumers_1.InviteAdminConsumer.consume();
            }
            catch (err) {
                console.error("Error connecting to RabbitMQ", err);
                this.retryRabbitMQ();
            }
            ;
        }, 3000);
    }
}
exports.Rabbitmq = Rabbitmq;
_a = Rabbitmq;
Rabbitmq.connect = async () => {
    try {
        const connection = await amqp.connect(auth_1.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        _a.connection = connection;
        _a.channel = channel;
        console.log("Rabbitmq Connected");
    }
    catch (err) {
        console.error("Error using rabbitmq: ", err);
        throw err;
    }
};
Rabbitmq.getChannel = async () => {
    if (!_a.channel) {
        throw new Error("Channel not initialized.");
    }
    else {
        return _a.channel;
    }
};
//# sourceMappingURL=index.js.map