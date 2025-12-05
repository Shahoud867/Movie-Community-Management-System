const { pool } = require('../../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ========================================
// ADMIN AUTHENTICATION
// ========================================

/**
 * Admin login
 */
async function adminLogin(email, password) {
    const [admins] = await pool.query(
        'SELECT * FROM Admin WHERE email = ?',
        [email]
    );

    if (admins.length === 0) {
        throw new Error('Invalid credentials');
    }

    const admin = admins[0];

    // Compare password using bcrypt
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
        { admin_id: admin.admin_id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );

    return {
        token,
        admin: {
            admin_id: admin.admin_id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            is_super_admin: admin.is_super_admin,
        },
    };
}

// ========================================
// DASHBOARD STATISTICS
// ========================================

/**
 * Get dashboard statistics
 */
async function getDashboardStats() {
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM Users WHERE is_active = TRUE');
    const [movieCount] = await pool.query('SELECT COUNT(*) as count FROM Movie');
    const [flaggedCount] = await pool.query(
        `SELECT COUNT(*) as count FROM Moderation WHERE action = 'flagged'`
    );
    const [eventCount] = await pool.query(
        `SELECT COUNT(*) as count FROM Event WHERE status = 'scheduled'`
    );
    const [postCount] = await pool.query('SELECT COUNT(*) as count FROM Post');
    const [reviewCount] = await pool.query('SELECT COUNT(*) as count FROM Review');

    return {
        total_users: userCount[0].count,
        total_movies: movieCount[0].count,
        flagged_content: flaggedCount[0].count,
        scheduled_events: eventCount[0].count,
        total_posts: postCount[0].count,
        total_reviews: reviewCount[0].count,
    };
}

/**
 * Get user signup chart data (last 7 days)
 */
async function getUserSignupChart() {
    const [signups] = await pool.query(`
    SELECT DATE(joined_date) as date, COUNT(*) as count
    FROM Users
    WHERE joined_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY DATE(joined_date)
    ORDER BY date ASC
  `);

    return signups;
}

/**
 * Get recent activity feed
 */
async function getRecentActivity(limit = 10) {
    const [activities] = await pool.query(`
    (SELECT 'user_joined' as type, u.name as user_name, u.joined_date as timestamp
     FROM Users u ORDER BY u.joined_date DESC LIMIT 5)
    UNION ALL
    (SELECT 'post_created' as type, u.name as user_name, p.created_date as timestamp
     FROM Post p JOIN Users u ON p.user_id = u.user_id ORDER BY p.created_date DESC LIMIT 5)
    UNION ALL
    (SELECT 'event_created' as type, u.name as user_name, e.created_date as timestamp
     FROM Event e JOIN Users u ON e.host_id = u.user_id ORDER BY e.created_date DESC LIMIT 5)
    ORDER BY timestamp DESC
    LIMIT ?
  `, [limit]);

    return activities;
}

// ========================================
// USER MANAGEMENT
// ========================================

/**
 * Get all users with optional search
 */
async function getAllUsers(searchQuery = '') {
    let query = `
    SELECT user_id, name, email, fav_genre, joined_date, last_login, is_active,
           (SELECT COUNT(*) FROM Post WHERE user_id = Users.user_id) as post_count,
           (SELECT COUNT(*) FROM Review WHERE user_id = Users.user_id) as review_count
    FROM Users
    WHERE 1=1
  `;

    const params = [];

    if (searchQuery) {
        query += ` AND (name LIKE ? OR email LIKE ?)`;
        params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    query += ` ORDER BY joined_date DESC`;

    const [users] = await pool.query(query, params);
    return users;
}

/**
 * Get user by ID with detailed stats
 */
async function getUserById(userId) {
    const [users] = await pool.query(`
    SELECT u.*,
           (SELECT COUNT(*) FROM Post WHERE user_id = u.user_id) as post_count,
           (SELECT COUNT(*) FROM Review WHERE user_id = u.user_id) as review_count,
           (SELECT COUNT(*) FROM Event WHERE host_id = u.user_id) as event_count,
           (SELECT COUNT(*) FROM Friendship WHERE (sender_id = u.user_id OR receiver_id = u.user_id) AND status = 'accepted') as friend_count
    FROM Users u
    WHERE u.user_id = ?
  `, [userId]);

    if (users.length === 0) {
        throw new Error('User not found');
    }

    return users[0];
}

/**
 * Update user status (activate/deactivate)
 */
async function updateUserStatus(userId, isActive) {
    const [result] = await pool.query(
        'UPDATE Users SET is_active = ? WHERE user_id = ?',
        [isActive, userId]
    );

    if (result.affectedRows === 0) {
        throw new Error('User not found');
    }

    return { message: 'User status updated successfully', is_active: isActive };
}

/**
 * Update user details
 */
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

    if (updates.fav_genre) {
        fields.push('fav_genre = ?');
        values.push(updates.fav_genre);
    }

    if (updates.bio !== undefined) {
        fields.push('bio = ?');
        values.push(updates.bio);
    }

    if (fields.length === 0) {
        throw new Error('No fields to update');
    }

    values.push(userId);

    const [result] = await pool.query(
        `UPDATE Users SET ${fields.join(', ')} WHERE user_id = ?`,
        values
    );

    if (result.affectedRows === 0) {
        throw new Error('User not found');
    }

    return { message: 'User updated successfully' };
}

/**
 * Delete user
 */
async function deleteUser(userId) {
    const [result] = await pool.query('DELETE FROM Users WHERE user_id = ?', [userId]);

    if (result.affectedRows === 0) {
        throw new Error('User not found');
    }

    return { message: 'User deleted successfully' };
}

// ========================================
// CONTENT MODERATION
// ========================================

/**
 * Get flagged content
 */
async function getFlaggedContent() {
    const [flagged] = await pool.query(`
    SELECT m.moderation_id, m.content_type, m.content_id, m.action, m.reason, m.action_date,
           a.name as admin_name,
           CASE 
             WHEN m.content_type = 'post' THEN (SELECT content FROM Post WHERE post_id = m.content_id)
             WHEN m.content_type = 'comment' THEN (SELECT content FROM Comment WHERE comment_id = m.content_id)
             WHEN m.content_type = 'review' THEN (SELECT review_text FROM Review WHERE review_id = m.content_id)
             ELSE NULL
           END as content_text,
           CASE 
             WHEN m.content_type = 'post' THEN (SELECT user_id FROM Post WHERE post_id = m.content_id)
             WHEN m.content_type = 'comment' THEN (SELECT user_id FROM Comment WHERE comment_id = m.content_id)
             WHEN m.content_type = 'review' THEN (SELECT user_id FROM Review WHERE review_id = m.content_id)
             ELSE NULL
           END as user_id,
           CASE 
             WHEN m.content_type = 'post' THEN (SELECT name FROM Users WHERE user_id = (SELECT user_id FROM Post WHERE post_id = m.content_id))
             WHEN m.content_type = 'comment' THEN (SELECT name FROM Users WHERE user_id = (SELECT user_id FROM Comment WHERE comment_id = m.content_id))
             WHEN m.content_type = 'review' THEN (SELECT name FROM Users WHERE user_id = (SELECT user_id FROM Review WHERE review_id = m.content_id))
             ELSE NULL
           END as user_name
    FROM Moderation m
    LEFT JOIN Admin a ON m.admin_id = a.admin_id
    WHERE m.action = 'flagged'
    ORDER BY m.action_date DESC
  `);

    return flagged;
}

/**
 * Get all moderation history
 */
async function getModerationHistory(limit = 50) {
    const [history] = await pool.query(`
    SELECT m.*, a.name as admin_name
    FROM Moderation m
    LEFT JOIN Admin a ON m.admin_id = a.admin_id
    ORDER BY m.action_date DESC
    LIMIT ?
  `, [limit]);

    return history;
}

/**
 * Flag content
 */
async function flagContent(adminId, contentType, contentId, reason) {
    const [result] = await pool.query(
        `INSERT INTO Moderation (admin_id, content_type, content_id, action, reason)
     VALUES (?, ?, ?, 'flagged', ?)`,
        [adminId, contentType, contentId, reason]
    );

    return { moderation_id: result.insertId, message: 'Content flagged successfully' };
}

/**
 * Approve content
 */
async function approveContent(adminId, moderationId) {
    const [result] = await pool.query(
        `UPDATE Moderation SET action = 'approved', admin_id = ?, action_date = CURRENT_TIMESTAMP
     WHERE moderation_id = ?`,
        [adminId, moderationId]
    );

    if (result.affectedRows === 0) {
        throw new Error('Moderation record not found');
    }

    return { message: 'Content approved successfully' };
}

/**
 * Delete flagged content
 */
async function deleteFlaggedContent(adminId, moderationId) {
    // Get moderation record
    const [modRecords] = await pool.query(
        'SELECT content_type, content_id FROM Moderation WHERE moderation_id = ?',
        [moderationId]
    );

    if (modRecords.length === 0) {
        throw new Error('Moderation record not found');
    }

    const { content_type, content_id } = modRecords[0];

    // Delete the actual content
    let deleteQuery = '';
    switch (content_type) {
        case 'post':
            deleteQuery = 'DELETE FROM Post WHERE post_id = ?';
            break;
        case 'comment':
            deleteQuery = 'DELETE FROM Comment WHERE comment_id = ?';
            break;
        case 'review':
            deleteQuery = 'DELETE FROM Review WHERE review_id = ?';
            break;
        default:
            throw new Error('Invalid content type');
    }

    await pool.query(deleteQuery, [content_id]);

    // Update moderation record
    await pool.query(
        `UPDATE Moderation SET action = 'deleted', admin_id = ?, action_date = CURRENT_TIMESTAMP
     WHERE moderation_id = ?`,
        [adminId, moderationId]
    );

    return { message: 'Content deleted successfully' };
}

// ========================================
// GENRE MANAGEMENT
// ========================================

/**
 * Get all genres
 */
async function getAllGenres() {
    const [genres] = await pool.query(`
    SELECT g.*, 
           (SELECT COUNT(*) FROM Movie_Genre WHERE genre_id = g.genre_id) as movie_count
    FROM Genre g
    ORDER BY g.genre_name ASC
  `);

    return genres;
}

/**
 * Create genre
 */
async function createGenre(genreName, description) {
    const [result] = await pool.query(
        'INSERT INTO Genre (genre_name, description) VALUES (?, ?)',
        [genreName, description]
    );

    return {
        genre_id: result.insertId,
        genre_name: genreName,
        description,
        message: 'Genre created successfully',
    };
}

/**
 * Update genre
 */
async function updateGenre(genreId, updates) {
    const fields = [];
    const values = [];

    if (updates.genre_name) {
        fields.push('genre_name = ?');
        values.push(updates.genre_name);
    }

    if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
    }

    if (fields.length === 0) {
        throw new Error('No fields to update');
    }

    values.push(genreId);

    const [result] = await pool.query(
        `UPDATE Genre SET ${fields.join(', ')} WHERE genre_id = ?`,
        values
    );

    if (result.affectedRows === 0) {
        throw new Error('Genre not found');
    }

    return { message: 'Genre updated successfully' };
}

