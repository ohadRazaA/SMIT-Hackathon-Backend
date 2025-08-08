import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"

const signupController = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const isExist = await userModel.findOne({ email });
        if (isExist) {
            return response.json({
                status: false,
                message: "Email Already Exist!",
                data: null
            })
        }

        if (!firstName || !lastName ||!email || !password) {
            return res.status(401).json({
                message: "required field are missing"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const myUser = new userModel({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            roles: 'user'
        });
        const user = await userModel.create(myUser);

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message || "something went wrong!"
        })
    }
}

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "required field are missing"
            })
        }

        const user = await userModel.findOne({ email });
        if (!user) return res.status(401).json({ message: 'INVALID EMAIL OR PASSWORD', status: false });


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'INVALID EMAIL OR PASSWORD', status: false });

        const PRIVATE_KEY = process.env.jwtPrivateKey
        const token = jwt.sign({ id: user._id }, PRIVATE_KEY)
        res.status(200).json({
            message: "USER SUCCESSFULLY LOGIN",
            data: user,
            status: true,
            token
        })

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


export {
    signupController,
    loginController
};