import { connect, Channel, Connection, Options } from 'amqplib';
import { Keys, Exchanges, Queues, ExchangeTypes } from './base-utils';

interface IListen {
    key: Keys;
    queue: Queues;
    exchange: Exchanges;
}

abstract class BaseListener<T extends IListen>{

    protected static connection: Connection;

    declare protected channel: Channel;
    protected abstract key: T["key"];

    static async connect(uri: string = "amqp://localhost"): Promise<void> {
        if (!BaseListener.connection) BaseListener.connection = await connect(uri);
    }
    static async close() {
        if (BaseListener.connection) {
            console.log("connection is closed");
            await BaseListener.connection.close();
        }
    }

    constructor(private uri: string = "amqp://localhost") { }

    async createConnection(): Promise<void> {
        if (!BaseListener.connection) {
            console.log("connection created !");
            await BaseListener.connect(this.uri);
        }

        if (!this.channel) {
            console.log("channel created !");
            await this.connectChannel();
        }

        return;
    }


    async connectChannel() {
        this.channel = await BaseListener.connection.createChannel();

        return this;
    }

    async createExchange(exchange: T["exchange"] = Exchanges.Default, type: ExchangeTypes = ExchangeTypes.FANOUT, opt?: Options.AssertExchange) {
        await this.createConnection();
        await this.channel!.assertExchange(exchange, type, opt);
    }

    async createQueue(queueName: T["queue"] = Queues.Default, opt?: Options.AssertQueue) {
        await this.createConnection();
        this.channel!.prefetch(1);
        const queue = await this.channel!.assertQueue(queueName, opt);

        return queue;
    }

    async closeChannel() {
        await this.channel.close();
    }

    abstract listen(...args: any): Promise<void>;
}

// (async () => {
//     try {
//         const listener = new Listener();
//         await listener.startup();
//         await listener.createExchange();
//         const q = await listener.createQueue(Queues.Ticket, { exclusive: true });

//         await listener.listen(Keys.Default, Exchanges.Default, q);

//     } catch (err) {
//         console.log(err);
//     }
// })()

export { BaseListener };