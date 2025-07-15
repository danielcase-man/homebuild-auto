# SuperClaude Development Team Guide

> **Complete workflow guide for developers using Claude Code with advanced features, MCPs, and cognitive personas**

## 🚀 Quick Start

### Initial Setup
```bash
# Load your project
claude --load /path/to/home-builder-app

# Verify project structure
claude "Analyze the project structure and identify key components"

# Check available MCPs
claude --list-mcps
```

### Basic Command Structure
```bash
# Standard development command
claude "your request here"

# With cognitive persona
claude --persona-architect "design the database schema"

# With MCP integration
claude --mcp-sequential "create user authentication flow"

# With token compression
claude --uc "refactor this component for better performance"
```

---

## 🏗️ Development Workflow Stages

### Stage 1: Architecture & Design

**When to use:** Project planning, system design, technical specifications

#### Key Commands
```bash
# Analyze existing architecture
claude --persona-architect "Analyze the current architecture and identify improvement opportunities"

# Design new features
claude --persona-architect --mcp-perplexity "Research best practices for home builder project management systems and design our architecture"

# Create technical specifications
claude --persona-architect "Create detailed technical specifications for the vendor management system"

# Database design
claude --persona-architect "Design the database schema for the new timeline management feature"
```

#### Expected Outputs
- Architectural diagrams and documentation
- Technical specifications
- Database schemas
- API designs
- Technology recommendations

---

### Stage 2: Feature Development

**When to use:** Implementing new features, building components, writing code

#### Key Commands
```bash
# Build complete features
claude /build "Create a vendor management dashboard with search, filtering, and CRUD operations"

# Implement specific components
claude --persona-frontend "Build a responsive timeline component using Tailwind CSS and Framer Motion"

# Backend development
claude --persona-backend "Implement the vendor API endpoints with validation and error handling"

# Database operations
claude --persona-database "Create Prisma models and migrations for the project timeline feature"
```

#### Development Patterns
```bash
# Feature development workflow
claude /build "user authentication system" --include-tests --include-docs

# Component creation with research
claude --mcp-perplexity --persona-frontend "Research React date picker libraries and implement the best one for our construction scheduling"

# API development
claude --persona-backend "Create tRPC router for project management with type-safe operations"

# Database migrations
claude --persona-database "Create migration to add vendor rating and performance tracking fields"
```

---

### Stage 3: Testing & Quality Assurance

**When to use:** Writing tests, debugging, code quality, security review

#### Testing Commands
```bash
# Comprehensive testing
claude --persona-qa "Create unit tests for the vendor management service"

# Integration testing
claude --persona-qa "Write integration tests for the project timeline API"

# E2E testing
claude --persona-qa "Create Playwright tests for the vendor onboarding workflow"

# Performance testing
claude --persona-performance "Analyze and optimize the database queries in the project dashboard"
```

#### Security & Quality
```bash
# Security audit
claude --persona-security "Review the authentication system for security vulnerabilities"

# Code quality review
claude --persona-qa "Review this component for best practices and suggest improvements"

# Accessibility audit
claude --persona-accessibility "Audit the dashboard for WCAG compliance and suggest fixes"
```

#### Debugging Workflows
```bash
# Bug investigation
claude --persona-qa "This timeline component is not updating correctly. Analyze the issue and provide a fix"

# Performance debugging
claude --persona-performance "The vendor search is slow. Identify bottlenecks and optimize"

# Error analysis
claude --persona-qa "Analyze this error log and provide a root cause analysis with solution"
```

---

### Stage 4: Deployment & Operations

**When to use:** Production deployment, monitoring, DevOps, maintenance

#### Deployment Commands
```bash
# Deployment preparation
claude --persona-devops "Create Docker configuration for production deployment"

# CI/CD setup
claude --persona-devops "Set up GitHub Actions workflow for automated testing and deployment"

# Infrastructure as code
claude --persona-devops "Create Terraform configuration for AWS infrastructure"

# Monitoring setup
claude --persona-devops "Implement application monitoring and alerting"
```

#### Production Operations
```bash
# Environment configuration
claude --persona-devops "Create production environment configuration with security best practices"

# Database optimization
claude --persona-database --persona-performance "Optimize database for production workload"

# Security hardening
claude --persona-security --persona-devops "Implement production security best practices"
```

---

## 🧠 Cognitive Personas Guide

### When to Use Each Persona

#### `--persona-architect`
**Use for:** System design, architecture decisions, technical planning
```bash
claude --persona-architect "Design the microservices architecture for our home builder platform"
```

#### `--persona-frontend`
**Use for:** UI/UX development, React components, styling
```bash
claude --persona-frontend "Create a mobile-responsive project dashboard with dark mode support"
```

#### `--persona-backend`
**Use for:** API development, server logic, data processing
```bash
claude --persona-backend "Implement webhook handling for vendor status updates"
```

