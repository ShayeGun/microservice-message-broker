import { BadRequestError, Exchanges, Keys, Queues } from "@yazidy-tickets/common";
import { BaseListener } from '../../../../rabbitmq/src/events/base-listener';
import { Replies } from "amqplib";
import { ExchangeTypes } from "../../../../rabbitmq/src/events/base-utils";

interface ITicketListener {
    key: Keys,
    queue: Queues,
    exchange: Exchanges;
}

class TicketCreatedListener extends BaseListener<ITicketListener> {
    protected key: Keys.TicketCreated = Keys.TicketCreated;

    async listen(exchange: ITicketListener['exchange'] = Exchanges.Default, queue?: Replies.AssertQueue): Promise<void> {
        if (!queue) throw new BadRequestError('no queue was founded');

        await this.channel.bindQueue(queue.queue, exchange, this.key);

        this.channel.consume(queue.queue, async (msg) => {
            console.log(` [x] ${msg!.fields.routingKey}:'${msg!.content.toString()}'`);

            this.channel.ack(msg!);
        }, {
            noAck: false
        });
    }

    async fastListen(exchange: ITicketListener['exchange'] = Exchanges.Default, exchangeType: ExchangeTypes = ExchangeTypes.DIRECT): Promise<void> {
        await this.createExchange(exchange, exchangeType);
        const q = await this.createQueue(Queues.Ticket, { autoDelete: true });
        await this.listen(exchange, q);
    }
}

const ticketCreatedListener = new TicketCreatedListener();

export { ticketCreatedListener, TicketCreatedListener };