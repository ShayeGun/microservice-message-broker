import express from "express";
import 'express-async-errors';
import cookieSession from "cookie-session";
import dotenv from 'dotenv';
import { errorHandler, NotFoundError, currentUser } from '@yazidy-tickets/common';
import { router } from "./routes/index";

dotenv.config({
    path: `${__dirname}/../config.env`
});

const app = express();

app.use(express.json());
app.set('trust proxy', true);
app.use(cookieSession({
    // jwt doesn't need encryption
    signed: false,
    // only transfer data on HTTPS
    // secure: true
}));

app.use('/api/orders', currentUser, router);
app.all("*", async () => {
    throw new NotFoundError()
})

app.use(errorHandler)

export { app };