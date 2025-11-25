Movie System Backend (Express + mysql2)

Setup
- Copy .env.example to .env and set DB credentials.
- Run: npm install
- Start: npm run dev (or npm start)

Health
- GET http://localhost:3000/health returns JSON with server and DB status.
- CLI DB check: npm run health

Sample Data
- SQL now lives at `backend/db/sample_data.sql`. The init script strips `DROP/CREATE/USE` and imports into `DB_NAME`.

Structure
- src/app.js: Express app
- src/server.js: Start script
- src/config/db.js: mysql2 pool
- src/middleware/error.js: error handlers
- src/routes/health.js: /health endpoint
