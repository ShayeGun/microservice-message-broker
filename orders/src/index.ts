import mongoose from "mongoose";
import { app } from "./app";
// import { OrderEmitter } from "./events/publisher/order-create-publisher";
// import { OrderCancelled } from "./events/publisher/order-cancel-publisher";
import { ticketCreatedListener, TicketCreatedListener } from "./events/listener/ticket-create-listener";
import { ExchangeTypes, Exchanges, Queues } from "@yazidy-tickets/common";


const startUp = async () => {
    if (!process.env.DATABASE_URI) throw new Error('not connected to a DB!');
    if (!process.env.JWT_SECRET) throw new Error('no jwt secret string!');

    try {
        // const orderEmitter = await new OrderEmitter().connectChannel();
        // const orderCancelled = await new OrderCancelled().connectChannel();
        // console.log('connected to rabbitMQ [ticketOrders]');

        await ticketCreatedListener.createConnection();
        await ticketCreatedListener.fastListen(Exchanges.Default, ExchangeTypes.DIRECT);

        console.log('connected to rabbitMQ [ticketListener]');

        await mongoose.connect(process.env.DATABASE_URI!);
        console.log('connected to mongoDB [ticketOrders]');

        process.on("SIGINT", () => {
            TicketCreatedListener.close();
            //  OrderEmitter.close();
            //  OrderCancelled.close();
            process.exit(0);
        });

        process.on("SIGTERM", () => {
            TicketCreatedListener.close();
            //  OrderEmitter.close();
            //  OrderCancelled.close();
            process.exit(0);
        });

    } catch (err) {
        console.log(err);

    }
};

app.listen(3001, () => {
    console.log('listening on port 3001 ...');
});

startUp();