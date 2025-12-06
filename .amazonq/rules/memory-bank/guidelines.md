# Development Guidelines

## Code Quality Standards

### File Organization
- **Modular structure**: Each feature module contains controller, routes, and service files
- **Separation of concerns**: Controllers handle HTTP, services contain business logic
- **Consistent naming**: `feature.controller.js`, `feature.routes.js`, `feature.service.js`
- **Section comments**: Use `// ========================================` to separate logical sections

### Code Formatting
- **Line endings**: CRLF (`\r\n`) - Windows convention
- **Indentation**: 2 spaces (no tabs)
- **String quotes**: Single quotes for strings, template literals for interpolation
- **Semicolons**: Always use semicolons at statement ends
- **Trailing commas**: Use in object/array literals for cleaner diffs

### Documentation Standards
- **JSDoc comments**: Document all exported functions with description and parameters
```javascript
/**
 * Get all users with optional search
 */
async function getAllUsers(searchQuery = '') {
  // implementation
}
```
- **Inline comments**: Explain complex logic, not obvious code
- **Section headers**: Group related functions with descriptive comment blocks

## Architectural Patterns

### Service Layer Pattern
All business logic resides in service files:
```javascript
// admin.service.js
const { pool } = require('../../config/db');

async function getAllUsers(searchQuery = '') {
  let query = 'SELECT * FROM Users WHERE 1=1';
  const params = [];
  
  if (searchQuery) {
    query += ' AND (name LIKE ? OR email LIKE ?)';
    params.push(`%${searchQuery}%`, `%${searchQuery}%`);
  }
  
  const [users] = await pool.query(query, params);
  return users;
}
```

### Controller Pattern
Controllers are thin wrappers that handle HTTP:
```javascript
// admin.controller.js
const adminService = require('./admin.service');

async function getAllUsersHandler(req, res) {
  try {
    const { search } = req.query;
    const users = await adminService.getAllUsers(search);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Route Definition Pattern
Routes use Express Router with middleware:
```javascript
// admin.routes.js
const express = require('express');
const { authenticateAdmin } = require('../../middleware/admin');
const controller = require('./admin.controller');

const router = express.Router();

router.get('/users', authenticateAdmin, controller.getAllUsersHandler);

module.exports = { adminRouter: router };
```

## Database Interaction Patterns

### Query Execution
Always use parameterized queries with mysql2 promise API:
```javascript
// ✅ CORRECT - Prevents SQL injection
const [users] = await pool.query(
  'SELECT * FROM Users WHERE email = ?',
  [email]
);

// ❌ WRONG - SQL injection vulnerability
const [users] = await pool.query(
  `SELECT * FROM Users WHERE email = '${email}'`
);
```

### Array Destructuring
mysql2 returns `[rows, fields]` - always destructure:
```javascript
const [movies] = await pool.query('SELECT * FROM Movie');
// movies is the array of results
```

### Dynamic Query Building
Build queries conditionally with parameter arrays:
```javascript
const conditions = [];
const params = [];

if (search) {
  conditions.push('title LIKE ?');
  params.push(`%${search}%`);
}

if (minYear) {
  conditions.push('release_year >= ?');
  params.push(parseInt(minYear, 10));
}

const whereClause = conditions.length > 0 
  ? `WHERE ${conditions.join(' AND ')}` 
  : '';

const query = `SELECT * FROM Movie ${whereClause}`;
const [movies] = await pool.query(query, params);
```

### IN Clause Pattern
Generate placeholders for IN queries:
```javascript
const movieIds = [1, 2, 3];
const placeholders = movieIds.map(() => '?').join(',');
const query = `SELECT * FROM Movie WHERE movie_id IN (${placeholders})`;
const [movies] = await pool.query(query, movieIds);
```

### Grouping Related Data
Fetch related data separately and merge:
```javascript
// 1. Get main entities
const [movies] = await pool.query('SELECT * FROM Movie LIMIT 10');

// 2. Get related data in batch
const movieIds = movies.map(m => m.movie_id);
const [genres] = await pool.query(
  `SELECT mg.movie_id, g.genre_name 
   FROM Movie_Genre mg 
   JOIN Genre g ON mg.genre_id = g.genre_id 
   WHERE mg.movie_id IN (${movieIds.map(() => '?').join(',')})`,
  movieIds
);

// 3. Group by parent ID
const genresByMovie = {};
genres.forEach(row => {
  if (!genresByMovie[row.movie_id]) {
    genresByMovie[row.movie_id] = [];
  }
  genresByMovie[row.movie_id].push(row.genre_name);
});

