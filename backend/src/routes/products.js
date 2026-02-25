const express = require('express');
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, toggleLike,
} = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', (req, res, next) => {
  // 선택적 인증 (좋아요 상태 확인용)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch {}
  }
  next();
}, getProduct);

router.post('/', authenticate, upload.array('images', 10), createProduct);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);
router.post('/:id/like', authenticate, toggleLike);

module.exports = router;
