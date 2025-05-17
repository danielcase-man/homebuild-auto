#!/usr/bin/env bash
set -euo pipefail

echo "Setting up Google Cloud services for Homebuild Email Management..."

# Check if environment variables are set
if [ -z "${GOOGLE_CLOUD_PROJECT:-}" ]; then
  echo "Error: GOOGLE_CLOUD_PROJECT environment variable not set."
  echo "Please set it with: export GOOGLE_CLOUD_PROJECT=your-project-id"
  exit 1
fi

if [ -z "${ADMIN_EMAIL:-}" ]; then
  echo "Error: ADMIN_EMAIL environment variable not set."
  echo "Please set it with: export ADMIN_EMAIL=your-admin-email@domain.com"
  exit 1
fi

echo "Using project: $GOOGLE_CLOUD_PROJECT"
echo "Using admin email: $ADMIN_EMAIL"

echo "########################################"
echo "# 1. Enable Google Workspace Admin & Gmail APIs"
echo "########################################"
echo "Running: gcloud services enable admin.googleapis.com gmail.googleapis.com"
gcloud services enable admin.googleapis.com gmail.googleapis.com

echo "########################################"
echo "# 2. Create Service Account & Delegation"
echo "########################################"
echo "Running: gcloud iam service-accounts create project-mailer --display-name=\"Homebuild Project Mailer\""
gcloud iam service-accounts create project-mailer \
  --display-name="Homebuild Project Mailer"

echo "Running: gcloud iam service-accounts add-iam-policy-binding for delegation"
gcloud iam service-accounts add-iam-policy-binding project-mailer@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com \
  --member="user:${ADMIN_EMAIL}" \
  --role="roles/iam.serviceAccountTokenCreator"

echo "########################################"
echo "# 3. Generate & Download Service Account Key"
echo "########################################"
echo "Running: gcloud iam service-accounts keys create mailer-key.json"
gcloud iam service-accounts keys create backend/mailer-key.json \
  --iam-account=project-mailer@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com

echo "########################################"
echo "# 4. Grant Mailer SA Gmail Admin Role"
echo "########################################"
echo "Running: gcloud projects add-iam-policy-binding for Gmail admin"
gcloud projects add-iam-policy-binding ${GOOGLE_CLOUD_PROJECT} \
  --member="serviceAccount:project-mailer@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com" \
  --role="roles/resourcemanager.projectIamAdmin"

echo "Setup complete! Please add your domain to the mailer-key.json file"
echo "under the 'domain' field."
