import { getConnectionInfo, getAllPosts } from './db';

const server = Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(request) {
    const url = new URL(request.url);
    
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