#### `--persona-database`
**Use for:** Database design, queries, migrations, optimization
```bash
claude --persona-database "Optimize the vendor search query and add proper indexing"
```

#### `--persona-qa`
**Use for:** Testing, debugging, code review, quality assurance
```bash
claude --persona-qa "Create comprehensive test suite for the budget tracking feature"
```

#### `--persona-security`
**Use for:** Security audits, vulnerability assessment, compliance
```bash
claude --persona-security "Audit the file upload functionality for security vulnerabilities"
```

#### `--persona-devops`
**Use for:** Deployment, infrastructure, CI/CD, monitoring
```bash
claude --persona-devops "Set up blue-green deployment with health checks"
```

#### `--persona-performance`
**Use for:** Optimization, profiling, scaling, efficiency
```bash
claude --persona-performance "Optimize the project dashboard loading time"
```

#### `--persona-accessibility`
**Use for:** WCAG compliance, inclusive design, screen reader support
```bash
claude --persona-accessibility "Ensure the vendor form is fully accessible"
```

### Combining Personas
```bash
# Frontend + Accessibility
claude --persona-frontend --persona-accessibility "Create an accessible date picker component"

# Backend + Security
claude --persona-backend --persona-security "Implement secure file upload with virus scanning"

# Database + Performance
claude --persona-database --persona-performance "Optimize vendor search with proper indexing"
```

---

## 🔌 MCP Integration Guide

### Sequential MCP (`--mcp-sequential`)
**Use for:** Multi-step workflows, complex processes

```bash
# Complex feature development
claude --mcp-sequential "Implement complete vendor onboarding: 1) Create form validation 2) Set up email notifications 3) Add to database 4) Send welcome email"

# Multi-stage deployment
claude --mcp-sequential --persona-devops "Deploy to production: 1) Run tests 2) Build Docker image 3) Deploy to staging 4) Run smoke tests 5) Deploy to production"
```

### Perplexity MCP (`--mcp-perplexity`)
**Use for:** Research, best practices, external knowledge

```bash
# Technology research
claude --mcp-perplexity "Research the best practices for construction project management software and implement key features"

# Market analysis
claude --mcp-perplexity --persona-architect "Research competing home builder software and identify differentiating features"

# Best practices research
claude --mcp-perplexity --persona-security "Research latest security best practices for construction management platforms"
```

### Combining MCPs
```bash
# Research + Implementation
claude --mcp-perplexity --mcp-sequential "Research React state management options and implement the best solution for our project"
```

---

## 🛠️ Command Reference & Examples

### Project Loading & Analysis
```bash
# Load and analyze project
claude --load /path/to/project
claude "Provide a comprehensive project analysis including architecture, dependencies, and potential improvements"

# Codebase exploration
claude "Map out the component hierarchy and identify reusable patterns"

# Dependency analysis
claude "Analyze package.json and identify outdated or unnecessary dependencies"
```

### Feature Development Patterns
```bash
# Complete feature with tests
claude /build "vendor rating system" --include-tests --include-docs --persona-fullstack

# Component with styling
claude --persona-frontend "Create a construction phase progress indicator with animations"

# API with documentation
claude --persona-backend "Create REST API for project timeline with OpenAPI documentation"

# Database feature
claude --persona-database "Add audit logging to all project modifications"
```

### Testing & Quality
```bash
# Test coverage
claude --persona-qa "Analyze test coverage and create tests for uncovered code"

# Bug investigation
claude --persona-qa "Investigate why the budget calculations are incorrect"

# Performance analysis
claude --persona-performance "Profile the dashboard loading time and optimize"

# Security review
claude --persona-security "Perform security audit on user authentication flow"
```

### Deployment & Operations
```bash
# Production deployment
claude --persona-devops "Create production deployment checklist and implementation"

# Monitoring setup
claude --persona-devops "Implement comprehensive application monitoring"

# Backup strategy
claude --persona-devops --persona-database "Design and implement database backup strategy"
```

---

## ⚡ Optimization & Best Practices

### Token Compression (`--uc`)
**When to use:** Large codebases, complex refactoring, detailed analysis

```bash
# Large file analysis
claude --uc "Analyze this entire component and suggest optimizations"

# Codebase refactoring
claude --uc --persona-architect "Refactor the entire vendor management module for better maintainability"

# Complex debugging
claude --uc --persona-qa "Debug this complex integration issue across multiple components"
```

### Introspection & Project Hygiene
```bash
# Code quality audit
claude "Analyze code quality across the project and provide improvement recommendations"

# Architecture review
claude --persona-architect "Review current architecture and suggest modernization strategies"

# Dependency cleanup
claude "Identify and remove unused dependencies and dead code"

# Documentation audit
claude "Review project documentation and identify gaps"
```

### Performance Optimization
```bash
# Bundle analysis
claude --persona-performance "Analyze bundle size and suggest optimizations"

# Database optimization
claude --persona-database --persona-performance "Optimize database queries and add proper indexing"

# Frontend performance
claude --persona-frontend --persona-performance "Optimize React components for better rendering performance"
```

