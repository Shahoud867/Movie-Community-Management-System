const {
  getFriends,
  getPendingRequests,
  getFriendshipStatus,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
} = require('./friends.service');

async function listFriends(req, res, next) {
  try {
    const userId = req.user.user_id;
    const friends = await getFriends(userId);
    res.json(friends);
  } catch (err) {
    next(err);
  }
}

async function listRequests(req, res, next) {
  try {
    const userId = req.user.user_id;
    const requests = await getPendingRequests(userId);
    res.json(requests);
  } catch (err) {
    next(err);
  }
}

async function checkStatus(req, res, next) {
  try {
    const userId = req.user.user_id;
    const otherUserId = parseInt(req.query.user_id);

    if (!otherUserId) {
      return res.status(400).json({ error: 'user_id query parameter is required' });
    }

    const status = await getFriendshipStatus(userId, otherUserId);
    res.json(status);
  } catch (err) {
    next(err);
  }
}

async function sendRequest(req, res, next) {
  try {
    const senderId = req.user.user_id;
    const { friend_id } = req.body;

    if (!friend_id) {
      return res.status(400).json({ error: 'friend_id is required' });
    }

    const result = await sendFriendRequest(senderId, parseInt(friend_id));
    res.json(result);
  } catch (err) {
    if (err.message === 'Cannot send friend request to yourself' ||
        err.message === 'Already friends' ||
        err.message === 'Friend request already pending' ||
        err.message === 'User not found') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

async function respond(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { friendship_id, action } = req.body;

    if (!friendship_id || !action) {
      return res.status(400).json({ error: 'friendship_id and action are required' });
    }

    const result = await respondToFriendRequest(userId, parseInt(friendship_id), action);
    res.json(result);
  } catch (err) {
    if (err.message === 'Invalid action. Must be "accept" or "decline"' ||
        err.message === 'Friend request not found' ||
        err.message === 'You cannot respond to this friend request' ||
        err.message === 'Friend request is not pending') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { friend_id } = req.body;

    if (!friend_id) {
      return res.status(400).json({ error: 'friend_id is required' });
    }

    const result = await removeFriend(userId, parseInt(friend_id));
    res.json(result);
  } catch (err) {
    if (err.message === 'Invalid operation' ||
        err.message === 'Friendship not found or not accepted') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = {
  listFriends,
  listRequests,
  checkStatus,
  sendRequest,
  respond,
  remove,
};