// 4. Attach to parent entities
movies.forEach(movie => {
  movie.genres = genresByMovie[movie.movie_id] || [];
});
```

## Error Handling Patterns

### Service Layer Errors
Throw descriptive errors in services:
```javascript
async function getUserById(userId) {
  const [users] = await pool.query(
    'SELECT * FROM Users WHERE user_id = ?',
    [userId]
  );
  
  if (users.length === 0) {
    throw new Error('User not found');
  }
  
  return users[0];
}
```

### Controller Error Handling
Catch and format errors in controllers:
```javascript
async function getUserHandler(req, res) {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Validation Errors
Check for missing/invalid data before processing:
```javascript
if (fields.length === 0) {
  throw new Error('No fields to update');
}

if (result.affectedRows === 0) {
  throw new Error('Record not found');
}
```

## Authentication & Security Patterns

### Password Hashing
Always hash passwords with bcrypt:
```javascript
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

// Hash on registration
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

// Compare on login
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### JWT Token Generation
Sign tokens with user data and expiration:
```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { user_id: user.user_id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

### Environment Variables
Use dotenv for configuration:
```javascript
require('dotenv').config();

const config = {
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
  dbHost: process.env.DB_HOST || 'localhost',
};
```

## API Response Patterns

### Success Responses
Return consistent JSON structures:
```javascript
// Single entity
res.json({ user: userData });

// Collection
res.json({ movies: moviesArray });

// With pagination
res.json({
  movies: moviesArray,
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5
  }
});

// Operation result
res.json({ 
  message: 'User created successfully',
  user_id: 123 
});
```

### Error Responses
Use appropriate status codes:
```javascript
// 400 - Bad Request
res.status(400).json({ error: 'Invalid input' });

// 404 - Not Found
res.status(404).json({ error: 'User not found' });

// 500 - Server Error
res.status(500).json({ error: error.message });
```

## Common Code Idioms

### Dynamic UPDATE Queries
Build UPDATE statements from partial data:
```javascript
async function updateUser(userId, updates) {
  const fields = [];
  const values = [];
  
  if (updates.name) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  
  if (updates.email) {
    fields.push('email = ?');
    values.push(updates.email);
  }
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  values.push(userId);
  
  await pool.query(
    `UPDATE Users SET ${fields.join(', ')} WHERE user_id = ?`,
    values
  );
}
```

### Fallback Queries
Try optimized query first, fallback if fails:
```javascript
async function getDashboardStats() {
  try {
    // Try using database view
    const [stats] = await pool.query('SELECT * FROM vw_admin_dashboard');
    if (stats.length > 0) {
      return stats[0];
    }
  } catch (error) {
    // View doesn't exist, use manual queries
  }
  
  // Fallback to individual queries
  const [userCount] = await pool.query('SELECT COUNT(*) as count FROM Users');
  return { total_users: userCount[0].count };
}
```

### CASE Statements for Dynamic Content
Use CASE for conditional data retrieval:
```javascript
const query = `
  SELECT 
    m.moderation_id,
    m.content_type,
    CASE 
      WHEN m.content_type = 'post' THEN (SELECT content FROM Post WHERE post_id = m.content_id)
      WHEN m.content_type = 'comment' THEN (SELECT content FROM Comment WHERE comment_id = m.content_id)
      ELSE NULL
    END as content_text
  FROM Moderation m
`;
```

## Email Service Patterns

### HTML Email Templates
Use inline styles for email compatibility:
```javascript
const mailOptions = {
  from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
  to: userEmail,
  subject: 'Password Reset Request',
  html: `
    <div style="font-family: Arial, sans-serif;">
      <h1>Password Reset</h1>
      <p>Click the link below:</p>
      <a href="${resetUrl}">Reset Password</a>
    </div>
  `,
  text: `Reset your password: ${resetUrl}` // Plain text fallback
};
```

### Error Handling for Non-Critical Emails
Don't throw errors for optional emails:
```javascript
async function sendWelcomeEmail(to, userName) {
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw - welcome emails are not critical
    return { success: false, error: error.message };
  }
}
```

## Express App Configuration

### Middleware Order
Apply middleware in correct sequence:
```javascript
app.use(helmet()); // Security headers first
app.use(cors());   // CORS before routes
app.use(express.json()); // Body parsing
app.use(cookieParser());
app.use(morgan('dev')); // Logging

// Static files
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

// Error handlers last
app.use(notFound);
app.use(errorHandler);
```

### Helmet CSP Configuration
Configure Content Security Policy for frontend assets:
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

## Module Export Patterns

### Named Exports
Export multiple functions as object:
```javascript
module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
```

### Router Exports
Export router with descriptive name:
```javascript
const router = express.Router();
// ... route definitions
module.exports = { adminRouter: router };
```

## Best Practices Summary

1. **Always use parameterized queries** - Never concatenate user input into SQL
2. **Destructure mysql2 results** - `const [rows] = await pool.query(...)`
3. **Hash passwords with bcrypt** - Use SALT_ROUNDS = 10
4. **Validate input before processing** - Check for required fields and valid data
5. **Use environment variables** - Never hardcode secrets or config
6. **Document public functions** - Use JSDoc comments for exported functions
7. **Handle errors gracefully** - Throw descriptive errors in services, catch in controllers
8. **Group related data efficiently** - Fetch in batches, merge in application code
9. **Use consistent response formats** - JSON with predictable structure
10. **Apply middleware in correct order** - Security → parsing → routes → error handling
