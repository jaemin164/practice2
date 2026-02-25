const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function parseImages(product) {
  try {
    return { ...product, images: JSON.parse(product.images || '[]') };
  } catch {
    return { ...product, images: [] };
  }
}

async function getProducts(req, res, next) {
  try {
    const { category, location, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = { NOT: { status: 'SOLD' } };
    if (category) where.category = category;
    if (location) where.location = { contains: location };
    if (search) where.title = { contains: search };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          seller: { select: { id: true, nickname: true, location: true } },
          _count: { select: { likes: true, chatRooms: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products: products.map(parseImages),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        seller: { select: { id: true, nickname: true, avatar: true, location: true, mannerScore: true } },
        _count: { select: { likes: true, chatRooms: true } },
      },
    });
    if (!product) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });

    await prisma.product.update({ where: { id: Number(id) }, data: { viewCount: { increment: 1 } } });

    let isLiked = false;
    if (req.user) {
      const like = await prisma.like.findUnique({
        where: { userId_productId: { userId: req.user.id, productId: Number(id) } },
      });
      isLiked = !!like;
    }

    res.json({ ...parseImages(product), isLiked });
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const { title, description, price, category, location } = req.body;
    if (!title || !price || !category) {
      return res.status(400).json({ message: '필수 항목을 입력해주세요.' });
    }
    const imageList = req.files?.map((f) => `/uploads/${f.filename}`) || [];

    const product = await prisma.product.create({
      data: {
        title,
        description: description || '',
        price: Number(price),
        category,
        location: location || '미설정',
        images: JSON.stringify(imageList),
        sellerId: req.user.id,
      },
    });
    res.status(201).json(parseImages(product));
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    if (product.sellerId !== req.user.id) return res.status(403).json({ message: '권한이 없습니다.' });

    const { title, description, price, category, location, status } = req.body;
    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(price && { price: Number(price) }),
        ...(category && { category }),
        ...(location && { location }),
        ...(status && { status }),
      },
    });
    res.json(parseImages(updated));
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    if (product.sellerId !== req.user.id) return res.status(403).json({ message: '권한이 없습니다.' });

    await prisma.like.deleteMany({ where: { productId: Number(id) } });
    await prisma.product.delete({ where: { id: Number(id) } });
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    next(err);
  }
}

async function toggleLike(req, res, next) {
  try {
    const { id } = req.params;
    const productId = Number(id);
    const userId = req.user.id;

    const existing = await prisma.like.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { userId_productId: { userId, productId } } });
      res.json({ liked: false });
    } else {
      await prisma.like.create({ data: { userId, productId } });
      res.json({ liked: true });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, toggleLike };
