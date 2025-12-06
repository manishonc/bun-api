import postgres from 'postgres';

export interface ConnectionInfo {
  status: 'connected' | 'disconnected' | 'error';
  connectionType: string;
  database?: string;
  host?: string;
  port?: number;
  user?: string;
  activeConnections?: number;
  error?: string;
}

let sql: postgres.Sql | null = null;

export async function getConnectionInfo(): Promise<ConnectionInfo> {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    return {
      status: 'error',
      connectionType: 'Not configured',
      error: 'DATABASE_URL environment variable is not set',
    };
  }

  try {
    // Parse connection string to extract info
    const url = new URL(connectionString);
    const host = url.hostname;
    const port = parseInt(url.port) || 5432;
    const database = url.pathname.slice(1); // Remove leading '/'
    const user = url.username;

    // Create connection if not exists
    if (!sql) {
      sql = postgres(connectionString, {
      max: 1, // Use single connection for testing
    });
    }

    // Test connection and get active connections count
    const [versionResult, connectionsResult] = await Promise.all([
      sql`SELECT version() as version`,
      sql`
        SELECT 
          count(*) as active_connections,
          count(*) FILTER (WHERE state = 'active') as active_state,
          count(*) FILTER (WHERE state = 'idle') as idle_state
        FROM pg_stat_activity
        WHERE datname = current_database()
      `,
    ]);

    const version = versionResult[0]?.version || 'Unknown';
    const activeConnections = parseInt(connectionsResult[0]?.active_connections || '0');
    const activeState = parseInt(connectionsResult[0]?.active_state || '0');
    const idleState = parseInt(connectionsResult[0]?.idle_state || '0');

    // Determine connection type from version string
    let connectionType = 'PostgreSQL';
    if (version.includes('PostgreSQL')) {
      connectionType = 'PostgreSQL via TCP';
    }

    return {
      status: 'connected',
      connectionType,
      database,
      host,
      port,
      user,
      activeConnections,
    };
  } catch (error) {
    return {
      status: 'error',
      connectionType: 'PostgreSQL',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function closeConnection(): Promise<void> {
  if (sql) {
    await sql.end();
    sql = null;
  }
}

export async function getDb() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  if (!sql) {
    sql = postgres(connectionString);
  }

  return sql;
}

export interface Post {
  id: number;
  title: string;
  created_at: Date;
}

export async function getAllPosts(): Promise<Post[]> {
  const db = await getDb();
  return await db`SELECT id, title, created_at FROM posts ORDER BY created_at DESC`;
}
