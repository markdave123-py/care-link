import * as amqp from "amqplib";
import type { ChannelModel, Channel } from "amqplib";

export class Rabbitmq {
    private static connection: ChannelModel;
    private static channel: Channel;

	static connect = async () => {
		try {
			const connection = await amqp.connect("amqp://guest:guest@rabbitmq:5672");
			const channel = await connection.createChannel();

            this.connection = connection;
            this.channel = channel;

			console.log("Rabbitmq Connected✅");
		} catch (err) {
			console.error("Error using rabbitmq: ", err);
			throw err;
		}
	};

	static getChannel = () => {
		if (!this.channel) {
			throw new Error("Channel not initialized.");
		} else {
			return this.channel;
		}
	};

	static async disconnect() {
		await this.channel?.close();
		await this.connection?.close();
		console.log("RabbitMQ connection closed");
	}
}
