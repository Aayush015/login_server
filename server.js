// Mongodb file
require('./config/db');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const http = require('http');
const socketIo = require('socket.io');
const Chat = require('./models/Chat');

const UserRouter = require('./api/User');
const ItemRouter = require('./api/Item');

// For accepting post form data
app.use(express.json());

app.use('/user', UserRouter);
app.use('/item', ItemRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');

    // Listen for incoming messages
    socket.on('sendMessage', async (data) => {
        const { senderId, receiverId, itemId, message } = data;

        // Save the message to the database
        const chatMessage = new Chat({ senderId, receiverId, itemId, message });
        await chatMessage.save();

        // Emit the message to both the sender and receiver
        io.emit(`message:${itemId}`, chatMessage);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});