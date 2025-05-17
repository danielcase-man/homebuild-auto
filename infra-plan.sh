#!/usr/bin/env bash
set -euo pipefail

echo "Running Terraform plan..."

# Check if tool-terraform plugin is installed
if ! cline plugin list 2>/dev/null | grep -q tool-terraform; then
  echo "Installing tool-terraform plugin..."
  cline install tool-terraform
fi

# Ensure we're using the AWS credentials
if [ -f "./cline-ci-cd_accessKeys" ]; then
  echo "Loading AWS credentials..."
  source ./cline-ci-cd_accessKeys
  
  # Configure AWS CLI if available
  if command -v aws >/dev/null 2>&1; then
    echo "Configuring AWS CLI..."
    aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
    aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
    aws configure set region us-east-1
    aws configure set output json
  fi
else
  echo "Warning: AWS credentials file not found. Make sure your AWS credentials are set up."
fi

# Run terraform plan
echo "Generating Terraform plan..."
cline run tool-terraform -- init -input=false terraform
cline run tool-terraform -- plan -out=tfplan terraform

echo "✅ Terraform plan generated as 'tfplan'"
echo "Run './infra-apply.sh' to apply the plan"
