# PowerShell script for setting up Google Cloud services for Homebuild Email Management

# Ensure error handling
$ErrorActionPreference = "Stop"

Write-Host "Setting up Google Cloud services for Homebuild Email Management..."

# Check if environment variables are set
if (-not $env:GOOGLE_CLOUD_PROJECT) {
    Write-Error "Error: GOOGLE_CLOUD_PROJECT environment variable not set.
    Please set it with: `$env:GOOGLE_CLOUD_PROJECT='your-project-id'"
    exit 1
}

if (-not $env:ADMIN_EMAIL) {
    Write-Error "Error: ADMIN_EMAIL environment variable not set.
    Please set it with: `$env:ADMIN_EMAIL='your-admin-email@domain.com'"
    exit 1
}

Write-Host "Using project: $env:GOOGLE_CLOUD_PROJECT"
Write-Host "Using admin email: $env:ADMIN_EMAIL"

Write-Host "########################################"
Write-Host "# 1. Enable Google Workspace Admin & Gmail APIs"
Write-Host "########################################"
Write-Host "Running: gcloud services enable admin.googleapis.com gmail.googleapis.com"
& gcloud services enable admin.googleapis.com gmail.googleapis.com

Write-Host "########################################"
Write-Host "# 2. Create Service Account & Delegation"
Write-Host "########################################"
Write-Host "Running: gcloud iam service-accounts create project-mailer --display-name=`"Homebuild Project Mailer`""
& gcloud iam service-accounts create project-mailer --display-name="Homebuild Project Mailer"

Write-Host "Running: gcloud iam service-accounts add-iam-policy-binding for delegation"
& gcloud iam service-accounts add-iam-policy-binding "project-mailer@$($env:GOOGLE_CLOUD_PROJECT).iam.gserviceaccount.com" `
    --member="user:$($env:ADMIN_EMAIL)" `
    --role="roles/iam.serviceAccountTokenCreator"

Write-Host "########################################"
Write-Host "# 3. Generate & Download Service Account Key"
Write-Host "########################################"
Write-Host "Running: gcloud iam service-accounts keys create backend/mailer-key.json"
& gcloud iam service-accounts keys create backend/mailer-key.json `
    --iam-account="project-mailer@$($env:GOOGLE_CLOUD_PROJECT).iam.gserviceaccount.com"

Write-Host "########################################"
Write-Host "# 4. Grant Mailer SA Gmail Admin Role"
Write-Host "########################################"
Write-Host "Running: gcloud projects add-iam-policy-binding for Gmail admin"
& gcloud projects add-iam-policy-binding $env:GOOGLE_CLOUD_PROJECT `
    --member="serviceAccount:project-mailer@$($env:GOOGLE_CLOUD_PROJECT).iam.gserviceaccount.com" `
    --role="roles/resourcemanager.projectIamAdmin"

Write-Host "Setup complete! Please add your domain to the mailer-key.json file"
Write-Host "under the 'domain' field."
