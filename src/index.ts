import { getConnectionInfo, getAllPosts } from './db';
import { auth } from './auth';

const server = Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/auth')) {
      return auth.handler(request);
    }
    
    if (url.pathname === '/login') {
      let sessionData: Awaited<ReturnType<typeof auth.api.getSession>> | null = null;
      try {
        sessionData = await auth.api.getSession({ headers: request.headers });
      } catch (error) {
        sessionData = null;
      }

      const user = (sessionData as any)?.user;

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login</title>
  <style>
    :root {
      color-scheme: light;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #0f172a;
      color: #0b1120;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
    }
    .card {
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      width: 100%;
      max-width: 440px;
      padding: 32px;
      box-sizing: border-box;
    }
    h1 {
      margin: 0 0 12px;
      font-size: 26px;
      color: #0f172a;
    }
    p {
      margin: 0 0 20px;
      color: #334155;
    }
    label {
      display: block;
      margin-bottom: 6px;
      font-size: 14px;
      color: #0f172a;
    }
    input {
      width: 100%;
      padding: 12px 14px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      font-size: 15px;
      box-sizing: border-box;
      background: #f8fafc;
      transition: border 0.2s, background 0.2s;
    }
    input:focus {
      outline: none;
      border-color: #6366f1;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    }
    .row {
      margin-bottom: 16px;
    }
    button {
      width: 100%;
      padding: 12px 14px;
      border: none;
      border-radius: 10px;
      background: linear-gradient(120deg, #6366f1, #8b5cf6);
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.08s ease, box-shadow 0.08s ease;
    }
    button:hover { box-shadow: 0 10px 40px rgba(99,102,241,0.35); transform: translateY(-1px); }
    button:active { transform: translateY(0); }
    .status {
      margin-top: 12px;
      font-size: 14px;
      min-height: 18px;
      color: #b91c1c;
    }
    .toggle {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
      color: #0f172a;
    }
    .badge {
      background: #ecfeff;
      border: 1px solid #22d3ee;
      color: #0e7490;
      padding: 8px 12px;
      border-radius: 10px;
      margin-bottom: 16px;
      font-size: 14px;
    }
    .link {
      display: inline-block;
      margin-top: 10px;
      font-size: 14px;
      color: #6366f1;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <main class="card">
    <h1>${user ? 'You are signed in' : 'Sign in or create account'}</h1>
    <p>${user ? 'Continue to your account details or sign out.' : 'Use email and password to sign in. New users can sign up below.'}</p>
    ${user ? `<div class="badge">Signed in as <strong>${user.email}</strong></div>` : ''}
    <div class="toggle">
      <input type="checkbox" id="modeToggle" aria-label="Enable sign up mode" />
      <label for="modeToggle">Sign up instead</label>
    </div>
    <form id="auth-form">
      <div class="row" id="name-row" style="display:none;">
        <label for="name">Name</label>
        <input id="name" name="name" placeholder="Your name" autocomplete="name" />
      </div>
      <div class="row">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" autocomplete="email" required />
      </div>
      <div class="row">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" placeholder="••••••••" autocomplete="current-password" minlength="8" required />
      </div>
      <button type="submit">Continue</button>
      <div class="status" id="status"></div>
    </form>
    <a class="link" href="/me">Go to my account</a>
  </main>
  <script>
    const form = document.getElementById('auth-form');
    const modeToggle = document.getElementById('modeToggle');
    const nameRow = document.getElementById('name-row');
    const status = document.getElementById('status');

    const updateMode = () => {
      const isSignup = modeToggle.checked;
      nameRow.style.display = isSignup ? 'block' : 'none';
    };
    updateMode();
    modeToggle.addEventListener('change', updateMode);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.textContent = '';
      const isSignup = modeToggle.checked;
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const nameInput = document.getElementById('name');
      const email = emailInput && 'value' in emailInput ? emailInput.value : '';
      const password = passwordInput && 'value' in passwordInput ? passwordInput.value : '';
      const name = nameInput && 'value' in nameInput ? nameInput.value : '';

      const payload = { email, password };
      if (isSignup) payload.name = name || 'User';

      const endpoint = isSignup ? '/api/auth/sign-up/email' : '/api/auth/sign-in/email';
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) {
          status.textContent = data?.message || 'Unable to continue. Check your details and try again.';
          return;
        }
        window.location.href = '/me';
      } catch (error) {
        status.textContent = 'Network error. Please try again.';
      }
    });
  </script>
