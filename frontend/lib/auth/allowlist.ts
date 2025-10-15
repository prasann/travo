/**
 * Email allowlist for application access
 * Only users with emails in this list can use the app
 * 
 * Configuration:
 * Set NEXT_PUBLIC_ALLOWED_EMAILS in .env.local as a comma-separated list:
 * NEXT_PUBLIC_ALLOWED_EMAILS=user1@example.com,user2@example.com,user3@example.com
 */

/**
 * Parse allowed emails from environment variable
 * Supports comma-separated list with optional whitespace
 */
function parseAllowedEmails(): readonly string[] {
  const envEmails = process.env.NEXT_PUBLIC_ALLOWED_EMAILS;
  
  if (!envEmails || envEmails.trim() === '') {
    return [];
  }
  
  // Split by comma, trim whitespace, filter empty strings
  return envEmails
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
}

/**
 * List of allowed email addresses from environment variable
 */
const ALLOWED_EMAILS: readonly string[] = parseAllowedEmails();

/**
 * Check if an email is in the allowlist
 * @param email - Email address to check
 * @returns true if email is allowed, false otherwise
 */
export function isEmailAllowed(email: string | null): boolean {
  if (!email) return false;
  
  // Case-insensitive comparison
  const normalizedEmail = email.toLowerCase().trim();
  return ALLOWED_EMAILS.some(
    allowedEmail => allowedEmail.toLowerCase() === normalizedEmail
  );
}

/**
 * Get all allowed emails (for debugging/admin purposes)
 * @returns Array of allowed email addresses
 */
export function getAllowedEmails(): readonly string[] {
  return ALLOWED_EMAILS;
}

/**
 * Check if allowlist is configured
 * @returns true if at least one email is in the allowlist
 */
export function isAllowlistConfigured(): boolean {
  return ALLOWED_EMAILS.length > 0;
}
