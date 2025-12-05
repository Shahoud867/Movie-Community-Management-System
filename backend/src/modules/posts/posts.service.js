const { pool } = require('../../config/db');
const { createNotification } = require('../notifications/notifications.service');

/**
 * Get posts for a specific movie
 */
async function getMoviePosts(movieId) {
  const [posts] = await pool.query(
    `SELECT 
      p.post_id,
      p.user_id,
      p.movie_id,
      p.content,
      p.created_date,
      p.edited_date,
      p.is_pinned,
      p.like_count,
      p.comment_count,
      u.name as user_name,
      u.profile_picture as user_profile_picture
    FROM Post p
    JOIN Users u ON p.user_id = u.user_id
    WHERE p.movie_id = ?
    ORDER BY p.is_pinned DESC, p.created_date DESC`,
    [movieId]
  );

  return posts;
}

/**
 * Get posts by a specific user
 */
async function getUserPosts(userId) {
  const [posts] = await pool.query(
    `SELECT 
      p.post_id,
      p.user_id,
      p.movie_id,
      p.content,
      p.created_date,
      p.edited_date,
      p.is_pinned,
      p.like_count,
      p.comment_count,
      m.title as movie_title,
      m.poster as movie_poster
    FROM Post p
    JOIN Movie m ON p.movie_id = m.movie_id
    WHERE p.user_id = ?
    ORDER BY p.created_date DESC`,
    [userId]
  );

  return posts;
}

/**
 * Get a single post by ID
 */
async function getPostById(postId) {
  const [posts] = await pool.query(
    `SELECT 
      p.post_id,
      p.user_id,
      p.movie_id,
      p.content,
      p.created_date,
      p.edited_date,
      p.is_pinned,
      p.like_count,
      p.comment_count,
      u.name as user_name,
      u.profile_picture as user_profile_picture,
      m.title as movie_title
    FROM Post p
    JOIN Users u ON p.user_id = u.user_id
    JOIN Movie m ON p.movie_id = m.movie_id
    WHERE p.post_id = ?`,
    [postId]
  );

  return posts[0] || null;
}

/**
 * Create a new post
 */
async function createPost(userId, movieId, content) {
  const [result] = await pool.query(
    'INSERT INTO Post (user_id, movie_id, content) VALUES (?, ?, ?)',
    [userId, movieId, content]
  );

  return {
    post_id: result.insertId,
    user_id: userId,
    movie_id: movieId,
    content,
    message: 'Post created successfully'
  };
}

/**
 * Update a post
 */
async function updatePost(postId, userId, content) {
  // Verify ownership
  const post = await getPostById(postId);
  if (!post || post.user_id !== userId) {
    throw new Error('Post not found or unauthorized');
  }

  const [result] = await pool.query(
    'UPDATE Post SET content = ?, edited_date = CURRENT_TIMESTAMP WHERE post_id = ?',
    [content, postId]
  );

  return {
    post_id: postId,
    content,
    message: 'Post updated successfully'
  };
}

/**
 * Delete a post
 */
async function deletePost(postId, userId) {
  // Verify ownership
  const post = await getPostById(postId);
  if (!post || post.user_id !== userId) {
    throw new Error('Post not found or unauthorized');
  }

  const [result] = await pool.query(
    'DELETE FROM Post WHERE post_id = ?',
    [postId]
  );

  return { success: result.affectedRows > 0 };
}

/**
 * Like/Unlike a post (toggle)
 */
async function likePost(postId, userId) {
  // Get the post to check ownership
  const post = await getPostById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  // Prevent self-likes
  if (post.user_id === userId) {
    throw new Error('You cannot like your own post');
  }

  // Check if user already liked the post
  const [existing] = await pool.query(
    'SELECT like_id FROM Like_Post WHERE post_id = ? AND user_id = ?',
    [postId, userId]
  );

  if (existing.length > 0) {
    // Unlike - remove the like
    await pool.query(
      'DELETE FROM Like_Post WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    // Decrement like count
    await pool.query(
      'UPDATE Post SET like_count = GREATEST(0, like_count - 1) WHERE post_id = ?',
      [postId]
    );

    const post = await getPostById(postId);

    return {
      post_id: postId,
      liked: false,
      like_count: post.like_count,
      message: 'Post unliked successfully'
    };
  } else {
    // Like - add the like
    await pool.query(
      'INSERT INTO Like_Post (post_id, user_id) VALUES (?, ?)',
      [postId, userId]
    );

    // Increment like count
    const [result] = await pool.query(
      'UPDATE Post SET like_count = like_count + 1 WHERE post_id = ?',
      [postId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Post not found');
    }

    const updatedPost = await getPostById(postId);

    // Create notification for post owner (with sender's name)
    try {
      const [likerInfo] = await pool.query('SELECT name FROM Users WHERE user_id = ?', [userId]);
      const likerName = likerInfo[0]?.name || 'Someone';
      await createNotification({
        recipient_id: post.user_id,
        sender_id: userId,
        notification_type: 'like',
        reference_id: postId,
        message: `${likerName} liked your post`
      });
    } catch (err) {
      // Don't fail the like if notification fails
      console.error('Failed to create like notification:', err.message);
    }

    return {
      post_id: postId,
      liked: true,
      like_count: updatedPost.like_count,
      message: 'Post liked successfully'
    };
  }
}

/**
 * Get comments for a post
 */
async function getPostComments(postId) {
  const [comments] = await pool.query(
    `SELECT 
      c.comment_id,
      c.post_id,
      c.user_id,
      c.content,
      c.created_date,
      c.edited_date,
      u.name as user_name,
      u.profile_picture as user_profile_picture
    FROM Comment c
    JOIN Users u ON c.user_id = u.user_id
    WHERE c.post_id = ?
    ORDER BY c.created_date ASC`,
    [postId]
  );

  // Transform to match frontend expectations
  return comments.map(c => ({
    comment_id: c.comment_id,
    post_id: c.post_id,
    user: {
      user_id: c.user_id,
      name: c.user_name,
      profile_picture: c.user_profile_picture
    },
    content: c.content,
    created_date: c.created_date,
    edited_date: c.edited_date
  }));
}

/**
 * Create a comment on a post
 */
async function createComment(postId, userId, content) {
  // Verify post exists
  const post = await getPostById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  // Insert comment
  const [result] = await pool.query(
    'INSERT INTO Comment (post_id, user_id, content) VALUES (?, ?, ?)',
    [postId, userId, content]
  );

  // Update comment count on post
  await pool.query(
    'UPDATE Post SET comment_count = comment_count + 1 WHERE post_id = ?',
    [postId]
  );

  // Create notification for post owner (if commenter is not the owner)
  if (post.user_id !== userId) {
    const [commenterInfo] = await pool.query('SELECT name FROM Users WHERE user_id = ?', [userId]);
    const commenterName = commenterInfo[0]?.name || 'Someone';
    await createNotification({
      recipient_id: post.user_id,
      sender_id: userId,
      notification_type: 'comment',
      reference_id: postId,
      message: `${commenterName} commented on your post`
    });
  }

  return {
    comment_id: result.insertId,
    post_id: postId,
    user_id: userId,
    content,
    message: 'Comment created successfully'
  };
}

/**
 * Check if user has liked a post
 */
async function hasUserLikedPost(postId, userId) {
  const [result] = await pool.query(
    'SELECT like_id FROM Like_Post WHERE post_id = ? AND user_id = ?',
    [postId, userId]
  );

  return result.length > 0;
}

module.exports = {
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
};
