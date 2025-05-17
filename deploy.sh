#!/bin/bash
set -euo pipefail

echo "Starting CLine MCP daemon and deployment process..."

# 1. Ensure MCP is up & connected
if ! cline mcp status &>/dev/null; then
  echo "Starting MCP daemon..."
  cline mcp start
  sleep 2
fi

ENDPOINT=$(cline mcp status | awk -F': ' '/Endpoint/ {print $2}')
echo "Connecting to MCP endpoint: $ENDPOINT"
cline connect "$ENDPOINT" || true

# Verify MCP health
echo "Checking MCP health..."
if ! cline mcp health | jq -r .status | grep -q ok; then
  echo "ERROR: MCP is not healthy. Exiting."
  exit 1
fi

# 2. Build & test with cline tools
echo "Running build tool..."
cline run build-tool

echo "Running tests..."
cline run test-tool

# 3. Build & push Docker image
echo "Building Docker image..."
IMAGE_TAG=${GITHUB_SHA:0:7}
echo "Using image tag: $IMAGE_TAG"

docker build --tag "$ECR_REPOSITORY:$IMAGE_TAG" .

echo "Logging in to ECR repository: $ECR_REPOSITORY"
aws ecr get-login-password --region "$AWS_REGION" | \
  docker login --username AWS --password-stdin "$ECR_REPOSITORY"

echo "Pushing image to ECR..."
docker push "$ECR_REPOSITORY:$IMAGE_TAG"

# 4. Deploy to ECS
echo "Updating ECS service in cluster: my-cluster, service: my-service"
aws ecs update-service \
  --cluster my-cluster \
  --service my-service \
  --force-new-deployment \
  --region "$AWS_REGION"

echo "✅ Successfully deployed image: $ECR_REPOSITORY:$IMAGE_TAG"
