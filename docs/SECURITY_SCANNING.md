# Security Scanning Documentation

## Overview

This document describes the security scanning implementation for the TodoList React application, including Trivy vulnerability scanning and Dependabot automated dependency updates.

## Components

### 1. Trivy - Container Vulnerability Scanning

**Purpose:** Scan Docker images for known vulnerabilities (CRITICAL and HIGH severity)

**Location:** `.github/workflows/frontend-ci.yml` (security-scan job)

**When it runs:**
- On push to main, staging, or develop branches
- After Docker image is built and pushed to Docker Hub
- Depends on: docker-build-push job

**What it does:**
1. Authenticates with Docker Hub
2. Scans the newly built Docker image using Aquasecurity Trivy
3. Generates SARIF report for GitHub Security
4. Displays vulnerability table in workflow logs
5. Uploads results to GitHub Security tab

**Configuration:**
```yaml
security-scan:
  runs-on: ubuntu-latest
  needs: docker-build-push
  if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/staging' || github.ref == 'refs/heads/develop')
  permissions:
    contents: read
    security-events: write
    actions: read

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}

    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: '${{ secrets.DOCKERHUB_USERNAME }}/todolist-frontend:git-${{ github.sha }}'
        format: 'sarif'
        output: 'trivy-results.sarif'
        severity: 'CRITICAL,HIGH'

    - name: Upload Trivy results to GitHub Security
      uses: github/codeql-action/upload-sarif@v3
      if: always()
      with:
        sarif_file: 'trivy-results.sarif'

    - name: Run Trivy vulnerability scanner (Table Output)
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: '${{ secrets.DOCKERHUB_USERNAME }}/todolist-frontend:git-${{ github.sha }}'
        format: 'table'
        severity: 'CRITICAL,HIGH'
```

### 2. Dependabot - Automated Dependency Updates

**Purpose:** Automatically create pull requests for outdated dependencies

**Location:** `.github/dependabot.yml`

**Schedule:** Weekly on Monday at 9:00 AM UTC

**Monitored ecosystems:**
- npm dependencies (React, testing libraries)
- Docker base images
- GitHub Actions

**Configuration:**
```yaml
version: 2
updates:
  # npm dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "npm"
    reviewers:
      - "ttambunan01-sudo"
    commit-message:
      prefix: "build"
      include: "scope"
    groups:
      react:
        patterns:
          - "react"
          - "react-*"
      testing:
        patterns:
          - "@testing-library/*"
          - "jest*"
      dev-dependencies:
        dependency-type: "development"
        update-types:
          - "minor"
          - "patch"

  # Docker dependencies
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 3
    labels:
      - "dependencies"
      - "docker"
    commit-message:
      prefix: "build"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 3
    labels:
      - "dependencies"
      - "github-actions"
    commit-message:
      prefix: "ci"
```

## Security Pipeline Flow

```
Code Push (develop/staging/main)
        ↓
Build & Test (build-and-test job)
        ↓
Quality Gate (lighthouse-ci job)
        ↓
Build & Push Docker Image (docker-build-push job)
        ↓
Security Scan (security-scan job)
  ├─ Login to Docker Hub
  ├─ Scan image with Trivy (CRITICAL, HIGH)
  ├─ Upload SARIF to GitHub Security
  └─ Display vulnerability table
        ↓
Results available in GitHub Security tab
```

## Troubleshooting

### Issue 1: Security Scan Skipped on develop/staging Branches

**Problem:** Security scan only ran on main branch and PRs, skipped on develop/staging

**Symptoms:**
- CI shows security-scan job as "skipped"
- No vulnerability reports generated for develop/staging merges

**Root Cause:**
Quality gate jobs (lighthouse-ci) had conditions that excluded develop/staging branches:
```yaml
if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
```

This caused a cascade effect:
1. lighthouse-ci skips (condition not met)
2. docker-build-push skips (depends on lighthouse-ci)
3. security-scan skips (depends on docker-build-push)

**Solution:**
Update lighthouse-ci job condition to include all deployment branches:
```yaml
if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/staging'
```

**Location:** `.github/workflows/frontend-ci.yml` line 50

### Issue 2: Docker Image Not Found

**Problem:** Trivy couldn't find the Docker image: "MANIFEST_UNKNOWN: manifest unknown"

**Error Message:**
```
remote error: GET https://index.docker.io/v2/***/todolist-frontend/manifests/git-abc123...:
MANIFEST_UNKNOWN: manifest unknown; unknown tag=git-abc123...
```

