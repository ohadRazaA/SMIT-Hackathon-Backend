import userModel from "../models/userModel.js";
import OTPModel from "../models/otp.js";

export const createIndexes = async () => {
    try {
        await userModel.collection.createIndex(
            { email: 1 }, 
            { unique: true, background: true }
        );
        await userModel.collection.createIndex(
            { createdAt: -1 }, 
            { background: true }
        );

        await OTPModel.collection.createIndex(
            { email: 1, otp: 1, isUsed: 1 }, 
            { background: true }
        );
        await OTPModel.collection.createIndex(
            { createdAt: 1 }, 
            { expireAfterSeconds: 900, background: true }
        );

        console.log('Database indexes created successfully');
    } catch (error) {
        console.error('Error creating indexes:', error);
    }
};