const {
  getMoviePosts,
  getUserPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getPostComments,
  createComment,
  hasUserLikedPost
} = require('./posts.service');

async function getPostsForMovie(req, res, next) {
  try {
    const movieId = parseInt(req.query.movie_id);
    if (!movieId) {
      return res.status(400).json({ error: 'Invalid movie ID' });
    }

    const posts = await getMoviePosts(movieId);
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

async function getPostsByUser(req, res, next) {
  try {
    const userId = parseInt(req.params.userId);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const posts = await getUserPosts(userId);
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

async function getPost(req, res, next) {
  try {
    const postId = parseInt(req.params.postId);
    if (!postId) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await getPostById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if current user has liked this post
    if (req.user) {
      const hasLiked = await hasUserLikedPost(postId, req.user.user_id);
      post.user_has_liked = hasLiked;
    }

    res.json(post);
  } catch (err) {
    next(err);
  }
}

async function submitPost(req, res, next) {
  try {
    const { movie_id, content } = req.body;

    if (!movie_id || !content) {
      return res.status(400).json({ error: 'Movie ID and content are required' });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ error: 'Content cannot be empty' });
    }

    const result = await createPost(req.user.user_id, movie_id, content);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function editPost(req, res, next) {
  try {
    const postId = parseInt(req.params.postId);
    const { content } = req.body;

    if (!postId) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await updatePost(postId, req.user.user_id, content);
    res.json(result);
  } catch (err) {
    if (err.message === 'Post not found or unauthorized') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

async function removePost(req, res, next) {
  try {
    const postId = parseInt(req.params.postId);

    if (!postId) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const result = await deletePost(postId, req.user.user_id);

    if (!result.success) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    if (err.message === 'Post not found or unauthorized') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

async function likePostController(req, res, next) {
  try {
    const postId = parseInt(req.params.postId);

    if (!postId) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const result = await likePost(postId, req.user.user_id);
    res.json(result);
  } catch (err) {
    if (err.message === 'Post not found') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

async function getCommentsForPost(req, res, next) {
  try {
    const postId = parseInt(req.params.postId);

    if (!postId) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const comments = await getPostComments(postId);
    res.json(comments);
  } catch (err) {
    next(err);
  }
}

async function submitComment(req, res, next) {
  try {
    const postId = parseInt(req.params.postId);
    const { content } = req.body;

    if (!postId) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await createComment(postId, req.user.user_id, content);
    res.status(201).json(result);
  } catch (err) {
    if (err.message === 'Post not found') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = {
  getPostsForMovie,
  getPostsByUser,
  getPost,
  submitPost,
  editPost,
  removePost,
  likePostController,
  getCommentsForPost,
  submitComment
};
