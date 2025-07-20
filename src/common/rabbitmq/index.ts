import * as amqp from "amqplib";
import type { ChannelModel, Channel } from "amqplib";
import { env } from "../../auth";
import { EmailVerification, ForgotPasswordConsumer, InviteAdminConsumer } from "./consumers";

export class Rabbitmq {
    private static connection: ChannelModel;
    private static channel: Channel;

	static connect = async () => {
		try {
			const connection = await amqp.connect(env.RABBITMQ_URL);
			const channel = await connection.createChannel();

            this.connection = connection;
            this.channel = channel;

			console.log("Rabbitmq Connected");
		} catch (err) {
			console.error("Error using rabbitmq: ", err);
			throw err;
		}
	};

	static getChannel = async () => {
		if (!this.channel) {
			throw new Error("Channel not initialized.");
		} else {
			return this.channel;
		}
	};

	static retryRabbitMQ() {
		setTimeout(async () => {
			if (this.channel || this.connection) {
				return
			}
			try {
				await this.connect();
	
				await EmailVerification.consume();
				await ForgotPasswordConsumer.consume();
				await InviteAdminConsumer.consume();
			} catch (err) {
				console.error("Error connecting to RabbitMQ", err);
				this.retryRabbitMQ();
			};
		}, 3000);
	}
}
