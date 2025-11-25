// COPY THIS SECTION TO REPLACE LINES 650-750 IN admin.service.js
// This is the correct code for the corrupted section

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
