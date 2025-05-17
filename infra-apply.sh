#!/usr/bin/env bash
set -euo pipefail

echo "Running Terraform apply..."

# Check if tfplan exists
if [ ! -f "tfplan" ]; then
  echo "❌ Error: tfplan file not found."
  echo "Run './infra-plan.sh' first to generate the Terraform plan."
  exit 1
fi

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

# Apply Terraform plan
echo "Applying Terraform plan..."
cline run tool-terraform -- apply -auto-approve tfplan

echo "✅ Infrastructure deployment complete!"

# Export outputs to state file for CI/CD
echo "Exporting Terraform outputs to cline-app-state.json..."
cline run tool-terraform -- output -json terraform > terraform-output.json

# Use jq to format the output into the structure we want for cline-app-state.json
jq -r '{
  "accessKeyId": .access_key_id.value,
  "secretAccessKey": .secret_key.value,
  "region": "us-east-1",
  "ecrRepoUri": .repository_url.value,
  "vpcId": .vpc_id.value,
  "subnetId": .subnet_id.value,
  "securityGroupId": .sg_id.value,
  "albDnsName": .alb_dns_name.value,
  "ecsClusterArn": .ecs_cluster_arn.value,
  "ecsServiceName": .ecs_service_name.value,
  "taskDefinitionArn": .task_definition_arn.value
}' terraform-output.json > cline-app-state.json

# Clean up
rm -f terraform-output.json

echo "State exported to cline-app-state.json"
echo "Remember to add the following secrets to your GitHub repository:"
echo "  - AWS_ACCESS_KEY_ID"
echo "  - AWS_SECRET_ACCESS_KEY"
echo "  - AWS_REGION (us-east-1)"
echo "  - ECR_REPOSITORY (available in cline-app-state.json as ecrRepoUri)"
