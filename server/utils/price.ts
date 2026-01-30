/**
 * server/utils/price.ts
 * 
 * Centralized utility for handling price normalization and validation.
 * Ensures consistent handling of currency values (stored in cents).
 */

/**
 * Normalizes a price input into an integer (cents).
 * Handles strings, numbers, and potential floating point issues.
 */
export function normalizePrice(input: any): number {
  if (typeof input === 'string') {
    // If it's a string, attempt to parse it. 
    // Handle cases like "19.99" by converting to cents safely.
    const parsed = parseFloat(input);
    if (isNaN(parsed)) return 0;
    return Math.round(parsed * 100);
  }
  
  if (typeof input === 'number') {
    // If it's already a number, ensure it's an integer representing cents
    // If it's a float (e.g., 19.99), convert to cents. 
    // If it's > 1000 and int, it might already be cents. 
    // However, the rule should be consistent: 
    // We expect the input to be the "human" value in many cases, or already cents.
    // For this project, prices are stored as Int (cents).
    // If the input is a float, we treat it as dollars.
    if (!Number.isInteger(input)) {
        return Math.round(input * 100);
    }
    return input;
  }
  
  return 0;
}

/**
 * Validates that a price (in cents) is a safe, non-negative integer.
 */
export function validatePrice(price: any): boolean {
  return (
    typeof price === 'number' &&
    Number.isInteger(price) &&
    price >= 0 &&
    Number.isSafeInteger(price)
  );
}

/**
 * Formats a cent-based price into a human-readable USD string.
 */
export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}
