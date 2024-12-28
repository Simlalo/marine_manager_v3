# Create timestamp for backup
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path -Path (Get-Item ..).FullName -ChildPath "project_backup_$timestamp"

# Step 1: Create backup
Write-Host "📦 Creating backup..."
Copy-Item -Path . -Destination $backupDir -Recurse

# Step 2: Clean build artifacts and caches
Write-Host "🧹 Cleaning build artifacts..."
$foldersToRemove = @(
    "dist",
    "build",
    ".next",
    "coverage"
)

foreach ($folder in $foldersToRemove) {
    if (Test-Path $folder) {
        Remove-Item -Path $folder -Recurse -Force
    }
}

# Remove specific file types
Get-ChildItem -Path . -Include "*.log", "*.map", ".DS_Store" -Recurse -File | Remove-Item -Force

# Step 3: Clean npm
Write-Host "🧼 Cleaning npm cache..."
npm cache clean --force
npm prune

# Step 4: Clean node_modules and reinstall
Write-Host "📥 Reinstalling dependencies..."
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force
}
npm install

# Step 5: Remove any redundant TypeScript build info
Get-ChildItem -Path . -Include "*.tsbuildinfo" -Recurse -File | Remove-Item -Force

# Step 6: Clean temporary files
Get-ChildItem -Path . -Include "*.tmp", "*.temp" -Recurse -File | Remove-Item -Force

# Step 7: Remove empty directories
Get-ChildItem -Path . -Recurse -Directory | 
    Where-Object { -not (Get-ChildItem -Path $_.FullName) } | 
    Remove-Item -Force -Recurse

# Step 8: Verify project still builds
Write-Host "🔍 Verifying project..."
npm run build

# Print summary
Write-Host "✨ Cleanup complete!"
Write-Host "Backup created at: $backupDir"
Write-Host "Run 'npm start' or 'npm run dev' to verify everything works"