/**
 * Delete genre
 */
async function deleteGenre(genreId) {
    const [result] = await pool.query('DELETE FROM Genre WHERE genre_id = ?', [genreId]);

    if (result.affectedRows === 0) {
        throw new Error('Genre not found');
    }

    return { message: 'Genre deleted successfully' };
}

// ========================================
// MOVIE MANAGEMENT (ADMIN)
// ========================================

/**
 * Create movie (admin)
 */
async function createMovie(adminId, movieData) {
    const { title, synopsis, release_year, poster, duration_minutes, language, director, genres } = movieData;

    const [result] = await pool.query(
        `INSERT INTO Movie (title, synopsis, release_year, poster, duration_minutes, language, director, added_by_admin)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, synopsis, release_year, poster, duration_minutes, language, director, adminId]
    );

    const movieId = result.insertId;

    // Add genres if provided
    if (genres && genres.length > 0) {
        const genreValues = genres.map(genreId => [movieId, genreId]);
        await pool.query(
            'INSERT INTO Movie_Genre (movie_id, genre_id) VALUES ?',
            [genreValues]
        );
    }

    return {
        movie_id: movieId,
        title,
        message: 'Movie created successfully',
    };
}

/**
 * Update movie (admin)
 */
async function updateMovie(movieId, updates) {
    const fields = [];
    const values = [];

    const allowedFields = ['title', 'synopsis', 'release_year', 'poster', 'duration_minutes', 'language', 'director'];

    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            fields.push(`${field} = ?`);
            values.push(updates[field]);
        }
    });

    if (fields.length === 0 && !updates.genres) {
        throw new Error('No fields to update');
    }

    if (fields.length > 0) {
        values.push(movieId);
        await pool.query(
            `UPDATE Movie SET ${fields.join(', ')} WHERE movie_id = ?`,
            values
        );
    }

    // Update genres if provided
    if (updates.genres) {
        await pool.query('DELETE FROM Movie_Genre WHERE movie_id = ?', [movieId]);
        if (updates.genres.length > 0) {
            const genreValues = updates.genres.map(genreId => [movieId, genreId]);
            await pool.query(
                'INSERT INTO Movie_Genre (movie_id, genre_id) VALUES ?',
                [genreValues]
            );
        }
    }

    return { message: 'Movie updated successfully' };
}

/**
 * Delete movie (admin)
 */
async function deleteMovie(movieId) {
    const [result] = await pool.query('DELETE FROM Movie WHERE movie_id = ?', [movieId]);

    if (result.affectedRows === 0) {
        throw new Error('Movie not found');
    }

    return { message: 'Movie deleted successfully' };
}

// ========================================
// RESTRICTED WORDS
// ========================================

/**
 * Get all restricted words
 */
async function getRestrictedWords() {
    const [words] = await pool.query(`
    SELECT rw.*, a.name as added_by_name
    FROM Restricted_Word rw
    LEFT JOIN Admin a ON rw.added_by_admin = a.admin_id
    ORDER BY rw.added_date DESC
  `);

    return words;
}

/**
 * Add restricted word
 */
async function addRestrictedWord(adminId, word, severity = 'medium') {
    const [result] = await pool.query(
        'INSERT INTO Restricted_Word (word, severity, added_by_admin) VALUES (?, ?, ?)',
        [word.toLowerCase(), severity, adminId]
    );

    return {
        word_id: result.insertId,
        word,
        severity,
        message: 'Restricted word added successfully',
    };
}

/**
 * Update restricted word
 */
async function updateRestrictedWord(wordId, severity) {
    const [result] = await pool.query(
        'UPDATE Restricted_Word SET severity = ? WHERE word_id = ?',
        [severity, wordId]
    );

    if (result.affectedRows === 0) {
        throw new Error('Restricted word not found');
    }

    return { message: 'Restricted word updated successfully' };
}

/**
 * Delete restricted word
 */
async function deleteRestrictedWord(wordId) {
    const [result] = await pool.query('DELETE FROM Restricted_Word WHERE word_id = ?', [wordId]);

    if (result.affectedRows === 0) {
        throw new Error('Restricted word not found');
    }

    return { message: 'Restricted word deleted successfully' };
}

// ========================================
// REPORTS & ANALYTICS
// ========================================

/**
 * Generate most watched movies report
 */
async function generateMostWatchedReport(adminId, startDate, endDate) {
    const [movies] = await pool.query(`
    SELECT m.movie_id, m.title, m.poster, COUNT(wh.history_id) as watch_count
    FROM Movie m
    LEFT JOIN Watch_History wh ON m.movie_id = wh.movie_id
    WHERE wh.watched_date BETWEEN ? AND ?
    GROUP BY m.movie_id
    ORDER BY watch_count DESC
    LIMIT 10
  `, [startDate, endDate]);

    const reportData = JSON.stringify(movies);

    const [result] = await pool.query(
        `INSERT INTO Report (report_type, generated_by_admin, report_data, date_range_start, date_range_end)
     VALUES ('most_watched', ?, ?, ?, ?)`,
        [adminId, reportData, startDate, endDate]
    );

    return {
        report_id: result.insertId,
        report_type: 'most_watched',
        data: movies,
        message: 'Report generated successfully',
    };
}

/**
 * Generate highest rated movies report
 */
async function generateHighestRatedReport(adminId, startDate, endDate) {
    const [movies] = await pool.query(`
    SELECT m.movie_id, m.title, m.poster, m.average_rating, COUNT(r.rating_id) as rating_count
    FROM Movie m
    LEFT JOIN Rating r ON m.movie_id = r.movie_id
    WHERE r.rated_date BETWEEN ? AND ?
    GROUP BY m.movie_id
    HAVING rating_count >= 5
    ORDER BY m.average_rating DESC
    LIMIT 10
  `, [startDate, endDate]);

    const reportData = JSON.stringify(movies);

    const [result] = await pool.query(
        `INSERT INTO Report (report_type, generated_by_admin, report_data, date_range_start, date_range_end)
     VALUES ('highest_rated', ?, ?, ?, ?)`,
        [adminId, reportData, startDate, endDate]
    );

    return {
        report_id: result.insertId,
        report_type: 'highest_rated',
        data: movies,
        message: 'Report generated successfully',
    };
}

/**
 * Generate most active users report
 */
async function generateMostActiveUsersReport(adminId, startDate, endDate) {
    const [users] = await pool.query(`
    SELECT u.user_id, u.name, u.email, u.profile_picture,
           (SELECT COUNT(*) FROM Post WHERE user_id = u.user_id AND created_date BETWEEN ? AND ?) as post_count,
           (SELECT COUNT(*) FROM Review WHERE user_id = u.user_id AND created_date BETWEEN ? AND ?) as review_count,
           (SELECT COUNT(*) FROM Event WHERE host_id = u.user_id AND created_date BETWEEN ? AND ?) as event_count
    FROM Users u
    WHERE u.is_active = TRUE
    HAVING (post_count + review_count + event_count) > 0
    ORDER BY (post_count + review_count + event_count) DESC
    LIMIT 10
  `, [startDate, endDate, startDate, endDate, startDate, endDate]);

    const reportData = JSON.stringify(users);

    const [result] = await pool.query(
        `INSERT INTO Report (report_type, generated_by_admin, report_data, date_range_start, date_range_end)
     VALUES ('most_active_users', ?, ?, ?, ?)`,
        [adminId, reportData, startDate, endDate]
    );

    return {
        report_id: result.insertId,
        report_type: 'most_active_users',
        data: users,
        message: 'Report generated successfully',
    };
}

/**
 * Get all reports
 */
async function getAllReports() {
    const [reports] = await pool.query(`
    SELECT r.*, a.name as admin_name
    FROM Report r
    LEFT JOIN Admin a ON r.generated_by_admin = a.admin_id
    ORDER BY r.generated_date DESC
  `);

    // Parse JSON data safely
    return reports.map(report => {
        let parsedData = null;
        if (report.report_data) {
            try {
                parsedData = typeof report.report_data === 'string'
                    ? JSON.parse(report.report_data)
                    : report.report_data;
            } catch (e) {
                console.error(`Failed to parse report_data for report ${report.report_id}:`, e);
                parsedData = null;
            }
        }
        return {
            ...report,
            report_data: parsedData,
        };
    });
}

// ========================================
// AUDIT TRAIL
// ========================================

/**
 * Get audit trail
 */
async function getAuditTrail(limit = 100) {
    const [audits] = await pool.query(`
    SELECT at.*, a.name as admin_name, a.email as admin_email
    FROM Audit_Trail at
    LEFT JOIN Admin a ON at.admin_id = a.admin_id
    ORDER BY at.operation_timestamp DESC
    LIMIT ?
  `, [limit]);

    return audits;
}

// ========================================
// ADMIN MANAGEMENT
// ========================================

/**
 * Get all admins
 */
async function getAllAdmins() {
    const [admins] = await pool.query(`
    SELECT admin_id, name, email, role, created_date, is_super_admin
    FROM Admin
    ORDER BY created_date DESC
  `);

    return admins;
}

/**
 * Create admin
 */
async function createAdmin(name, email, password, role = 'moderator', isSuperAdmin = false) {
    const [result] = await pool.query(
        'INSERT INTO Admin (name, email, password, role, is_super_admin) VALUES (?, ?, ?, ?, ?)',
        [name, email, password, role, isSuperAdmin]
    );

    return {
        admin_id: result.insertId,
        name,
        email,
        role,
        is_super_admin: isSuperAdmin,
        message: 'Admin created successfully',
    };
}

/**
 * Update admin
 */
async function updateAdmin(adminId, updates) {
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

    if (updates.role) {
        fields.push('role = ?');
        values.push(updates.role);
    }

    if (updates.is_super_admin !== undefined) {
        fields.push('is_super_admin = ?');
        values.push(updates.is_super_admin);
    }

    if (fields.length === 0) {
        throw new Error('No fields to update');
    }

    values.push(adminId);

    const [result] = await pool.query(
        `UPDATE Admin SET ${fields.join(', ')} WHERE admin_id = ?`,
        values
    );

    if (result.affectedRows === 0) {
        throw new Error('Admin not found');
    }

    return { message: 'Admin updated successfully' };
}

/**
 * Delete admin
 */
async function deleteAdmin(adminId) {
    const [result] = await pool.query('DELETE FROM Admin WHERE admin_id = ?', [adminId]);

    if (result.affectedRows === 0) {
        throw new Error('Admin not found');
    }

    return { message: 'Admin deleted successfully' };
}

module.exports = {
    // Auth
    adminLogin,

    // Dashboard
    getDashboardStats,
    getUserSignupChart,
    getRecentActivity,

    // User Management
    getAllUsers,
    getUserById,
    updateUserStatus,
    updateUser,
    deleteUser,

    // Content Moderation
    getFlaggedContent,
    getModerationHistory,
    flagContent,
    approveContent,
    deleteFlaggedContent,

    // Genre Management
    getAllGenres,
    createGenre,
    updateGenre,
    deleteGenre,

    // Movie Management
    createMovie,
    updateMovie,
    deleteMovie,

    // Restricted Words
    getRestrictedWords,
    addRestrictedWord,
    updateRestrictedWord,
    deleteRestrictedWord,

    // Reports
    generateMostWatchedReport,
    generateHighestRatedReport,
    generateMostActiveUsersReport,
    getAllReports,

    // Audit Trail
    getAuditTrail,

    // Admin Management
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
};
