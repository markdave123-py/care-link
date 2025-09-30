"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishToQueue = void 0;
const _1 = require(".");
class PublishToQueue {
}
exports.PublishToQueue = PublishToQueue;
_a = PublishToQueue;
PublishToQueue.email = async (key, data) => {
    try {
        const channel = await _1.Rabbitmq.getChannel();
        const exchange = "email_service";
        channel.assertExchange(exchange, 'topic', { durable: true });
        channel.publish(exchange, key, Buffer.from(JSON.stringify(data)), { persistent: true });
        console.log(`Sent message for email sending to queue`);
    }
    catch (err) {
        console.error("Error creating channel: ", err);
    }
};
//# sourceMappingURL=producer.js.map