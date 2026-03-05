# Disable git pager temporarily
$env:GIT_PAGER = ''
$env:LESS = ''
$env:GIT_CONFIG_PARAMETERS = 'core.pager='

# Reset all staged files (if any)
git reset HEAD 2>&1 | Out-Null

# 1. Project setup and configuration
Write-Host "Creating commit 1: Project setup..." -ForegroundColor Green
git add package.json package-lock.json tsconfig.json .env .gitignore 2>&1 | Out-Null
git commit -m "chore: add project setup and configuration files" 2>&1 | Out-Null

# 2. Public icons
Write-Host "Creating commit 2: Public icons..." -ForegroundColor Green
git add public/icons/ 2>&1 | Out-Null
git commit -m "feat: add public icons assets" 2>&1 | Out-Null

# 3. Public images and video
Write-Host "Creating commit 3: Public images and video..." -ForegroundColor Green
git add public/img/ public/video/ public/index.html public/manifest.json public/robots.txt 2>&1 | Out-Null
git commit -m "feat: add public images, video and static files" 2>&1 | Out-Null

# 4. Core application files
Write-Host "Creating commit 4: Core application files..." -ForegroundColor Green
git add src/index.tsx src/app/store.ts src/app/context/ src/app/MaterialTheme/ 2>&1 | Out-Null
git commit -m "feat: add core application setup and theme configuration" 2>&1 | Out-Null

# 5. Components
Write-Host "Creating commit 5: Components..." -ForegroundColor Green
git add src/app/components/ 2>&1 | Out-Null
git commit -m "feat: add application components" 2>&1 | Out-Null

# 6. Screens
Write-Host "Creating commit 6: Screens..." -ForegroundColor Green
git add src/app/screens/ 2>&1 | Out-Null
git commit -m "feat: add application screens and pages" 2>&1 | Out-Null

# 7. Services
Write-Host "Creating commit 7: Services..." -ForegroundColor Green
git add src/app/services/ 2>&1 | Out-Null
git commit -m "feat: add application services" 2>&1 | Out-Null

# 8. Library files (types, enums, config)
Write-Host "Creating commit 8: Library files..." -ForegroundColor Green
git add src/lib/ 2>&1 | Out-Null
git commit -m "feat: add library types, enums and configuration" 2>&1 | Out-Null

# 9. Hooks
Write-Host "Creating commit 9: Hooks..." -ForegroundColor Green
git add src/app/hooks.ts src/app/hooks/ 2>&1 | Out-Null
git commit -m "feat: add custom React hooks" 2>&1 | Out-Null

# 10. CSS files
Write-Host "Creating commit 10: CSS files..." -ForegroundColor Green
git add src/css/ 2>&1 | Out-Null
git commit -m "feat: add application stylesheets" 2>&1 | Out-Null

# 11. Documentation and other files
Write-Host "Creating commit 11: Documentation..." -ForegroundColor Green
git add README.md src/reportWebVitals.ts src/setupTests.ts src/react-app-env.d.ts 2>&1 | Out-Null
git commit -m "docs: add documentation and test setup files" 2>&1 | Out-Null

Write-Host "All commits created successfully!"

