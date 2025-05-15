import { z } from "zod";

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: "pending" | "completed" | "in_progress";
  due_date: string | null;
  created_at: string;
  updated_at: string | null;
  is_deleted: boolean;
}

export interface TodoFormData {
  id?: string;
  title: string;
  description?: string;
  status: "pending" | "completed" | "in_progress";
  due_date?: Date;
}

export const todoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "completed", "in_progress"]).default("pending"),
  due_date: z.date().optional(),
});
