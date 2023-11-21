import express from "express";
import 'express-async-errors'
import { router } from "./routes/auth";
import { errorHandler, NotFoundError } from '@yazidy-tickets/common';
import cookieSession from "cookie-session";
import dotenv from 'dotenv';

console.log(__dirname);

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


app.use('/api/users', router)
app.all("*", async () => {
    throw new NotFoundError()
})

app.use(errorHandler)

export { app };