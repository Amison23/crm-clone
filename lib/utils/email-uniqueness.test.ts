import { describe, it, expect } from "vitest";
import { normalizeEmail, isValidEmail, formatEmailError } from "./email";

describe("Phase 7 - Email Normalization & Uniqueness Utilities", () => {
  it("should normalize email addresses to lower case and trim whitespace", () => {
    expect(normalizeEmail("  User@Test.com  ")).toBe("user@test.com");
    expect(normalizeEmail("AGENT.SMITH@DOMAIN.CO.UK")).toBe("agent.smith@domain.co.uk");
    expect(normalizeEmail("  test@EXAMPLE.COM")).toBe("test@example.com");
  });

  it("should treat differently cased emails as identical accounts", () => {
    const email1 = normalizeEmail("User@Test.com");
    const email2 = normalizeEmail("user@test.com");
    const email3 = normalizeEmail("USER@TEST.COM  ");

    expect(email1).toBe(email2);
    expect(email2).toBe(email3);
    expect(email1 === email2 && email2 === email3).toBe(true);
  });

  it("should validate proper email structures", () => {
    expect(isValidEmail("User@Test.com")).toBe(true);
    expect(isValidEmail("plainaddress")).toBe(false);
    expect(isValidEmail("@missingusername.com")).toBe(false);
    expect(isValidEmail("user@domain..com")).toBe(false);
  });

  it("should format duplicate email / constraint errors into clear intuitive messages", () => {
    const duplicateError1 = { code: "23505", message: "duplicate key value violates unique constraint" };
    const duplicateError2 = { message: "User already registered" };
    const invalidCreds = { message: "Invalid login credentials" };

    expect(formatEmailError(duplicateError1)).toBe(
      "An account with this email address already exists. Please login or reset your password."
    );
    expect(formatEmailError(duplicateError2)).toBe(
      "An account with this email address already exists. Please login or reset your password."
    );
    expect(formatEmailError(invalidCreds)).toBe(
      "Invalid email address or password. Please check your credentials and try again."
    );
  });

  it("should simulate rapid concurrent duplicate registration and ensure atomic conflict detection", async () => {
    // Simulated in-memory database store with case-insensitive unique index
    const registeredUsers = new Map<string, { id: string; email: string }>();

    async function registerUserAtomic(rawEmail: string): Promise<{ success: boolean; id?: string; error?: string }> {
      const normalized = normalizeEmail(rawEmail);
      
      // Atomic insert operation simulation
      if (registeredUsers.has(normalized)) {
        return {
          success: false,
          error: formatEmailError({ code: "23505", message: "duplicate key value violates unique constraint" })
        };
      }

      const id = `user_${Math.random().toString(36).substring(2, 9)}`;
      registeredUsers.set(normalized, { id, email: normalized });
      return { success: true, id };
    }

    // Fire 2 concurrent registration requests with differently cased emails in rapid succession
    const [res1, res2] = await Promise.all([
      registerUserAtomic("Concurrent@Example.com"),
      registerUserAtomic("concurrent@example.com")
    ]);

    // Exactly one registration must succeed and one must fail with friendly error
    const successes = [res1, res2].filter((r) => r.success);
    const failures = [res1, res2].filter((r) => !r.success);

    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);
    expect(failures[0].error).toBe(
      "An account with this email address already exists. Please login or reset your password."
    );
    expect(registeredUsers.size).toBe(1);
  });
});
