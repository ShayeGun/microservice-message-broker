import { OrderStatus } from '@yazidy-tickets/common';
import { BaseEmitter } from '../../../../rabbitmq/src/events/base-emitter';
import { Keys, Exchanges, Queues } from '@yazidy-tickets/common';

interface IOrderEmitter {
    key: Keys;
    queue: Queues;
    exchange: Exchanges;
    msg: {
        id: string,
        status: OrderStatus,
        userId: string,
        expiresAt: string,
        ticket: {
            id: string,
            price: number;
        };
    };

}

class OrderEmitter extends BaseEmitter<IOrderEmitter>{
    protected key: Keys.OrderCreated = Keys.OrderCreated;

    async publish(msg: IOrderEmitter["msg"], exchange: IOrderEmitter['exchange'] = Exchanges.Default): Promise<void> {
        this.channel.publish(exchange, this.key, Buffer.from(JSON.stringify(msg)));
        console.log(` [x] Sent ${this.key}: '${msg}'`);
    }
}

export { OrderEmitter };



