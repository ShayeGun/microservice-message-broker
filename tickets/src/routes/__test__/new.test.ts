import request from "supertest";
import { Ticket } from "../../models/ticket";
import { app } from "../../app";
import mongoose from "mongoose";
import { ticketEmitter } from "../../events/publisher/ticket-create-publisher";
import { ticketUpdate } from "../../events/publisher/ticket-update-publisher";
import jwt from "jsonwebtoken";

// // =================================== creating tickets =========================================

// test('has a route handler listening to api/tickets for POST request', async () => {
//     const response = await request(app).post('/api/tickets').send({});
//     expect(response.status).not.toBe(404);
// });
// test('can only be accessed if user signed in', async () => {
//     const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({});

//     expect(response.status).not.toBe(401);
// });
// test('returns an error if an invalid title is provided', async () => {
//     let response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: "", price: 10 });
//     expect(response.status).toBe(400);

//     response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ price: 10 });
//     expect(response.status).toBe(400);

// });
// test('returns an error if an invalid price is provided', async () => {
//     let response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: "title", price: -10 });
//     expect(response.status).toBe(400);

//     response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'title' });
//     expect(response.status).toBe(400);
// });
// test('creates a ticket with valid inputs', async () => {
//     // setting up connection to RabbitMQ
//     await ticketEmitter.connect();

//     let ticket = await Ticket.find({});
//     expect(ticket.length).toEqual(0);

//     const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'title', price: 10 });
//     expect(response.status).toBe(201);

//     ticket = await Ticket.find({});
//     expect(ticket.length).toEqual(1);

// });

test('update a ticket with valid inputs', async () => {
    const auth = global.signin();

    let ticket = await Ticket.find({});
    expect(ticket.length).toEqual(0);

    const response = await request(app).post('/api/tickets').set('Cookie', auth).send({ title: 'title', price: 10 });
    expect(response.status).toBe(201);

    await request(app).patch(`/api/tickets/${global.mongooseID}`).set('Cookie', auth).send({ title: 't', price: 11 });
    expect(response.status).toBe(201);

    ticket = await Ticket.find({});
    expect(ticket.length).toEqual(1);

});

// // =================================== showing tickets =========================================

// test('returns 404 if ticket is not found', async () => {
//     // create random + valid mongodb id
//     const randomId = new mongoose.Types.ObjectId().toHexString();

//     const response = await request(app).get(`/api/tickets/${randomId}`).send();
//     expect(response.status).toEqual(404);
// });

// test('returns the ticket if it is found', async () => {
//     // insert a ticket in DB
//     const title = 'title';
//     const price = 10;
//     const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title, price }).expect(201);

//     const ticketResponse = await request(app).get(`/api/tickets/${response.body._id}`).send();

//     expect(ticketResponse.status).toEqual(200);
//     expect(ticketResponse.body.title).toEqual(title);
//     expect(ticketResponse.body.price).toEqual(price);
// });

// test('get all tickets that are available', async () => {
//     // create 3 tickets
//     await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'title', price: 10 });
//     await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'title2', price: 10 });
//     await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'title3', price: 10 });

//     // get all tickets
//     const response = await request(app).get('/api/tickets').send();
//     expect(response.status).toEqual(200);
// })

// // =================================== updating tickets =========================================

// test('unauthenticated users cant update tickets returns 401', async () => {
//     const randomId = new mongoose.Types.ObjectId().toHexString();
//     await request(app).patch(`/api/tickets/${randomId}`).send({ title: 'update title', price: 100 }).expect(401);

// })
// test('ticket id validation for update', async () => {
//     const randomId = new mongoose.Types.ObjectId().toHexString();
//     await request(app).patch(`/api/tickets/${randomId}`).set('Cookie', global.signin()).send({ title: 'update title', price: 100 }).expect(404);
// })
// test('return 401 if another user tries to update a ticket that he doesn\'t own', async () => {
//     // ticket owner
//     const response = await request(app).post(`/api/tickets`).set('Cookie', global.signin()).send({ title: 'title', price: 10 }).expect(201);
//     // other user
//     await request(app).patch(`/api/tickets/${response.body._id}`).set('Cookie', global.signin()).send({ title: 'update', price: 100 }).expect(401);
// })
// test('return 400 if user provides invalid title or price for updating', async () => {
//     const cookie = global.signin();
//     const response = await request(app).post(`/api/tickets`).set('Cookie', cookie).send({ title: 'title', price: 10 }).expect(201);
//     await request(app).patch(`/api/tickets/${response.body._id}`).set('Cookie', cookie).send({ title: '', price: 10 }).expect(400);
//     await request(app).patch(`/api/tickets/${response.body._id}`).set('Cookie', cookie).send({ title: 'update' }).expect(400);
// })
// test('update ticket if user was authorized + inputs were valid', async () => {
//     const cookie = global.signin();
//     const response = await request(app).post(`/api/tickets`).set('Cookie', cookie).send({ title: 'title', price: 10 }).expect(201);
//     await request(app).patch(`/api/tickets/${response.body._id}`).set('Cookie', cookie).send({ title: 'update', price: 100 }).expect(200);

//     const ticketResponse = await request(app).get(`/api/tickets/${response.body._id}`).set('Cookie', cookie);
//     expect(ticketResponse.body.title).toEqual('update');
//     expect(ticketResponse.body.price).toEqual(100);
//     expect(ticketResponse.status).toEqual(200);
// })

