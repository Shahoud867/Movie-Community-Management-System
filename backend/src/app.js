const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { healthRouter } = require('./routes/health');
const { genresRouter } = require('./routes/genres');
const { authRouter } = require('./modules/auth/auth.routes');
const { usersRouter } = require('./modules/users/users.routes');
const { moviesRouter } = require('./modules/movies/movies.routes');
const { dashboardRouter } = require('./modules/dashboard/dashboard.routes');
const { friendsRouter } = require('./modules/friends/friends.routes');
const { messagesRouter } = require('./modules/messages/messages.routes');
const { watchlistRouter } = require('./modules/watchlist/watchlist.routes');
const { reviewsRouter } = require('./modules/reviews/reviews.routes');
const { notificationsRouter } = require('./modules/notifications/notifications.routes');
const { ratingsRouter } = require('./modules/ratings/ratings.routes');
const { postsRouter } = require('./modules/posts/posts.routes');
const { eventsRouter } = require('./modules/events/events.routes');
const { adminRouter } = require('./modules/admin/admin.routes');
const { analyticsRouter } = require('./modules/analytics/analytics.routes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com"]
    }
  }
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Serve static files from frontend/dist
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/genres', genresRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/friendship', friendsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/analytics', analyticsRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
