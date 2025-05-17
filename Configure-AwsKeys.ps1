# Configure-AwsKeys.ps1
# PowerShell script to configure AWS keys for both CLine AWS plugin and standard AWS CLI

# Clear screen
Clear-Host
Write-Host "🔑 AWS Keys Configuration" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

$keysFile = "./cline-ci-cd_accessKeys.ps1"

# Check if keys file exists
if (-Not (Test-Path $keysFile)) {
    Write-Host "AWS keys file not found. Creating template file..." -ForegroundColor Yellow
    
    $templateContent = @"
# AWS Access Keys for CI/CD
# Replace the placeholder values with your actual AWS keys
`$env:AWS_ACCESS_KEY_ID = "your-access-key-id-here"
`$env:AWS_SECRET_ACCESS_KEY = "your-secret-access-key-here"
"@
    
    Set-Content -Path $keysFile -Value $templateContent
    
    # Set permissions to be more secure (owner-only)
    $acl = Get-Acl -Path $keysFile
    $acl.SetAccessRuleProtection($true, $false)
    $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule($identity, "FullControl", "Allow")
    $acl.AddAccessRule($accessRule)
    Set-Acl -Path $keysFile -AclObject $acl
    
    Write-Host "Please edit the cline-ci-cd_accessKeys.ps1 file with your actual AWS keys and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Loading AWS keys from file..." -ForegroundColor Green
. $keysFile

# Verify keys are not empty
if ([string]::IsNullOrEmpty($env:AWS_ACCESS_KEY_ID) -or [string]::IsNullOrEmpty($env:AWS_SECRET_ACCESS_KEY)) {
    Write-Host "Error: AWS keys are empty or not properly set in the cline-ci-cd_accessKeys.ps1 file." -ForegroundColor Red
    Write-Host "Please edit the file with your actual AWS keys and run this script again." -ForegroundColor Red
    exit 1
}

Write-Host "2. Configuring CLine AWS plugin..." -ForegroundColor Green
try {
    cline run tool-aws -- configure set aws_access_key_id $env:AWS_ACCESS_KEY_ID
    cline run tool-aws -- configure set aws_secret_access_key $env:AWS_SECRET_ACCESS_KEY
} catch {
    Write-Host "Error: Failed to configure CLine AWS plugin. Make sure CLine is installed and the AWS tool plugin is available." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Continuing with AWS CLI configuration..." -ForegroundColor Yellow
}

Write-Host "3. Writing keys to AWS credentials file..." -ForegroundColor Green
$awsFolder = "$env:USERPROFILE\.aws"
$awsCredentialsFile = "$awsFolder\credentials"

# Create AWS directory if it doesn't exist
if (-Not (Test-Path $awsFolder)) {
    New-Item -ItemType Directory -Path $awsFolder | Out-Null
}

# Create or update credentials file
$credentialsContent = @"
[default]
aws_access_key_id = $($env:AWS_ACCESS_KEY_ID)
aws_secret_access_key = $($env:AWS_SECRET_ACCESS_KEY)
"@

Set-Content -Path $awsCredentialsFile -Value $credentialsContent

# Set restrictive permissions on credentials file
$acl = Get-Acl -Path $awsCredentialsFile
$acl.SetAccessRuleProtection($true, $false)
$identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule($identity, "FullControl", "Allow")
$acl.AddAccessRule($accessRule)
Set-Acl -Path $awsCredentialsFile -AclObject $acl

Write-Host "4. Setting default region and output format..." -ForegroundColor Green
$awsConfigFile = "$awsFolder\config"

# Create or update config file
$configContent = @"
[default]
region = us-east-1
output = json
"@

Set-Content -Path $awsConfigFile -Value $configContent

try {
    cline run tool-aws -- configure set region us-east-1
    cline run tool-aws -- configure set output json
} catch {
    Write-Host "Warning: Failed to configure CLine AWS plugin region/output settings." -ForegroundColor Yellow
    Write-Host "AWS CLI configuration is still complete." -ForegroundColor Yellow
}

Write-Host "5. Verifying setup..." -ForegroundColor Green
Write-Host "Calling sts get-caller-identity to verify credentials..." -ForegroundColor Yellow
try {
    cline run tool-aws -- sts get-caller-identity
    Write-Host "`n✅ AWS keys configuration complete!" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not verify credentials with CLine AWS plugin." -ForegroundColor Yellow
    Write-Host "You may need to verify the AWS CLI configuration manually." -ForegroundColor Yellow
    Write-Host "`nAWS keys configuration completed with warnings." -ForegroundColor Yellow
}

# Clean up sensitive variables from memory
$env:AWS_ACCESS_KEY_ID = $null
$env:AWS_SECRET_ACCESS_KEY = $null
[System.GC]::Collect()

Write-Host "`nPress any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
