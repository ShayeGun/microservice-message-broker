import mongoose from 'mongoose';
import { Order } from './order';
import { OrderStatus } from '@yazidy-tickets/common';

// for mongo attributes that ticket inserts in model by new Ticket()
interface TicketAttr {
    id: string;
    title: string;
    price: number;
}

// for mongo internal attributes that automatically gets added to entities like __v or createdAt , ...
interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attr: TicketAttr): TicketDoc;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    toJSON: {
        // not show __v and change _id to id for consistency in microservices 
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
})

ticketSchema.statics.build = function (attr: TicketAttr) {
    return new Ticket({
        _id: attr.id,
        title: attr.title,
        price: attr.price
    });
}

ticketSchema.methods.isReserved = async function () {
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    });

    // for converting null | tuple into boolean
    return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket, TicketDoc }