import express from 'express';
import mongoose from 'mongoose';
import { NotFoundError, requireAuth, validateRequest, OrderStatus, BadRequestError, NotAuthorizedError, Exchanges, Keys, ExchangeTypes } from '@yazidy-tickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
// import { orderEmitter } from '../events/publisher/order-create-publisher';
// import { orderCancelled } from '../events/publisher/order-cancel-publisher';

const router = express.Router();

router.route('')
    .get(requireAuth, async (req, res) => {
        const orders = await Order.find({
            userId: req.currentUser!.id
        }).populate('ticket');

        res.send(orders);
    })
    .post(
        requireAuth,
        body('ticketId')
            .not()
            .isEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input)) // making assumption that our DB is mongoDB
            .withMessage('ticket ID must be provided 😉')
        , validateRequest
        , async (req, res) => {
            const { ticketId } = req.body;

            // 1) find the ticket the user is trying to order in the DB
            const ticket = await Ticket.findById(ticketId);
            if (!ticket) throw new NotFoundError();

            // 2) make sure this ticket is not already reserved
            const isReserved = await ticket.isReserved();
            if (isReserved) throw new BadRequestError('ticket is already being reserved');

            // 3) calculate an expiration date for this order
            const expiration = new Date();
            expiration.setSeconds(expiration.getSeconds() + Number(process.env.EXPIRATION_DATE));

            // 4) build the order and save it to DB
            const order = Order.build({
                userId: req.currentUser!.id,
                status: OrderStatus.Created,
                expiresAt: expiration,
                ticket
            });
            await order.save();

            // 5) emit a create event 
            const data = {
                id: order.id, status: order.status, userId: order.userId, expiresAt: order.expiresAt.toISOString(), ticket: {
                    id: ticket.id,
                    price: ticket.price
                }
            };
            // await orderEmitter.createExchange(Exchanges.Default, ExchangeTypes.DIRECT);
            // await orderEmitter.publish(data);
            // console.log('sent order created event !');

            // 6) publish an event saying an order was created 
            res.status(201).send(order);
        });


router.route('/:orderID')
    .get(requireAuth, async (req, res) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.orderID)) throw new BadRequestError('not correct id format');

        const order = await Order.findById(req.params.orderID);

        if (!order) throw new NotFoundError();
        if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();

        res.send(order);
    })
    .delete(requireAuth, async (req, res) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.orderID)) throw new BadRequestError('not correct id format');

        const order = await Order.findById(req.params.orderID).populate('ticket');

        if (!order) throw new NotFoundError();
        if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();

        order.status = OrderStatus.Cancelled;
        await order.save();

        const data = {
            id: order.id, ticket: {
                id: order.ticket.id,
            }
        };
        // await orderCancelled.createExchange(Exchanges.Default, ExchangeTypes.DIRECT);
        // await orderCancelled.publish(data);
        // console.log('sent order created event !');

        // DON'T USE STATUS() OR YOU'LL GET ERROR IN JEST (DON'T KNOW WHY ?)
        res.send(order);
    });


export { router };