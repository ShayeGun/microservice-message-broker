import mongoose from "mongoose";
import { app } from "./app";
import { TicketEmitter, ticketEmitter } from "./events/publisher/ticket-create-publisher";
import { BaseEmitter } from "../../rabbitmq/src/events/base-emitter";
import { TicketUpdate, ticketUpdate } from "./events/publisher/ticket-update-publisher";



const startUp = async () => {
    if (!process.env.DATABASE_URI) throw new Error('not connected to a DB!');
    if (!process.env.JWT_SECRET) throw new Error('no jwt secret string!');

    try {
        await ticketEmitter.createConnection();
        await ticketUpdate.createConnection();

        console.log('connected to rabbitMQ [ticketTickets]');

        await mongoose.connect(process.env.DATABASE_URI!);
        console.log('connected to mongoDB [ticketTickets]');

        process.on("SIGINT", () => {
            TicketEmitter.close();
            TicketUpdate.close();
            process.exit(0);
        });

        process.on("SIGTERM", () => {
            TicketEmitter.close();
            TicketUpdate.close();
            process.exit(0);
        });

    } catch (err) {
        console.log(err);

    }
};

app.listen(3000, () => {
    console.log('listening on port 3000 ...');
});

startUp();