import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

declare global {
    // must be var (let / const won't work)
    var signin: () => Promise<string[]>;
}

beforeAll(async () => {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    await mongoose.connect(uri);
});

afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        // clear all mongodb data related to previous tests
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    // terminate all connections to mongod-server
    // await mongoose.connection.close();
    // await mongod.stop();
    await mongoose.disconnect();
});

global.signin = async () => {
    const email = 'test@test.com';
    const password = 'test1234';

    const response = await request(app).post('/api/users/signin').send({ email, password }).expect(201);

    const cookie = response.get('Set-Cookie');

    return cookie;
}