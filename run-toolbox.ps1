# Run-toolbox.ps1
# Script to build and run the toolbox container with AWS provisioning

# Clear screen
Clear-Host
Write-Host "🔧 AWS Infrastructure Provisioning Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Prompt for AWS credentials
Write-Host "Please enter your AWS credentials:" -ForegroundColor Yellow
$AWS_ACCESS_KEY_ID = Read-Host -Prompt "AWS Access Key ID"
$AWS_SECRET_ACCESS_KEY = Read-Host -Prompt "AWS Secret Access Key" -AsSecureString
$AWS_SECRET_ACCESS_KEY_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($AWS_SECRET_ACCESS_KEY))

# Build the Docker image
Write-Host "`n🔨 Building toolbox image..." -ForegroundColor Green
docker build -t toolbox:latest -f Dockerfile.toolbox .

# Check if the build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Toolbox image built successfully!" -ForegroundColor Green
    
    # Prompt to run the provisioning
    Write-Host "`nWould you like to run the AWS provisioning script now? (y/n)" -ForegroundColor Yellow
    $runProvisioning = Read-Host
    
    if ($runProvisioning -eq "y" -or $runProvisioning -eq "Y") {
        Write-Host "`n🚀 Running AWS provisioning in the toolbox container..." -ForegroundColor Green
        Write-Host "This may take several minutes. Please wait..." -ForegroundColor Yellow
        
        # Run the Docker container with AWS provisioning script
        docker run --rm -it `
            -v "${PWD}:/app" `
            -e "AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID" `
            -e "AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY_PLAIN" `
            toolbox:latest bash -c "chmod +x ./provision-aws.sh && ./provision-aws.sh"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ AWS provisioning completed successfully!" -ForegroundColor Green
            Write-Host "The infrastructure details are stored in cline-app-state.json" -ForegroundColor Green
        } else {
            Write-Host "`n❌ AWS provisioning failed. Please check the error messages above." -ForegroundColor Red
        }
    } else {
        Write-Host "`nYou can run the provisioning later with:" -ForegroundColor Yellow
        Write-Host "docker run --rm -it -v `"${PWD}:/app`" -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY toolbox:latest bash -c `"chmod +x ./provision-aws.sh && ./provision-aws.sh`"" -ForegroundColor Gray
    }
} else {
    Write-Host "`n❌ Failed to build the toolbox image. Please check the error messages above." -ForegroundColor Red
}

# Clean up sensitive data
$AWS_ACCESS_KEY_ID = $null
$AWS_SECRET_ACCESS_KEY = $null
$AWS_SECRET_ACCESS_KEY_PLAIN = $null
[System.GC]::Collect()

Write-Host "`nPress any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
