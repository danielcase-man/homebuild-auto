#!/bin/bash
set -euo pipefail

echo "=== Installing AWS Plugin ==="
cline install tool-aws
cline run tool-aws -- configure set region us-east-1
cline run tool-aws -- configure set output json

echo "=== Creating CI/CD IAM User ==="
cline run tool-aws -- iam create-user --user-name cicd-user
cline run tool-aws -- iam attach-user-policy --user-name cicd-user --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess
cline run tool-aws -- iam attach-user-policy --user-name cicd-user --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess
cline run tool-aws -- iam create-access-key --user-name cicd-user > cicd-keys.json
echo "Created IAM user cicd-user with access keys stored in cicd-keys.json"

echo "=== Creating ECR Repository ==="
cline run tool-aws -- ecr create-repository --repository-name my-app > ecr.json
ECR_REPO_URI=$(jq -r .repository.repositoryUri ecr.json)
echo "Created ECR repository: $ECR_REPO_URI"

echo "=== Provisioning VPC, Subnet and Security Group ==="
VPC_ID=$(cline run tool-aws -- ec2 create-vpc --cidr-block 10.0.0.0/16 --query 'Vpc.VpcId' --output text)
echo "Created VPC: $VPC_ID"

# Enable DNS hostnames for the VPC
cline run tool-aws -- ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames "{\"Value\":true}"

SUBNET_ID=$(cline run tool-aws -- ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --query 'Subnet.SubnetId' --output text)
echo "Created Subnet: $SUBNET_ID"

# Create and attach internet gateway
IGW_ID=$(cline run tool-aws -- ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text)
cline run tool-aws -- ec2 attach-internet-gateway --internet-gateway-id $IGW_ID --vpc-id $VPC_ID
echo "Created and attached Internet Gateway: $IGW_ID"

# Update route table
ROUTE_TABLE_ID=$(cline run tool-aws -- ec2 describe-route-tables --filters Name=vpc-id,Values=$VPC_ID --query 'RouteTables[0].RouteTableId' --output text)
cline run tool-aws -- ec2 create-route --route-table-id $ROUTE_TABLE_ID --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID
echo "Updated route table to use Internet Gateway"

SG_ID=$(cline run tool-aws -- ec2 create-security-group --group-name ecs-sg --description "ECS SG" --vpc-id $VPC_ID --query 'GroupId' --output text)
cline run tool-aws -- ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0
echo "Created Security Group: $SG_ID with HTTP ingress"

echo "=== Creating Load Balancer and Target Group ==="
ALB_ARN=$(cline run tool-aws -- elbv2 create-load-balancer --name my-app-alb --subnets $SUBNET_ID --security-groups $SG_ID --query 'LoadBalancers[0].LoadBalancerArn' --output text)
echo "Created Application Load Balancer: $ALB_ARN"

TARGET_GROUP_ARN=$(cline run tool-aws -- elbv2 create-target-group --name my-app-tg --protocol HTTP --port 80 --vpc-id $VPC_ID --target-type ip --query 'TargetGroups[0].TargetGroupArn' --output text)
echo "Created Target Group: $TARGET_GROUP_ARN"

LISTENER_ARN=$(cline run tool-aws -- elbv2 create-listener --load-balancer-arn $ALB_ARN --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn=$TARGET_GROUP_ARN --query 'Listeners[0].ListenerArn' --output text)
echo "Created Listener: $LISTENER_ARN"

echo "=== Creating ECS Cluster, Task Definition and Service ==="
CLUSTER_ARN=$(cline run tool-aws -- ecs create-cluster --cluster-name my-app-cluster --query 'cluster.clusterArn' --output text)
echo "Created ECS Cluster: $CLUSTER_ARN"

# Get AWS account ID
ACCOUNT_ID=$(cline run tool-aws -- sts get-caller-identity --query Account --output text)

# Create ECS Task Execution Role if it doesn't exist
echo "Ensuring ecsTaskExecutionRole exists..."
role_exists=$(cline run tool-aws -- iam get-role --role-name ecsTaskExecutionRole 2>/dev/null || echo "not_found")

if [[ $role_exists == *"not_found"* ]]; then
  echo "Creating ecsTaskExecutionRole..."
  
  # Create trust policy document
  cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
  
  # Create the role
  cline run tool-aws -- iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document file://trust-policy.json
  
  # Attach the necessary policy
  cline run tool-aws -- iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
  
  echo "ecsTaskExecutionRole created."
else
  echo "ecsTaskExecutionRole already exists."
fi

cat > taskdef.json <<EOF
{
  "family":"my-app-task",
  "networkMode":"awsvpc",
  "requiresCompatibilities":["FARGATE"],
  "cpu":"256",
  "memory":"512",
  "executionRoleArn":"arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "containerDefinitions":[{
    "name":"my-app",
    "image":"${ECR_REPO_URI}:latest",
    "essential":true,
    "portMappings":[{"containerPort":80,"protocol":"tcp"}]
  }]
}
EOF

TASK_DEF_ARN=$(cline run tool-aws -- ecs register-task-definition --cli-input-json file://taskdef.json --query 'taskDefinition.taskDefinitionArn' --output text)
echo "Registered Task Definition: $TASK_DEF_ARN"

echo "Creating ECS Service..."
cline run tool-aws -- ecs create-service \
  --cluster $CLUSTER_ARN \
  --service-name my-app-service \
  --task-definition $TASK_DEF_ARN \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_ID],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$TARGET_GROUP_ARN,containerName=my-app,containerPort=80"

echo "=== Creating State File ==="
ALB_DNS_NAME=$(cline run tool-aws -- elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text)

cat > cline-app-state.json <<EOF
{
  "accessKeyId": "$(jq -r .AccessKey.AccessKeyId cicd-keys.json)",
  "secretAccessKey": "$(jq -r .AccessKey.SecretAccessKey cicd-keys.json)",
  "region": "us-east-1",
  "ecrRepoUri": "$ECR_REPO_URI",
  "vpcId": "$VPC_ID",
  "subnetId": "$SUBNET_ID",
  "securityGroupId": "$SG_ID",
  "albArn": "$ALB_ARN",
  "albDnsName": "$ALB_DNS_NAME",
  "targetGroupArn": "$TARGET_GROUP_ARN",
  "listenerArn": "$LISTENER_ARN",
  "clusterArn": "$CLUSTER_ARN",
  "taskDefinitionArn": "$TASK_DEF_ARN",
  "ecsServiceName": "my-app-service"
}
EOF

echo "=== Summary of AWS Resources ==="
echo "AWS_ACCESS_KEY_ID=$(jq -r .AccessKey.AccessKeyId cicd-keys.json)"
echo "AWS_SECRET_ACCESS_KEY=$(jq -r .AccessKey.SecretAccessKey cicd-keys.json)"
echo "AWS_REGION=us-east-1"
echo "ECR_REPO_URI=$ECR_REPO_URI"
echo "VPC_ID=$VPC_ID"
echo "SUBNET_ID=$SUBNET_ID"
echo "SG_ID=$SG_ID"
echo "ALB_DNS_NAME=$ALB_DNS_NAME"
echo "ECS_CLUSTER_ARN=$CLUSTER_ARN"
echo "ECS_SERVICE_NAME=my-app-service"

echo "✅ AWS Provisioning Complete!"
echo "All details are stored in cline-app-state.json"
