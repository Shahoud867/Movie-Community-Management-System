# 🎬 Movie Community Management System

> A vibrant social platform where movie enthusiasts connect, share, and celebrate cinema together.

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/Shahoud867/Movie-Community-Management-System)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Development](#-development)
- [Testing](#-testing)
- [Known Issues](#-known-issues)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [FAQ](#-faq)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 Overview

### For Everyone
**Movie Community Management System** is like a social network built specifically for movie lovers! Think of it as a combination of Letterboxd, Goodreads (but for movies), and a social platform all rolled into one. You can:
- Track movies you've watched or want to watch
- Rate and review films
- Connect with friends who share your taste in cinema
- Join watch parties and movie discussion events
- Message other cinephiles
- Get personalized movie recommendations

### For Developers
This is a **full-stack web application** that provides a comprehensive movie community platform. Built with vanilla JavaScript and a mock API architecture, it demonstrates modern web development practices including:
- Client-side rendering with component-based architecture
- RESTful API design patterns
- Real-time search and filtering
- Responsive UI with Tailwind CSS
- Session-based authentication flow
- Mock data persistence for development and testing

The system is designed as a database management project showcasing CRUD operations, relational data modeling, and user interaction flows typical of social media platforms.

---

## ✨ Key Features

### 🎥 Movie Discovery & Management
- **Browse Movies**: Filter by genre, release year, rating, and sort by popularity or newest releases
- **Detailed Movie Pages**: View comprehensive information including synopsis, director, cast, ratings, and runtime
- **Advanced Search**: Real-time search with autocomplete suggestions
- **Personal Watchlist**: Track movies as "To Watch", "Watching", or "Completed" with progress tracking

### 👥 Social Features
- **User Profiles**: Customizable profiles with favorite genres, bio, and viewing history
- **Friend System**: Send and accept friend requests, view friends' activity
- **Discussion Posts**: Create and participate in movie discussions
- **Reviews & Ratings**: Write detailed reviews with spoiler warnings
- **Direct Messaging**: Private conversations with other users

### 🎉 Events & Community
- **Watch Parties**: Host or join virtual movie watch events
- **Event Management**: Create events with movie selection, date/time, and capacity limits
- **RSVP System**: Join or leave events with real-time participant tracking
- **Event Discovery**: Browse upcoming scheduled watch parties

### 🔔 Engagement & Notifications
- **Real-time Notifications**: Friend requests, event invites, messages, and activity updates
- **Activity Feed**: See what your friends are watching and rating
- **Like & Comment**: Engage with community posts and reviews

### 🎨 User Experience
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Dark Mode Ready**: Eye-friendly interface for late-night movie browsing
- **Intuitive Navigation**: Clean, modern UI built with Tailwind CSS
- **Fast & Interactive**: Client-side rendering for snappy performance

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup structure
- **CSS3** - Custom styles and animations
- **Tailwind CSS 3.4** - Utility-first CSS framework via CDN
- **JavaScript (ES6+)** - Modern vanilla JavaScript
- **Component Architecture** - Reusable HTML components (navbar, footer, cards)

### Backend (Mock API)
- **Mock API System** - Custom fetch interceptor for simulating backend
- **LocalStorage** - Client-side data persistence
- **RESTful Design** - Standard HTTP methods and response patterns

### Development Tools
- **Git** - Version control
- **GitHub** - Repository hosting and collaboration
- **VS Code** - Recommended IDE
- **Python HTTP Server** - Local development server

### Database Design
- **Relational Model** - Entity-relationship design
- **SQL Schema** - Complete database structure in `movie.sql`
- Supports PostgreSQL/MySQL/SQLite implementations

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  HTML Pages  │  │  Components  │  │  Tailwind CSS │      │
│  │  (13 pages)  │  │  (Navbar,    │  │  (Styling)   │      │
│  │              │  │   Footer,    │  │              │      │
│  │              │  │   Cards)     │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
│         │                 │                                  │
│         └─────────────────┴──────────────┐                  │
│                                           ▼                  │
│                                  ┌─────────────────┐        │
│                                  │  JavaScript      │        │
│                                  │  Controllers     │        │
│                                  │  (Event handlers)│        │
│                                  └────────┬─────────┘        │
│                                           │                  │
│                                           ▼                  │
│                                  ┌─────────────────┐        │
│                                  │  Fetch API      │        │
│                                  │  Requests       │        │
│                                  └────────┬─────────┘        │
└──────────────────────────────────────────┼──────────────────┘
                                            │
                                            ▼
                              ┌──────────────────────────┐
                              │   Mock API Interceptor   │
                              │   (mock-api.js)          │
                              └─────────┬────────────────┘
                                        │
                                        ▼
                              ┌──────────────────────────┐
                              │   In-Memory Database     │
                              │   (mockDB object)        │
                              │                          │
                              │  • Users                 │
                              │  • Movies                │
                              │  • Watchlists            │
                              │  • Reviews               │
                              │  • Events                │
                              │  • Messages              │
                              │  • Notifications         │
                              └──────────────────────────┘
```

### Data Flow

1. **User Interaction** → User clicks button or submits form
2. **Event Handler** → JavaScript captures event
3. **API Request** → `fetch()` called with endpoint (e.g., `/api/movies`)
4. **Interception** → Mock API intercepts request before it leaves browser
5. **Processing** → Mock API filters/sorts/paginates in-memory data
6. **Response** → Returns JSON response simulating real backend
7. **DOM Update** → JavaScript renders data to page

---

## 🚀 Getting Started

### Prerequisites

**For Non-Technical Users:**
You just need a web browser (Chrome, Firefox, Safari, or Edge) and a text editor.

**For Developers:**
- **Git** (2.x or higher) - [Download Git](https://git-scm.com/downloads)
- **Python 3.x** (for local server) - [Download Python](https://www.python.org/downloads/)
  - Alternative: Node.js with `npx http-server`
- **Code Editor** - VS Code, Sublime Text, or similar
- **Modern Browser** - Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Installation

#### Step 1: Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/Shahoud867/Movie-Community-Management-System.git

# Or using SSH
git clone git@github.com:Shahoud867/Movie-Community-Management-System.git

# Navigate to project
cd Movie-Community-Management-System/frontend
```

#### Step 2: Review Project Structure

```bash
# List project files
ls -la

# You should see:
# - src/          (all source files)
# - movie.sql     (database schema)
# - package.json  (project metadata)
# - README.md     (this file)
```

#### Step 3: Start Local Server

You can serve either the `src` directory directly (recommended) or the `frontend` directory and use the `/src` path in URLs.

**Option A: Serve `src` (recommended)**
```powershell
cd "<path>/Movie-Community-Management-System/frontend/src"
python -m http.server 8000
```
Open:
- App: http://localhost:8000/login.html
- Admin: http://localhost:8000/admin/dashboard.html

**Option B: Serve `frontend`**
```powershell
cd "<path>/Movie-Community-Management-System/frontend"
python -m http.server 8000
```
Open (notice the `/src` prefix):
- App: http://localhost:8000/src/login.html
- Admin: http://localhost:8000/src/admin/dashboard.html

**Option C: Node.js http-server**
```powershell
cd "<path>/Movie-Community-Management-System/frontend/src"
npx http-server -p 8000
```

**Option D: VS Code Live Server**
1. Install "Live Server" extension
2. Right-click `frontend/src/login.html`
3. Select "Open with Live Server"

#### Step 4: Open in Browser

Use one of the URLs above depending on Option A/B.

### Configuration

#### Mock API Configuration

The application uses a mock API that requires no configuration. However, you can customize the mock data:

**Edit Mock Database** (`src/js/mock-api.js`)

```javascript
// Line ~10: Modify current logged-in user
const mockDB = {
  currentUser: { 
    user_id: 1, 
    name: 'Your Name', 
    email: 'your@email.com',
    // ... other fields
  },
  
  // Add more movies
  movies: [
    { 
      id: 16, 
      title: 'Your Favorite Movie', 
      poster: 'https://via.placeholder.com/300x450',
      release_year: 2024,
      // ... other fields
    }
  ]
}
```

#### Database Setup (Optional - For Production)

If deploying with a real backend:

```bash
# Connect to your PostgreSQL/MySQL database
psql -U username -d database_name

# Run the schema
\i movie.sql

# Or for MySQL
mysql -u username -p database_name < movie.sql
```

---

## 💻 Usage

### For First-Time Users

1. **Start the Application**
   - Open `http://localhost:8080/login.html`
   - You'll see a login page (mock authentication - any credentials work)

2. **Explore the Dashboard**
   - After "logging in", you'll land on the main dashboard
   - See recommended movies, friend activity, and upcoming events

3. **Browse Movies**
   - Click "Movies" in navigation
   - Use filters: select genres, adjust year/rating sliders
   - Click any movie to see details

4. **Manage Your Watchlist**
   - Click "Watchlist" in navigation
   - Add movies by clicking "Add to Watchlist" on movie pages
   - Track progress with the progress bar

5. **Connect with Friends**
   - Click "Friends" to see your connections
   - View friend activity and what they're watching

6. **Join Watch Parties**
   - Navigate to "Events"
   - Browse scheduled watch parties
   - Click "Join Event" to RSVP

7. **Update Your Profile**
   - Click your profile picture → "Settings"
   - Edit bio, favorite genre, email
   - Update password (Account Settings)

### For Developers

#### Working with the Mock API

```javascript
// Example: Fetching movies with filters
async function getMovies() {
  const response = await fetch('/api/movies?genres=1,3&minYear=2010&maxYear=2024&sort=rating&page=1');
  const data = await response.json();
  
  console.log(data);
  // {
  //   items: [...movies],
  //   page: 1,
  //   totalPages: 3,
  //   total: 25
  // }
}
```

#### Adding a New Page

1. Create HTML file in `src/`
2. Include navbar component:
```html
<div id="navbar-container"></div>
<script>
  fetch('./components/navbar-main.html')
    .then(r => r.text())
    .then(html => {
      document.getElementById('navbar-container').innerHTML = html;
    });
</script>
```

3. Add page-specific JavaScript
4. Link from navigation menu

#### Customizing Components

**Navbar** (`src/components/navbar-main.html`)
- Modify links, add/remove menu items
- Update search functionality
- Customize notification badge

**Movie Card** (`src/components/movie-card.html`)
- Change card layout
- Add/remove information fields
- Modify rating display

---

## 📁 Project Structure

```
frontend/
├── src/                              # Source files (all active code)
│   ├── *.html                        # 13 main application pages
│   │   ├── login.html               # Login page (entry point)
│   │   ├── register.html            # User registration
│   │   ├── dashboard.html           # Main dashboard
│   │   ├── movies.html              # Browse movies with filters
│   │   ├── movie.html               # Movie detail page
│   │   ├── watchlist.html           # Personal watchlist
│   │   ├── friends.html             # Friends management
│   │   ├── profile.html             # User profile view
│   │   ├── settings.html            # Profile settings
│   │   ├── account-settings.html    # Account/security settings
│   │   ├── events.html              # Browse watch parties
│   │   ├── messages.html            # Direct messaging
│   │   └── post.html                # Discussion post detail
│   │
│   ├── components/                   # Reusable HTML components
│   │   ├── navbar-main.html         # Authenticated user navbar
│   │   ├── navbar-public.html       # Public pages navbar
│   │   ├── footer.html              # Site footer
│   │   ├── movie-card.html          # Movie display card
│   │   └── admin-sidebar.html       # Admin panel sidebar
│   │
│   ├── js/                           # JavaScript files
│   │   └── mock-api.js              # Mock API interceptor & data
│   │
│   ├── css/                          # Stylesheets
│   │   └── input.css                # Custom CSS (Tailwind base)
│   │
│   ├── assets/                       # Static assets
│   │   └── images/                  # Image files
│   │
│   └── admin/                        # Admin panel
│       ├── dashboard.html            # Admin dashboard (stats, chart, activity)
│       ├── movies.html               # Movie management (CRUD)
│       ├── genres.html               # Genre management (CRUD)
│       ├── users.html                # User management (edit, activate/deactivate)
│       ├── admins.html               # Admin management (super-admin only)
│       ├── moderation.html           # Content moderation queue
│       ├── reports.html              # System reports (generate/view/delete)
│       ├── audit.html                # Read-only admin audit trail
│       └── settings/
│           └── words.html            # Restricted words management
│
├── movie.sql                         # Database schema & seed data
├── package.json                      # Project metadata & dependencies
├── tailwind.config.js               # Tailwind CSS configuration
├── MOCK-API-README.md               # Mock API documentation
└── README.md                         # This file
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `src/js/mock-api.js` | Intercepts all `/api/*` fetch requests and returns mock data. Contains all sample data and API logic. |
| `src/components/*.html` | Reusable UI components loaded dynamically into pages. |
| `movie.sql` | Complete database schema with tables, relationships, and sample data for production deployment. |
| `tailwind.config.js` | Tailwind CSS theme customization (colors, fonts, breakpoints). |
| `MOCK-API-README.md` | Detailed documentation of all mock API endpoints and request/response formats. |

---

## 🛡️ Admin Panel

The Admin Panel is available under `src/admin/` and includes:

- Dashboard: stats, recent activity, user signups chart
- Movie Management: full CRUD with genre multi-select
- Genre Management: inline add/edit/delete with descriptions
- User Management: edit profiles and activate/deactivate users
- Admin Management: create/edit/delete admins (super-admin only, self-delete protected)
- Content Moderation: review flagged content and approve/delete
- Restricted Words: manage restricted terms with severity levels
- Reports: generate, view (modal), and delete system reports
- Audit Trail: read-only log of admin actions (joined with admin names)

Endpoints are emulated via the mock API (`src/js/mock-api.js`) by intercepting `/api/admin/*` requests.

Quick links when serving `src` directly (Option A):
- http://localhost:8000/admin/dashboard.html
- http://localhost:8000/admin/movies.html
- http://localhost:8000/admin/genres.html
- http://localhost:8000/admin/users.html
- http://localhost:8000/admin/admins.html
- http://localhost:8000/admin/moderation.html
- http://localhost:8000/admin/settings/words.html
- http://localhost:8000/admin/reports.html
- http://localhost:8000/admin/audit.html

## 📸 Screenshots

### Dashboard
The main hub showing recommended movies, friend activity, and upcoming events.

```
┌────────────────────────────────────────────────────────┐
│  🎬 MovieCommunity    [Search]  🔔  [Profile ▼]       │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Recommended For You                                    │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐              │
│  │Movie │  │Movie │  │Movie │  │Movie │              │
│  │ ★8.8 │  │ ★9.0 │  │ ★8.6 │  │ ★7.9 │              │
│  └──────┘  └──────┘  └──────┘  └──────┘              │
│                                                         │
│  Friend Activity                Upcoming Events         │
│  • Laura rated Inception 9/10   • Inception Watch Party│
│  • Ahmed completed Dark Knight  • Interstellar Deep Dive│
└────────────────────────────────────────────────────────┘
```

### Movies Browser with Filters
Advanced filtering by genre, year, rating with real-time results.

### Movie Detail Page
Comprehensive movie information with reviews, ratings, and discussion posts.

### Watchlist Management
Track your watching progress with status indicators and progress bars.

### Events & Watch Parties
Discover and join community watch events with RSVP functionality.

---

### Quick Reference

#### Authentication
```http
GET /api/auth/me
```
Returns currently logged-in user information.

#### Movies
```http
GET /api/movies?genres=1,3&minYear=2010&maxYear=2024&minRating=8.0&sort=rating&page=1
```
Browse movies with filtering, sorting, and pagination.

**Query Parameters:**
- `genres` - Comma-separated genre IDs
- `minYear`, `maxYear` - Release year range
- `minRating`, `maxRating` - Rating range (0-10)
- `sort` - Sort by: `popularity`, `rating`, `newest`
- `page` - Page number (10 items per page)

#### Watchlist
```http
PUT /api/watchlist
Content-Type: application/json

{
  "movie_id": 1,
  "status": "watching",
  "progress_percent": 45
}
```

#### Events
```http
POST /api/events/{id}/join
```
Join a watch party event.

#### Messages
```http
GET /api/messages?user_id=2
```
Get conversation thread with specific user.

---

## 🔧 Development

### Development Workflow

1. **Make Changes**
   ```bash
   # Edit files in src/
   code src/movies.html
   ```

2. **Test Locally**
   ```bash
   # Ensure server is running
   cd src
   python -m http.server 8080
   ```

3. **Check Browser Console**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for API calls

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add feature: movie filtering"
   git push origin main
   ```

### Code Style Guidelines

**HTML**
- Use semantic HTML5 elements
- Consistent indentation (2 spaces)
- Include ARIA labels for accessibility

**JavaScript**
- Use ES6+ features (const/let, arrow functions, async/await)
- Meaningful variable names (`movieCard` not `mc`)
- Comment complex logic
- Handle errors with try/catch

**CSS/Tailwind**
- Mobile-first approach
- Use Tailwind utility classes
- Custom CSS only when necessary
- Follow BEM naming for custom classes

### Adding New Features

#### Example: Add Movie Sorting by Title

1. **Update Mock API** (`src/js/mock-api.js`)
```javascript
// In /api/movies handler, add:
else if (sortBy === 'title') {
  filtered.sort((a, b) => a.title.localeCompare(b.title));
}
```

2. **Update UI** (`src/movies.html`)
```html
<select id="sortBy">
  <option value="popularity">Popularity</option>
  <option value="rating">Rating</option>
  <option value="newest">Newest</option>
  <option value="title">Title (A-Z)</option>
</select>
```

3. **Test**
   - Refresh page
   - Select "Title (A-Z)"
   - Verify movies sorted alphabetically

---

## 🧪 Testing

### Manual Testing Checklist

#### Authentication Flow
- [ ] Login page loads correctly
- [ ] Registration form validation works
- [ ] Forgot password link present
- [ ] After login, redirects to dashboard

#### Movie Browsing
- [ ] All movies display with posters
- [ ] Genre filter updates results
- [ ] Year slider filters correctly
- [ ] Rating slider filters correctly
- [ ] Sort dropdown works (popularity, rating, newest)
- [ ] Pagination prev/next buttons work
- [ ] Movie detail page loads with all information

#### Watchlist
- [ ] Add to watchlist button works
- [ ] Status can be changed (to-watch, watching, completed)
- [ ] Progress bar updates when slider moved
- [ ] Filter by status works

#### Social Features
- [ ] Friend list displays correctly
- [ ] Friend activity shows recent actions
- [ ] Posts can be liked
- [ ] Comments can be added
- [ ] Reviews can be marked helpful

#### Events
- [ ] Events list shows scheduled events
- [ ] Join/Leave event buttons work
- [ ] Participant count updates
- [ ] Event detail page shows all information
- [ ] Create event form validates input

#### Messaging
- [ ] Conversations list loads
- [ ] Message thread displays chronologically
- [ ] Send message adds to thread
- [ ] Unread message indicator appears

#### Search & Notifications
- [ ] Global search autocomplete works
- [ ] Clicking search result navigates correctly
- [ ] Notification badge shows count
- [ ] Notification dropdown displays items
- [ ] Mark as read functionality works

### Browser Compatibility Testing

Test on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

### Performance Testing

**Lighthouse Metrics** (Target Scores)
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >90

Run Lighthouse:
1. Open DevTools (F12)
2. Navigate to "Lighthouse" tab
3. Click "Generate report"

---

## ⚠️ Known Issues

### Current Limitations

1. **No Persistent Data**
   - Mock API uses in-memory storage
   - Data resets on page refresh
   - **Workaround:** Implement localStorage persistence or connect real backend

2. **Search Limitations**
   - Search only looks at movie titles
   - No fuzzy matching or typo tolerance
   - **Planned:** Full-text search with director, cast, synopsis

3. **404 When Opening Pages**
   - If you see `404 File not found` opening `/src/...` paths, the server is likely running from the repository root instead of `frontend` or `frontend/src`.
   - Fix: Either start the server from `frontend/src` (recommended), or keep serving from `frontend` and add `/src` to your URLs (e.g., `http://localhost:8000/src/admin/dashboard.html`).

4. **Repository Layout**
   - All active code is under `frontend/`. If you previously had a duplicate root-level `src/`, it has been removed to avoid confusion.

5. **Image Placeholders**
   - Uses generic placeholder images
   - **Planned:** Integration with TMDB or OMDB API for real posters

6. **No Real-Time Updates**
   - Notifications don't update automatically
   - Must refresh to see new messages
   - **Planned:** WebSocket implementation for real-time features

7. **Single-Session Only**
   - Cannot have multiple users logged in simultaneously
   - **Workaround:** Use different browsers/incognito windows

8. **Mobile Navigation**
   - Hamburger menu works but could be smoother
   - **In Progress:** Improved mobile UX

### Browser-Specific Issues

**Safari**
- Fetch API requires polyfill for older versions (<14)
- **Fix:** Include polyfill or enforce minimum version

**Internet Explorer**
- Not supported (uses ES6+ features)
- **Solution:** Add transpilation with Babel if IE support needed

---

## 🗺️ Roadmap

### Version 1.1 (Q1 2026)
- [ ] Real backend API integration (Node.js/Express or Python/Flask)
- [ ] PostgreSQL/MySQL database connection
- [ ] JWT authentication
- [ ] Password hashing and security
- [ ] Email verification for registration
- [ ] Forgot password functionality

### Version 1.2 (Q2 2026)
- [ ] TMDB API integration for real movie data
- [ ] Real movie posters and metadata
- [ ] Trailer embeds (YouTube/Vimeo)
- [ ] Movie cast and crew information
- [ ] Streaming availability checker

### Version 2.0 (Q3 2026)
- [ ] Real-time features (WebSockets)
- [ ] Live chat in watch parties
- [ ] Instant notifications
- [ ] Online/offline user status
- [ ] Typing indicators in messages

### Version 2.1 (Q4 2026)
- [ ] Mobile apps (React Native)
- [ ] Push notifications
- [ ] Offline mode support
- [ ] Dark mode toggle
- [ ] Multiple theme options

### Future Enhancements
- AI-powered movie recommendations
- Sentiment analysis on reviews
- Advanced analytics dashboard
- Export watchlist to CSV/PDF
- Integration with streaming services (Netflix, Hulu, etc.)
- Social login (Google, Facebook, Twitter)
- Two-factor authentication
- Admin panel for content moderation
- Report/flag inappropriate content
- User blocking and privacy controls

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the Repository**
   ```bash
   # Click "Fork" button on GitHub
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/Movie-Community-Management-System.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Write clean, commented code
   - Follow existing code style
   - Test thoroughly

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add amazing feature: detailed description"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Go to original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Describe your changes in detail

### Contribution Guidelines

**Code Standards**
- Follow existing file structure
- Use meaningful variable/function names
- Add comments for complex logic
- Ensure responsive design
- Test on multiple browsers

**Commit Messages**
- Use clear, descriptive messages
- Start with verb: "Add", "Fix", "Update", "Remove"
- Reference issue numbers if applicable

**Pull Request Process**
1. Update README.md if needed
2. Add yourself to CONTRIBUTORS.md
3. Request review from maintainers
4. Address any feedback
5. Wait for approval and merge

### Code of Conduct

- Be respectful and inclusive
- Constructive feedback only
- No harassment or discrimination
- Focus on collaboration
- Help newcomers learn

---

## ❓ FAQ

### For Non-Technical Users

**Q: Do I need to know programming to use this?**
A: No! You just need to open the files in a web browser. Follow the "Getting Started" section above.

**Q: Is my data saved?**
A: Currently, data resets when you refresh. This is a demo version. A production version would save everything to a database.

**Q: Can I add my own movies?**
A: In the mock version, you can edit the `mock-api.js` file to add movies. Future versions will let you add movies through the interface.

**Q: Do I need an internet connection?**
A: Once loaded, most features work offline since it's using mock data. Only the Tailwind CSS requires initial internet connection.

**Q: Can I share this with friends?**
A: Locally, no (it's on your computer only). To share, you'd need to deploy to a web server (see deployment section).

### For Developers

**Q: Why use a mock API instead of a real backend?**
A: This is designed as an educational project and frontend demo. The mock API allows full functionality without server setup. The database schema (`movie.sql`) is provided for building a real backend.

**Q: Can I convert this to React/Vue/Angular?**
A: Absolutely! The mock API can work with any frontend framework. Just intercept fetch calls the same way.

**Q: How do I deploy this?**
A: 
- **GitHub Pages**: Push to gh-pages branch
- **Netlify**: Connect GitHub repo, deploy from main branch
- **Vercel**: Import GitHub repo, configure build settings
- **Traditional Hosting**: Upload `src/` folder to web server

**Q: How do I add real authentication?**
A: Replace mock authentication with:
1. Backend API (Node.js/Express, Python/Flask, etc.)
2. JWT tokens for session management
3. Password hashing (bcrypt)
4. Database for user storage

**Q: Can I use this for my school project?**
A: Yes! This is open-source. Please credit the original repository and follow the license terms.

**Q: Where is the database connection?**
A: Currently there isn't one (mock data only). To add:
1. Set up PostgreSQL/MySQL database
2. Run `movie.sql` to create tables
3. Create backend API server
4. Replace mock API fetch intercepts with real API calls

**Q: How do I add more API endpoints?**
A: Edit `src/js/mock-api.js`, add new route handler in the `window.fetch` function following existing patterns.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What This Means

✅ **You CAN:**
- Use this commercially
- Modify and distribute
- Use privately
- Include in other projects

✅ **You MUST:**
- Include original license
- Include copyright notice

❌ **You CANNOT:**
- Hold author liable
- Use author's name for endorsement

---

## 📞 Contact

### Project Maintainer

**Shahoud**
- GitHub: [@Shahoud867](https://github.com/Shahoud867)
- Email: [Your Email Here]
- Project Link: [https://github.com/Shahoud867/Movie-Community-Management-System](https://github.com/Shahoud867/Movie-Community-Management-System)

### Support

- **Bug Reports**: [Open an issue](https://github.com/Shahoud867/Movie-Community-Management-System/issues/new?template=bug_report.md)
- **Feature Requests**: [Open an issue](https://github.com/Shahoud867/Movie-Community-Management-System/issues/new?template=feature_request.md)
- **Questions**: [Discussions](https://github.com/Shahoud867/Movie-Community-Management-System/discussions)

### Community

- **Discussions**: Join our [GitHub Discussions](https://github.com/Shahoud867/Movie-Community-Management-System/discussions)
- **Wiki**: Check the [project wiki](https://github.com/Shahoud867/Movie-Community-Management-System/wiki) for detailed guides
- **Changelog**: See [CHANGELOG.md](CHANGELOG.md) for version history

---

## 🙏 Acknowledgments

- **Tailwind CSS** - For the amazing utility-first CSS framework
- **Placeholder.com** - For temporary movie poster images
- **TMDB** - Inspiration for movie database structure
- **Letterboxd** - UX inspiration for watchlist features
- All contributors who have helped improve this project

---

<div align="center">

**Made with ❤️ by movie lovers, for movie lovers**

[⬆ Back to Top](#-movie-community-management-system)

</div>
