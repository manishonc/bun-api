import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function runMigrations() {
  console.log('🔄 Running database migrations...\n');

  // connectionString is guaranteed to be defined here due to the check above
  const sql = postgres(connectionString as string);

  try {
    // Read and execute the migration file
    const migrationPath = join(process.cwd(), 'migrations', '001_create_posts_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    // Execute the migration
    await sql.unsafe(migrationSQL);
    
    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Posts table created with 50 dummy posts\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigrations();
