const jwt = require('jsonwebtoken');
const User = require("../models/User");

module.exports = {
    signup: async (req, res) => {
        const { username, email, password } = req.body;

        // validations and sanitization
        if (!username || !email || !password) {
            const err = new Error('All fields are required');
            err.status = 400;
            throw err;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            const err = new Error('Username or email already exists');
            err.status = 409;
            throw err;
        };

        // create new user

        const newUser = new User({ username, email, password });
        await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    },

    login: async (req, res) => {
        const { username, password } = req.body;

        // validations and sanitization
        if (!username || !password) {
            const err = new Error('All fields are required');
            err.status = 400;
            throw err;
        }

        const user = await User.findOne({ username });
        if (!user) {
            const err = new Error('Invalid username or password');
            err.status = 401;
            throw err;
        }

        // check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            const err = new Error('Invalid username or password');
            err.status = 401;
            throw err;
        }

        // sign jwt
        const payload = { sub: user._id, username: user.username }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        res.json({
            message: 'Logged in successfully',
            token,
            user_id: user._id
        });
    }
}