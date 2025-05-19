# Docker-Based CI/CD for CLine Tooling

This documentation explains the Docker-based approach implemented to resolve the CLine CLI installation issues in the GitHub Actions workflow.

## Problem Overview

The CI/CD pipeline was failing with exit code 127 when attempting to use the `cline` command. This error typically occurs when a command is not found, indicating that the CLine CLI was not properly installed or not available in the PATH.

Common causes:
- Installation script failures
- PATH environment variable issues
- Incompatible versions
- Missing dependencies

## Solution: Docker-based Approach

We've implemented a Docker-based approach that leverages the existing `Dockerfile.toolbox` to create a container with CLine pre-installed. This eliminates the need to install CLine directly on the GitHub Actions runner.

### Key Components

1. **Dockerfile.toolbox**: Contains all necessary dependencies:
   - CLine CLI (installed via pip)
   - AWS CLI for cloud deployments
   - Docker CLI for container operations
   - Required utilities (jq, curl, git)

2. **GitHub Actions Workflow**:
   - Builds the Docker image on the runner
   - Runs the build and deploy scripts inside the container
   - Passes necessary environment variables

3. **Enhanced Deploy Script**:
   - Added error handling for MCP operations
   - Made the script more resilient to failures
   - Added additional debug information

## How It Works

1. The CI/CD workflow checks out the code
2. It builds the CLine toolbox Docker image using Dockerfile.toolbox
3. It runs the build_and_deploy.sh script inside the Docker container
4. All CLine commands execute in the container where CLine is properly installed
5. The script handles AWS ECR authentication and deployment

## Benefits

This approach provides several advantages:

1. **Consistency**: The same Docker environment is used locally and in CI/CD
2. **Isolation**: No dependency on GitHub Actions environment quirks
3. **Simplicity**: No need to install CLine directly on the runner
4. **Portability**: Works across different CI/CD platforms
5. **Reliability**: Less prone to installation failures

## Maintenance

### Adding New Dependencies

If you need to add new dependencies:

1. Update `Dockerfile.toolbox` with the required packages
2. Rebuild the Docker image locally to test
3. Commit the changes to trigger a new CI/CD run

### Updating CLine

To update the CLine version:

1. Edit `Dockerfile.toolbox` to specify the version:
   ```dockerfile
   RUN pip3 install cline-cli==X.Y.Z
   ```
2. Rebuild and test locally
3. Commit and push

### Debugging Issues

If you encounter issues:

1. Check the GitHub Actions logs for Docker build errors
2. Verify that all required environment variables are set in GitHub secrets
3. Test the Docker container locally:
   ```bash
   docker build -t cline-toolbox:latest -f Dockerfile.toolbox .
   docker run --rm -v "$(pwd):/app" cline-toolbox:latest cline --version
   ```

## Local Development

You can use the same Docker container for local development:

```bash
docker build -t cline-toolbox:latest -f Dockerfile.toolbox .
docker run --rm -it -v "$(pwd):/app" -w /app cline-toolbox:latest bash
```

This gives you a shell inside the container with all the tools installed.
