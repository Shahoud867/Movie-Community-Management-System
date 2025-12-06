# Product Overview

## Project Purpose
Movie Community Management System is a full-stack social platform that connects movie enthusiasts through shared experiences, reviews, and organized watch events. Built as a Database Management Systems course project, it demonstrates comprehensive database design, RESTful API development, and modern web application architecture.

## Value Proposition
Solves the challenge of fragmented movie discovery and social engagement by providing a centralized hub where users can:
- Track personal movie watchlists and viewing progress
- Connect with friends who share similar cinematic tastes
- Organize and participate in group watch events
- Share authentic reviews and ratings
- Engage in community discussions about films
- Receive personalized recommendations

## Key Features

### User Authentication & Security
- JWT-based authentication with secure session management
- Email-verified password reset with time-limited tokens
- bcrypt password hashing (10 salt rounds)
- Protected routes with middleware authorization
- Separate admin authentication system

### Movie Discovery & Management
- Extensive movie catalog with search and filtering
- Detailed movie information (cast, crew, genres, ratings)
- Advanced search by title, genre, release year
- Personal rating system (1-10 scale)
- Written reviews with community feedback

### Social Networking
- Friend request system with bidirectional relationships
- Direct messaging between users
- Community posts with likes and comments
- User profiles with customizable bio and preferences
- Activity feed showing friends' ratings and reviews

### Watchlist & Tracking
- Personal watchlist management
- Watch status tracking (watched/unwatched)
- Priority-based organization
- Progress statistics

### Event Organization
- Create movie watch events with date, time, location
- Friend invitation system
- RSVP functionality (attending/maybe/declined)
- Event notifications and reminders

### Notification System
- Real-time notifications for friend requests, messages, events
- Post interactions (comments, likes)
- Mark as read/unread functionality
- Automatic cleanup of old notifications (30+ days)

### Admin Panel
- User account management (activate/deactivate)
- Movie catalog administration (add, edit, delete)
- Genre management
- Content moderation (posts, reviews)
- Restricted word filtering
- Audit logs for admin actions
- System analytics and reports

## Target Users

### Primary Users
- Movie enthusiasts seeking community engagement
- Social viewers who enjoy watching films with friends
- Film critics and reviewers sharing opinions
- Users tracking their viewing habits and preferences

### Administrators
- Content moderators managing community standards
- System administrators maintaining movie catalog
- Analytics reviewers monitoring platform health

## Use Cases

### For Movie Lovers
1. Discover new films through friend recommendations
2. Maintain organized watchlist of must-see movies
3. Share detailed reviews and ratings
4. Track viewing history and preferences

### For Social Groups
1. Organize movie night events with friends
2. Coordinate watch parties with RSVP tracking
3. Discuss films through posts and comments
4. Follow friends' movie activities

### For Community Building
1. Connect with users sharing similar tastes
2. Engage in film discussions and debates
3. Build reputation through quality reviews
4. Participate in trending movie conversations

## Technical Highlights
- 15+ normalized MySQL database tables
- RESTful API with Express.js
- Vanilla JavaScript frontend with Tailwind CSS
- Email service integration (Nodemailer)
- Scheduled background jobs (notification cleanup)
- Comprehensive security measures (Helmet.js, CORS)
