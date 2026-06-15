import { pgTable, serial, text, varchar, integer, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Match Status Enum
// Values are defined exactly as requested: 'schedules', 'lives', and 'finisned'
export const matchStatusEnum = pgEnum('match_status', ['schedules', 'lives', 'finisned']);

// 2. Matches Table
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  sport: varchar('sport', { length: 50 }).notNull(),
  homeTeam: text('home_team').notNull(),
  awayTeam: text('away_team').notNull(),
  status: matchStatusEnum('status').default('schedules').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }),
  endTime: timestamp('end_time', { withTimezone: true }),
  homeScore: integer('home_score').default(0).notNull(),
  awayScore: integer('away_score').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Commentary Table
export const commentary = pgTable('commentary', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id')
    .references(() => matches.id, { onDelete: 'cascade' })
    .notNull(),
  minute: integer('minute').notNull(),
  sequence: integer('sequence').notNull(),
  period: varchar('period', { length: 50 }).notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  actor: text('actor'),
  team: text('team'),
  message: text('message').notNull(),
  metaData: jsonb('meta_data'),
  tags: text('tags').array(), // Stores tags as a text array (text[])
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Relationships (Drizzle Relations API)
export const matchesRelations = relations(matches, ({ many }) => ({
  commentaries: many(commentary),
}));

export const commentaryRelations = relations(commentary, ({ one }) => ({
  match: one(matches, {
    fields: [commentary.matchId],
    references: [matches.id],
  }),
}));
