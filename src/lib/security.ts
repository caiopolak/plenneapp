/**
 * Security utilities for the application
 */

// ============================================
// Rate Limiting (Client-side)
// ============================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Simple client-side rate limiting
 * Returns true if action is allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxAttempts) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Reset rate limit for a key
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

// ============================================
// Input Sanitization
// ============================================

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

/**
 * Remove all HTML tags from a string
 */
export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize for safe URL usage
 */
export function sanitizeForUrl(text: string): string {
  return encodeURIComponent(text.trim().slice(0, 500));
}

/**
 * Validate and sanitize external URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// ============================================
// Sensitive Data Handling
// ============================================

/**
 * Mask sensitive data for logging (e.g., email, phone)
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const maskedLocal = local.slice(0, 2) + '***';
  return `${maskedLocal}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (phone.length < 4) return '***';
  return '***' + phone.slice(-4);
}

/**
 * Safe console logging that redacts sensitive fields
 */
export function safeLog(
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>
): void {
  // Only log in development
  if (import.meta.env.PROD) return;

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  const sanitizedData = data ? { ...data } : undefined;

  if (sanitizedData) {
    for (const key of Object.keys(sanitizedData)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitizedData[key] = '[REDACTED]';
      }
      if (key === 'email' && typeof sanitizedData[key] === 'string') {
        sanitizedData[key] = maskEmail(sanitizedData[key] as string);
      }
    }
  }

  console[level](`[Security] ${message}`, sanitizedData || '');
}

// ============================================
// CSRF Protection
// ============================================

/**
 * Generate a simple CSRF token (for client-side validation)
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// ============================================
// Session Validation
// ============================================

/**
 * Check if a session is still valid (not expired)
 */
export function isSessionValid(expiresAt: number | undefined): boolean {
  if (!expiresAt) return false;
  return Date.now() < expiresAt * 1000;
}

// ============================================
// Content Security
// ============================================

/**
 * Validate file type for uploads
 */
export function isAllowedFileType(
  filename: string,
  allowedExtensions: string[] = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf']
): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? allowedExtensions.includes(ext) : false;
}

/**
 * Validate file size (in bytes)
 */
export function isValidFileSize(size: number, maxSizeMB: number = 5): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return size <= maxBytes;
}
