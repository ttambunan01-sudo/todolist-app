# Frontend Quality Gates Documentation

## Table of Contents
- [Overview](#overview)
- [Quality Gates Summary](#quality-gates-summary)
- [Automated Testing](#automated-testing)
- [Code Quality - ESLint](#code-quality---eslint)
- [Bundle Size Monitoring](#bundle-size-monitoring)
- [Performance - Lighthouse CI](#performance---lighthouse-ci)
- [Setup and Configuration](#setup-and-configuration)
- [GitHub Actions Workflow](#github-actions-workflow)
- [Viewing Reports and Results](#viewing-reports-and-results)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

## Overview

The TodoList frontend implements comprehensive quality gates to ensure code quality, performance, accessibility, and user experience. All quality checks run automatically on every push and pull request through GitHub Actions.

### Quality Gates Enforced

| Gate | Type | Threshold | When | Blocks Merge |
|------|------|-----------|------|--------------|
| Unit Tests | Jest/RTL | 100% pass | Every commit | Yes |
| Test Coverage | Jest | Reported | Every commit | No |
| ESLint | Linting | 0 warnings | PRs & main | Yes |
| Bundle Size | Size Limit | JS: 500KB, CSS: 100KB | PRs & main | Yes |
| Lighthouse Performance | Core Web Vitals | See details | PRs & main | Yes (errors) |
| Lighthouse Accessibility | WCAG | ≥ 90% | PRs & main | Yes |
| Lighthouse Best Practices | Standards | ≥ 90% | PRs & main | Yes |
| Lighthouse SEO | Optimization | ≥ 90% | PRs & main | Yes |

## Quality Gates Summary

### 1. Unit Tests (Jest + React Testing Library)
- **Framework:** Jest 29 + React Testing Library 16
- **Threshold:** All tests must pass
- **Command:** `npm test -- --watchAll=false`
- **Coverage:** Automatically generated

### 2. ESLint
- **Configuration:** react-app preset
- **Threshold:** Maximum 0 warnings
- **Command:** `npx eslint src/ --ext .js,.jsx --max-warnings 0`
- **Purpose:** Enforce code style, catch bugs, ensure best practices

### 3. Bundle Size
- **Tool:** size-limit + @size-limit/file
- **Thresholds:**
  - JavaScript: 500 KB
  - CSS: 100 KB
- **Command:** `npx size-limit`

### 4. Lighthouse CI
- **Tool:** Lighthouse CI (LHCI)
- **Runs:** 3 times (median score used)
- **Command:** `lhci autorun`
- **Infrastructure:** Kubernetes-hosted LHCI server (optional for historical data)

**Performance Thresholds:**
| Metric | Threshold | Level |
|--------|-----------|-------|
| Performance Score | ≥ 90% | Error |
| Accessibility Score | ≥ 90% | Error |
| Best Practices Score | ≥ 90% | Error |
| SEO Score | ≥ 90% | Error |
| PWA Score | ≥ 50% | Warning |

**Core Web Vitals:**
| Metric | Threshold | Level |
|--------|-----------|-------|
| First Contentful Paint (FCP) | ≤ 2000ms | Error |
| Largest Contentful Paint (LCP) | ≤ 2500ms | Error |
| Cumulative Layout Shift (CLS) | ≤ 0.1 | Error |
| Total Blocking Time (TBT) | ≤ 300ms | Error |
| Speed Index | ≤ 3000ms | Error |

**Optimization Checks:**
| Check | Level |
|-------|-------|
| Unminified CSS | Error |
| Unminified JavaScript | Error |
| Uses text compression | Error |
| Color contrast | Warning |
| CSP XSS protection | Warning |
| Console errors | Warning |
| Main landmark | Warning |
| Total byte weight (1MB) | Warning |
| Unused CSS/JS | Warning |
| Image optimization | Warning |

## Automated Testing

### Test Structure
```
src/
├── App.test.js
└── components/
    ├── TodoList.js
    └── TodoList.test.js
```

### Running Tests Locally

```bash
# Run all tests (watch mode)
npm test

# Run all tests once
npm test -- --watchAll=false

# Run tests with coverage
npm test -- --watchAll=false --coverage

# Run specific test file
npm test -- TodoList.test

# Update snapshots
npm test -- -u
```

### Test Coverage

Coverage is automatically generated when running tests in CI:

```bash
# Generate coverage report locally
npm test -- --watchAll=false --coverage

# View coverage report
open coverage/lcov-report/index.html
```

**Coverage Thresholds (Current):**
- Statements: Tracked but not enforced
- Branches: Tracked but not enforced
- Functions: Tracked but not enforced
- Lines: Tracked but not enforced

### Testing Best Practices

**DO:**
- Use `screen.getByRole()` for queries
- Test user behavior, not implementation
- Keep tests focused and atomic
- Use `userEvent` for interactions
- Avoid multiple assertions in `waitFor`

**DON'T:**
- Use `container.querySelector()` (Testing Library anti-pattern)
- Access component internals
- Put multiple assertions in `waitFor` callback
- Test implementation details

Example:
```javascript
// ❌ Bad
const { container } = render(<App />);
const div = container.querySelector('.App');

// ✅ Good
render(<App />);
expect(screen.getByRole('main')).toBeInTheDocument();
```

## Code Quality - ESLint

### Configuration

Located in `package.json`:

```json
{
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  }
}
```

### Running ESLint

```bash
# Check for linting errors
npx eslint src/ --ext .js,.jsx

# Fix auto-fixable issues
npx eslint src/ --ext .js,.jsx --fix

# Check with zero warnings (CI mode)
npx eslint src/ --ext .js,.jsx --max-warnings 0
```

### Common ESLint Rules

**React Specific:**
- `react/jsx-uses-react` - Prevent React from being marked as unused
- `react/jsx-uses-vars` - Prevent variables used in JSX from being marked as unused
- `react/no-unescaped-entities` - Prevent unescaped entities in JSX

**Testing Library:**
- `testing-library/no-container` - Avoid using `container` methods
- `testing-library/no-node-access` - Avoid using node accessing methods
- `testing-library/no-wait-for-multiple-assertions` - Ensure only one assertion per `waitFor`
- `testing-library/prefer-screen-queries` - Prefer `screen` queries

### Auto-fixing Issues

Most ESLint issues can be auto-fixed:

```bash
# Fix all auto-fixable issues
npm run lint:fix

# Or manually
npx eslint src/ --ext .js,.jsx --fix
```

## Bundle Size Monitoring

### Configuration

Located in `.size-limit.json`:

```json
[
  {
    "path": "build/static/js/*.js",
    "limit": "500 KB"
  },
  {
    "path": "build/static/css/*.css",
    "limit": "100 KB"
  }
]
```

### Dependencies

In `package.json`:

```json
{
  "devDependencies": {
    "size-limit": "^12.0.0",
    "@size-limit/file": "^12.0.0"
  },
  "scripts": {
    "size": "size-limit"
  }
}
```

### Running Bundle Size Checks

```bash
# Build the app first
npm run build

# Check bundle size
npm run size

# Or directly
npx size-limit
```

### Example Output

```
Package size limit has exceeded by 150 KB
  Size limit: 500 KB
  Size:       650 KB
```

### Optimizing Bundle Size

**Strategies:**
1. **Code Splitting:**
```javascript
// Use React.lazy for route-based splitting
const TodoList = React.lazy(() => import('./components/TodoList'));
```

2. **Dependency Analysis:**
```bash
# Analyze bundle composition
npm install --save-dev webpack-bundle-analyzer
npm run build
```

3. **Remove Unused Dependencies:**
```bash
# Find unused dependencies
npx depcheck
```

4. **Optimize Images:**
- Use WebP format
- Compress images
- Lazy load images

## Performance - Lighthouse CI

### Architecture

```
GitHub Actions Runner
       ↓
   Build App
       ↓
  Run Lighthouse (3x)
       ↓
   Generate Reports
       ↓
  Upload to Temporary Storage (publicly accessible link)
       ↓
  Assert Thresholds
```

### Configuration

Located in `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./build",
      "numberOfRuns": 3,
      "url": ["http://localhost/index.html"],
      "settings": {
        "preset": "desktop",
        "throttling": {
          "rttMs": 40,
          "throughputKbps": 10240,
          "cpuSlowdownMultiplier": 1
        }
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        // Category scores
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}],
        "categories:pwa": ["warn", {"minScore": 0.5}],

        // Core Web Vitals
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
        "total-blocking-time": ["error", {"maxNumericValue": 300}],
        "speed-index": ["error", {"maxNumericValue": 3000}],

        // Optimization checks
        "unminified-css": "error",
        "unminified-javascript": "error",
        "uses-text-compression": "error",

        // Quality checks (warnings)
        "color-contrast": "warn",
        "csp-xss": "warn",
        "errors-in-console": "warn",
        "landmark-one-main": "warn",
        "total-byte-weight": ["warn", {"maxNumericValue": 1000000}],

        // PWA
        "maskable-icon": "off"
      }
    }
  }
}
```

### Running Lighthouse Locally

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Build the app
npm run build

# Run Lighthouse CI
lhci autorun

# Or run single Lighthouse audit
npx lighthouse http://localhost:3000 --view
```

### Understanding Core Web Vitals

**First Contentful Paint (FCP):**
- Time until first text/image is painted
- Target: < 2000ms
- Improve: Reduce server response time, eliminate render-blocking resources

**Largest Contentful Paint (LCP):**
- Time until largest content element is visible
- Target: < 2500ms
- Improve: Optimize images, lazy load off-screen content

**Cumulative Layout Shift (CLS):**
- Visual stability - unexpected layout shifts
- Target: < 0.1
- Improve: Set size attributes on images, avoid inserting content above existing

**Total Blocking Time (TBT):**
- Time the main thread is blocked
- Target: < 300ms
- Improve: Break up long tasks, code splitting, defer unused JavaScript

**Speed Index:**
- How quickly content is visually displayed
- Target: < 3000ms
- Improve: Minimize main thread work, reduce JavaScript execution time

## Setup and Configuration

### Prerequisites

1. **Node.js 20+**
2. **npm** (comes with Node.js)
3. **GitHub repository access**
4. **Lighthouse CI Server** (optional, for historical tracking)

### Step-by-Step Setup

#### 1. Install Dependencies

```bash
# Install size-limit
npm install --save-dev size-limit @size-limit/file

# Install Lighthouse CI (optional for local testing)
npm install -g @lhci/cli
```

#### 2. Create Configuration Files

**Create `.size-limit.json`:**
```json
[
  {
    "path": "build/static/js/*.js",
    "limit": "500 KB"
  },
  {
    "path": "build/static/css/*.css",
    "limit": "100 KB"
  }
]
```

**Create `lighthouserc.json`:**
See full configuration in [Configuration](#configuration-3) section above.

#### 3. Update `package.json`

Add scripts:
```json
{
  "scripts": {
    "size": "size-limit"
  }
}
```

#### 4. Configure GitHub Actions

The workflow is already configured in `.github/workflows/frontend-ci.yml`.

No additional setup needed unless customizing.

#### 5. Lighthouse CI Server Setup (Optional)

**For Historical Performance Tracking:**

The LHCI server is deployed on Kubernetes. Access:

```bash
# Port forward to access LHCI dashboard
kubectl port-forward -n lighthouse-ci svc/lhci-server-service 9001:9001

# Open dashboard
open http://localhost:9001
```

**To Use LHCI Server:**

1. Update `lighthouserc.json`:
```json
{
  "ci": {
    "upload": {
      "target": "lhci",
      "serverBaseUrl": "http://lhci-server-service.lighthouse-ci.svc.cluster.local:9001",
      "token": ""
    }
  }
}
```

2. Get build token from LHCI wizard:
```bash
kubectl port-forward -n lighthouse-ci svc/lhci-server-service 9001:9001
lhci wizard
```

3. Add `LHCI_BUILD_TOKEN` to GitHub Secrets

**Current Setup:** Uses `temporary-public-storage` to avoid Kubernetes DNS issues from GitHub Actions.

## GitHub Actions Workflow

### Workflow Jobs

The CI pipeline consists of three jobs:

```
build-and-test
     ↓
lighthouse-ci
     ↓
docker-build-push (only on push to main/staging/develop)
```

### Job: build-and-test

**Purpose:** Run tests and build the application

```yaml
steps:
  1. Checkout code
  2. Setup Node.js 20 (with npm cache)
  3. Install dependencies (npm ci)
  4. Run tests with coverage
  5. Build application
  6. Upload coverage report (artifact)
  7. Upload build output (artifact)
```

### Job: lighthouse-ci

**Purpose:** Check code quality, bundle size, and performance

**Runs:** On PRs and pushes to `main`

```yaml
steps:
  1. Checkout code
  2. Setup Node.js 20
  3. Install dependencies
  4. Build application
  5. Run ESLint (max 0 warnings)
  6. Check bundle size
  7. Install Lighthouse CI
  8. Run Lighthouse CI
  9. Upload Lighthouse reports (artifact)
```

**Dependencies:** Requires successful `build-and-test` job

### Job: docker-build-push

**Purpose:** Build and push Docker image

**Runs:** Only on pushes to `main`, `staging`, or `develop`

**Dependencies:** Requires both `build-and-test` and `lighthouse-ci` to pass

## Viewing Reports and Results

### Local Test Reports

```bash
# Run tests with coverage
npm test -- --watchAll=false --coverage

# View coverage report (macOS)
open coverage/lcov-report/index.html

# View coverage report (Linux)
xdg-open coverage/lcov-report/index.html
```

### GitHub Actions Artifacts

1. Go to GitHub repository → Actions
2. Click on a workflow run
3. Scroll to "Artifacts" section
4. Download:
   - `coverage-report` - Jest coverage reports
   - `build-output` - Production build
   - `lighthouse-reports` - Lighthouse HTML/JSON reports

### Lighthouse Reports

**From GitHub Actions:**
1. Download `lighthouse-reports` artifact
2. Extract and open `.lighthouseci/lhr-*.html`

**From Temporary Storage:**
Check GitHub Actions logs for public URL:
```
Uploading median LHR of http://localhost/index.html...
Dashboard URL: https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/...
```

### Lighthouse CI Dashboard (Optional)

If using LHCI server:

```bash
# Port forward
kubectl port-forward -n lighthouse-ci svc/lhci-server-service 9001:9001

# Access dashboard
open http://localhost:9001
```

**Features:**
- Historical performance trends
- Compare builds
- Track Core Web Vitals over time
- Performance budgets visualization

## Common Tasks

### 1. Adjust Performance Thresholds

Edit `lighthouserc.json`:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        // Make performance threshold stricter
        "categories:performance": ["error", {"minScore": 0.95}],

        // Relax LCP threshold
        "largest-contentful-paint": ["error", {"maxNumericValue": 3000}],

        // Change to warning instead of error
        "cumulative-layout-shift": ["warn", {"maxNumericValue": 0.1}]
      }
    }
  }
}
```

### 2. Adjust Bundle Size Limits

Edit `.size-limit.json`:

```json
[
  {
    "path": "build/static/js/*.js",
    "limit": "600 KB"  // Increased from 500 KB
  },
  {
    "path": "build/static/css/*.css",
    "limit": "150 KB"  // Increased from 100 KB
  }
]
```

### 3. Add New Lighthouse Assertion

```json
{
  "ci": {
    "assert": {
      "assertions": {
        // Add new metric
        "interactive": ["error", {"maxNumericValue": 3500}],

        // Add SEO check
        "meta-description": "error"
      }
    }
  }
}
```

### 4. Disable Lighthouse for Specific PRs

Add to PR description:
```
[skip lighthouse]
```

Then update workflow condition:
```yaml
if: |
  !contains(github.event.pull_request.body, '[skip lighthouse]') &&
  (github.event_name == 'pull_request' || github.ref == 'refs/heads/main')
```

### 5. Run Lighthouse on Different URLs

Edit `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost/index.html",
        "http://localhost/about.html",
        "http://localhost/dashboard.html"
      ]
    }
  }
}
```

### 6. Fix Common Performance Issues

**Large Bundle Size:**
```javascript
// Use dynamic imports
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Memoize expensive calculations
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// Memoize components
const MemoizedComponent = memo(MyComponent);
```

**Poor LCP:**
```javascript
// Preload critical resources
<link rel="preload" href="/hero.jpg" as="image">

// Lazy load images below the fold
<img loading="lazy" src="/image.jpg" alt="..." />
```

**High CLS:**
```javascript
// Set explicit dimensions
<img src="/image.jpg" width="600" height="400" alt="..." />

// Use aspect-ratio CSS
.image-container {
  aspect-ratio: 16 / 9;
}
```

## Troubleshooting

### Issue 1: ESLint Testing Library Violations

**Error:**
```
error  Use `screen` to query DOM elements  testing-library/prefer-screen-queries
error  Avoid using `container` methods  testing-library/no-container
error  Do not put multiple assertions in `waitFor`  testing-library/no-wait-for-multiple-assertions
```

**Solutions:**

**Problem:** Using `container.querySelector()`
```javascript
// ❌ Before
const { container } = render(<App />);
const appDiv = container.querySelector('.App');
expect(appDiv).toBeInTheDocument();

// ✅ After
render(<App />);
expect(screen.getByTestId('app-container')).toBeInTheDocument();
// Or remove test if not testing meaningful behavior
```

**Problem:** Multiple assertions in `waitFor`
```javascript
// ❌ Before
await waitFor(() => {
  expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
  expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
});

// ✅ After
await waitFor(() => {
  expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
});
expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
```

---

### Issue 2: size-limit Package Not Installed

**Error:**
```
The following package was not found and will be installed: size-limit@12.0.0
Install Size Limit preset depends on type of the project
```

**Solution:**

1. Install dependencies:
```bash
npm install --save-dev size-limit @size-limit/file
```

2. Update `package-lock.json`:
```bash
npm install
git add package.json package-lock.json
git commit -m "Add size-limit dependencies"
```

---

### Issue 3: package-lock.json Out of Sync

**Error:**
```
npm ci can only install packages when your package.json and package-lock.json are in sync
```

**Solution:**

```bash
# Regenerate package-lock.json
rm package-lock.json
npm install

# Commit the updated file
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

**Prevention:** Always run `npm install` locally before pushing `package.json` changes.

---

### Issue 4: size-limit webpack Configuration Error

**Error:**
```
Config option webpack needs @size-limit/webpack plugin
```

**Cause:** `.size-limit.json` had `"webpack": false` with wrong plugin

**Solution:**

1. Remove `webpack` option from `.size-limit.json`:
```json
[
  {
    "path": "build/static/js/*.js",
    "limit": "500 KB"
    // Remove "webpack": false
  }
]
```

2. Use `@size-limit/file` instead of `@size-limit/preset-app`:
```json
{
  "devDependencies": {
    "size-limit": "^12.0.0",
    "@size-limit/file": "^12.0.0"
  }
}
```

---

### Issue 5: Lighthouse CI Server Connection Failed

**Error:**
```
FetchError: request to http://lhci-server-service.lighthouse-ci.svc.cluster.local:9001/v1/projects/lookup failed
reason: getaddrinfo EAI_AGAIN lhci-server-service.lighthouse-ci.svc.cluster.local
```

**Cause:** GitHub Actions runners cannot access Kubernetes cluster internal DNS

**Solution:**

Use `temporary-public-storage` in `lighthouserc.json`:

```json
{
  "ci": {
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**Alternative (for LHCI server access):**
- Expose LHCI server via Ingress
- Use public URL in `serverBaseUrl`
- Add LHCI_BUILD_TOKEN to GitHub Secrets

---

### Issue 6: Lighthouse Assertions Failing

**Error:**
```
Assertion failed: color-contrast
  Expected: ≥ 0.9
  Actual: 0
```

**Common Failures:**

| Assertion | Cause | Solution |
|-----------|-------|----------|
| color-contrast | Text color too similar to background | Increase contrast ratio to 4.5:1 minimum |
| csp-xss | No Content Security Policy | Add CSP headers |
| errors-in-console | JavaScript errors | Fix console errors |
| landmark-one-main | Missing `<main>` landmark | Add `<main role="main">` |
| maskable-icon | PWA icon not maskable | Add maskable icon or disable assertion |
| total-byte-weight | Bundle too large | Optimize images, code-split, compress |

**Quick Fix - Adjust Thresholds:**

If not critical, change from `error` to `warn`:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "color-contrast": "warn",  // Changed from "error"
        "maskable-icon": "off"     // Disabled
      }
    }
  }
}
```

---

### Issue 7: Build Fails on `npm ci`

**Error:**
```
npm ERR! cipm can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync.
```

**Solution:**

```bash
# Option 1: Update package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"

# Option 2: Use npm install in CI (not recommended)
# Change in .github/workflows/frontend-ci.yml:
- run: npm install  # Instead of npm ci
```

---

### Issue 8: Lighthouse Report Links Expired

**Issue:** Temporary storage links expire after ~30 days

**Solution:**

**For Permanent Storage:**

1. Deploy or access LHCI server:
```bash
kubectl port-forward -n lighthouse-ci svc/lhci-server-service 9001:9001
```

2. Update `lighthouserc.json` to use LHCI server

3. Add public URL or use GitHub Actions artifacts:
```yaml
- name: Upload Lighthouse reports
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: lighthouse-reports
    retention-days: 90  # Extend retention
    path: .lighthouseci/
```

---

### Issue 9: Lighthouse Runs Too Slow in CI

**Issue:** Lighthouse runs taking > 5 minutes

**Solutions:**

1. **Reduce number of runs:**
```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 1  // Changed from 3
    }
  }
}
```

2. **Audit fewer URLs:**
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost/index.html"]  // Only home page
    }
  }
}
```

3. **Use GitHub Actions caching:**
```yaml
- name: Cache Lighthouse CI dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-lighthouse-${{ hashFiles('package-lock.json') }}
```

## Maintenance

### Regular Tasks

**Daily:**
- Monitor CI build status
- Fix failing quality gates immediately

**Weekly:**
- Review Lighthouse performance trends
- Check bundle size growth
- Address new ESLint warnings

**Monthly:**
- Update dependencies (`npm outdated`)
- Review and adjust thresholds
- Analyze coverage gaps
- Clean up unused code

**Quarterly:**
- Major dependency updates
- Review quality gate effectiveness
- Update performance budgets
- Benchmark against competitors

### Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update minor versions
npm update

# Update major versions (carefully)
npm install package@latest

# Security audit
npm audit
npm audit fix
```

### Performance Monitoring

**Track These Metrics Over Time:**
- Lighthouse Performance Score
- Core Web Vitals (LCP, FCP, CLS, TBT)
- Bundle Size (JS + CSS)
- Test Coverage %
- Build Time

**Tools:**
- LHCI Dashboard (historical trends)
- GitHub Actions (build times)
- Browser DevTools (local profiling)

### Quality Gate Review

**Quarterly Review Questions:**
1. Are thresholds too strict or too lenient?
2. Do quality gates catch real issues?
3. Are developers bypassing checks?
4. What's the false positive rate?
5. Are new web standards emerging we should adopt?

**Adjustment Guidelines:**
- Gradually tighten thresholds (don't shock developers)
- Grandfather legacy code (strict for new code)
- Focus on metrics that matter to users
- Balance strictness with developer velocity

## Best Practices

### Testing
1. **Test User Behavior:** Not implementation details
2. **Use Semantic Queries:** `getByRole`, `getByLabelText`, not `querySelector`
3. **Avoid Testing Implementation:** Don't test internal state
4. **Keep Tests Fast:** Mock external dependencies
5. **Test Edge Cases:** Empty states, errors, loading

### Performance
1. **Code Split:** Route-based splitting at minimum
2. **Lazy Load:** Images, heavy components
3. **Optimize Images:** Use WebP, compress, set dimensions
4. **Minimize Bundle:** Remove unused dependencies
5. **Monitor Core Web Vitals:** Focus on LCP, CLS, FCP

### Code Quality
1. **Fix ESLint Issues:** Don't disable rules without good reason
2. **Run Locally First:** Catch issues before pushing
3. **Keep Bundle Small:** Review size-limit regularly
4. **Document Exceptions:** If bypassing a check, explain why
5. **Consistent Style:** Let ESLint enforce it

### CI/CD
1. **Keep Builds Fast:** Parallel jobs, caching
2. **Meaningful Thresholds:** Based on real user impact
3. **Don't Skip Checks:** Quality gates exist for a reason
4. **Monitor Trends:** Track metrics over time
5. **Fail Fast:** Cheapest checks first (ESLint before Lighthouse)

## References

- **Jest:** https://jestjs.io/
- **React Testing Library:** https://testing-library.com/react
- **ESLint:** https://eslint.org/
- **size-limit:** https://github.com/ai/size-limit
- **Lighthouse:** https://developers.google.com/web/tools/lighthouse
- **Lighthouse CI:** https://github.com/GoogleChrome/lighthouse-ci
- **Core Web Vitals:** https://web.dev/vitals/
- **Web.dev:** https://web.dev/ (Performance guides)

## Support

**Issues:** https://github.com/ttambunan01-sudo/todolist-app/issues
**Lighthouse CI Dashboard:** http://localhost:9001 (via port-forward)