</body>
</html>
      `;

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    if (url.pathname === '/me') {
      let sessionData: Awaited<ReturnType<typeof auth.api.getSession>> | null = null;
      try {
        sessionData = await auth.api.getSession({ headers: request.headers });
      } catch (error) {
        sessionData = null;
      }

      if (!sessionData || !(sessionData as any)?.user) {
        return new Response(null, {
          status: 302,
          headers: { Location: '/login' },
        });
      }

      const user = (sessionData as any).user;
      const session = (sessionData as any).session;

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Account</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #0b1120;
      color: #0f172a;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
    }
    .card {
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      width: 100%;
      max-width: 720px;
      padding: 32px;
      box-sizing: border-box;
    }
    h1 { margin: 0 0 12px; }
    p { margin: 0 0 18px; color: #334155; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
    .tile { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; }
    .tile strong { display: block; color: #0f172a; margin-bottom: 6px; }
    .actions { margin-top: 18px; display: flex; gap: 12px; flex-wrap: wrap; }
    button {
      padding: 12px 14px;
      border: none;
      border-radius: 10px;
      background: linear-gradient(120deg, #6366f1, #8b5cf6);
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.08s ease, box-shadow 0.08s ease;
    }
    button:hover { box-shadow: 0 10px 40px rgba(99,102,241,0.35); transform: translateY(-1px); }
    .secondary {
      background: #e2e8f0;
      color: #0f172a;
    }
    .mono { font-family: 'Monaco', 'Courier New', monospace; word-break: break-all; }
  </style>
</head>
<body>
  <main class="card">
    <h1>Hello, ${user.name || user.email}</h1>
    <p>You're signed in. Here's a quick view of your profile and session.</p>
    <div class="grid">
      <div class="tile">
        <strong>User</strong>
        <div class="mono">${user.id}</div>
        <div>${user.email}</div>
        <div>${user.emailVerified ? 'Email verified' : 'Email not verified'}</div>
      </div>
      <div class="tile">
        <strong>Session</strong>
        <div class="mono">${session?.token || 'n/a'}</div>
        <div>Expires: ${session?.expiresAt ? new Date(session.expiresAt).toLocaleString() : 'n/a'}</div>
      </div>
      <div class="tile">
        <strong>Metadata</strong>
        <div>Created: ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'n/a'}</div>
        <div>Updated: ${user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'n/a'}</div>
      </div>
    </div>
    <div class="actions">
      <button onclick="logout()">Sign out</button>
      <button class="secondary" onclick="window.location.href='/'">Back home</button>
    </div>
  </main>
  <script>
    async function logout() {
      await fetch('/api/auth/sign-out', { method: 'POST' });
      window.location.href = '/login';
    }
  </script>
</body>
</html>
      `;

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    if (url.pathname === '/logout') {
      try {
        const signOutResponse = await auth.api.signOut({ headers: request.headers, asResponse: true });
        const headers = new Headers(signOutResponse.headers);
        headers.set('Location', '/login');
        return new Response(null, { status: 302, headers });
      } catch (error) {
        return new Response(null, { status: 302, headers: { Location: '/login' } });
      }
    }
    if (url.pathname === "/" || url.pathname === "/hello") {
      return new Response("hello world", {
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }
    
    if (url.pathname === "/db-test") {
      const connectionInfo = await getConnectionInfo();
      
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PostgreSQL Connection Test</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 40px;
      max-width: 600px;
      width: 100%;
    }
    h1 {
      color: #333;
      margin-bottom: 30px;
      font-size: 28px;
      text-align: center;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .status-connected {
      background: #10b981;
      color: white;
    }
    .status-disconnected {
      background: #ef4444;
      color: white;
    }
    .status-error {
      background: #f59e0b;
      color: white;
    }
    .info-grid {
      display: grid;
      gap: 15px;
      margin-top: 20px;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .info-label {
      font-weight: 600;
      color: #6b7280;
    }
    .info-value {
      color: #111827;
      font-family: 'Monaco', 'Courier New', monospace;
    }
    .error-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 16px;
      margin-top: 20px;
      color: #991b1b;
    }
    .refresh-btn {
      margin-top: 30px;
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .refresh-btn:hover {
      background: #5568d3;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>PostgreSQL Connection Test</h1>
    
    <div class="status-badge status-${connectionInfo.status}">
      ${connectionInfo.status === 'connected' ? '✓ Connected' : 
        connectionInfo.status === 'error' ? '✗ Error' : '✗ Disconnected'}
    </div>
    
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Connection Type:</span>
        <span class="info-value">${connectionInfo.connectionType || 'N/A'}</span>
      </div>
      ${connectionInfo.database ? `
      <div class="info-item">
        <span class="info-label">Database:</span>
        <span class="info-value">${connectionInfo.database}</span>
      </div>
      ` : ''}
      ${connectionInfo.host ? `
      <div class="info-item">
        <span class="info-label">Host:</span>
        <span class="info-value">${connectionInfo.host}</span>
      </div>
      ` : ''}
      ${connectionInfo.port ? `
      <div class="info-item">
        <span class="info-label">Port:</span>
        <span class="info-value">${connectionInfo.port}</span>
      </div>
      ` : ''}
      ${connectionInfo.user ? `
      <div class="info-item">
        <span class="info-label">User:</span>
        <span class="info-value">${connectionInfo.user}</span>
      </div>
      ` : ''}
      ${connectionInfo.activeConnections !== undefined ? `
      <div class="info-item">
        <span class="info-label">Active Connections:</span>
        <span class="info-value">${connectionInfo.activeConnections}</span>
      </div>
      ` : ''}
    </div>
    
    ${connectionInfo.error ? `
    <div class="error-box">
      <strong>Error:</strong> ${connectionInfo.error}
    </div>
    ` : ''}
    
    <button class="refresh-btn" onclick="window.location.reload()">Refresh</button>
  </div>
</body>
</html>
      `;
      
      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }
    
    if (url.pathname === "/post") {
      try {
        const posts = await getAllPosts();
        
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Posts</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: #333;
      margin-bottom: 30px;
      font-size: 32px;
      text-align: center;
    }
    .posts-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .posts-container p {
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      color: #111827;
      font-size: 16px;
      line-height: 1.6;
    }
    .count {
      text-align: center;
      color: #6b7280;
      margin-bottom: 20px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>All Posts</h1>
    <div class="count">Total: ${posts.length} posts</div>
    <div class="posts-container">
      ${posts.map(post => `<p>${post.title}</p>`).join('')}
    </div>
  </div>
</body>
</html>
        `;
        
        return new Response(html, {
          headers: {
            "Content-Type": "text/html",
          },
        });
      } catch (error) {
        return new Response(`Error loading posts: ${error instanceof Error ? error.message : String(error)}`, {
          status: 500,
          headers: {
            "Content-Type": "text/plain",
          },
        });
      }
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server is running on http://localhost:${server.port}`);

