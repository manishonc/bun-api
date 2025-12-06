import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDrizzleDb } from './db';
import * as authSchema from './db/schema/auth';

const db = getDrizzleDb();

export const auth = betterAuth({
  appName: 'Niu',
  baseURL: process.env.BETTER_AUTH_URL || process.env.AUTH_BASE_URL || undefined,
  basePath: '/api/auth',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
    camelCase: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
});

export type AuthInstance = typeof auth;
