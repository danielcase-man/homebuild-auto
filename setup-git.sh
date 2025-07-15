#!/bin/bash
# Setup git and push to GitHub

echo "Setting up git repository..."

# Remove any existing git directory
rm -rf .git

# Initialize git with main branch
git init -b main

# Add remote
git remote add origin https://github.com/danielcase-man/homebuild-auto

# Stage all files
git add .

# Commit with message
git commit -m "feat: Comprehensive design system enhancement with Shadcn/UI integration

- Install and configure Shadcn/UI as base component library
- Implement WCAG 2.1 AA accessibility compliance with automated testing
- Create construction-specific components extending Shadcn/UI
- Add accessibility testing automation and documentation
- Optimize mobile-first patterns with Shadcn/UI foundation
- Create comprehensive construction-themed style guide

Preserves mobile-first approach, construction color palette, and field worker optimizations while upgrading to industry best practices.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub
git push -u origin main

echo "Git setup complete!"