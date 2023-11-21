import mongoose from 'mongoose';
import request from "supertest";
import { app } from "../../app";
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';
import { OrderStatus } from '@yazidy-tickets/common';

// =================== POST '/api/orders' ===================
test('returns an error if the ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId();

    await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId }).expect(404);
});

test('returns an error if the ticket is already reserved', async () => {
    const randomId = new mongoose.Types.ObjectId;

    const ticket = Ticket.build({
        id: randomId.toHexString(),
        title: 'test book',
        price: 10
    });
    await ticket.save();

    const order = Order.build({
        userId: 'dummy',
        status: OrderStatus.Created,
        ticket,
        expiresAt: new Date()
    });
    await order.save();

    await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId: ticket.id }).expect(400);
});

test('reserves a ticket', async () => {
    const randomId = new mongoose.Types.ObjectId;

    const ticket = Ticket.build({
        id: randomId.toHexString(),
        title: 'test book',
        price: 10
    });
    await ticket.save();

    await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId: ticket.id }).expect(201);
});

// =================== GET '/api/orders' ===================
async function buildTicket() {
    const randomId = new mongoose.Types.ObjectId;

    const ticket = Ticket.build({
        id: randomId.toHexString(),
        title: 'test book',
        price: 10
    });
    await ticket.save();

    return ticket;
}

test('fetches orders of a particular user', async () => {
    // create three thickets
    const ticket1 = await buildTicket();
    const ticket2 = await buildTicket();
    const ticket3 = await buildTicket();

    const user1 = global.signin();
    const user2 = global.signin();

    // create 1 orders as user #1
    await request(app).post('/api/orders').set('Cookie', user1).send({ ticketId: ticket1.id }).expect(201);

    // create 2 orders as user #2
    const { body: order1 } = await request(app).post('/api/orders').set('Cookie', user2).send({ ticketId: ticket2.id }).expect(201);
    const { body: order2 } = await request(app).post('/api/orders').set('Cookie', user2).send({ ticketId: ticket3.id }).expect(201);

    // make request to get orders for user #2
    const response = await request(app).get('/api/orders').set('Cookie', user2).expect(200);

    //make sure we only got orders for user #2
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(order1.id);
    expect(response.body[1].id).toEqual(order2.id);
    expect(response.body[0].ticket.id).toEqual(ticket2.id);
    expect(response.body[1].ticket.id).toEqual(ticket3.id);

})

test('fetch the order', async () => {
    // create a ticket
    const ticket = await buildTicket();
    const user = global.signin();

    // make a request to build an order with this ticket
    const { body: order } = await request(app).post('/api/orders').set('Cookie', user).send({ ticketId: ticket.id }).expect(201);

    // make request to fetch order
    const response = await request(app).get(`/api/orders/${order.id}`).set('Cookie', user).expect(200);
    expect(response.body.id).toEqual(order.id);
    // another user tries to
    await request(app).get(`/api/orders/${order.id}`).set('Cookie', global.signin()).expect(401);
})

test('return an error if a user tries to fetch another users order', async () => {
    // create a ticket
    const ticket = await buildTicket();
    const user = global.signin();

    // make a request to build an order with this ticket
    const { body: order } = await request(app).post('/api/orders').set('Cookie', user).send({ ticketId: ticket.id }).expect(201);

    // make request to fetch order
    await request(app).get(`/api/orders/${order.id}`).set('Cookie', global.signin()).expect(401);
})

test('cancelling an order', async () => {
    // create a ticket
    const ticket = await buildTicket();
    const user = global.signin();

    // make a request to build an order with this ticket
    const { body: order } = await request(app).post('/api/orders').set('Cookie', user).send({ ticketId: ticket.id }).expect(201);

    // cancel that order
    const { body: cancelledOrder } = await request(app).delete(`/api/orders/${order.id}`).set('Cookie', user).expect(200);

    expect(cancelledOrder.id).toEqual(order.id);
    expect(cancelledOrder.status).toEqual(OrderStatus.Cancelled);

})
