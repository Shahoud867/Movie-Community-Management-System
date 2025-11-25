const adminService = require('./admin.service');
const { logAuditTrail } = require('../../middleware/adminAuth');

// ========================================
// AUTHENTICATION
// ========================================

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await adminService.adminLogin(email, password);

        // Set cookie
        res.cookie('admin_token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        res.json(result);
    } catch (err) {
        if (err.message === 'Invalid credentials') {
            return res.status(401).json({ error: err.message });
        }
        next(err);
    }
}

async function logout(req, res) {
    res.clearCookie('admin_token');
    res.json({ message: 'Logged out successfully' });
}

async function getProfile(req, res) {
    res.json({ admin: req.admin });
}

// ========================================
// DASHBOARD
// ========================================

async function getDashboard(req, res, next) {
    try {
        const stats = await adminService.getDashboardStats();
        const signupChart = await adminService.getUserSignupChart();
        const recentActivity = await adminService.getRecentActivity(10);

        res.json({
            stats,
            signup_chart: signupChart,
            recent_activity: recentActivity,
        });
    } catch (err) {
        next(err);
    }
}

// ========================================
// USER MANAGEMENT
// ========================================

async function listUsers(req, res, next) {
    try {
        const { search } = req.query;
        const users = await adminService.getAllUsers(search);
        res.json(users);
    } catch (err) {
        next(err);
    }
}

async function getUser(req, res, next) {
    try {
        const userId = parseInt(req.params.id);
        if (!userId) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = await adminService.getUserById(userId);
        res.json(user);
    } catch (err) {
        if (err.message === 'User not found') {
            return res.status(404).json({ error: err.message });
        }
        next(err);
    }
}

async function updateUserStatus(req, res, next) {
    try {
        const userId = parseInt(req.params.id);
        const { is_active } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        if (is_active === undefined) {
            return res.status(400).json({ error: 'is_active field is required' });
        }

        const result = await adminService.updateUserStatus(userId, is_active);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'UPDATE',
            'Users',
            userId,
            `is_active=${!is_active}`,
            `is_active=${is_active}`,
            req.ip
        );

        res.json(result);
    } catch (err) {
        if (err.message === 'User not found') {
            return res.status(404).json({ error: err.message });
        }
        next(err);
    }
}

async function editUser(req, res, next) {
    try {
        const userId = parseInt(req.params.id);
        if (!userId) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const result = await adminService.updateUser(userId, req.body);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'UPDATE',
            'Users',
            userId,
            null,
            JSON.stringify(req.body),
            req.ip
        );

        res.json(result);
    } catch (err) {
        if (err.message === 'User not found') {
            return res.status(404).json({ error: err.message });
        }
        next(err);
    }
}

async function removeUser(req, res, next) {
    try {
        const userId = parseInt(req.params.id);
        if (!userId) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const result = await adminService.deleteUser(userId);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'DELETE',
            'Users',
            userId,
            null,
            null,
            req.ip
        );

        res.json(result);
    } catch (err) {
        if (err.message === 'User not found') {
            return res.status(404).json({ error: err.message });
        }
        next(err);
    }
}

// ========================================
// CONTENT MODERATION
// ========================================

async function getFlaggedContent(req, res, next) {
    try {
        const flagged = await adminService.getFlaggedContent();
        res.json(flagged);
    } catch (err) {
        next(err);
    }
}

async function getModerationHistory(req, res, next) {
    try {
        const { limit } = req.query;
        const history = await adminService.getModerationHistory(limit ? parseInt(limit) : 50);
        res.json(history);
    } catch (err) {
        next(err);
    }
}

async function flagContent(req, res, next) {
    try {
        const { content_type, content_id, reason } = req.body;

        if (!content_type || !content_id) {
            return res.status(400).json({ error: 'content_type and content_id are required' });
        }

        const result = await adminService.flagContent(
            req.admin.admin_id,
            content_type,
            content_id,
            reason
        );

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'FLAG',
            'Moderation',
            result.moderation_id,
            null,
            `${content_type}:${content_id}`,
            req.ip
        );

        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

async function approveContent(req, res, next) {
    try {
        const moderationId = parseInt(req.params.id);
        if (!moderationId) {
            return res.status(400).json({ error: 'Invalid moderation ID' });
        }

        const result = await adminService.approveContent(req.admin.admin_id, moderationId);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'APPROVE',
            'Moderation',
            moderationId,
            'flagged',
            'approved',
            req.ip
        );

        res.json(result);
    } catch (err) {
        if (err.message === 'Moderation record not found') {
            return res.status(404).json({ error: err.message });
        }
        next(err);
    }
}

