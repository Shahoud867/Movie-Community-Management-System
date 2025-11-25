const {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  updateUserEmail,
} = require('./users.service');
const { getFriends } = require('../friends/friends.service');
const { getUserWatchlist } = require('../watchlist/watchlist.service');
const { getUserReviews } = require('../reviews/reviews.service');

async function getMe(req, res, next) {
  try {
    const profile = await getUserProfile(req.user.user_id);
    res.json({ user: profile });
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const profile = await getUserProfile(userId);
    
    // Return public profile (exclude sensitive fields if needed)
    res.json({ user: profile });
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { name, bio, fav_genre, profile_picture } = req.body;

    if (!name && !bio && fav_genre === undefined && !profile_picture) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updatedProfile = await updateUserProfile(req.user.user_id, {
      name,
      bio,
      fav_genre,
      profile_picture,
    });

    res.json({ user: updatedProfile, message: 'Profile updated successfully' });
  } catch (err) {
    if (err.message === 'No fields to update') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const result = await updateUserPassword(req.user.user_id, {
      currentPassword,
      newPassword,
    });

    res.json(result);
  } catch (err) {
    if (err.message === 'Current password is incorrect' || err.message === 'User not found') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

async function changeEmail(req, res, next) {
  try {
    const { password, newEmail } = req.body;

    if (!password || !newEmail) {
      return res.status(400).json({ error: 'Password and new email are required' });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const result = await updateUserEmail(req.user.user_id, {
      password,
      newEmail,
    });

    res.json(result);
  } catch (err) {
    if (err.message === 'Password is incorrect' || err.message === 'Email already in use') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

async function getUserFriends(req, res, next) {
  try {
    const userId = parseInt(req.params.id);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const friends = await getFriends(userId);
    res.json(friends);
  } catch (err) {
    next(err);
  }
}

async function getUserWatchlistById(req, res, next) {
  try {
    const userId = parseInt(req.params.id);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { status } = req.query;
    const items = await getUserWatchlist(userId, status);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getUserReviewsById(req, res, next) {
  try {
    const userId = parseInt(req.params.id);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const reviews = await getUserReviews(userId);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMe,
  getUserById,
  updateMe,
  changePassword,
  changeEmail,
  getUserFriends,
  getUserWatchlistById,
  getUserReviewsById,
};
