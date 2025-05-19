@echo off
REM Test script for validating the Docker-based CLine setup on Windows
echo 🧪 Testing CLine in Docker container...

REM Step 1: Build the Docker image
echo 📦 Building CLine toolbox Docker image...
docker build -t cline-toolbox:latest -f Dockerfile.toolbox .

REM Step 2: Test CLine version
echo 🔍 Checking CLine version in container...
docker run --rm cline-toolbox:latest cline --version

REM Step 3: Test basic CLine functionality
echo ✅ Testing CLine basic functionality...
docker run --rm -v "%CD%:/app" -w /app cline-toolbox:latest bash -c ^
"echo \"- Creating test file\" && ^
echo \"Test content\" > test_file.txt && ^
echo \"- Running CLine MCP status\" && ^
cline mcp status || echo \"MCP status check completed with code $?\" && ^
echo \"- Cleaning up test file\" && ^
rm test_file.txt"

echo 🎉 Tests completed!
echo.
echo To use the CLine toolbox container interactively, run:
echo docker run --rm -it -v "%%CD%%:/app" -w /app cline-toolbox:latest bash
