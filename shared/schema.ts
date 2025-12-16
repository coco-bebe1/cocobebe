import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  date: text("date").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'notice' | 'event' | 'album' | 'board' | 'menu'
  classId: text("class_id"),
  parentId: text("parent_id"),
  images: jsonb("images").$type<string[]>(),
});

// Album Photos table
export const albumPhotos = pgTable("album_photos", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  classId: text("class_id"),
});

// App Users table (different from auth users)
export const appUsers = pgTable("app_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'admin' | 'parent' | 'teacher' | 'nutritionist'
  child: jsonb("child").$type<{ name: string; age: number; classId: string; birthDate?: string }>(),
  phone: text("phone"),
  classId: text("class_id"),
  approved: boolean("approved").notNull().default(false),
});

// Teachers table
export const teachers = pgTable("teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  classId: text("class_id").notNull(),
  approved: boolean("approved").notNull().default(false),
  photoUrl: text("photo_url"),
});

// Classes table
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  age: text("age").notNull(),
  teacher: text("teacher").notNull(),
  color: text("color").notNull(),
  description: text("description").notNull(),
  schedule: jsonb("schedule").$type<Array<{ time: string; activity: string }>>().notNull(),
});

// Registered Children table
export const registeredChildren = pgTable("registered_children", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  birthDate: text("birth_date").notNull(),
  classId: text("class_id").notNull(),
  parentId: text("parent_id"),
});

// Site Settings table (single row)
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  mapLink: text("map_link").notNull(),
  aboutDescription: text("about_description").notNull(),
  history: jsonb("history").$type<{ year: string; title: string; desc?: string }[]>().notNull(),
  greetingTitle: text("greeting_title").notNull(),
  greetingMessage: text("greeting_message").notNull(),
  greetingImageUrl: text("greeting_image_url").notNull(),
  greetingSignature: text("greeting_signature").notNull(),
  philosophy: jsonb("philosophy").$type<{ title: string; desc: string }[]>().notNull(),
  facilityImages: jsonb("facility_images").$type<{ title: string; url: string; desc?: string }[]>().notNull(),
});
