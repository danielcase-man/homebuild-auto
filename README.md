# CI/CD and AWS Deployment Pipeline

This repository contains a complete CI/CD pipeline that builds, tests, and deploys a containerized application to AWS ECS Fargate, with automatic provisioning of all required AWS resources.

## What's Included

- **Docker Toolbox Container**: Provides all necessary tools for development and deployment
- **AWS Infrastructure Automation**: Scripts to provision complete AWS infrastructure
- **GitHub Actions Workflow**: Automated CI/CD pipeline that runs on every push
- **Cross-Platform Support**: Windows PowerShell and Unix/Linux/macOS bash scripts
- **VS Code Integration**: Tasks and keybindings for seamless development experience

## Getting Started

### 1. Apply Your AWS Credentials

#### On Windows:

```powershell
# Creates template file if it doesn't exist
.\Configure-AwsKeys.ps1

# Edit the created template file with your credentials
notepad .\cline-ci-cd_accessKeys.ps1

# Run again to apply settings
.\Configure-AwsKeys.ps1

# Verify your credentials work
cline run tool-aws -- sts get-caller-identity
```

#### On Unix/Linux/macOS:

```bash
# Creates template file if it doesn't exist
chmod +x ./configure-aws-keys.sh
./configure-aws-keys.sh

# Edit the template file with your credentials
nano ./cline-ci-cd_accessKeys

# Run again to apply settings
./configure-aws-keys.sh

# Verify your credentials work
cline run tool-aws -- sts get-caller-identity
```

### 2. Provision AWS Infrastructure

Run the toolbox container with your provisioning script:

#### On Windows:

```powershell
.\run-toolbox.ps1
# Follow the prompts to build image and run provisioning
```

#### On Unix/Linux/macOS:

```bash
chmod +x ./run-toolbox.sh
./run-toolbox.sh
# Follow the prompts to build image and run provisioning
```

After provisioning completes, verify that `cline-app-state.json` is populated with your AWS resource details.

### 3. Set GitHub Repository Secrets

Copy these values from `cline-app-state.json` to your GitHub repository's secrets (Settings → Secrets → Actions):

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `ECR_REPOSITORY`

### 4. Trigger Your First CI/CD Run

Push a change to your main/master branch (you can make a small update to this README file). The GitHub Actions workflow will:

1. Build the toolbox image
2. Run your deploy.sh script (build, test, push, deploy)
3. Update your ECS service automatically

### 5. Verify Deployment

After the workflow completes successfully, verify your deployment:

- **Check ECR**: Confirm your Docker image was pushed with the correct tag (GitHub commit SHA)
- **Check ECS**: In AWS Console under ECS → Clusters → your cluster, verify tasks are running
- **Check ALB**: In EC2 → Load Balancers, confirm your ALB's DNS is serving traffic

The ALB DNS name is stored in `cline-app-state.json` as `albDnsName`.

## VS Code Integration

This repository includes VS Code tasks and keybindings for faster development:

### Available Tasks

Press `Ctrl+Shift+P` and type "Run Task" to see these options:

- **Cline Build Website**: Runs the complete bootstrapping process via CLine
- **Configure AWS Credentials**: Sets up your AWS credentials
- **Run Toolbox Container**: Builds and runs the Docker toolbox
- **Provision AWS Resources**: Runs the provisioning script in the toolbox

### Keyboard Shortcuts

The following keyboard shortcuts are available:

- `Ctrl+Alt+B`: Run the "Cline Build Website" task
- `Ctrl+Alt+C`: Run the "Configure AWS Credentials" task
- `Ctrl+Alt+R`: Run the "Run Toolbox Container" task
- `Ctrl+Alt+P`: Run the "Provision AWS Resources" task

> Note: These keybindings are defined in `.vscode/keybindings.json` and are specific to this workspace.

## Infrastructure Components

This setup provisions the following AWS resources:

- IAM role for CI/CD with appropriate permissions
- ECR repository for Docker images
- VPC with public subnet
- Security group with HTTP ingress
- Application Load Balancer
- ECS Fargate cluster, task definition, and service

## Maintenance

### Updating AWS Infrastructure

To update your AWS infrastructure, modify `provision-aws.sh` and run it again using the toolbox runner.

### CI/CD Pipeline Customization

Modify `.github/workflows/ci-cd.yml` to customize the GitHub Actions workflow.

### Local Development

Use the toolbox container for local development to ensure a consistent environment:

```bash
docker run --rm -it -v $(pwd):/app toolbox:latest bash
```

## Clean Up

To avoid AWS charges, remember to delete resources when no longer needed:

1. Delete the ECS service and cluster
2. Delete the load balancer and target group
3. Delete the ECR repository
4. Delete the VPC, subnet, and security group
5. Delete the IAM user and policies
