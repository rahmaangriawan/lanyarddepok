/**
 * Utility to manage wishlist state in localStorage with a 1-year expiration
 * and client-side rate limiting (max 4 actions per 60 seconds).
 */

interface WishlistData {
  skus: string[];
  expiresAt: number;
}

const WISHLIST_KEY = "wishlist";
const RATE_LIMIT_KEY = "wishlist_rate_limit_timestamps";
const EXPIRY_TIME = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
const RATE_LIMIT_WINDOW = 60000; // 60 seconds
const MAX_ACTIONS = 4;

/**
 * Retrieves the list of SKU strings from the wishlist.
 * Automatically handles migration from old format (string[]) and checks for expiration.
 */
export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    // Old format migration (array of strings)
    if (Array.isArray(parsed)) {
      saveWishlist(parsed);
      return parsed;
    }

    // New format with expiration check
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.skus)) {
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        // Expired: Clear wishlist
        localStorage.removeItem(WISHLIST_KEY);
        return [];
      }
      return parsed.skus;
    }

    return [];
  } catch (e) {
    console.error("Failed to retrieve wishlist from storage", e);
    return [];
  }
}

/**
 * Saves the list of SKU strings to the wishlist with a 1-year expiration timestamp.
 */
export function saveWishlist(skus: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const data: WishlistData = {
      skus,
      expiresAt: Date.now() + EXPIRY_TIME
    };
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save wishlist to storage", e);
  }
}

/**
 * Check if user is allowed to perform a wishlist action (add/remove).
 * Limits to 4 actions within a rolling 60-second window.
 * Persists timestamps in sessionStorage to prevent bypass via simple F5 refresh.
 */
export function checkRateLimit(): { allowed: boolean; waitTimeSec?: number } {
  if (typeof window === "undefined") return { allowed: true };

  const now = Date.now();
  let timestamps: number[] = [];

  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
    if (raw) {
      timestamps = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse rate limit timestamps", e);
  }

  // Filter out timestamps outside the rolling window
  timestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);

  if (timestamps.length >= MAX_ACTIONS) {
    const oldestTimestamp = timestamps[0];
    const waitTimeSec = Math.ceil((RATE_LIMIT_WINDOW - (now - oldestTimestamp)) / 1000);
    return { allowed: false, waitTimeSec };
  }

  // Record current action timestamp
  timestamps.push(now);
  try {
    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps));
  } catch (e) {
    console.error("Failed to save rate limit timestamps", e);
  }

  return { allowed: true };
}
