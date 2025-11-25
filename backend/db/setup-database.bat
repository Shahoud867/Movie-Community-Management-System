@echo off
echo ========================================
echo Movie Community Database Setup
echo ========================================
echo.
echo This will:
echo 1. Drop existing movie_community database (if exists)
echo 2. Create fresh movie_community database
echo 3. Insert all sample data including admin users
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo Running database setup...
echo.

mysql -u root -ppassword < sample_data.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Database setup complete!
    echo ========================================
    echo.
    echo Admin credentials:
    echo   Email: sarah.admin@moviehub.com
    echo   Password: admin123
    echo.
    echo You can now login at:
    echo   http://localhost:3000/admin/login.html
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR! Database setup failed!
    echo ========================================
    echo.
    echo Please check:
    echo 1. MySQL is running
    echo 2. Username is 'root'
    echo 3. Password is 'password' (or update this script)
    echo.
)

pause
