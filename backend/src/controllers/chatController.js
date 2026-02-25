const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getOrCreateRoom(req, res, next) {
  try {
    const { productId } = req.body;
    const buyerId = req.user.id;

    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    if (product.sellerId === buyerId) return res.status(400).json({ message: '본인 상품에는 채팅할 수 없습니다.' });

    const room = await prisma.chatRoom.upsert({
      where: { productId_buyerId: { productId: Number(productId), buyerId } },
      update: {},
      create: { productId: Number(productId), buyerId },
      include: {
        product: { select: { id: true, title: true, price: true, images: true } },
        buyer: { select: { id: true, nickname: true, avatar: true } },
      },
    });

    res.json(room);
  } catch (err) {
    next(err);
  }
}

async function getMyRooms(req, res, next) {
  try {
    const userId = req.user.id;
    const rooms = await prisma.chatRoom.findMany({
      where: { OR: [{ buyerId: userId }, { product: { sellerId: userId } }] },
      include: {
        product: { select: { id: true, title: true, price: true, images: true, sellerId: true } },
        buyer: { select: { id: true, nickname: true, avatar: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(rooms);
  } catch (err) {
    next(err);
  }
}

async function getMessages(req, res, next) {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await prisma.chatRoom.findUnique({
      where: { id: Number(roomId) },
      include: { product: { select: { sellerId: true } } },
    });
    if (!room) return res.status(404).json({ message: '채팅방을 찾을 수 없습니다.' });

    const isMember = room.buyerId === userId || room.product.sellerId === userId;
    if (!isMember) return res.status(403).json({ message: '권한이 없습니다.' });

    const messages = await prisma.message.findMany({
      where: { chatRoomId: Number(roomId) },
      include: { sender: { select: { id: true, nickname: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

module.exports = { getOrCreateRoom, getMyRooms, getMessages };