**Root Cause:**
Security-scan job wasn't authenticated with Docker Hub, so Trivy couldn't pull the private/newly pushed image.

**Solution:**
Add Docker Hub authentication before Trivy scan:
```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

**Location:** `.github/workflows/frontend-ci.yml` line 141-145

### Issue 3: SHA Format Mismatch

**Problem:**
- docker-build-push created image with tag: `git-abc1234` (short SHA)
- security-scan expected tag: `git-abc1234567890abcdef1234567890abcdef1234` (full SHA)

**Symptoms:**
- Docker image exists on Docker Hub but Trivy can't find it
- Tag mismatch between build and scan steps

**Root Cause:**
docker/metadata-action defaults to short SHA format (7 characters), but GitHub Actions `${{ github.sha }}` is the full 40-character SHA.

**Solution:**
Add `format=long` to metadata-action configuration:
```yaml
- name: Extract metadata
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: ${{ secrets.DOCKERHUB_USERNAME }}/todolist-frontend
    tags: |
      type=raw,value=latest
      type=sha,prefix=git-,format=long
```

**Location:** `.github/workflows/frontend-ci.yml` line 116

### Issue 4: Permission Denied to Upload SARIF

**Problem:** "Resource not accessible by integration" when uploading to GitHub Security

**Error Message:**
```
Error: Resource not accessible by integration
Warning: This run of the CodeQL Action does not have permission to access
the CodeQL Action API endpoints. Please ensure the workflow has at least
the 'security-events: read' permission.
```

**Root Cause:**
Security-scan job lacked explicit permissions to write to GitHub Security tab.

**Solution:**
Add explicit permissions to security-scan job:
```yaml
security-scan:
  runs-on: ubuntu-latest
  needs: docker-build-push
  permissions:
    contents: read           # Checkout code
    security-events: write   # Upload SARIF to Security tab
    actions: read            # Access GitHub Actions API
```

**Location:** `.github/workflows/frontend-ci.yml` line 136-139

## Viewing Results

### Trivy Scan Results

**In Workflow Logs:**
1. Go to repository → Actions
2. Click on the workflow run
3. Expand "security-scan" job
4. View "Run Trivy vulnerability scanner (Table Output)" step

**In GitHub Security Tab:**
1. Go to repository → Security → Code scanning
2. View alerts by severity (Critical, High)
3. Click alert for details and remediation advice
4. Track fixes across commits

### Dependabot Updates

**Pull Requests:**
1. Go to repository → Pull Requests
2. Filter by label: "dependencies"
3. Review dependency changes
4. Check if CI tests pass
5. Merge if safe

**Insights:**
1. Go to repository → Insights → Dependency graph
2. View "Dependabot" tab for update schedule and status

## Frontend-Specific Considerations

### npm Dependency Security

**Grouped Updates:**
- React ecosystem updates are grouped (react, react-dom, react-scripts)
- Testing library updates are grouped (@testing-library/*, jest*)
- Development dependencies get minor/patch updates grouped

**Why this matters:**
- React updates often require coordinated version changes
- Reduces PR noise for related dependencies
- Maintains compatibility across the React ecosystem

### Base Image Security

**Current Setup:**
- Multi-stage Dockerfile using Node.js and nginx
- Scans both build and runtime images
- nginx base image vulnerabilities are common

**Common Alerts:**
- nginx CVEs (usually informational)
- Node.js vulnerabilities (update base image)
- npm package vulnerabilities (update package.json)

**Remediation Priority:**
1. CRITICAL: Update immediately
2. HIGH: Update within 7 days
3. MEDIUM: Update during next sprint

## Best Practices

1. **Review Security Alerts Promptly**
   - Check GitHub Security tab weekly
   - Prioritize CRITICAL vulnerabilities
   - Update base images when notified

2. **Dependabot PR Management**
   - Enable auto-merge for patch updates
   - Review minor/major updates carefully
   - Test grouped React updates thoroughly

3. **CI/CD Integration**
   - Security scans run on all deployment branches
   - Failed scans don't block deployment (warning only)
   - Results tracked in GitHub Security for compliance

4. **Frontend-Specific**
   - Update npm packages regularly (security and features)
   - Audit production bundle for vulnerabilities
   - Keep nginx base image current

## Related Documentation

- Backend Security: `/Users/tumpaltambunan/Downloads/todolist/docs/SECURITY_SCANNING.md`
- Quality Gates: `docs/QUALITY_GATES.md`
- CI/CD Pipeline: `.github/workflows/frontend-ci.yml`
- Dependabot Config: `.github/dependabot.yml`
