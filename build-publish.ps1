# ==========================================================
#   Knowledge Management System — One-Click Build & Publish
# ==========================================================
$ErrorActionPreference = "Stop"

$rootDir = $PSScriptRoot
$frontendDir = Join-Path $rootDir "frontend"
$backendDir = Join-Path $rootDir "backend"
$publishDir = Join-Path $rootDir "publish"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Knowledge Management System — Build & Publish Process" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 1: Frontend Build
Write-Host "`n[1/4] Building Frontend (Angular Production)..." -ForegroundColor Yellow
Set-Location $frontendDir
npm run build

# Step 2: Backend Build
Write-Host "`n[2/4] Building Backend (Spring Boot JAR)..." -ForegroundColor Yellow
Set-Location $backendDir
.\gradlew.bat bootJar

# Step 3: Packaging
Write-Host "`n[3/4] Copying artifacts to publish folder..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path (Join-Path $publishDir "backend"), (Join-Path $publishDir "frontend"), (Join-Path $publishDir "nginx") | Out-Null

$jarSource = Get-ChildItem -Path (Join-Path $backendDir "build\libs\knowledge-management-*.jar") | Select-Object -First 1
Copy-Item -Path $jarSource.FullName -Destination (Join-Path $publishDir "backend\knowledge-management.jar") -Force
Write-Host "Copied JAR: $($jarSource.Name) -> publish/backend/knowledge-management.jar" -ForegroundColor Green

$browserSource = Join-Path $frontendDir "dist\knowledge-management-frontend\browser"
Copy-Item -Path $browserSource -Destination (Join-Path $publishDir "frontend") -Recurse -Force
Write-Host "Copied Frontend Browser artifacts -> publish/frontend/browser" -ForegroundColor Green

Set-Location $rootDir
Write-Host "`n[4/4] Publish completed successfully!" -ForegroundColor Green
Write-Host "Output Directory: $publishDir" -ForegroundColor Cyan

