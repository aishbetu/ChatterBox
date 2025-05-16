const jwt = require("jsonwebtoken");

module.exports = {
    verifyToken: (req, res, next) => {
        try {
            const authorization = req.headers['authorization'];
            if (!authorization) {
                const err = new Error('No token provided');
                err.status = 401;
                return next(err);
            }
            // split Bearer from token
            const tokenParts = authorization.split(' ');
            if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
                const err = new Error('Invalid token format');
                err.status = 401;
                return next(err);
            }
            // get token
            const token = tokenParts[1];
            // Verify token logic here (e.g., using JWT)
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    const error = new Error('Failed to authenticate token');
                    error.status = 401;
                    return next(error);
                }
                req.user = decoded;
                next();
            })
        } catch (error) {
            console.error('Error verifying token:', error);
            const err = new Error('Error verifying token');
            err.status = 401;
            return next(err);
        }
    },

    verifySocket: (socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.query?.token ||
                socket.handshake.headers?.token;
            console.log('Socket token:', token);
            if (!token) {
                return next(new Error('No token provided'));
            }

            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return next(new Error('Failed to authenticate token'));
                }
                socket.user = decoded;
                next();
            });
        } catch (error) {
            console.error('Error in socket auth:', error);
            next(new Error('Error verifying token'));
        }
    }
};