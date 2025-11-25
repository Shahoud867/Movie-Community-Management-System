const express = require('express');
const {
  getPostsForMovie,
  getPostsByUser,
  getPost,
  submitPost,
  editPost,
  removePost,
  likePostController,
  getCommentsForPost,
  submitComment
} = require('./posts.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

// Get posts for a specific movie (public)
router.get('/', getPostsForMovie);

// Get posts by a specific user (public)
router.get('/user/:userId', getPostsByUser);

// Get a single post (public)
router.get('/:postId', getPost);

// Get comments for a post (public)
router.get('/:postId/comments', getCommentsForPost);

// Create, update, delete posts (authenticated)
router.post('/', authenticate, submitPost);
router.patch('/:postId', authenticate, editPost);
router.delete('/:postId', authenticate, removePost);

// Like a post (authenticated)
router.post('/:postId/like', authenticate, likePostController);

// Comment on a post (authenticated)
router.post('/:postId/comments', authenticate, submitComment);

module.exports = { postsRouter: router };
