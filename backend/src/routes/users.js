const express = require('express');
const { getProfile, updateProfile, writeReview, getMyProducts, getMyLikes } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.get('/me/products', authenticate, getMyProducts);
router.get('/me/likes', authenticate, getMyLikes);
router.put('/me', authenticate, upload.single('avatar'), updateProfile);
router.post('/reviews', authenticate, writeReview);
router.get('/:id', getProfile);

module.exports = router;