---

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### Build Failures
```bash
# TypeScript errors
claude --persona-qa "Fix all TypeScript errors in the project"

# Dependency conflicts
claude "Resolve package dependency conflicts"

# Build optimization
claude --persona-devops "Optimize build process for faster compilation"
```

#### Runtime Issues
```bash
# Debug API issues
claude --persona-backend --persona-qa "Debug why the vendor API is returning 500 errors"

# Frontend bugs
claude --persona-frontend --persona-qa "Fix the timeline component rendering issues"

# Performance problems
claude --persona-performance "Identify and fix performance bottlenecks in the dashboard"
```

#### Database Issues
```bash
# Migration problems
claude --persona-database "Fix database migration issues"

# Query optimization
claude --persona-database --persona-performance "Optimize slow database queries"

# Data integrity
claude --persona-database --persona-qa "Ensure data integrity across all models"
```

### Debug Workflows
```bash
# Step-by-step debugging
claude --mcp-sequential --persona-qa "Debug vendor search issue: 1) Check API endpoint 2) Validate database query 3) Test frontend integration 4) Verify search logic"

# Error analysis
claude --persona-qa "Analyze this error stack trace and provide root cause analysis with fix"

# Integration testing
claude --persona-qa "Test the complete vendor onboarding flow and identify issues"
```

---

## 👥 Team Collaboration

### Code Review Process
```bash
# Review pull request
claude --persona-qa "Review this pull request for code quality, security, and best practices"

# Architecture review
claude --persona-architect "Review the proposed architecture changes"

# Security review
claude --persona-security "Review code changes for security implications"
```

### Documentation Standards
```bash
# API documentation
claude "Generate comprehensive API documentation for the vendor endpoints"

# Component documentation
claude --persona-frontend "Create Storybook stories and documentation for all UI components"

# Architecture documentation
claude --persona-architect "Create technical documentation for the system architecture"
```

### Onboarding New Developers
```bash
# Project overview
claude "Create a comprehensive onboarding guide for new developers"

# Development environment setup
claude --persona-devops "Create development environment setup instructions"

# Coding standards
claude "Document coding standards and best practices for the team"
```

---

## 📈 Advanced Workflows

### Multi-Stage Development
```bash
# Complete feature pipeline
claude --mcp-sequential "
1. Research construction project management best practices
2. Design feature architecture
3. Implement backend API
4. Create frontend components
5. Write comprehensive tests
6. Create documentation
7. Set up deployment
"
```

### Cross-Cutting Concerns
```bash
# Add feature across all layers
claude --mcp-sequential --persona-fullstack "Add audit logging: 1) Database schema 2) Backend middleware 3) Frontend tracking 4) Admin dashboard 5) Tests"

# Security implementation
claude --mcp-sequential --persona-security "Implement comprehensive security: 1) Authentication 2) Authorization 3) Input validation 4) Rate limiting 5) Audit logging"
```

### Research-Driven Development
```bash
# Research and implement
claude --mcp-perplexity --mcp-sequential "Research modern React patterns and refactor our components to use the latest best practices"

# Competitive analysis
claude --mcp-perplexity --persona-architect "Research competitor features and design our differentiation strategy"
```

---

## 🎯 Pro Tips

### 1. **Context Management**
- Use `--load` to maintain project context
- Combine personas for complex tasks
- Use `--uc` for large codebase analysis

### 2. **Efficient Development**
- Start with architecture (`--persona-architect`)
- Build incrementally with `/build`
- Test continuously (`--persona-qa`)
- Document as you go

### 3. **Quality Assurance**
- Use multiple personas for comprehensive review
- Implement security checks early (`--persona-security`)
- Optimize throughout development (`--persona-performance`)

### 4. **Team Coordination**
- Standardize on persona usage
- Document architectural decisions
- Use MCPs for complex workflows
- Maintain coding standards

### 5. **Problem Solving**
- Use `--mcp-sequential` for multi-step debugging
- Combine research with implementation
- Leverage introspection for code quality
- Document solutions for future reference

---

## 📋 Quick Reference Card

```bash
# Essential Commands
claude --load /path/to/project          # Load project
claude /build "feature description"     # Build feature
claude --persona-qa "test this"         # Quality assurance
claude --mcp-perplexity "research X"    # Research
claude --uc "analyze large codebase"    # Token compression

# Common Workflows
Architecture: --persona-architect
Frontend: --persona-frontend + --persona-accessibility
Backend: --persona-backend + --persona-security
Database: --persona-database + --persona-performance
Testing: --persona-qa
Deployment: --persona-devops
Multi-step: --mcp-sequential
Research: --mcp-perplexity
```

This guide should be your team's go-to reference for maximizing productivity with SuperClaude. Keep it updated as new features and patterns emerge!