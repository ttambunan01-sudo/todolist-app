# CI/CD Pipeline Documentation - Frontend

## Overview

The TodoList Frontend uses GitHub Actions for continuous integration and deployment. The pipeline automatically builds, tests, and deploys the React application on every push.

## Pipeline Architecture

```
┌──────────────┐
│  Developer   │
│  git push    │
└──────┬───────┘
       │
       v
┌────────────────────────────────┐
│   GitHub Actions Triggered     │
└──────────┬─────────────────────┘
           │
           v
   ┌───────────────┐
   │build-and-test │
   ├───────────────┤
   │ • Setup Node  │
   │ • Install deps│
   │ • Run tests   │
   │ • Coverage    │
   │ • Build app   │
   └───────┬───────┘
           │
    [Tests Pass?]
           │
           ├─ No ──> ❌ Pipeline Fails
           │
           v Yes
   ┌────────────────┐
   │ lighthouse-ci  │ (PRs & main branch)
   ├────────────────┤
   │ • ESLint Check │
   │ • Bundle Size  │
   │ • Performance  │
   │ • Accessibility│
   │ • Best Practices│
   └───────┬────────┘
           │
  [Quality Gates?]
           │
           ├─ Fail ──> ❌ Pipeline Fails
           │
           v Pass
   ┌────────────────┐
   │docker-build-   │ (main branch only)
   │    push        │
   ├────────────────┤
   │ • Build Image  │
   │ • Tag (latest) │
   │ • Tag (SHA)    │
   │ • Push to Hub  │
   └───────┬────────┘
           │
           v
   ┌────────────────┐
   │   Docker Hub   │
   │   ttambunan01/ │
   │todolist-frontend│
   └────────────────┘
```

## Workflow Files

### `.github/workflows/frontend-ci.yml`

Main CI/CD workflow for building, testing, and deploying the frontend.

**Location:** `.github/workflows/frontend-ci.yml`

## Triggers

The CI pipeline runs on:

1. **Push to main branch** - Full pipeline including Docker build/push
2. **Pull requests to main** - Tests and build only (no Docker push)
3. **Manual trigger** - Via GitHub Actions UI (`workflow_dispatch`)

## Jobs

### Job 1: build-and-test

**Purpose:** Install dependencies, run tests, and build the application

**Steps:**

1. **Checkout code** - Uses `actions/checkout@v4`
2. **Setup Node.js 20** - Uses `actions/setup-node@v4` with npm caching
3. **Install dependencies** - Runs `npm ci` (clean install)
4. **Run tests** - Executes `npm test -- --watchAll=false --coverage`
5. **Build application** - Creates production build with `npm run build`
6. **Upload coverage** - Uploads test coverage reports
7. **Upload build** - Uploads production build artifacts

**Artifacts Created:**
- `coverage-report` - Jest test coverage reports
- `build-output` - Production build files

**Duration:** ~2-3 minutes

### Job 2: lighthouse-ci

**Purpose:** Check code quality, bundle size, and performance metrics

**Conditions:**
- Runs on pull requests and pushes to `main` branch
- Requires `build-and-test` job to succeed

**Steps:**

1. **Checkout code**
2. **Setup Node.js 20** - With npm caching
3. **Install dependencies** - `npm ci`
4. **Build application** - Production build
5. **Run ESLint** - Code linting with zero warnings threshold
6. **Check bundle size** - Enforce JS (500KB) and CSS (100KB) limits
7. **Install Lighthouse CI** - Global LHCI CLI installation
8. **Run Lighthouse CI** - Performance, accessibility, and best practices audits
9. **Upload Lighthouse reports** - Upload HTML/JSON reports as artifacts

**Quality Checks:**
- **ESLint:** Zero warnings policy
- **Bundle Size:** JS ≤ 500KB, CSS ≤ 100KB
- **Performance:** ≥ 90% score
- **Accessibility:** ≥ 90% score
- **Best Practices:** ≥ 90% score
- **SEO:** ≥ 90% score
- **Core Web Vitals:** LCP ≤ 2500ms, FCP ≤ 2000ms, CLS ≤ 0.1

**Artifacts Created:**
- `lighthouse-reports` - Lighthouse HTML/JSON reports

**Duration:** ~3-5 minutes

See [QUALITY_GATES.md](QUALITY_GATES.md) for detailed quality gates documentation.

### Job 3: docker-build-push

**Purpose:** Build and publish Docker image to Docker Hub

**Conditions:**
- Only runs on `push` events
- Only runs on `main` branch
- Requires both `build-and-test` and `lighthouse-ci` jobs to succeed

**Steps:**

1. **Checkout code**
2. **Set up Docker Buildx** - Enables multi-platform builds
3. **Login to Docker Hub** - Uses secrets for authentication
4. **Extract metadata** - Generates image tags
5. **Build and push** - Creates and publishes Docker image with Nginx

**Image Tags Created:**
- `latest` - Always points to the latest main branch build
- `git-<sha>` - Specific commit SHA (e.g., `git-abc1234`)

**Duration:** ~3-5 minutes

## Secrets Required

Configure these in GitHub repository settings:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `DOCKERHUB_USERNAME` | Docker Hub username | `ttambunan01` |
| `DOCKERHUB_TOKEN` | Docker Hub access token | `dckr_pat_xxxxx...` |
| `LHCI_BUILD_TOKEN` | Lighthouse CI build token (optional) | `xxxxx-xxxxx-xxxxx...` |

**To add secrets:**
1. Go to `https://github.com/ttambunan01-sudo/todolist-app/settings/secrets/actions`
2. Click "New repository secret"
3. Add name and value
4. Click "Add secret"

## Running Tests Locally

Before pushing, run tests locally:

