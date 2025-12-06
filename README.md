# Hello World API

A simple HTTP API server built with Bun that returns "hello world".

## Prerequisites

- Bun runtime installed

## Installation

```bash
bun install
```

## Usage

### Run the server directly

```bash
bun run start
```

Or:

```bash
bun run src/index.ts
```

The server will start on `http://localhost:3000` (or the port specified by the `PORT` environment variable).

### Build executable

```bash
bun run build
```

This creates a standalone executable at `./dist/api`.

### Run the executable

```bash
./dist/api
```

## API Endpoints

- `GET /` - Returns "hello world"
- `GET /hello` - Returns "hello world"
- Any other path - Returns 404 Not Found

## Example

```bash
curl http://localhost:3000/
# Returns: hello world
```

## Deployment to Railway

### Prerequisites

- A Railway account ([railway.app](https://railway.app))
- Your code pushed to a GitHub repository

### Method 1: Deploy via Railway Dashboard

1. **Create a new project:**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "+ New" → "GitHub Repo"
   - Select your repository

2. **Railway will automatically:**
   - Detect Bun as the runtime
   - Use the `start` script from `package.json`
   - Deploy your application

3. **Generate a public domain:**
   - Select your service
   - Go to "Settings" tab
   - Under "Networking", click "Generate Domain"

### Method 2: Deploy via Railway CLI

1. **Install Railway CLI:**
   ```bash
   bun install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize project:**
   ```bash
   railway init
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

5. **Generate domain:**
   ```bash
   railway domain
   ```

### Configuration

The project includes `railway.json` which configures Railway to use Railpack for better Bun support. Railway will automatically:
- Use the `start` script to run your application
- Listen on the port provided by the `PORT` environment variable (Railway sets this automatically)

### Automatic Deployments

Railway automatically deploys updates whenever you push to your connected GitHub repository.

