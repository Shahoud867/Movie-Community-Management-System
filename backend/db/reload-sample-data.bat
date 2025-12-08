@echo off
echo ========================================
echo Reloading Sample Data for Analytics Demo
echo ========================================
echo.

echo Connecting to MySQL and running sample_data.sql...
mysql -u root -p < sample_data.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Sample data reloaded.
    echo ========================================
    echo.
    echo New data includes:
    echo - 20 users
    echo - 13 movies with genres
    echo - 100+ watchlist entries across 2025
    echo - 80+ ratings with dates
    echo - 35+ detailed reviews
    echo - 28 friendships
    echo.
    echo Analytics dashboard will now show:
    echo - Rich monthly activity charts
    echo - Genre distribution data
    echo - Year-in-review stats for 2025
    echo - Community trends and popular movies
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Failed to reload data
    echo ========================================
    echo.
    echo Please check:
    echo 1. MySQL is running
    echo 2. Root password is correct
    echo 3. sample_data.sql file exists
    echo.
)

pause
