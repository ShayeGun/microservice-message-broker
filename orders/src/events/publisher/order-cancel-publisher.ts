import { BaseEmitter } from '../../../../rabbitmq/src/events/base-emitter';
import { Keys, Exchanges, Queues } from '@yazidy-tickets/common';

interface IOrderCancelled {
    key: Keys;
    queue: Queues;
    exchange: Exchanges;
    msg: {
        id: string,
        ticket: {
            id: string;
        };
    };

}

class OrderCancelled extends BaseEmitter<IOrderCancelled>{
    protected key: Keys.OrderCancelled = Keys.OrderCancelled;

    async publish(msg: IOrderCancelled["msg"], exchange: IOrderCancelled['exchange'] = Exchanges.Default): Promise<void> {
        this.channel.publish(exchange, this.key, Buffer.from(JSON.stringify(msg)));
        console.log(` [x] Sent ${this.key}: '${msg}'`);
    }
}

export { OrderCancelled };



