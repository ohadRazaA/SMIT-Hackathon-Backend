import mongoose from 'mongoose';
import vitalsSchema from './vitals.js';

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    relation: {
        type: String,
        trim: true
    },
    age: {
        type: Number,
        min: 0,
        max: 150
    },
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/doxunnujg/image/upload/v1766140938/hi_fk5gyf.png',
        trim: true,
        set: v => (v === '' ? undefined : v)
    },
    email: {
        type: String,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Invalid email address'],
    },
    phone: {
        type: String,
        trim: true
    },
    vitals: { 
        type: vitalsSchema, 
        default: () => ({}) 
    },
    vitalsHistory: [vitalsSchema],
    AISummary: {
        type: String,
        trim: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });


const memberModel = mongoose.model('member', memberSchema);
export default memberModel;