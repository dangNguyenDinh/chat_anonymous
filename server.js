const express = require('express');
const { MongoClient } = require('mongodb');
const http = require('http');
const { Server } = require('socket.io');
//mongodb+srv://konan:MxF5dRjwTsQ3jBLZ@cluster0.njam8.mongodb.net/
// Kết nối MongoDB
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'konan_db';
const client = new MongoClient(url);

async function connectDB() {
    await client.connect();
    console.log('Kết nối thành công tới MongoDB');
    return client.db(dbName).collection('messages');
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware phục vụ file tĩnh
app.use(express.static('public'));

// Socket.IO xử lý tin nhắn
io.on('connection', async (socket) => {
    console.log('Người dùng kết nối:', socket.id);

    const messagesCollection = await connectDB();

    // Gửi lịch sử tin nhắn khi người dùng mới kết nối
    const messages = await messagesCollection.find().toArray();
    socket.emit('load_messages', messages);

    // Lắng nghe tin nhắn từ client
    socket.on('chat_message', async (data) => {
        const message = { username: data.username, message: data.message, timestamp: new Date() };
        await messagesCollection.insertOne(message);

        // Gửi tin nhắn tới tất cả người dùng
        io.emit('chat_message', message);
    });

    socket.on('disconnect', () => {
        console.log('Người dùng đã ngắt kết nối:', socket.id);
    });
});

// Khởi động server
const PORT = 2511;
server.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
