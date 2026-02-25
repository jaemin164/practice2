const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function parseImages(product) {
  try {
    return { ...product, images: JSON.parse(product.images || '[]') };
  } catch {
    return { ...product, images: [] };
  }
}

async function getProfile(req, res, next) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        location: true,
        mannerScore: true,
        createdAt: true,
        products: {
          where: { status: { not: 'SOLD' } },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { _count: { select: { likes: true } } },
        },
      },
    });
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    res.json({ ...user, products: user.products.map(parseImages) });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { nickname, location } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;

    const data = {};
    if (nickname) data.nickname = nickname;
    if (location) data.location = location;
    if (avatar) data.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, email: true, nickname: true, avatar: true, location: true, mannerScore: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function writeReview(req, res, next) {
  try {
    const { receiverId, score, content } = req.body;
    const review = await prisma.review.create({
      data: { receiverId: Number(receiverId), writerId: req.user.id, score: Number(score), content },
    });

    const reviews = await prisma.review.findMany({ where: { receiverId: Number(receiverId) } });
    const avg = reviews.reduce((s, r) => s + r.score, 0) / reviews.length;
    await prisma.user.update({ where: { id: Number(receiverId) }, data: { mannerScore: avg } });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}

async function getMyProducts(req, res, next) {
  try {
    const { status } = req.query;
    const where = { sellerId: req.user.id };
    if (status) where.status = status;

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { likes: true, chatRooms: true } } },
    });
    res.json(products.map(parseImages));
  } catch (err) {
    next(err);
  }
}

async function getMyLikes(req, res, next) {
  try {
    const likes = await prisma.like.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            seller: { select: { id: true, nickname: true, location: true } },
            _count: { select: { likes: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(likes.map((l) => parseImages(l.product)));
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, writeReview, getMyProducts, getMyLikes };
