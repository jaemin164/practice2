const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('인증 필요'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('유효하지 않은 토큰'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`소켓 연결: userId=${socket.userId}`);

    socket.on('join_room', (roomId) => {
      socket.join(`room_${roomId}`);
    });

    socket.on('send_message', async ({ roomId, content }) => {
      try {
        const message = await prisma.message.create({
          data: { content, chatRoomId: roomId, senderId: socket.userId },
          include: { sender: { select: { id: true, nickname: true, avatar: true } } },
        });
        io.to(`room_${roomId}`).emit('receive_message', message);
      } catch (err) {
        socket.emit('error', { message: '메시지 전송 실패' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`소켓 해제: userId=${socket.userId}`);
    });
  });
}

module.exports = { initSocket };
