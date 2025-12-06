# Password Reset Feature - Setup Guide

## Overview
The password reset feature allows users to reset their password via email if they forget it.

## Features Implemented
- ✅ Forgot password page with email input
- ✅ Secure token generation (SHA-256 hashed)
- ✅ Email delivery with beautiful HTML template
- ✅ Token validation (1-hour expiry)
- ✅ Reset password page with new password form
- ✅ Token usage tracking (one-time use only)
- ✅ Database table: `Password_Reset_Token`

## Setup Instructions

### 1. Database Setup
Run the updated database script to create the `Password_Reset_Token` table:

```bash
cd backend/db
./setup-database.bat
```

Or manually execute the migration:
```sql
CREATE TABLE Password_Reset_Token (
    token_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_reset_token (token),
    INDEX idx_reset_user (user_id),
    INDEX idx_reset_expiry (expires_at)
);
```

### 2. Email Configuration

**⚠️ SECURITY WARNING:** Never commit your actual `.env` file with real credentials to GitHub! Use `.env.example` as a template.

#### Setup Steps:

1. **Copy the example file:**
```bash
cd backend
cp .env.example .env
```

2. **Edit `.env` with your real credentials** (this file is gitignored):

#### Option A: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App-Specific Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or Other)
   - Copy the 16-character password

3. **Update `.env` file:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM_NAME=Movie Community
FRONTEND_URL=http://localhost:5500
```

#### Option B: Other Email Providers

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

**Mailgun:**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=your-mailgun-password
```

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### 3. Test Email Configuration

Start your backend server:
```bash
cd backend
npm start
```

The server will verify email configuration on startup. You should see:
```
✅ Email server is ready to send messages
```

If you see an error, check your email credentials.

### 4. Testing the Feature

1. **Navigate to Forgot Password:**
   - Go to `http://localhost:5500/forgot-password.html`
   - Enter a valid user email (e.g., `ahmed.malik@gmail.com`)
   - Click "Send Reset Link"

2. **Check Email:**
   - Check the inbox of the email you entered
   - Click the "Reset Password" button in the email

3. **Reset Password:**
   - You'll be redirected to `reset-password.html?token=...`
   - Enter your new password (min 6 characters)
   - Confirm the password
   - Click "Reset Password"

4. **Login:**
   - Go to `login.html`
   - Login with your email and new password

## API Endpoints

### POST /api/auth/forgot-password
Request password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If that email exists, a reset link has been sent."
}
```

### GET /api/auth/validate-reset-token
Validate if reset token is still valid.

**Query Parameter:**
- `token` - The reset token from URL

**Response:**
```json
{
  "valid": true,
  "message": "Token is valid"
}
```

### POST /api/auth/reset-password
Reset password using valid token.

**Request:**
```json
{
  "token": "abc123...",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful. You can now login with your new password."
}
```

## Security Features

1. **Token Hashing:** Reset tokens are SHA-256 hashed before storage
2. **One-Time Use:** Tokens are marked as `used` after successful password reset
3. **Expiry:** Tokens expire after 1 hour
4. **Email Privacy:** System doesn't reveal if email exists (security best practice)
5. **Strong Passwords:** Minimum 6 characters enforced
6. **Old Token Cleanup:** Previous tokens deleted when requesting new reset

## Troubleshooting

### Email Not Sending

**Error: "Invalid login"**
- Check email and password in `.env`
- For Gmail: Ensure you're using App-Specific Password, not regular password
- Verify 2FA is enabled on Gmail account

**Error: "Connection timeout"**
- Check `EMAIL_HOST` and `EMAIL_PORT`
- Ensure your network allows SMTP connections
- Try port 465 with `secure: true` for Gmail

**Error: "self signed certificate"**
- For development, you can add this to `email.js`:
```javascript
const transporter = nodemailer.createTransport({
  ...EMAIL_CONFIG,
  tls: { rejectUnauthorized: false }
});
```

### Token Issues

**"Invalid or expired reset token"**
- Token may have expired (>1 hour old)
- Token may have already been used
- Request a new reset link

**Token not found in email**
- Check spam folder
- Verify email configuration
- Check backend logs for email sending errors

## Development vs Production

**Development (Local):**
- Use Gmail with App-Specific Password
- `FRONTEND_URL=http://localhost:5500`

**Production:**
- Use professional email service (SendGrid, Mailgun, AWS SES)
- Update `FRONTEND_URL` to your domain
- Set `secure: true` for port 465
- Use environment-specific `.env` files

## Files Modified/Created

### Backend
- ✅ `backend/db/sample_data.sql` - Added `Password_Reset_Token` table
- ✅ `backend/src/utils/email.js` - Email service with templates
- ✅ `backend/src/modules/auth/auth.service.js` - Reset logic
- ✅ `backend/src/modules/auth/auth.controller.js` - API controllers
- ✅ `backend/src/modules/auth/auth.routes.js` - New routes
- ✅ `backend/.env` - Email configuration variables
- ✅ `backend/package.json` - Added nodemailer dependency

### Frontend
- ✅ `frontend/src/forgot-password.html` - Updated to use new API
- ✅ `frontend/src/reset-password.html` - New password reset page

## Next Steps

1. ✅ All backend functionality implemented
2. ✅ All frontend pages created
3. ⏳ Configure email credentials in `.env`
4. ⏳ Test the complete flow
5. ⏳ Consider adding rate limiting to prevent abuse
6. ⏳ Add email templates for other notifications (welcome email, etc.)

---

**Support:** If you encounter issues, check the backend console logs for detailed error messages.
