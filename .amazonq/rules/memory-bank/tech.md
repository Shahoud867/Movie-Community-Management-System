# Movie Community System - Technology Stack

## Programming Languages & Versions

### Backend
- **Node.js**: JavaScript runtime environment
- **JavaScript (ES6+)**: Primary backend programming language

### Frontend
- **HTML5**: Semantic markup and structure
- **CSS3**: Styling with Tailwind CSS framework
- **JavaScript**: Client-side interactivity (vanilla JS)

### Database
- **SQL**: MySQL database queries and schema management

## Core Technologies

### Backend Framework & Libraries
- **Express.js 4.19.2**: Web application framework
- **mysql2 3.11.3**: MySQL database driver with Promise support
- **bcryptjs 2.4.3**: Password hashing and encryption
- **jsonwebtoken 9.0.2**: JWT token generation and verification
- **cors 2.8.5**: Cross-Origin Resource Sharing middleware
- **helmet 7.0.0**: Security middleware for HTTP headers
- **morgan 1.10.0**: HTTP request logging
- **cookie-parser 1.4.6**: Cookie parsing middleware
- **express-validator 7.0.1**: Input validation and sanitization
- **zod 3.22.4**: Schema validation library
- **dotenv 16.4.5**: Environment variable management

### Frontend Framework & Tools
- **Tailwind CSS 3.4.13**: Utility-first CSS framework
- **HTML5**: Modern semantic markup
- **Vanilla JavaScript**: No frontend framework dependencies

### Database System
- **MySQL**: Relational database management system
- **Database Name**: `movie_community`

### Development Tools
- **nodemon 3.0.2**: Development server with auto-restart
- **PowerShell**: Build script execution on Windows

## Build Systems & Dependencies

### Backend Build Process
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon --watch src --ext js,json --exec node src/server.js",
    "health": "node scripts/health-check.js",
    "db:init": "node scripts/init-db.js"
  }
}
```

### Frontend Build Process
```json
{
  "scripts": {
    "dev": "tailwindcss -i ./src/css/input.css -o ./dist/css/styles.css -w",
    "build:css": "tailwindcss -i ./src/css/input.css -o ./dist/css/styles.css --minify",
    "copy:html": "powershell -NoProfile -Command \"New-Item -ItemType Directory -Force -Path ./dist/admin | Out-Null; Copy-Item -Path './src/*.html' -Destination './dist' -Recurse -Force; Copy-Item -Path './src/admin/*.html' -Destination './dist/admin' -Recurse -Force\"",
    "copy:assets": "powershell -NoProfile -Command \"Copy-Item -Path './src/assets' -Destination './dist' -Recurse -Force\"",
    "postbuild:html": "node ./scripts/patch-html.js",
    "build": "npm run build:css && npm run copy:html && npm run copy:assets && npm run postbuild:html"
  }
}
```

## Development Commands

### Backend Development
```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Initialize database with sample data
npm run db:init

# Check system health
npm run health
```

### Frontend Development
```bash
# Watch mode for CSS development
npm run dev

# Build production CSS
npm run build:css

# Copy HTML files to dist
npm run copy:html

# Copy static assets
npm run copy:assets

# Complete production build
npm run build
```

### Database Management
```bash
# Initialize database schema and sample data
node scripts/init-db.js

# Run system health check
node scripts/health-check.js

# Test complete system functionality
node scripts/test-system.js

# Validate movie data
node scripts/check-movie.js
```

## Environment Configuration

### Backend Environment Variables (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=movie_community
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=3000
```

### Frontend Configuration (tailwind.config.js)
```javascript
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {}
  },
  plugins: []
}
```

## Server Configuration

### Express Server Setup
- **Port**: 3000 (configurable via environment)
- **Static Files**: Served from `frontend/dist`
- **CORS**: Enabled with credentials support
- **Security Headers**: Configured via Helmet.js
- **Request Logging**: Morgan middleware in development mode
- **Cookie Support**: HTTP-only cookies for JWT tokens

### Database Connection
- **Connection Pooling**: MySQL2 connection pool
- **Host**: localhost (configurable)
- **Database**: movie_community
- **Character Set**: utf8mb4
- **Timezone**: UTC

## Security Configuration

### Authentication & Authorization
- **JWT Tokens**: 7-day expiration, HTTP-only cookies
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Stateless JWT-based authentication

### Security Middleware
- **Helmet.js**: Security headers and CSP configuration
- **CORS**: Cross-origin request handling
- **Input Validation**: express-validator and Zod schemas
- **SQL Injection Prevention**: Prepared statements with mysql2

## Development Environment

### System Requirements
- **Node.js**: Version 16+ recommended
- **MySQL**: Version 8.0+ recommended
- **npm**: Package manager for dependencies
- **PowerShell**: For Windows build scripts

### IDE Configuration
- **File Watching**: nodemon for backend auto-reload
- **CSS Processing**: Tailwind CLI for style compilation
- **Static Serving**: Express static middleware for frontend assets

## Production Considerations

### Performance Optimizations
- **CSS Minification**: Tailwind production build
- **Static Asset Serving**: Express static middleware
- **Database Connection Pooling**: MySQL2 pool configuration
- **HTTP Compression**: Available via Express middleware

### Deployment Requirements
- **Environment Variables**: Production database and JWT secrets
- **Database Setup**: MySQL server with movie_community database
- **Static Assets**: Built frontend files in dist directory
- **Process Management**: PM2 or similar for production deployment