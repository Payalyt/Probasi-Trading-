import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, doublePrecision } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  accountType: text('account_type').default('demo'),
  balance: doublePrecision('balance').default(10000.0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const trades = pgTable('trades', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  assetSymbol: text('asset_symbol').notNull(),
  assetName: text('asset_name').notNull(),
  tradeType: text('trade_type').notNull(), // 'Buy' or 'Sell'
  investmentAmount: doublePrecision('investment_amount').notNull(),
  entryPrice: doublePrecision('entry_price').notNull(),
  exitPrice: doublePrecision('exit_price'),
  durationSeconds: integer('duration_seconds').notNull(),
  payoutRate: integer('payout_rate').notNull(),
  tradeStatus: text('trade_status').default('Pending'), // 'Pending', 'Win', 'Loss', 'Tie'
  profit: doublePrecision('profit'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const deposits = pgTable('deposits', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  amount: doublePrecision('amount').notNull(),
  method: text('method').notNull(),
  status: text('status').default('Completed'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const withdrawals = pgTable('withdrawals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  amount: doublePrecision('amount').notNull(),
  method: text('method').notNull(),
  status: text('status').default('Pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  trades: many(trades),
  deposits: many(deposits),
  withdrawals: many(withdrawals),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  user: one(users, { fields: [trades.userId], references: [users.id] }),
}));

export const depositsRelations = relations(deposits, ({ one }) => ({
  user: one(users, { fields: [deposits.userId], references: [users.id] }),
}));

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  user: one(users, { fields: [withdrawals.userId], references: [users.id] }),
}));
