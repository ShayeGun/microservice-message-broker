import mongoose from "mongoose";
import { OrderStatus } from "@yazidy-tickets/common";
import { TicketDoc } from "./ticket";

// for mongo attributes that order inserts in model by new Order()
interface OrderAttr {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

// for mongo internal attributes that automatically gets added to entities like __v or createdAt , ...
interface OrderDoc extends mongoose.Document {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attr: OrderAttr): OrderDoc;
}

const orderSchema = new mongoose.Schema<OrderAttr>({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        required: true
    },
    expiresAt: {
        type: Date,
        default: Date.now
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket"
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


orderSchema.statics.build = function (attr: OrderAttr) {
    return new Order(attr);
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order }