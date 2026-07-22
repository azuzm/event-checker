import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

class MockAuthStorage implements IAuthStorage {
  private users: Map<string, User> = new Map();

  constructor() {
    this.users.set("user1", {
      id: "user1",
      username: "demo_user",
      password: "password",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: null,
      createdAt: new Date(),
    } as User);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || `user_${Date.now()}`;
    const user: User = {
      ...userData,
      id,
      createdAt: new Date(),
      // Add missing fields required by User type but not in UpsertUser if any
    } as User;
    this.users.set(id, user);
    return user;
  }
}

export const authStorage = process.env.DATABASE_URL ? new AuthStorage() : new MockAuthStorage();
