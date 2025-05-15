// import { cuid } from "@/lib/utils-server";
import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  username: text("username"),
  email: text("email").notNull(),
  phone: text("phone"),
  first_name: text("first_name"),
  last_name: text("last_name"),
  profile_image: text("profile_image"),
  created_at: timestamp("created_at").default(sql`now()`),
  updated_at: timestamp("updated_at"),
  is_deleted: boolean("is_deleted").notNull().default(false),
});

export const todo = pgTable("todo", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  due_date: timestamp("due_date"),
  created_at: timestamp("created_at").default(sql`now()`),
  updated_at: timestamp("updated_at"),
  is_deleted: boolean("is_deleted").notNull().default(false),
});

// Define relationships
export const userRelations = relations(user, ({ many }) => ({
  todos: many(todo),
}));

export const todoRelations = relations(todo, ({ one }) => ({
  user: one(user, {
    fields: [todo.user_id],
    references: [user.id],
  }),
}));
