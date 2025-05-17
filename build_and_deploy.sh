#!/usr/bin/env bash
set -euo pipefail
echo "🔨 Building the app with build-tool…"
cline run build-tool
echo "🚀 Deploying via deploy.sh…"
./deploy.sh
