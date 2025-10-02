import * as amqp from "amqplib";
import type { ChannelModel, Channel } from "amqplib";
import { env } from "../../auth";
import { EmailVerification, ForgotPasswordConsumer, InviteAdminConsumer } from "./consumers";

export class Rabbitmq {
     private static connection?: ChannelModel;
     private static channel?: Channel;
     private static retryCount = 0;
     private static readonly MAX_RETRY_ATTEMPTS = 10;

	static connect = async () => {
		try {
			console.log("[amqp] Attempting to connect to RabbitMQ at:", env.RABBITMQ_URL);
			const connection = await amqp.connect(env.RABBITMQ_URL);
			console.log("[amqp] Connection established successfully");

			const channel = await connection.createChannel();
			console.log("[amqp] Channel created successfully");

			// helpful defaults
			await channel.prefetch(5);
			console.log("[amqp] Channel prefetch set to 5");

			// observe connection lifecycle and auto-retry
			connection.on("close", () => {
			  console.warn(`[amqp] connection closed — retrying in 3s (attempt ${this.retryCount + 1}/${this.MAX_RETRY_ATTEMPTS})`);
			  this.connection = undefined; this.channel = undefined;
			  this.retryCount++;
			  if (this.retryCount < this.MAX_RETRY_ATTEMPTS) {
			    setTimeout(() => this.safeStartConsumers(), 3000);
			  } else {
			    console.error(`[amqp] Max retry attempts (${this.MAX_RETRY_ATTEMPTS}) reached. Giving up.`);
			  }
			});
			connection.on("error", (e) => console.error("[amqp] conn error:", e));
			channel.on("error", (e) => console.error("[amqp] channel error:", e));
			channel.on("close", () => console.warn("[amqp] channel closed"));

	           this.connection = connection;
	           this.channel = channel;

			console.log("[amqp] Rabbitmq Connected successfully");
		} catch (err) {
			console.error("[amqp] Error connecting to RabbitMQ:", err);
			console.error("[amqp] RABBITMQ_URL:", env.RABBITMQ_URL);
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

	static isConnected = (): boolean => {
		return !!(this.connection && this.channel);
	};

	static getConnectionState = () => {
		return {
			connected: this.isConnected(),
			retryCount: this.retryCount,
			maxRetries: this.MAX_RETRY_ATTEMPTS,
			connectionExists: !!this.connection,
			channelExists: !!this.channel
		};
	};


	static async safeStartConsumers() {
		try {
		  console.log(`[amqp] Starting consumers (attempt ${this.retryCount + 1}/${this.MAX_RETRY_ATTEMPTS})...`);
		  if (!this.connection || !this.channel) {
		    console.log("[amqp] Connection or channel not available, connecting...");
		    await this.connect();
		  }

		  console.log("[amqp] Starting EmailVerification consumer...");
		  await EmailVerification.consume();

		  console.log("[amqp] Starting ForgotPasswordConsumer consumer...");
		  await ForgotPasswordConsumer.consume();

		  console.log("[amqp] Starting InviteAdminConsumer consumer...");
		  await InviteAdminConsumer.consume();

		  console.log("[amqp] All consumers started successfully");
		  this.retryCount = 0; // Reset retry count on successful startup
		} catch (err) {
		  console.error(`[amqp] Failed to start consumers (attempt ${this.retryCount + 1}/${this.MAX_RETRY_ATTEMPTS}):`, err);
		  this.retryCount++;
		  if (this.retryCount < this.MAX_RETRY_ATTEMPTS) {
		    console.error(`[amqp] Retrying in 3 seconds...`);
		    setTimeout(() => this.safeStartConsumers(), 3000);
		  } else {
		    console.error(`[amqp] Max retry attempts (${this.MAX_RETRY_ATTEMPTS}) reached for consumer startup. Giving up.`);
		  }
		}
	}
}

	// static retryRabbitMQ() {
	// 	setTimeout(async () => {
	// 		if (this.channel || this.connection) {
	// 			return
	// 		}
	// 		try {
	// 			await this.connect();
	
	// 			await EmailVerification.consume();
	// 			await ForgotPasswordConsumer.consume();
	// 			await InviteAdminConsumer.consume();
	// 		} catch (err) {
	// 			console.error("Error connecting to RabbitMQ", err);
	// 			this.retryRabbitMQ();
	// 		};
	// 	}, 3000);
	// }
// }
