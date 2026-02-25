const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function register(req, res, next) {
  try {
    const { email, password, nickname, location } = req.body;
    if (!email || !password || !nickname) {
      return res.status(400).json({ message: '필수 항목을 입력해주세요.' });
    }

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { nickname }] },
    });
    if (exists) {
      return res.status(409).json({ message: '이미 사용 중인 이메일 또는 닉네임입니다.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, nickname, location: location || '미설정' },
    });

    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email, nickname: user.nickname, location: user.location } });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, nickname: user.nickname, location: user.location, avatar: user.avatar } });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, nickname: true, avatar: true, location: true, mannerScore: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };
