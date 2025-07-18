"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rabbitmq = void 0;
const amqp = require("amqplib");
const auth_1 = require("../../auth");
class Rabbitmq {
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
Rabbitmq.getChannel = () => {
    if (!_a.channel) {
        throw new Error("Channel not initialized.");
    }
    else {
        return _a.channel;
    }
};
//# sourceMappingURL=index.js.map