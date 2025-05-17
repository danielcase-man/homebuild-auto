#!/bin/bash
# Script to build and run the toolbox container with AWS provisioning

# Clear screen
clear
echo -e "\033[1;36m🔧 AWS Infrastructure Provisioning Setup\033[0m"
echo -e "\033[1;36m============================================\033[0m"

# Prompt for AWS credentials
echo -e "\033[1;33mPlease enter your AWS credentials:\033[0m"
read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -sp "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
echo

# Build the Docker image
echo -e "\n\033[1;32m🔨 Building toolbox image...\033[0m"
docker build -t toolbox:latest -f Dockerfile.toolbox .

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo -e "\n\033[1;32m✅ Toolbox image built successfully!\033[0m"
    
    # Prompt to run the provisioning
    echo -e "\n\033[1;33mWould you like to run the AWS provisioning script now? (y/n)\033[0m"
    read run_provisioning
    
    if [[ "$run_provisioning" == "y" || "$run_provisioning" == "Y" ]]; then
        echo -e "\n\033[1;32m🚀 Running AWS provisioning in the toolbox container...\033[0m"
        echo -e "\033[1;33mThis may take several minutes. Please wait...\033[0m"
        
        # Run the Docker container with AWS provisioning script
        docker run --rm -it \
            -v "$(pwd):/app" \
            -e "AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID" \
            -e "AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY" \
            toolbox:latest bash -c "chmod +x ./provision-aws.sh && ./provision-aws.sh"
        
        if [ $? -eq 0 ]; then
            echo -e "\n\033[1;32m✅ AWS provisioning completed successfully!\033[0m"
            echo -e "\033[1;32mThe infrastructure details are stored in cline-app-state.json\033[0m"
        else
            echo -e "\n\033[1;31m❌ AWS provisioning failed. Please check the error messages above.\033[0m"
        fi
    else
        echo -e "\n\033[1;33mYou can run the provisioning later with:\033[0m"
        echo -e "\033[1;30mdocker run --rm -it -v \"$(pwd):/app\" -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY toolbox:latest bash -c \"chmod +x ./provision-aws.sh && ./provision-aws.sh\"\033[0m"
    fi
else
    echo -e "\n\033[1;31m❌ Failed to build the toolbox image. Please check the error messages above.\033[0m"
fi

# Clean up sensitive data
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

echo -e "\n\033[1;33mPress Enter to exit...\033[0m"
read
