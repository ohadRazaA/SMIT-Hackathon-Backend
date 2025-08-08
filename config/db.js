import mongoose from "mongoose";

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.URI);
        console.log('db connected');
    } catch (error) {
        console.error(error.message)
    }
}

export default dbConnection;