async function deleteContent(req, res, next) {
    try {
        const moderationId = parseInt(req.params.id);
        if (!moderationId) {
            return res.status(400).json({ error: 'Invalid moderation ID' });
        }

        const result = await adminService.deleteFlaggedContent(req.admin.admin_id, moderationId);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'DELETE_CONTENT',
            'Moderation',
            moderationId,
            'flagged',
            'deleted',
            req.ip
        );

        res.json(result);
    } catch (err) {
        if (err.message === 'Moderation record not found' || err.message === 'Invalid content type') {
            return res.status(404).json({ error: err.message });
        }
        next(err);
    }
}

// ========================================
// GENRE MANAGEMENT
// ========================================

async function listGenres(req, res, next) {
    try {
        const genres = await adminService.getAllGenres();
        res.json(genres);
    } catch (err) {
        next(err);
    }
}

async function createGenre(req, res, next) {
    try {
        const { genre_name, description } = req.body;

        if (!genre_name) {
            return res.status(400).json({ error: 'genre_name is required' });
        }

        const result = await adminService.createGenre(genre_name, description);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'INSERT',
            'Genre',
            result.genre_id,
            null,
            genre_name,
            req.ip
        );

        res.status(201).json(result);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Genre already exists' });
        }
        next(err);
    }
}

async function editGenre(req, res, next) {
    try {
        const genreId = parseInt(req.params.id);
        if (!genreId) {
            return res.status(400).json({ error: 'Invalid genre ID' });
        }

        const result = await adminService.updateGenre(genreId, req.body);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'UPDATE',
            'Genre',
            genreId,
            null,
            JSON.stringify(req.body),
            req.ip
        );

        res.json(result);
    } catch (err) {
        if (err.message === 'Genre not found') {
            return res.status(404).json({ error: err.message });
        }
        next(err);
    }
}

async function removeGenre(req, res, next) {
    try {
        const genreId = parseInt(req.params.id);
        if (!genreId) {
            return res.status(400).json({ error: 'Invalid genre ID' });
        }

        const result = await adminService.deleteGenre(genreId);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'DELETE',
            'Genre',
            genreId,
            null,
            null,
            req.ip
        );

        res.json(result);
    } catch (err) {
        if (err.message === 'Genre not found') {
            return res.status(404).json({ error: err.message });
        }
        next(err);
    }
}

// ========================================
// MOVIE MANAGEMENT
// ========================================

async function createMovie(req, res, next) {
    try {
        const result = await adminService.createMovie(req.admin.admin_id, req.body);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'INSERT',
            'Movie',
            result.movie_id,
            null,
            req.body.title,
            req.ip
        );

        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

async function editMovie(req, res, next) {
    try {
        const movieId = parseInt(req.params.id);
        if (!movieId) {
            return res.status(400).json({ error: 'Invalid movie ID' });
        }

        const result = await adminService.updateMovie(movieId, req.body);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'UPDATE',
            'Movie',
            movieId,
            null,
            JSON.stringify(req.body),
            req.ip
        );

        res.json(result);
    } catch (err) {
        if (err.message === 'Movie not found') {
            return res.status(404).json({ error: err.message });
        }
        next(err);
    }
}

async function removeMovie(req, res, next) {
    try {
        const movieId = parseInt(req.params.id);
        if (!movieId) {
            return res.status(400).json({ error: 'Invalid movie ID' });
        }

        const result = await adminService.deleteMovie(movieId);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'DELETE',
            'Movie',
            movieId,
            null,
            null,
            req.ip
        );

        res.json(result);
    } catch (err) {
        if (err.message === 'Movie not found') {
            return res.status(404).json({ error: err.message });
        }
        next(err);
    }
}

// ========================================
// RESTRICTED WORDS
// ========================================

async function listRestrictedWords(req, res, next) {
    try {
        const words = await adminService.getRestrictedWords();
        res.json(words);
    } catch (err) {
        next(err);
    }
}

async function addRestrictedWord(req, res, next) {
    try {
        const { word, severity } = req.body;

        if (!word) {
            return res.status(400).json({ error: 'word is required' });
        }

        const result = await adminService.addRestrictedWord(req.admin.admin_id, word, severity);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'INSERT',
            'Restricted_Word',
            result.word_id,
            null,
            word,
            req.ip
        );

        res.status(201).json(result);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Word already exists in restricted list' });
        }
        next(err);
    }
}

async function editRestrictedWord(req, res, next) {
    try {
        const wordId = parseInt(req.params.id);
        const { severity } = req.body;

        if (!wordId) {
            return res.status(400).json({ error: 'Invalid word ID' });
        }

        if (!severity) {
            return res.status(400).json({ error: 'severity is required' });
        }

        const result = await adminService.updateRestrictedWord(wordId, severity);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'UPDATE',
            'Restricted_Word',
            wordId,
            null,
            severity,
            req.ip
        );

        res.json(result);
    } catch (err) {
        if (err.message === 'Restricted word not found') {
            return res.status(404).json({ error: err.message });
        }
        next(err);
    }
}

