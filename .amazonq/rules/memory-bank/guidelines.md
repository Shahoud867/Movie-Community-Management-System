# Movie Community System - Development Guidelines

## Code Quality Standards

### File Structure and Organization
- **Modular Architecture**: Each feature organized in dedicated modules with consistent MVC pattern
- **Separation of Concerns**: Controllers handle HTTP requests, services contain business logic, routes define endpoints
- **Consistent Naming**: Files follow `{feature}.{type}.js` pattern (e.g., `events.service.js`, `notifications.controller.js`)
- **Directory Structure**: Features grouped under `/modules/` with config, middleware, routes, and utils as separate directories

### Code Formatting Patterns
- **Indentation**: 2-space indentation consistently used across all files
- **Line Breaks**: Windows-style CRLF line endings (`\r\n`) throughout the codebase
- **Semicolons**: Always terminate statements with semicolons
- **Quotes**: Single quotes preferred for strings, double quotes for SQL queries
- **Spacing**: Consistent spacing around operators and after commas

### Naming Conventions
- **Variables**: camelCase for JavaScript variables (`userId`, `eventDateTime`)
- **Database Fields**: snake_case for database columns (`user_id`, `event_datetime`, `created_date`)
- **Functions**: Descriptive camelCase names (`getUserNotifications`, `markAllAsSeen`)
- **Constants**: UPPER_SNAKE_CASE for configuration values (`SALT_ROUNDS`, `DB_HOST`)
- **Files**: kebab-case for directories, camelCase for JavaScript files

### Documentation Standards
- **JSDoc Comments**: Comprehensive function documentation with description and parameters
- **Inline Comments**: Explanatory comments for complex business logic
- **Error Messages**: Descriptive error messages for user-facing operations
- **API Documentation**: Clear endpoint descriptions and expected responses

## Structural Conventions

### Module Architecture Pattern
Every feature module follows this exact structure:
```
modules/{feature}/
├── {feature}.controller.js    # HTTP request handling
├── {feature}.routes.js        # Route definitions and middleware
└── {feature}.service.js       # Business logic and database operations
```

### Database Interaction Patterns
- **Connection Pooling**: Use `const { pool } = require('../../config/db')` for database access
- **Prepared Statements**: Always use parameterized queries with `?` placeholders
- **Destructuring Results**: Extract results with `const [rows] = await pool.query()`
- **Error Handling**: Throw descriptive errors for business logic violations
- **Transaction Safety**: Use appropriate error handling for database operations

### Service Layer Patterns
- **Async/Await**: Consistent use of async/await for asynchronous operations
- **Parameter Validation**: Validate input parameters before database operations
- **Business Logic**: Implement all business rules in service layer, not controllers
- **Return Consistency**: Return objects with consistent structure and success messages

### Authentication and Authorization
- **JWT Integration**: Use JWT tokens for authentication with 7-day expiration
- **Password Security**: bcrypt with 10 salt rounds for password hashing
- **Permission Checks**: Verify user ownership before allowing modifications
- **Cookie Management**: HTTP-only cookies for secure token storage

## Semantic Patterns

### Error Handling Patterns
```javascript
// Standard error throwing pattern
if (condition) {
  throw new Error('Descriptive error message');
}

// Database operation error handling
if (result.affectedRows === 0) {
  throw new Error('Resource not found or access denied');
}
```

### Query Building Patterns
```javascript
// Dynamic query building with parameters
let query = `SELECT ... FROM table WHERE 1=1`;
const params = [];

if (filter) {
  query += ` AND column = ?`;
  params.push(filter);
}

const [results] = await pool.query(query, params);
```

### Response Formatting Patterns
```javascript
// Consistent success response structure
return {
  id: result.insertId,
  ...data,
  message: 'Operation completed successfully'
};

// Error response with descriptive messages
throw new Error('Specific business rule violation message');
```

### Validation Patterns
```javascript
// Date validation pattern
const eventDate = new Date(event_datetime);
if (eventDate <= new Date()) {
  throw new Error('Event must be scheduled for a future date and time');
}

// Ownership verification pattern
if (resource.owner_id !== userId) {
  throw new Error('You do not have permission to perform this action');
}
```

## Internal API Usage Patterns

### Database Connection Pattern
```javascript
const { pool } = require('../../config/db');

// Standard query execution
const [rows] = await pool.query(sql, params);

// Insert operations
const [result] = await pool.query(insertSql, params);
return { id: result.insertId };
```

### Module Export Pattern
```javascript
module.exports = {
  functionName1,
  functionName2,
  functionName3,
};
```

### Express Application Setup Pattern
```javascript
// Middleware order in app.js
app.use(helmet(/* security config */));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Route mounting pattern
app.use('/api/feature', featureRouter);
```

### Environment Configuration Pattern
```javascript
const {
  CONFIG_VAR = 'default_value',
  ANOTHER_VAR = 'default',
} = process.env;
```

## Frequently Used Code Idioms

### Conditional Query Building
```javascript
// Pattern for optional filters
if (status) {
  query += ` AND status = ?`;
  params.push(status);
}

if (upcoming) {
  query += ` AND event_datetime > NOW()`;
}
```

### Array Destructuring for Database Results
```javascript
const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
if (users.length === 0) {
  throw new Error('User not found');
}
return users[0];
```

### Dynamic Field Updates
```javascript
const fields = [];
const values = [];

if (updates.title) {
  fields.push('title = ?');
  values.push(updates.title);
}

if (fields.length === 0) {
  throw new Error('No fields to update');
}

values.push(id);
await pool.query(`UPDATE table SET ${fields.join(', ')} WHERE id = ?`, values);
```

### JOIN Query Pattern
```javascript
const query = `
  SELECT 
    main.field1,
    main.field2,
    related.field as related_field
  FROM MainTable main
  INNER JOIN RelatedTable related ON main.id = related.main_id
  WHERE main.condition = ?
`;
```

## Popular Annotations and Comments

### Function Documentation Pattern
```javascript
/**
 * Brief description of function purpose
 */
async function functionName(param1, param2) {
  // Implementation
}
```

### Business Logic Comments
```javascript
// Validate event is in the future
// Check if user already joined
// Increment participant count
// Verify ownership before modification
```

### SQL Query Comments
```javascript
// Get all events with optional filters
// Check for conflicting events at the same datetime
// Update with safety check using GREATEST function
```

## Security and Validation Practices

### Input Sanitization
- Always use parameterized queries to prevent SQL injection
- Validate date formats and ranges before database operations
- Check user permissions before allowing data modifications
- Sanitize user input in service layer before processing

### Authentication Patterns
- Verify JWT tokens in middleware before protected operations
- Check resource ownership in service layer
- Use bcrypt for password hashing with consistent salt rounds
- Implement proper session management with HTTP-only cookies

### Error Information Disclosure
- Provide specific error messages for business logic violations
- Avoid exposing internal system details in error messages
- Use consistent error response format across all endpoints
- Log detailed errors server-side while returning user-friendly messages

## Performance Considerations

### Database Optimization
- Use appropriate indexes for frequently queried columns
- Implement connection pooling for database connections
- Use LIMIT clauses for large result sets
- Optimize JOIN queries with proper table relationships

### Query Efficiency
- Select only required columns instead of using SELECT *
- Use prepared statements for repeated queries
- Implement proper pagination for large datasets
- Cache frequently accessed data when appropriate