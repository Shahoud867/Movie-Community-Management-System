# Project Structure

## Directory Organization

```
Movie-System/
├── backend/                 # Node.js/Express API server
│   ├── db/                 # Database setup and migrations
│   │   ├── sample_data.sql        # Database schema + seed data
│   │   ├── migrate_comments.sql   # Schema migration scripts
│   │   └── setup-database.bat     # Windows DB setup script
│   ├── scripts/            # Utility and testing scripts
│   │   ├── init-db.js            # Database initialization
│   │   ├── health-check.js       # System health verification
│   │   ├── test-system.js        # Integration tests
│   │   └── test-watchlist.js     # Watchlist feature tests
│   ├── src/                # Application source code
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware (auth, error handling)
│   │   ├── modules/        # Feature modules (MVC pattern)
│   │   ├── routes/         # API route aggregation
│   │   ├── utils/          # Shared utilities
│   │   ├── app.js          # Express app configuration
│   │   └── server.js       # Server entry point
│   ├── .env.example        # Environment variables template
│   └── package.json        # Backend dependencies
├── frontend/               # Static web frontend
│   ├── scripts/            # Build scripts
│   │   └── patch-html.js         # Post-build HTML processing
│   ├── src/                # Frontend source files
│   │   ├── admin/          # Admin panel pages
│   │   ├── assets/         # Images, icons, static files
│   │   ├── components/     # Reusable HTML components
│   │   ├── css/            # Tailwind CSS source
│   │   ├── js/             # JavaScript modules
│   │   └── *.html          # Page templates
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── package.json        # Frontend build dependencies
└── README.md               # Project documentation
```

## Backend Architecture

### Modular Structure (Feature-Based)
Each feature module follows consistent MVC pattern:
```
modules/
├── admin/
│   ├── admin.controller.js    # Request handlers
│   ├── admin.routes.js        # Route definitions
│   └── admin.service.js       # Business logic
├── auth/                      # Authentication & authorization
├── dashboard/                 # User dashboard aggregation
├── events/                    # Movie watch events
├── friends/                   # Friend relationships
├── messages/                  # Direct messaging
├── movies/                    # Movie catalog
├── notifications/             # Notification system
├── posts/                     # Community posts
├── ratings/                   # Movie ratings
├── reviews/                   # Movie reviews
├── users/                     # User profiles
└── watchlist/                 # Personal watchlists
```

### Core Components

#### Configuration (`config/`)
- `database.js` - MySQL connection pool with promise API
- Environment-specific settings

#### Middleware (`middleware/`)
- `auth.middleware.js` - JWT token validation
- `admin.middleware.js` - Admin role verification
- `error.middleware.js` - Centralized error handling
- `validation.middleware.js` - Request validation

#### Utilities (`utils/`)
- `email.js` - Nodemailer email service
- `password.js` - bcrypt hashing utilities
- `token.js` - JWT generation and verification
- `validators.js` - Input validation schemas

#### Routes (`routes/`)
- `index.js` - Aggregates all module routes
- Mounts routes under `/api` prefix

### Request Flow
```
Client Request
    ↓
Express App (app.js)
    ↓
Route Handler (*.routes.js)
    ↓
Middleware (auth, validation)
    ↓
Controller (*.controller.js)
    ↓
Service Layer (*.service.js)
    ↓
Database (MySQL via mysql2)
    ↓
Response
```

## Frontend Architecture

### Page Structure
```
src/
├── admin/                  # Admin-only pages
│   ├── dashboard.html
│   ├── login.html
│   ├── users.html
│   └── movies.html
├── components/             # Reusable HTML partials
│   ├── navbar.html
│   └── footer.html
├── js/                     # JavaScript modules
│   ├── api.js             # API client wrapper
│   ├── auth.js            # Authentication helpers
│   ├── utils.js           # DOM utilities
│   └── [feature].js       # Feature-specific scripts
├── css/
│   └── input.css          # Tailwind directives
└── [pages].html           # User-facing pages
```

### JavaScript Organization
- **api.js** - Centralized fetch wrapper with auth headers
- **auth.js** - Token management, login/logout
- **utils.js** - DOM manipulation, formatting helpers
- Feature-specific modules for each page

### Build Process
1. Tailwind CSS compilation (`input.css` → `dist/css/styles.css`)
2. HTML file copying to `dist/`
3. Asset copying (images, icons)
4. Post-build HTML patching (path adjustments)

## Database Schema

### Core Tables (15+)
- **Users** - User accounts and profiles
- **Admin** - Administrator accounts
- **Movies** - Movie catalog
- **Genres** - Genre classifications
- **Movie_Genres** - Many-to-many movie-genre relationship
- **Ratings** - User movie ratings (1-10)
- **Reviews** - Detailed movie reviews
- **Watchlist** - Personal watchlists
- **Friendships** - User friend relationships
- **Posts** - Community posts
- **Comments** - Post comments
- **Post_Likes** - Post like tracking
- **Events** - Movie watch events
- **Event_Invites** - Event invitation system
- **Messages** - Direct messaging
- **Notifications** - System notifications
- **Audit_Logs** - Admin action tracking
- **Restricted_Words** - Content moderation
- **Password_Reset_Token** - Password reset tokens

### Key Relationships
- Users ↔ Friendships (self-referencing many-to-many)
- Movies ↔ Genres (many-to-many via Movie_Genres)
- Users ↔ Watchlist ↔ Movies
- Users ↔ Ratings ↔ Movies
- Users ↔ Reviews ↔ Movies
- Events ↔ Event_Invites ↔ Users
- Posts ↔ Comments ↔ Users

## Architectural Patterns

### Backend Patterns
- **MVC (Model-View-Controller)** - Separation of concerns
- **Service Layer** - Business logic isolation
- **Repository Pattern** - Database access abstraction
- **Middleware Chain** - Request processing pipeline
- **Dependency Injection** - Database pool injection

### Frontend Patterns
- **Module Pattern** - JavaScript code organization
- **API Client Pattern** - Centralized HTTP requests
- **Component-Based** - Reusable HTML components
- **Utility-First CSS** - Tailwind CSS approach

### Security Patterns
- **JWT Authentication** - Stateless session management
- **Password Hashing** - bcrypt with salt rounds
- **Token Expiration** - Time-limited reset tokens
- **Parameterized Queries** - SQL injection prevention
- **CORS Configuration** - Cross-origin security
- **Helmet.js** - HTTP header security

## Deployment Architecture
- Single-server deployment (backend serves frontend)
- Express static middleware for frontend files
- API routes under `/api` prefix
- Frontend pages served from root
- MySQL database on same/separate server
