import * as amqp from "amqplib";
export declare class Rabbitmq {
    private static connection;
    private static channel;
    static connect: () => Promise<void>;
    static getChannel: () => Promise<amqp.Channel>;
    static retryRabbitMQ(): void;
}
