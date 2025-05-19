# PowerShell script to check Docker dependencies and run tests

Write-Host "🔍 Checking Docker installation..." -ForegroundColor Cyan

# Check if Docker is installed
$dockerInstalled = $null -ne (Get-Command docker -ErrorAction SilentlyContinue)

if (-not $dockerInstalled) {
    Write-Host "❌ Docker is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After installing Docker Desktop:" -ForegroundColor Cyan
    Write-Host "1. Start Docker Desktop"
    Write-Host "2. Verify installation with: docker --version"
    Write-Host "3. Run this test script again"
    exit 1
}

# Docker is installed, show version
Write-Host "✅ Docker is installed" -ForegroundColor Green
Write-Host "Docker version: $(docker --version)"
Write-Host ""

# Run the test script
Write-Host "🧪 Running CLine Docker tests..." -ForegroundColor Cyan
Write-Host ""

# Call the batch script
& .\test-cline-docker.bat

Write-Host ""
Write-Host "✅ Test complete! If all steps succeeded, your Docker environment is correctly set up." -ForegroundColor Green
Write-Host "This indicates GitHub Actions should be able to build and run the Docker container." -ForegroundColor Green
