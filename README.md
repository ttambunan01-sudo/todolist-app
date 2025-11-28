# TodoList Frontend Application

![CI Status](https://github.com/ttambunan01-sudo/todolist-app/actions/workflows/frontend-ci.yml/badge.svg)

A modern, responsive React application for managing todo items with full CRUD operations.

## Features

- ✅ Create, read, update, and delete todos
- ✅ Toggle todo completion status
- ✅ Inline editing of todo titles
- ✅ Real-time todo statistics
- ✅ Responsive UI design
- ✅ Error handling with user feedback
- ✅ Loading states for better UX
- ✅ Comprehensive test coverage (86%+)
- ✅ CI/CD with GitHub Actions
- ✅ Docker containerization

## Technology Stack

- **Framework:** React 19
- **Build Tool:** Create React App
- **Testing:** Jest + React Testing Library
- **Styling:** CSS3
- **API Client:** Fetch API
- **Containerization:** Docker + Nginx

## Quick Start

### Prerequisites

- Node.js 20+
- npm
- Backend API running (see [backend repository](https://github.com/ttambunan01-sudo/todolist))

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ttambunan01-sudo/todolist-app.git
   cd todolist-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file:
   ```
   REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
   ```

4. **Run the application**
   ```bash
   npm start
   ```

5. **Access the app**
   - Open [http://localhost:3000](http://localhost:3000)

### Using Docker

```bash
# Build the image
docker build -t todolist-frontend:latest .

# Run the container
docker run -p 3000:80 todolist-frontend:latest
```

## Testing

```bash
# Run tests in watch mode
npm test

# Run tests once with coverage
npm test -- --watchAll=false --coverage

# View coverage report
open coverage/lcov-report/index.html
```

## Test Coverage

Current coverage: **~86% for components**

- App.js: 100%
- TodoList.js: 86.3%
- 15 test cases covering:
  - Component rendering
  - CRUD operations
  - Error handling
  - User interactions
  - State management

## Project Structure

```
src/
├── components/
│   ├── TodoList.js           # Main todo list component
│   ├── TodoList.css          # Component styles
│   └── TodoList.test.js      # Component tests
├── services/
│   └── api.js                # API client
├── App.js                    # Root component
├── App.test.js               # App tests
├── App.css                   # App styles
└── index.js                  # Entry point
```

## API Integration

The frontend communicates with the backend REST API:

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | `/api/v1/todos` | Fetch all todos |
| POST | `/api/v1/todos` | Create new todo |
| PUT | `/api/v1/todos/:id` | Update todo |
| DELETE | `/api/v1/todos/:id` | Delete todo |

## Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

The page reloads on changes. Lint errors appear in the console.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

Bundles React in production mode and optimizes for best performance.

### `npm run eject`

**Note: This is a one-way operation!**

Copies all configuration files into your project for full control.

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

- **On Push/PR:** Runs tests with coverage
- **On Main Branch:** Builds and pushes Docker image to Docker Hub
- **Test Reports:** Automatically uploaded as artifacts

See [CI/CD Documentation](docs/CI.md) for more details.

## Docker Image

Pull the latest image:
```bash
docker pull ttambunan01/todolist-frontend:latest
```

Run with environment variables:
```bash
docker run -p 3000:80 \
  -e REACT_APP_API_BASE_URL=http://your-backend-api:8080/api/v1 \
  ttambunan01/todolist-frontend:latest
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api/v1` |

**Note:** Environment variables must be prefixed with `REACT_APP_` to be embedded in the build.

## Deployment

### Production Build

```bash
npm run build
```

The `build` folder contains the optimized production build.

### Deploy to Nginx

```bash
# Copy build files to nginx
cp -r build/* /var/www/html/

# Configure nginx reverse proxy for API
# See nginx.conf for example configuration
```

### Deploy with Docker

```bash
docker build -t todolist-frontend:v1.0.0 .
docker push your-registry/todolist-frontend:v1.0.0
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests: `npm test -- --watchAll=false`
5. Commit: `git commit -m "feat: add new feature"`
6. Push: `git push origin feature/new-feature`
7. Submit a pull request

## Troubleshooting

### API Connection Failed

**Problem:** "Failed to load todos. Make sure the backend server is running."

**Solution:**
1. Verify backend is running at the configured URL
2. Check CORS settings in backend
3. Verify `REACT_APP_API_BASE_URL` is correct

### Tests Failing

**Problem:** Tests fail locally

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

### Build Errors

**Problem:** `npm run build` fails

**Solution:**
```bash
# Clear cache
rm -rf node_modules build
npm install
npm run build
```

## License

[Add your license here]

## Authors

[Add your name/team here]

---

**Last Updated:** 2025-11-28
**Version:** 0.1.0
