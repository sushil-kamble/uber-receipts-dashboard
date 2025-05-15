import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/db";
import { todo } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { createUserContext } from "../_middleware/AuthMiddleware";
import { handleError, validate } from "@/lib/utils-server";
import { ApiResponse } from "@/lib/http";

// Validation schema for todo
const todoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["pending", "completed", "in_progress"]).default("pending"),
  due_date: z.string().or(z.date()).optional(),
});

const updateTodoSchema = todoSchema.extend({
  id: z.string().min(1),
});

// Create todo
export async function POST(request: NextRequest) {
  try {
    const { userId } = await createUserContext();

    const body = await request.json();

    const validatedData = validate(todoSchema, body, "Failed to create todo");

    const [result] = await db
      .insert(todo)
      .values({
        ...validatedData,
        due_date: validatedData.due_date
          ? new Date(validatedData.due_date)
          : null,
        user_id: userId,
      })
      .returning();

    return ApiResponse.success(result);
  } catch (error) {
    return handleError(error);
  }
}

// Get all todos
export async function GET() {
  try {
    const { userId } = await createUserContext();

    const todos = await db.query.todo.findMany({
      where: and(eq(todo.user_id, userId), eq(todo.is_deleted, false)),
      orderBy: (todo, { desc }) => [desc(todo.created_at)],
    });

    return ApiResponse.success(todos);
  } catch (error) {
    return handleError(error);
  }
}

// Update todo
export async function PUT(request: Request) {
  try {
    await createUserContext();
    const body = await request.json();

    const validatedData = validate(
      updateTodoSchema,
      body,
      "Failed to update todo"
    );

    const result = await db
      .update(todo)
      .set({
        ...validatedData,
        due_date: validatedData.due_date
          ? new Date(validatedData.due_date)
          : null,
        updated_at: new Date(),
      })
      .where(eq(todo.id, validatedData.id))
      .returning();

    return ApiResponse.success(result);
  } catch (error) {
    return handleError(error);
  }
}

// Delete todo (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await createUserContext();

    const queryParameters = request.nextUrl.searchParams;
    const todoId = queryParameters.get("id");
    console.log(queryParameters);

    const { id } = validate(
      z.object({
        id: z.string(),
      }),
      { id: todoId },
      "Failed to delete todo"
    );

    const result = await db
      .update(todo)
      .set({
        is_deleted: true,
        updated_at: new Date(),
      })
      .where(and(eq(todo.user_id, userId), eq(todo.id, id)))
      .returning();

    return ApiResponse.success(result);
  } catch (error) {
    return handleError(error);
  }
}
