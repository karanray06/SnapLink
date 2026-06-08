import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// URLs table - stores shortened links
export const urls = pgTable(
  "urls",
  {
    id: serial("id").primaryKey(),
    shortId: varchar("short_id", { length: 7 }).notNull().unique(),
    longUrl: text("long_url").notNull(),
    customAlias: varchar("custom_alias", { length: 50 }).unique(),
    userId: varchar("user_id", { length: 255 }), // Clerk user ID (nullable for anonymous links)
    createdAt: timestamp("created_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at"),
    clickCount: integer("click_count").notNull().default(0),
  },
  (table) => {
    return {
      shortIdIdx: uniqueIndex("short_id_idx").on(table.shortId),
      customAliasIdx: uniqueIndex("custom_alias_idx").on(table.customAlias),
      userIdIdx: index("user_id_idx").on(table.userId),
      expiresAtIdx: index("expires_at_idx").on(table.expiresAt),
    };
  }
);

// Clicks table - stores analytics data
export const clicks = pgTable(
  "clicks",
  {
    id: serial("id").primaryKey(),
    urlId: integer("url_id")
      .notNull()
      .references(() => urls.id, { onDelete: "cascade" }),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
    country: varchar("country", { length: 2 }), // ISO 3166-1 alpha-2
    referrer: text("referrer"),
    device: varchar("device", { length: 50 }), // e.g., "Desktop", "Mobile", "Tablet"
  },
  (table) => {
    return {
      urlIdIdx: index("url_id_idx").on(table.urlId),
      timestampIdx: index("timestamp_idx").on(table.timestamp),
      countryIdx: index("country_idx").on(table.country),
    };
  }
);

export type UrlRecord = typeof urls.$inferSelect;
export type UrlInsert = typeof urls.$inferInsert;
export type ClickRecord = typeof clicks.$inferSelect;
export type ClickInsert = typeof clicks.$inferInsert;
