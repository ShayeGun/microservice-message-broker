import mongoose from "mongoose";

interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
}

interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema<TicketAttrs>({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    userId: { type: String, required: true }
}, {
    toObject: {
        // not show __v and change _id to id for consistency in microservices 
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

ticketSchema.statics.build = function (attr: TicketAttrs) {
    return new Ticket(attr);
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

// *** this works as expected converts _id to id and removes __v but in jest it won't work correctly (idk why?) ***
// (async () => {
//     const data = await Ticket.build({ title: 'test', price: 99, userId: '12345' }).save();

//     console.log(data);

//     await Ticket.deleteMany({ title: 'test' });


// })()

export { Ticket };