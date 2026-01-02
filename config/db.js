import mongoose from "mongoose";
import { createIndexes } from "./indexes.js";

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.URI);
        await createIndexes();
        console.log('db connected');
    } catch (error) {
        console.error(error.message);
    }
}

export default dbConnection;