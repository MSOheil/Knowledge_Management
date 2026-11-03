@echo off
chcp 65001 > nul
echo ==========================================================
echo   Knowledge Management System — One-Click Build & Publish
echo ==========================================================
echo.

set ROOT_DIR=%~dp0
set FRONTEND_DIR=%ROOT_DIR%frontend
set BACKEND_DIR=%ROOT_DIR%backend
set PUBLISH_DIR=%ROOT_DIR%publish

echo [1/4] Building Frontend (Angular Production Build)...
cd /d "%FRONTEND_DIR%"
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo [2/4] Building Backend (Spring Boot JAR)...
cd /d "%BACKEND_DIR%"
call gradlew.bat bootJar
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backend build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo [3/4] Packaging to publish folder...
if not exist "%PUBLISH_DIR%\backend" mkdir "%PUBLISH_DIR%\backend"
if not exist "%PUBLISH_DIR%\frontend" mkdir "%PUBLISH_DIR%\frontend"
if not exist "%PUBLISH_DIR%\nginx" mkdir "%PUBLISH_DIR%\nginx"

echo Copying Backend JAR...
copy /Y "%BACKEND_DIR%\build\libs\knowledge-management-*.jar" "%PUBLISH_DIR%\backend\knowledge-management.jar"

echo Copying Frontend Assets...
xcopy /E /I /Y "%FRONTEND_DIR%\dist\knowledge-management-frontend\browser" "%PUBLISH_DIR%\frontend\browser"

echo [4/4] Publish completed successfully!
echo Output folder: %PUBLISH_DIR%
echo.
pause

