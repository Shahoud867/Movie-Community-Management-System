# 🎬 Movie Community Management System

A comprehensive full-stack web application that brings movie enthusiasts together in a vibrant social platform. Users can discover movies, share reviews, connect with friends, organize watch events, and engage in meaningful discussions about cinema.

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Technologies & Tools](#-technologies--tools)
- [Features](#-features)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Key Learnings & Insights](#-key-learnings--insights)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 🎯 Project Overview

### Problem Statement

Movie enthusiasts often struggle to:
- Keep track of movies they want to watch
- Find like-minded people who share similar tastes
- Organize group watch events with friends
- Discover quality content through trusted recommendations
- Engage in meaningful discussions about films

### Solution

The **Movie Community Management System** solves these problems by providing a centralized platform where users can:
- Browse and rate thousands of movies with detailed information
- Build personalized watchlists and track viewing progress
- Connect with friends and follow their movie activities
- Create and join movie watch events
- Share reviews, posts, and engage in discussions
- Receive personalized recommendations based on preferences
- Communicate through an integrated messaging system

This project was developed as part of a **Database Management Systems** course to demonstrate proficiency in full-stack development, database design, and modern web technologies.

---

## 🛠 Technologies & Tools

### Backend
- **Runtime**: Node.js v16+
- **Framework**: Express.js v4.19
- **Database**: MySQL v8.0
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcrypt.js
- **Email Service**: Nodemailer (Gmail SMTP)
- **Validation**: Express-validator, Zod
- **Security**: Helmet.js, CORS
- **Logging**: Morgan

### Frontend
- **Markup**: HTML5
- **Styling**: Tailwind CSS v3.4
- **Scripting**: Vanilla JavaScript (ES6+)
- **Build Tool**: Tailwind CLI
- **Icons**: SVG (inline)

### Database
- **RDBMS**: MySQL 8.0
- **Connection Pool**: mysql2 with promise API
- **Schema**: 15+ normalized tables with foreign key relationships

### Development Tools
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Code Editor**: VS Code
- **Testing**: Manual API testing via browser/Postman
- **Environment Management**: dotenv

---

## ✨ Features

### 🔐 User Authentication & Authorization
- User registration with email validation
- Secure login with JWT-based session management
- Password reset via email with time-limited tokens
- Change password functionality for logged-in users
- Separate admin authentication system
- Protected routes with middleware authentication

### 🎥 Movie Management
- Browse extensive movie catalog with search and filtering
- View detailed movie information (cast, crew, genres, ratings)
- Advanced search by title, genre, release year
- Trending and top-rated movie sections
- Movie rating system (1-10 scale)
- Personal movie reviews with text feedback

### 📝 Social Features
- **Posts & Comments**: Create posts, like, and comment on community discussions
- **Friends System**: Send/accept friend requests, view friends' activities
- **Messaging**: Direct messaging with real-time conversation threads
- **User Profiles**: Customizable profiles with bio, favorite genre, and profile picture
- **Activity Feed**: Dashboard showing friends' recent ratings and reviews

### 📋 Watchlist & Tracking
- Add movies to personal watchlist
- Mark movies as watched/unwatched
- Track watchlist progress and statistics
- Priority-based watchlist organization

### 🎉 Event Management
- Create movie watch events with date, time, and location
- Invite friends to events
- RSVP system (attending/maybe/declined)
- View upcoming and past events
- Event notifications

### 🔔 Notification System
- Real-time notifications for:
  - Friend requests
  - Event invitations
  - New messages
  - Post comments and likes
  - Review interactions
- Mark notifications as read/unread
- Automatic cleanup of old notifications (30+ days)

### 👨‍💼 Admin Panel
- **User Management**: View, activate/deactivate user accounts
- **Admin Management**: Create and manage admin accounts
- **Movie Management**: Add, edit, and delete movies from catalog
- **Genre Management**: Manage movie genres
- **Content Moderation**: Review and moderate user posts/reviews
- **Restricted Words**: Filter inappropriate content
- **Audit Logs**: Track admin actions and system events
- **Reports & Analytics**: User statistics and system metrics

### 🔒 Security Features
- Password hashing with bcrypt (10 salt rounds)
- SHA-256 token hashing for password reset
- JWT token validation on protected routes
- SQL injection prevention via parameterized queries
- XSS protection with Helmet.js
- CORS configuration for API security
- Email verification for password resets
- Environment variable protection (.env)

---

## 🚀 Installation & Setup

### Prerequisites

Ensure you have the following installed:
- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **MySQL** v8.0 or higher ([Download](https://dev.mysql.com/downloads/))
- **Git** ([Download](https://git-scm.com/))
- A **Gmail account** with App Password for email features (optional)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Shahoud867/Movie-Community-Management-System.git
cd Movie-Community-Management-System
```

### Step 2: Database Setup

1. Start your MySQL server
2. Run the database setup script:

```bash
cd backend/db
# On Windows
setup-database.bat

# On Linux/Mac
mysql -u root -p < sample_data.sql
```

This will:
- Create the `movie_community` database
- Set up all tables with proper relationships
- Insert sample data (users, movies, genres, etc.)

### Step 3: Backend Configuration

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Edit `.env` with your configuration:
```env
PORT=3000

# MySQL connection
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=movie_community

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM_NAME=Movie Community

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Step 4: Frontend Setup

1. Navigate to frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Build frontend assets:
```bash
npm run build
```

This will compile Tailwind CSS and copy HTML files to the `dist` directory.

### Step 5: Start the Application

1. Start the backend server:
```bash
cd ../backend
npm start
```

You should see:
```
Server listening on http://localhost:3000
MySQL: connected
[Notification Cleanup] Scheduler started - runs every hour
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

### Step 6: Test Login

Use these sample accounts:

**Regular User**:
- Email: `ahmed.malik@gmail.com`
- Password: `ahmed111`

**Admin User**:
- Navigate to: `http://localhost:3000/admin/login.html`
- Email: `admin@moviecommunity.com`
- Password: `admin123`

---

## 📖 Usage Guide

### For Regular Users

#### 1. **Registration & Login**
- Visit `http://localhost:3000/register.html`
- Fill in your details (name, email, password, favorite genre)
- Login at `http://localhost:3000/login.html`

#### 2. **Browse Movies**
- Navigate to **Movies** from the navbar
- Use search bar to find specific titles
- Filter by genre, year, or rating
- Click on any movie to view detailed information

#### 3. **Rate & Review Movies**
- Open a movie detail page
- Scroll to the rating section
- Select rating (1-10 stars)
- Write a review and submit

#### 4. **Manage Watchlist**
- Click "Add to Watchlist" on any movie page
- View your watchlist from the navbar
- Mark movies as watched/unwatched
- Remove movies from watchlist

#### 5. **Connect with Friends**
- Visit a user's profile
- Click "Add Friend"
- Accept friend requests from notifications
- View friends' activities on dashboard

#### 6. **Create & Join Events**
- Navigate to **Events** → **Create Event**
- Fill in event details (movie, date, location)
- Invite friends
- RSVP to events you're invited to

#### 7. **Messaging**
- Click **Messages** in navbar
- Start a new conversation with friends
- View conversation history

#### 8. **Account Settings**
- Go to **Settings** from profile dropdown
- Update profile picture, bio, favorite genre
- Change password or reset via email

### For Administrators

#### 1. **Access Admin Panel**
- Navigate to `http://localhost:3000/admin/login.html`
- Login with admin credentials

#### 2. **User Management**
- View all registered users
- Activate/deactivate accounts
- Monitor user activities

#### 3. **Movie Management**
- Add new movies with details
- Edit existing movie information
- Delete inappropriate content

#### 4. **Content Moderation**
- Review flagged posts and reviews
- Manage restricted word filters
- Delete policy-violating content

#### 5. **System Monitoring**
- View audit logs of admin actions
- Check user reports
- Monitor system metrics

---

## 🗄 Database Schema

The system uses a normalized MySQL database with **15 core tables**:

### Core Tables

| Table | Purpose |
|-------|---------|
| `Users` | User accounts and profile information |
| `Admin` | Administrator accounts |
| `Movies` | Movie catalog with details |
| `Genres` | Movie genre classifications |
| `Movie_Genres` | Many-to-many movie-genre relationship |
| `Ratings` | User ratings for movies (1-10 scale) |
| `Reviews` | Detailed movie reviews with text |
| `Watchlist` | Personal movie watchlists |
| `Friendships` | User friend relationships |
| `Posts` | Community posts and discussions |
| `Comments` | Comments on posts |
| `Post_Likes` | Post like tracking |
| `Events` | Movie watch events |
| `Event_Invites` | Event invitation system |
| `Messages` | Direct messaging between users |
| `Notifications` | System-wide notification center |
| `Audit_Logs` | Admin action tracking |
| `Restricted_Words` | Content moderation filters |
| `Password_Reset_Token` | Secure password reset tokens |

### Key Relationships

- Users ↔ Friendships (self-referencing many-to-many)
- Movies ↔ Genres (many-to-many)
- Users ↔ Watchlist ↔ Movies
- Users ↔ Ratings ↔ Movies
- Users ↔ Reviews ↔ Movies
- Events ↔ Event_Invites ↔ Users
- Posts ↔ Comments ↔ Users

---

## 🔌 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "fav_genre": "Action",
  "bio": "Movie enthusiast"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { "token": "jwt_token", "user": {...} }
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

#### Change Password (Authenticated)
```http
POST /auth/change-password
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Movie Endpoints

#### Get All Movies
```http
GET /movies?page=1&limit=20&genre=Action&search=inception
```

#### Get Movie Details
```http
GET /movies/:id
```

#### Rate Movie
```http
POST /ratings
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "movie_id": 1,
  "rating": 8
}
```

#### Add Review
```http
POST /reviews
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "movie_id": 1,
  "review_text": "Amazing movie!"
}
```

### Watchlist Endpoints

#### Get User Watchlist
```http
GET /watchlist
Authorization: Bearer {jwt_token}
```

#### Add to Watchlist
```http
POST /watchlist
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "movie_id": 1
}
```

### Social Endpoints

#### Send Friend Request
```http
POST /friends/request
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "friend_id": 2
}
```

#### Get Messages
```http
GET /messages/conversations
Authorization: Bearer {jwt_token}
```

#### Send Message
```http
POST /messages
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "receiver_id": 2,
  "message_text": "Hey, want to watch Inception?"
}
```

### Admin Endpoints (Require Admin Auth)

#### Get All Users
```http
GET /admin/users
Authorization: Bearer {admin_jwt_token}
```

#### Add Movie
```http
POST /admin/movies
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json

{
  "title": "The Matrix",
  "release_year": 1999,
  "description": "...",
  "poster_url": "..."
}
```

---

## 💡 Key Learnings & Insights

### Technical Achievements

1. **Database Design Mastery**
   - Designed and normalized a 15+ table relational database
   - Implemented complex many-to-many relationships
   - Used foreign keys, constraints, and indexes for data integrity
   - Optimized queries with JOINs and subqueries

2. **Full-Stack Integration**
   - Successfully integrated Express.js backend with vanilla JS frontend
   - Implemented RESTful API design principles
   - Managed state and sessions using JWT tokens
   - Built responsive UI with Tailwind CSS utility-first approach

3. **Security Implementation**
   - Implemented bcrypt password hashing with salt rounds
   - Created secure password reset flow with time-limited tokens
   - Protected routes with JWT middleware
   - Prevented SQL injection with parameterized queries

4. **Email Service Integration**
   - Configured Nodemailer with Gmail SMTP
   - Designed professional HTML email templates
   - Implemented token-based password reset system

### Challenges Overcome

1. **Password Reset Token Security**
   - Challenge: Ensuring tokens are secure, one-time use, and time-limited
   - Solution: Implemented SHA-256 hashing, database expiry checks, and used flag

2. **Friend System Complexity**
   - Challenge: Managing bidirectional friendships in SQL
   - Solution: Used self-referencing foreign keys with OR conditions in queries

3. **Notification Cleanup**
   - Challenge: Preventing notification table bloat
   - Solution: Implemented scheduled cleanup job using setInterval

4. **Static File Serving**
   - Challenge: Serving both API and frontend from single port
   - Solution: Used Express static middleware with proper routing order

### Development Insights

- **Modular Architecture**: Separating concerns (routes, controllers, services) made debugging easier
- **Environment Variables**: Using `.env` files improved security and deployment flexibility
- **Database Seeding**: Sample data significantly accelerated testing and demonstration
- **Error Handling**: Centralized error middleware improved user experience and debugging

---

## 🚀 Future Enhancements

### Short-term Improvements

1. **Real-time Features**
   - Implement WebSocket (Socket.io) for live messaging
   - Real-time notification updates
   - Live event updates when friends RSVP

2. **Enhanced Search**
   - Fuzzy search algorithm for better movie discovery
   - Advanced filters (director, cast, IMDb rating)
   - "Similar movies" recommendation engine

3. **Mobile Responsiveness**
   - Optimize UI for mobile devices
   - Progressive Web App (PWA) capabilities
   - Mobile-friendly event creation

4. **File Upload**
   - Allow users to upload profile pictures to server/cloud
   - Movie poster uploads for admins
   - Image optimization and compression

### Long-term Vision

1. **Machine Learning Integration**
   - Collaborative filtering for personalized recommendations
   - Sentiment analysis on reviews
   - Predictive analytics for trending movies

2. **External API Integration**
   - TMDB/IMDB API for automatic movie data population
   - Streaming availability checker (Netflix, Prime, etc.)
   - Trailer embedding from YouTube

3. **Advanced Social Features**
   - User-created movie lists (e.g., "Top 10 Sci-Fi")
   - Discussion forums by genre
   - Movie polls and voting systems
   - User badges and achievements

4. **Analytics Dashboard**
   - Personal viewing statistics (genres watched, hours spent)
   - Year-in-review summary
   - Community trends and popular movies

5. **Performance Optimization**
   - Implement Redis caching for frequently accessed data
   - Lazy loading for movie images
   - Database query optimization with indexes
   - CDN integration for static assets

6. **Testing & CI/CD**
   - Unit tests with Jest
   - Integration tests for API endpoints
   - Automated deployment pipeline
   - Docker containerization

---

## 📄 License

This project was developed for educational purposes as part of a Database Management Systems course at **FAST National University**.

**Author**: Shahoud Shahid  
**Course**: Database Management Systems  
**Semester**: Fall 2025  
**Institution**: FAST National University

---

## 🙏 Acknowledgments

- **FAST National University** for providing the learning environment
- **Course Instructors** for guidance on database design principles
- **Express.js & Node.js communities** for comprehensive documentation
- **Tailwind CSS team** for the excellent utility-first framework
- **MySQL documentation** for SQL reference and best practices
- **GitHub** for version control and collaboration platform

---

## 📞 Contact

For questions, feedback, or collaboration opportunities:

- **GitHub**: [@Shahoud867](https://github.com/Shahoud867)
- **Repository**: [Movie-Community-Management-System](https://github.com/Shahoud867/Movie-Community-Management-System)

---

<div align="center">

**Made with ❤️ for movie lovers everywhere**

⭐ Star this repo if you found it helpful!

</div>
