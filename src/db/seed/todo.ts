// seeds/todo.ts
import { faker } from "@faker-js/faker";
import { todo } from "../schema";
import db from "..";

const USER_ID = "user_2nTZc1IK1Hb3jHZ6nyjmuX5eDfa";
const STATUSES = ["pending", "in_progress", "completed"];

async function seedTodos() {
  const todos = Array.from({ length: 100 }, () => ({
    user_id: USER_ID,
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    status: faker.helpers.arrayElement(STATUSES),
    due_date: faker.date.future(),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
    is_deleted: faker.datatype.boolean({ probability: 0.1 }), // 10% chance of being deleted
  }));

  await db.insert(todo).values(todos);
  console.log("Seeded 100 todos");
}

// Run seed
seedTodos().catch(console.error);