async function removeRestrictedWord(req, res, next) {
    try {
        const wordId = parseInt(req.params.id);
        if (!wordId) {
            return res.status(400).json({ error: 'Invalid word ID' });
        }

        const result = await adminService.deleteRestrictedWord(wordId);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'DELETE',
            'Restricted_Word',
            wordId,
            null,
            null,
            req.ip
        );

        res.json(result);
    } catch (err) {
        if (err.message === 'Restricted word not found') {
            return res.status(404).json({ error: err.message });
        }
        next(err);
    }
}

// ========================================
// REPORTS
// ========================================

async function generateReport(req, res, next) {
    try {
        const { report_type, start_date, end_date } = req.body;

        if (!report_type || !start_date || !end_date) {
            return res.status(400).json({ error: 'report_type, start_date, and end_date are required' });
        }

        let result;

        switch (report_type) {
            case 'most_watched':
                result = await adminService.generateMostWatchedReport(req.admin.admin_id, start_date, end_date);
                break;
            case 'highest_rated':
                result = await adminService.generateHighestRatedReport(req.admin.admin_id, start_date, end_date);
                break;
            case 'most_active_users':
                result = await adminService.generateMostActiveUsersReport(req.admin.admin_id, start_date, end_date);
                break;
            default:
                return res.status(400).json({ error: 'Invalid report type' });
        }

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'GENERATE_REPORT',
            'Report',
            result.report_id,
            null,
            report_type,
            req.ip
        );

        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

async function listReports(req, res, next) {
    try {
        const reports = await adminService.getAllReports();
        res.json(reports);
    } catch (err) {
        next(err);
    }
}

// ========================================
// AUDIT TRAIL
// ========================================

async function getAuditTrail(req, res, next) {
    try {
        const { limit } = req.query;
        const audits = await adminService.getAuditTrail(limit ? parseInt(limit) : 100);
        res.json(audits);
    } catch (err) {
        next(err);
    }
}

// ========================================
// ADMIN MANAGEMENT
// ========================================

async function listAdmins(req, res, next) {
    try {
        const admins = await adminService.getAllAdmins();
        res.json(admins);
    } catch (err) {
        next(err);
    }
}

async function createAdmin(req, res, next) {
    try {
        const { name, email, password, role, is_super_admin } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'name, email, and password are required' });
        }

        const result = await adminService.createAdmin(name, email, password, role, is_super_admin);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'INSERT',
            'Admin',
            result.admin_id,
            null,
            email,
            req.ip
        );

        res.status(201).json(result);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Admin with this email already exists' });
        }
        next(err);
    }
}

async function editAdmin(req, res, next) {
    try {
        const adminId = parseInt(req.params.id);
        if (!adminId) {
            return res.status(400).json({ error: 'Invalid admin ID' });
        }

        const result = await adminService.updateAdmin(adminId, req.body);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'UPDATE',
            'Admin',
            adminId,
            null,
            JSON.stringify(req.body),
            req.ip
        );

        res.json(result);
    } catch (err) {
        if (err.message === 'Admin not found') {
            return res.status(404).json({ error: err.message });
        }
        next(err);
    }
}

async function removeAdmin(req, res, next) {
    try {
        const adminId = parseInt(req.params.id);
        if (!adminId) {
            return res.status(400).json({ error: 'Invalid admin ID' });
        }

        // Prevent deleting self
        if (adminId === req.admin.admin_id) {
            return res.status(400).json({ error: 'Cannot delete your own admin account' });
        }

        const result = await adminService.deleteAdmin(adminId);

        // Log audit trail
        await logAuditTrail(
            req.admin.admin_id,
            'DELETE',
            'Admin',
            adminId,
            null,
            null,
            req.ip
        );

        res.json(result);
    } catch (err) {
        if (err.message === 'Admin not found') {
            return res.status(404).json({ error: err.message });
        }
        next(err);
    }
}

module.exports = {
    // Auth
    login,
    logout,
    getProfile,

    // Dashboard
    getDashboard,

    // User Management
    listUsers,
    getUser,
    updateUserStatus,
    editUser,
    removeUser,

    // Content Moderation
    getFlaggedContent,
    getModerationHistory,
    flagContent,
    approveContent,
    deleteContent,

    // Genre Management
    listGenres,
    createGenre,
    editGenre,
    removeGenre,

    // Movie Management
    createMovie,
    editMovie,
    removeMovie,

    // Restricted Words
    listRestrictedWords,
    addRestrictedWord,
    editRestrictedWord,
    removeRestrictedWord,

    // Reports
    generateReport,
    listReports,

    // Audit Trail
    getAuditTrail,

    // Admin Management
    listAdmins,
    createAdmin,
    editAdmin,
    removeAdmin,
};
