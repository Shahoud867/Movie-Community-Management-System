# Technology Stack

## Programming Languages
- **JavaScript (ES6+)** - Backend and frontend
- **SQL** - Database queries and schema
- **HTML5** - Page structure
- **CSS3** - Styling via Tailwind

## Backend Stack

### Runtime & Framework
- **Node.js** v16+ - JavaScript runtime
- **Express.js** v4.19 - Web framework

### Database
- **MySQL** v8.0 - Relational database
- **mysql2** v3.15 - MySQL client with promises

### Authentication & Security
- **jsonwebtoken** v9.0 - JWT tokens
- **bcryptjs** v2.4 - Password hashing
- **helmet** v7.0 - HTTP security headers
- **cors** v2.8 - Cross-origin resource sharing

### Validation
- **express-validator** v7.0 - Request validation
- **zod** v3.22 - Schema validation

### Utilities
- **nodemailer** v7.0 - Email service
- **dotenv** v16.6 - Environment variables
- **morgan** v1.10 - HTTP logging
- **cookie-parser** v1.4 - Cookie parsing

### Development
- **nodemon** v3.0 - Auto-restart on changes

## Frontend Stack

### Styling
- **Tailwind CSS** v3.4 - Utility-first CSS framework

### Build Tools
- **Tailwind CLI** - CSS compilation
- **PowerShell scripts** - File copying and patching

## Database Configuration

### Connection Pool
```javascript
mysql2.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})
```

## Development Commands

### Backend
```bash
npm start              # Start production server
npm run dev            # Start with nodemon (auto-reload)
npm run health         # Run health check
npm run db:init        # Initialize database
```

### Frontend
```bash
npm run dev            # Watch Tailwind CSS changes
npm run build:css      # Build minified CSS
npm run copy:html      # Copy HTML files to dist
npm run copy:assets    # Copy assets to dist
npm run build          # Full production build
```

### Database Setup
```bash
cd backend/db
setup-database.bat     # Windows: Create DB and load data
mysql -u root -p < sample_data.sql  # Linux/Mac
```

## Environment Variables

### Required (.env)
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=movie_community
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM_NAME=Movie Community
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Authentication
- POST `/auth/register` - User registration
- POST `/auth/login` - User login
- POST `/auth/forgot-password` - Request password reset
- POST `/auth/reset-password` - Reset password with token
- POST `/auth/change-password` - Change password (authenticated)

### Movies
- GET `/movies` - List movies (pagination, filters)
- GET `/movies/:id` - Movie details

### Ratings & Reviews
- POST `/ratings` - Rate movie
- POST `/reviews` - Write review

### Watchlist
- GET `/watchlist` - Get user watchlist
- POST `/watchlist` - Add to watchlist

### Social
- POST `/friends/request` - Send friend request
- GET `/messages/conversations` - Get conversations
- POST `/messages` - Send message

### Admin (requires admin auth)
- GET `/admin/users` - List all users
- POST `/admin/movies` - Add movie

## Port Configuration
- **Backend Server**: 3000 (serves both API and frontend)
- **MySQL**: 3306 (default)

## Build Output
- Frontend builds to `frontend/dist/`
- Backend serves from `frontend/dist/` via Express static
