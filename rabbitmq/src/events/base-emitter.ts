import { connect, Channel, Connection, Options } from 'amqplib';
import { Keys, Exchanges, Queues, ExchangeTypes } from './base-utils';

interface IEmmit {
    key: Keys;
    queue: Queues;
    exchange: Exchanges;
    msg: any;
}

abstract class BaseEmitter<T extends IEmmit>{

    protected static connection: Connection;

    declare protected channel: Channel;
    protected abstract key: T["key"];



    static async connect(uri: string = "amqp://localhost"): Promise<void> {
        if (!BaseEmitter.connection) {
            BaseEmitter.connection = await connect(uri);
        }
    }
    static async close() {
        if (BaseEmitter.connection) {
            console.log("connection is closed");
            await BaseEmitter.connection.close();
        }
    }

    constructor(private uri: string = "amqp://localhost") { }

    async createConnection(): Promise<void> {
        if (!BaseEmitter.connection) {
            console.log("connection created !");
            await BaseEmitter.connect(this.uri);
        }

        if (!this.channel) {
            console.log("channel created !");
            await this.connectChannel();
        }

        return;
    }

    async connectChannel() {
        this.channel = await BaseEmitter.connection.createChannel();

        return this;
    }

    async createExchange(exchange: T["exchange"] = Exchanges.Default, type: ExchangeTypes = ExchangeTypes.FANOUT, opt?: Options.AssertExchange) {
        await this.createConnection();
        await this.channel!.assertExchange(exchange, type, opt);
    }

    async closeChannel() {
        await this.channel.close();
    }

    abstract publish(...args: any): Promise<void>;
}

// (async () => {
//     try {
//         const server = new Emitter();
//         await server.startup();
//         await server.createExchange();
//         server.publish('i am a banana');

//         server.close();
//     } catch (err) {
//         console.log(err);
//     }
// })()

export { BaseEmitter };