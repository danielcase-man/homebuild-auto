# Homebuild Project Email Management

This module extends the Home Construction Management System with Gmail integration for project-specific email management.

## Features

- **Automated Project Email Creation**: Create Gmail accounts for each construction project
- **Email Integration**: Send emails directly from your backend application
- **Email Ingestion**: Process incoming emails to update project data automatically

## Setup Instructions

### Prerequisites

- Google Cloud Platform account with billing enabled
- Google Workspace with domain management access
- `gcloud` CLI installed and authenticated

### 1. Configure Google Cloud Project

First, set up the required environment variables:

```bash
# For Linux/macOS
export GOOGLE_CLOUD_PROJECT="your-project-id"
export ADMIN_EMAIL="your-admin-email@domain.com"

# For Windows PowerShell
$env:GOOGLE_CLOUD_PROJECT = "your-project-id"
$env:ADMIN_EMAIL = "your-admin-email@domain.com"
```

### 2. Run Setup Script

Execute the setup script to create and configure the necessary Google Cloud resources:

```bash
# For Linux/macOS
chmod +x setup-google-services.sh
./setup-google-services.sh

# For Windows PowerShell
.\Setup-GoogleServices.ps1
```

### 3. Configure Service Account

The script will generate a `mailer-key.json` file. You need to add your domain to this file:

```json
{
  // existing content
  "domain": "yourdomain.com"
}
```

### 4. Configure Environment Variables

Make sure your `.env` file contains:

```
SA_KEY_PATH=./mailer-key.json
DELEGATED_ADMIN_EMAIL=project-mailer@your-project-id.iam.gserviceaccount.com
```

### 5. Install Dependencies

```bash
npm install
```

## API Endpoints

### Create Project Email

```
POST /email/create
```

Request body:
```json
{
  "userName": "project123",
  "password": "SecurePassword123!"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "primaryEmail": "project123@yourdomain.com",
    "name": {
      "givenName": "project123",
      "familyName": "Homebuild"
    }
  }
}
```

### Send Email

```
POST /email/send
```

Request body:
```json
{
  "to": "recipient@example.com",
  "subject": "Project Update",
  "body": "Construction phase 1 is complete."
}
```

Response:
```json
{
  "success": true,
  "message": "Email sent to recipient@example.com"
}
```

### Ingest Emails

```
POST /email/ingest
```

Response:
```json
{
  "success": true,
  "message": "Emails ingested and analyzed successfully"
}
```

## Docker Deployment

To deploy the application using Docker Compose:

```bash
cd ../infra
docker-compose up -d
```

## Security Considerations

- Store your `mailer-key.json` securely and never commit it to version control
- Use strong passwords for Gmail accounts
- Review Google Cloud IAM permissions regularly