```bash
# Run tests in watch mode
npm test

# Run all tests once with coverage
npm test -- --watchAll=false --coverage

# View coverage report
open coverage/lcov-report/index.html

# Build the application
npm run build

# Test the build locally
npx serve -s build
```

## Viewing Pipeline Results

### GitHub Actions UI

1. Go to `https://github.com/ttambunan01-sudo/todolist-app/actions`
2. Click on a workflow run to see details
3. Click on a job to see logs
4. Download artifacts (coverage, build)

### Workflow Status Badge

The README.md includes a status badge:

```markdown
![CI Status](https://github.com/ttambunan01-sudo/todolist-app/actions/workflows/frontend-ci.yml/badge.svg)
```

**Status Indicators:**
- 🟢 Green (passing) - All tests passed, build succeeded
- 🔴 Red (failing) - Tests failed or build error
- 🟡 Yellow (pending) - Workflow is currently running

### Test Reports

After each run:

1. Go to workflow run page
2. Scroll to "Artifacts" section
3. Download `coverage-report` or `build-output`
4. Extract and open `index.html`

## Docker Images

### Pulling Images

```bash
# Pull latest
docker pull ttambunan01/todolist-frontend:latest

# Pull specific commit
docker pull ttambunan01/todolist-frontend:git-abc1234

# Run the container
docker run -p 3000:80 ttambunan01/todolist-frontend:latest
```

### Image Details

- **Base Image:** `nginx:alpine`
- **Size:** ~45MB (optimized static files)
- **Architecture:** linux/amd64, linux/arm64
- **Port:** 80 (Nginx)
- **Content:** Static React build files

## Build Optimization

### npm Caching

GitHub Actions automatically caches npm dependencies:

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # Enables caching
```

**Benefits:**
- First build: ~2-3 minutes (downloads dependencies)
- Subsequent builds: ~1-2 minutes (uses cache)

### Docker Layer Caching

The workflow uses GitHub Actions cache for Docker layers:

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

**Benefits:**
- Faster Docker builds
- Efficient layer reuse
- Reduced build time

## Troubleshooting

### Pipeline Fails on Tests

**Problem:** Tests pass locally but fail in CI

**Solution:**
```bash
# Ensure all dependencies are in package.json
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests with same conditions as CI
npm test -- --watchAll=false --coverage

# Check for environment-specific issues
CI=true npm test
```

### Docker Push Fails

**Problem:** Cannot push to Docker Hub

**Common Causes:**
1. Invalid credentials
2. Repository doesn't exist
3. Token expired

**Solution:**
```bash
# Verify secrets are set correctly
# Check Docker Hub repository exists: todolist-frontend
# Regenerate access token if needed

# Test locally:
docker login -u ttambunan01
docker tag todolist-frontend:latest ttambunan01/todolist-frontend:test
docker push ttambunan01/todolist-frontend:test
```

### Build Fails

**Problem:** `npm run build` fails in CI

**Common Causes:**
1. Missing environment variables
2. Dependency issues
3. Memory limits

**Solution:**
```bash
# Check build locally
npm run build

# Verify environment variables are set
# Check package.json for required variables
```

## Best Practices

### Commit Messages

Use conventional commits:

```bash
feat: add new component
fix: resolve API connection bug
test: add TodoList component tests
docs: update README
ci: improve build performance
```

### Pull Request Workflow

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and commit
3. Push to GitHub: `git push origin feature/new-feature`
4. Create pull request
5. Wait for CI to pass (required)
6. Request review
7. Merge when approved and green

### Testing Strategy

**Before Pushing:**
```bash
# 1. Run tests locally
npm test -- --watchAll=false

# 2. Check coverage
npm test -- --watchAll=false --coverage

# 3. Verify build
npm run build

# 4. Test build locally
npx serve -s build

# 5. Push to GitHub
git push origin main
```

## Test Coverage Goals

Current coverage targets:

- **Overall:** > 80%
- **Components:** > 85%
- **Critical paths:** 100%

**Coverage Report Locations:**
- HTML: `coverage/lcov-report/index.html`
- JSON: `coverage/coverage-final.json`
- LCOV: `coverage/lcov.info`

## Future Enhancements

### Planned Improvements

1. **E2E Testing**
   - Cypress or Playwright integration
   - Visual regression testing
   - Cross-browser testing

2. **Performance Testing** ✅ IMPLEMENTED
   - ✅ Lighthouse CI integration (see [QUALITY_GATES.md](QUALITY_GATES.md))
   - ✅ Bundle size tracking (size-limit)
   - ✅ Performance budgets (Lighthouse assertions)
   - ✅ Core Web Vitals monitoring

3. **Quality Gates** ✅ IMPLEMENTED
   - ✅ ESLint in CI pipeline (zero warnings)
   - ✅ Accessibility testing (Lighthouse ≥ 90%)
   - ✅ Best practices enforcement
   - ✅ SEO validation

4. **Security**
   - npm audit in pipeline
   - Snyk vulnerability scanning
   - OWASP dependency check

5. **Deployment Automation**
   - Kubernetes deployment workflow
   - Staging environment
   - Production deployment with approval

## Related Documentation

- [README.md](../README.md) - Project overview and quick start
- [QUALITY_GATES.md](QUALITY_GATES.md) - Comprehensive quality gates documentation
- [Backend CI/CD](https://github.com/ttambunan01-sudo/todolist/blob/main/docs/CI.md) - Backend pipeline docs
- [Lighthouse CI Dashboard](http://localhost:9001) - Performance trends (via port-forward)

## Support

For issues or questions about the CI/CD pipeline:

1. Check GitHub Actions logs
2. Review this documentation
3. Check recent commits for changes
4. Create an issue on GitHub

---

**Last Updated:** 2025-11-28
**Pipeline Version:** 1.0.0
