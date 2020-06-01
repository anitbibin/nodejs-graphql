const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

router.get('/posts', isAuth, feedController.getPosts);
router.get('/post/:postId', isAuth, feedController.getPost);
router.post('/post', isAuth, feedController.createPost);
router.put('/post/:postId', isAuth, feedController.updatePost);
router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;