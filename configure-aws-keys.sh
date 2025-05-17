#!/bin/bash
# configure-aws-keys.sh
# Script to configure AWS keys for both CLine AWS plugin and standard AWS CLI

set -euo pipefail

echo -e "\033[1;36m🔑 AWS Keys Configuration\033[0m"
echo -e "\033[1;36m========================\033[0m"

# Check if keys file exists
if [ ! -f "./cline-ci-cd_accessKeys" ]; then
    echo -e "\033[1;33mAWS keys file not found. Creating template file...\033[0m"
    cat > ./cline-ci-cd_accessKeys <<EOF
# AWS Access Keys for CI/CD
# Replace the placeholder values with your actual AWS keys
export AWS_ACCESS_KEY_ID="your-access-key-id-here"
export AWS_SECRET_ACCESS_KEY="your-secret-access-key-here"
EOF
    echo -e "\033[1;33mPlease edit the cline-ci-cd_accessKeys file with your actual AWS keys and run this script again.\033[0m"
    chmod 600 ./cline-ci-cd_accessKeys
    exit 1
fi

echo -e "\033[1;32m1. Loading AWS keys from file...\033[0m"
source ./cline-ci-cd_accessKeys

# Verify keys are not empty
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo -e "\033[1;31mError: AWS keys are empty or not properly set in the cline-ci-cd_accessKeys file.\033[0m"
    echo -e "\033[1;31mPlease edit the file with your actual AWS keys and run this script again.\033[0m"
    exit 1
fi

echo -e "\033[1;32m2. Configuring CLine AWS plugin...\033[0m"
cline run tool-aws -- configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
cline run tool-aws -- configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"

echo -e "\033[1;32m3. Writing keys to ~/.aws/credentials...\033[0m"
mkdir -p ~/.aws
cat > ~/.aws/credentials <<EOF
[default]
aws_access_key_id = $AWS_ACCESS_KEY_ID
aws_secret_access_key = $AWS_SECRET_ACCESS_KEY
EOF
chmod 600 ~/.aws/credentials

echo -e "\033[1;32m4. Setting default region and output format...\033[0m"
cline run tool-aws -- configure set region us-east-1
cline run tool-aws -- configure set output json

# Also configure standard AWS CLI
mkdir -p ~/.aws
cat > ~/.aws/config <<EOF
[default]
region = us-east-1
output = json
EOF
chmod 600 ~/.aws/config

echo -e "\033[1;32m5. Verifying setup...\033[0m"
echo -e "\033[1;33mCalling sts get-caller-identity to verify credentials...\033[0m"
cline run tool-aws -- sts get-caller-identity

echo -e "\n\033[1;32m✅ AWS keys configuration complete!\033[0m"
