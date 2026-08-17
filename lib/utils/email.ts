/**
 * Email Normalization & Validation Utility Module
 * Enforces case-insensitivity, whitespace trimming, and intuitive error messages.
 */

/**
 * Normalizes an email address to lowercase and trimmed string.
 * @param email - The raw input email string
 * @returns Clean, lowercased, trimmed email string
 */
export function normalizeEmail(email: string): string {
  if (!email) return "";
  return email.trim().toLowerCase();
}

/**
 * Validates basic RFC-compliant email structure.
 * @param email - The email string to validate
 * @returns boolean indicating validity
 */
export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  if (normalized.includes("..")) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(normalized);
}

/**
 * Formats database or auth errors into clear, intuitive user-facing messages.
 * @param error - The raw error object or string
 * @returns A friendly, action-oriented error message string
 */
export function formatEmailError(error: unknown): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  const message = typeof error === "string" ? error : (error as { message?: string }).message || "";
  const code = typeof error === "object" && error !== null ? (error as { code?: string }).code : undefined;

  // Handle unique constraint conflict / duplicate user error (Postgres 23505 or Supabase duplicate user)
  if (
    code === "23505" ||
    message.toLowerCase().includes("already registered") ||
    message.toLowerCase().includes("unique constraint") ||
    message.toLowerCase().includes("duplicate key") ||
    message.toLowerCase().includes("user_already_exists") ||
    message.toLowerCase().includes("already exists")
  ) {
    return "An account with this email address already exists. Please login or reset your password.";
  }

  if (message.includes("Invalid login credentials") || message.includes("invalid_credentials")) {
    return "Invalid email address or password. Please check your credentials and try again.";
  }

  if (message.includes("Email not confirmed")) {
    return "Please confirm your email address before logging in.";
  }

  return message || "An unexpected error occurred. Please try again.";
}
