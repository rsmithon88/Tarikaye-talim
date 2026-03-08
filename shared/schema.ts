import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").default(""),
  author: varchar("author", { length: 255 }).default(""),
  coverColor: varchar("cover_color", { length: 20 }).default("#1E3A5F"),
  coverAccent: varchar("cover_accent", { length: 20 }).default("#C9A84C"),
  published: boolean("published").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").default(""),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const libraryBooks = pgTable("library_books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").default(""),
  status: varchar("status", { length: 50 }).default("upcoming"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  deviceId: varchar("device_id", { length: 100 }).notNull(),
  bookId: integer("book_id").notNull(),
  chapterId: integer("chapter_id").notNull(),
  bookTitle: varchar("book_title", { length: 255 }).default(""),
  chapterTitle: varchar("chapter_title", { length: 255 }).default(""),
  scrollPosition: integer("scroll_position").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supportMessages = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").default(""),
  mobile: varchar("mobile", { length: 50 }).default(""),
  details: text("details").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookSchema = createInsertSchema(books).omit({ id: true, createdAt: true, updatedAt: true });
export const insertChapterSchema = createInsertSchema(chapters).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertUser = z.infer<typeof createInsertSchema<typeof users>>;
export type User = typeof users.$inferSelect;
export type Book = typeof books.$inferSelect;
export type Chapter = typeof chapters.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type InsertChapter = z.infer<typeof insertChapterSchema>;
