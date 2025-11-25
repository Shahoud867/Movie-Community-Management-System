# Movie Community System - Project Structure

## Root Directory Organization
```
Movie-System/
├── backend/          # Node.js/Express API server
├── frontend/         # HTML/CSS/JS client application
└── .amazonq/         # AI assistant configuration and memory bank
```

## Backend Architecture (`/backend`)

### Core Application Structure
```
backend/src/
├── config/           # Database and application configuration
├── middleware/       # Express middleware (auth, error handling)
├── modules/          # Feature-based modular architecture
├── routes/           # Shared route handlers
├── utils/            # Utility functions (JWT, password hashing)
├── app.js           # Express application setup
└── server.js        # Server entry point
```

### Modular Feature Organization
Each feature module follows consistent MVC pattern:
```
modules/{feature}/
├── {feature}.controller.js    # Request handling and response logic
├── {feature}.routes.js        # Route definitions and middleware
└── {feature}.service.js       # Business logic and database operations
```

### Implemented Modules
- **auth**: User authentication and session management
- **users**: User profile and account management
- **movies**: Movie data and information retrieval
- **watchlist**: Personal movie tracking and progress
- **reviews**: Movie review creation and management
- **friends**: Social connection and friend management
- **messages**: Direct messaging between users
- **notifications**: Real-time notification system
- **dashboard**: User statistics and overview data
- **ratings**: Movie rating system
- **posts**: Social posting (UI ready, backend pending)
- **events**: Community events (UI ready, backend pending)

### Database Layer
```
backend/db/
├── sample_data.sql       # Initial database seeding
└── migrate_comments.sql  # Schema migration scripts
```

### Utility Scripts
```
backend/scripts/
├── init-db.js          # Database initialization
├── health-check.js     # System health monitoring
├── test-system.js      # End-to-end testing
└── check-movie.js      # Movie data validation
```

## Frontend Architecture (`/frontend`)

### Source Structure
```
frontend/src/
├── admin/            # Administrative interface pages
├── assets/           # Static resources (images, icons)
├── components/       # Reusable HTML components
├── css/              # Tailwind CSS input files
├── js/               # JavaScript modules (future implementation)
└── *.html           # Main application pages
```

### Page Categories

#### Public Pages (3)
- `login.html` - User authentication
- `register.html` - Account creation
- `forgot-password.html` - Password recovery

#### User Dashboard & Profile (4)
- `dashboard.html` - Personal overview and statistics
- `profile.html` - User profile with tabs (watchlist, reviews, friends)
- `settings.html` - Account configuration
- `account-settings.html` - Additional user preferences

#### Movie Features (3)
- `movies.html` - Movie browsing with filters
- `movie.html` - Individual movie details
- `watchlist.html` - Personal movie tracking

#### Social Features (3)
- `friends.html` - Friend management and requests
- `messages.html` - Direct messaging interface
- `notifications.html` - Notification center

#### Community Features (4)
- `events.html` - Community events listing
- `event.html` - Individual event details
- `events-new.html` - Event creation
- `post.html` - Social posts and discussions

#### Administrative Interface (10)
Complete admin panel with specialized management pages:
- `admin/dashboard.html` - Administrative overview
- `admin/users.html` - User account management
- `admin/movies.html` - Movie database management
- `admin/genres.html` - Genre classification management
- `admin/admins.html` - Administrator account management
- `admin/reports.html` - System reporting and analytics
- `admin/moderation.html` - Content moderation tools
- `admin/audit.html` - System audit trail
- `admin/settings.html` - System configuration

### Component Architecture
```
frontend/src/components/
├── navbar-main.html      # Authenticated user navigation
├── navbar-public.html    # Public page navigation
├── navbar-enhanced.html  # Advanced navigation features
├── admin-sidebar.html    # Administrative navigation
├── movie-card.html       # Reusable movie display component
└── footer.html          # Site footer
```

### Build System
```
frontend/
├── dist/                 # Compiled output directory
├── scripts/patch-html.js # Build process customization
└── tailwind.config.js    # CSS framework configuration
```

## Architectural Patterns

### Backend Patterns
- **Modular Architecture**: Feature-based organization with consistent MVC structure
- **Middleware Pipeline**: Authentication, error handling, and request processing
- **Service Layer**: Business logic separation from controllers
- **Configuration Management**: Environment-based settings with dotenv

### Frontend Patterns
- **Component-Based Design**: Reusable HTML components for consistent UI
- **Utility-First CSS**: Tailwind CSS for rapid styling
- **Progressive Enhancement**: HTML-first approach with JavaScript enhancement
- **Responsive Design**: Mobile-first responsive layouts

### Database Design
- **Relational Model**: MySQL with normalized table structure
- **Junction Tables**: Many-to-many relationships (movie_genre, friendship)
- **Audit Trail**: System activity tracking and logging
- **Status Enums**: Controlled vocabulary for state management

## Integration Points

### API Communication
- RESTful API design with consistent endpoint patterns
- JSON request/response format
- JWT token-based authentication
- CORS configuration for cross-origin requests

### Database Integration
- MySQL2 driver with connection pooling
- Prepared statements for security
- Transaction support for data consistency
- Error handling and connection management

### Security Architecture
- bcrypt password hashing
- JWT token authentication with httpOnly cookies
- Helmet.js security headers
- Input validation and sanitization