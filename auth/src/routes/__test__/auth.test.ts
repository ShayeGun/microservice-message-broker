import request from "supertest";
import { app } from "../../app";


// =============== signup =================
test('set cookie after successful signin', async () => {
    const response = await request(app).post('/api/users/signin').send({
        email: 'test@test.com',
        password: '123456'
    });

    expect(response.get('Set-Cookie')).toBeDefined();
})

test('email not valid', async () => {
    return request(app).post('/api/users/signin').send({
        email: 'hollyMotherOfJesus',
        password: '123456'
    }).expect(400);
})

test('reject repetitive email signin', async () => {
    await request(app).post('/api/users/signin').send({
        email: 'test@test.com',
        password: '123456'
    }).expect(201);

    return request(app).post('/api/users/signin').send({
        email: 'test@test.com',
        password: '123456'
    }).expect(400);
})

// =============== login =================
test('login with correct email and incorrect password', async () => {
    await request(app).post('/api/users/signin').send({
        email: 'test@test.com',
        password: 'test1234'
    }).expect(201);

    await request(app).post('/api/users/login').send({
        email: 'test@test.com',
        password: '123borokhar'
    }).expect(400);
})

test('login with correct email & password', async () => {
    await request(app).post('/api/users/signin').send({
        email: 'test@test.com',
        password: 'test1234'
    }).expect(201);

    await request(app).post('/api/users/login').send({
        email: 'test@test.com',
        password: 'test1234'
    }).expect(200);

})

// =============== current-user =================
test('responds with detail about current user', async () => {
    const cookie = await global.signin();

    const response = await request(app).get('/api/users/currentuser').set({ 'Cookie': cookie }).send().expect(200);

    expect(response.body.currentUser.email).toEqual('test@test.com');
});

test('responds with null if not authorized', async () => {
    const response = await request(app).get('/api/users/currentuser').expect(401);

    expect(response.body.currentUser).toBeUndefined();
})