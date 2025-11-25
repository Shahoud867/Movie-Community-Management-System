const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { requireAdmin, requireSuperAdmin } = require('../../middleware/adminAuth');

// ========================================
// PUBLIC ROUTES (No Auth Required)
// ========================================

// Admin login
router.post('/login', adminController.login);

// ========================================
// PROTECTED ROUTES (Admin Auth Required)
// ========================================

// Admin logout & profile
router.post('/logout', requireAdmin, adminController.logout);
router.get('/profile', requireAdmin, adminController.getProfile);

// Dashboard
router.get('/dashboard', requireAdmin, adminController.getDashboard);

// User Management
router.get('/users', requireAdmin, adminController.listUsers);
router.get('/users/:id', requireAdmin, adminController.getUser);
router.patch('/users/:id/status', requireAdmin, adminController.updateUserStatus);
router.put('/users/:id', requireAdmin, adminController.editUser);
router.delete('/users/:id', requireAdmin, adminController.removeUser);

// Content Moderation
router.get('/moderation/flagged', requireAdmin, adminController.getFlaggedContent);
router.get('/moderation/history', requireAdmin, adminController.getModerationHistory);
router.post('/moderation/flag', requireAdmin, adminController.flagContent);
router.patch('/moderation/:id/approve', requireAdmin, adminController.approveContent);
router.delete('/moderation/:id', requireAdmin, adminController.deleteContent);

// Genre Management
router.get('/genres', requireAdmin, adminController.listGenres);
router.post('/genres', requireAdmin, adminController.createGenre);
router.put('/genres/:id', requireAdmin, adminController.editGenre);
router.delete('/genres/:id', requireAdmin, adminController.removeGenre);

// Movie Management (Admin)
router.post('/movies', requireAdmin, adminController.createMovie);
router.put('/movies/:id', requireAdmin, adminController.editMovie);
router.delete('/movies/:id', requireAdmin, adminController.removeMovie);

// Restricted Words
router.get('/restricted-words', requireAdmin, adminController.listRestrictedWords);
router.post('/restricted-words', requireAdmin, adminController.addRestrictedWord);
router.put('/restricted-words/:id', requireAdmin, adminController.editRestrictedWord);
router.delete('/restricted-words/:id', requireAdmin, adminController.removeRestrictedWord);

// Reports
router.post('/reports', requireAdmin, adminController.generateReport);
router.get('/reports', requireAdmin, adminController.listReports);

// Audit Trail
router.get('/audit', requireAdmin, adminController.getAuditTrail);

// ========================================
// SUPER ADMIN ONLY ROUTES
// ========================================

// Admin Management (Super Admin Only)
router.get('/admins', requireAdmin, requireSuperAdmin, adminController.listAdmins);
router.post('/admins', requireAdmin, requireSuperAdmin, adminController.createAdmin);
router.put('/admins/:id', requireAdmin, requireSuperAdmin, adminController.editAdmin);
router.delete('/admins/:id', requireAdmin, requireSuperAdmin, adminController.removeAdmin);

module.exports = { adminRouter: router };
