import mongoose from "mongoose";
import { app } from "./app";


const startUp = async () => {
    if (!process.env.DATABASE_URI) throw new Error('not connected to a DB!');
    if (!process.env.JWT_SECRET) throw new Error('no jwt secret string!');

    try {
        await mongoose.connect(process.env.DATABASE_URI!);
        console.log('connected to mongoDB [ticketAuth]');
    } catch (err) {
        console.log(err);

    }
};

app.listen(3000, () => {
    console.log('listening on port 3000 ...');
});

startUp();