const {
  getConversations,
  getMessagesBetweenUsers,
  sendMessage,
  markMessageAsRead,
  markConversationAsRead,
} = require('./messages.service');

async function listConversations(req, res, next) {
  try {
    const userId = req.user.user_id;
    const conversations = await getConversations(userId);
    res.json(conversations);
  } catch (err) {
    next(err);
  }
}

async function getMessages(req, res, next) {
  try {
    const userId = req.user.user_id;
    const otherUserId = parseInt(req.query.user_id);

    if (!otherUserId) {
      return res.status(400).json({ error: 'user_id query parameter is required' });
    }

    const messages = await getMessagesBetweenUsers(userId, otherUserId);
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

async function send(req, res, next) {
  try {
    const senderId = req.user.user_id;
    const { receiver_id, content } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({ error: 'receiver_id and content are required' });
    }

    const message = await sendMessage(senderId, parseInt(receiver_id), content);
    res.status(201).json(message);
  } catch (err) {
    if (err.message === 'Cannot send message to yourself' ||
        err.message === 'User not found' ||
        err.message === 'You can only send messages to friends' ||
        err.message === 'Message content cannot be empty') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const userId = req.user.user_id;
    const messageId = parseInt(req.params.id);

    if (!messageId) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    const result = await markMessageAsRead(messageId, userId);
    res.json(result);
  } catch (err) {
    if (err.message === 'Message not found' ||
        err.message === 'You can only mark your own messages as read') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

async function markConversationRead(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const result = await markConversationAsRead(userId, parseInt(user_id));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listConversations,
  getMessages,
  send,
  markRead,
  markConversationRead,
};
