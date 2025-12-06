import { index, pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: false }).notNull().defaultNow(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expiresAt', { withTimezone: false }).notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: false }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('session_user_idx').on(table.userId),
    tokenIdx: index('session_token_idx').on(table.token),
  })
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { withTimezone: false }),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { withTimezone: false }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: false }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('account_user_idx').on(table.userId),
  })
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt', { withTimezone: false }).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: false }).notNull().defaultNow(),
  },
  (table) => ({
    identifierIdx: index('verification_identifier_idx').on(table.identifier),
  })
);

export const authSchema = { user, session, account, verification };
