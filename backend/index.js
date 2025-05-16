require('dotenv').config(); 

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors')
const { Server } = require('socket.io');

// import routes
const authRoute = require('./routes/authRoute');
const chatRoute = require('./routes/chatRoute');
const mongoose = require('mongoose');
const { verifySocket } = require('./utils/middleware');
const Message = require('./models/Message');

const io     = new Server(http, {
  cors: { origin: '*' }
});



const port = process.env.PORT;

// Middleware to parse JSON
app.use(cors(), express.json());

//mongoDB connection
mongoose.connect(process.env.DATABASE)
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
    });

//setup routes
app.use('/api/auth', authRoute);
app.use('/api/chat', chatRoute);

app.use((req, res, next) => {
    res.status(404).json({error: 'Not Found'});
});


// 2. Global error handler
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err.stack);                    // log stack
  res
    .status(err.status && err.status >= 400 && err.status < 600    // valid HTTP code?
      ? err.status : 500)
    .json({
      error: err.message || 'Internal Server Error'
    });
});

io.use(verifySocket);

const ONLINE_USERS = new Map();
// Socket.io connection
io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    const userId = socket.user.sub;
    ONLINE_USERS.set(userId, socket.id);
    console.log(`🟢 User ${userId} connected`);

    io.emit('onlineUsers', Array.from(ONLINE_USERS.keys())); // Broadcast the online users to all clients

    // 1. Send mesage to client
    socket.on('sendMessage', async ({to, text}, ack) => {
        try {
            const msg = await Message({ sender: userId, receiver: to, content: text }).save();
            // ack to sender
            if(ack) ack({ status: 'ok', message: msg });

            // emit to recipient if online
            const recipientSocketId = ONLINE_USERS.get(to);
            if(recipientSocketId) {
                io.to(recipientSocketId).emit('receiveMessage', msg);
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            if (ack) ack({ status: 'error', error: error.message });
        }
    });

    // 2. Acknowledge message read
    socket.on('messageRead', async ({ messageId, from, to }) => {
        try {
            const msg = await Message.findByIdAndUpdate(messageId, { read: true }, { new: true });

            // acknowledge to reader
            socket.emit('messageReadAck', { messageId, read: msg.read });

            // notify original sender if online
            const senderSocketId = ONLINE_USERS.get(to);
            if(senderSocketId) {
                io.to(senderSocketId).emit('messageRead', {
                    messageId,
                    by: from,
                    at: new Date()
                });
            }
        } catch (error) {
            console.error('[messageRead error]', error);
            socket.emit('error', { message: error.message });
        }
    })

    // 3 Handle typing event
    socket.on('typing', ({ to, typing }) => {
        const recipientSocketId = ONLINE_USERS.get(to);
        if(recipientSocketId) {
            io.to(recipientSocketId)
                .emit('typing', { from: userId, typing })
        }
    });

    socket.on('disconnect', () => {
        ONLINE_USERS.delete(userId)
        console.log(`🔴 User ${userId} disconnected`);
        io.emit('onlineUsers', Array.from(ONLINE_USERS.keys()));
    });
});

// Update the server to use the HTTP server
http.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});