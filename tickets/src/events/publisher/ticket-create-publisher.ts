import { BaseEmitter } from '../../../../rabbitmq/src/events/base-emitter';
import { Keys, Exchanges, Queues } from '@yazidy-tickets/common';
import { ExchangeTypes } from '../../../../rabbitmq/src/events/base-utils';

interface ITicketEmitter {
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

class TicketEmitter extends BaseEmitter<ITicketEmitter>{
    protected key: Keys.TicketCreated = Keys.TicketCreated;

    async publish(msg: ITicketEmitter["msg"], exchange: ITicketEmitter['exchange'] = Exchanges.Default): Promise<void> {
        this.channel.publish(exchange, this.key, Buffer.from(JSON.stringify(msg)));
        console.log(` [x] Sent ${this.key}: '${msg}'`);
    }

    async fastPublish(msg: ITicketEmitter["msg"], exchange: ITicketEmitter['exchange'] = Exchanges.Default, exchangeType: ExchangeTypes = ExchangeTypes.DIRECT) {
        await this.createExchange(exchange, exchangeType);
        await this.publish(msg, exchange);
    }
}

const ticketEmitter = new TicketEmitter();


export { ticketEmitter, TicketEmitter }



