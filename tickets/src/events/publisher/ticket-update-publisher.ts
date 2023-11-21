import { BaseEmitter } from '../../../../rabbitmq/src/events/base-emitter';
import { Keys, Exchanges, Queues } from '@yazidy-tickets/common';
import { ExchangeTypes } from '../../../../rabbitmq/src/events/base-utils';

interface ITicketUpdate {
    key: Keys;
    queue: Queues;
    exchange: Exchanges;
    msg: {
        id: string,
        title: string,
        price: number,
        userId: string;
    };

}

class TicketUpdate extends BaseEmitter<ITicketUpdate>{
    protected key: Keys.TicketUpdated = Keys.TicketUpdated;

    async publish(msg: ITicketUpdate["msg"], exchange: ITicketUpdate['exchange'] = Exchanges.Default): Promise<void> {
        this.channel.publish(exchange, this.key, Buffer.from(JSON.stringify(msg)));
        console.log(` [x] Sent ${this.key}: '${msg}'`);
    }

    async fastPublish(msg: ITicketUpdate["msg"], exchange: ITicketUpdate['exchange'] = Exchanges.Default, exchangeType: ExchangeTypes = ExchangeTypes.DIRECT) {
        await this.createExchange(exchange, exchangeType);
        await this.publish(msg, exchange);
    }
}

const ticketUpdate = new TicketUpdate();

export { ticketUpdate, TicketUpdate };



