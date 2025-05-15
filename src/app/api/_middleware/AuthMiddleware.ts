import { auth } from "@clerk/nextjs/server";

export class AuthenticationError extends Error {
  constructor(message = "User not authenticated") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export const createUserContext = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new AuthenticationError();
  }
  return { userId };
};
