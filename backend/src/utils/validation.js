/**
 * Enhanced input validation and sanitization
 */

/**
 * Common prompt injection patterns to detect
 */
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(previous|above|all)\s+(instructions|prompts?|commands?)/i,
  /forget\s+(previous|above|all)\s+(instructions|prompts?|commands?)/i,
  /system\s*:\s*you\s+are/i,
  /you\s+are\s+now\s+a/i,
  /act\s+as\s+if/i,
  /pretend\s+to\s+be/i,
  /roleplay\s+as/i,
  /\[system\]/i,
  /<\|system\|>/i,
  /###\s*system\s*###/i,
  /```system/i,
];

/**
 * Check if input contains prompt injection attempts
 * @param {string} input - User input
 * @returns {boolean}
 */
function containsPromptInjection(input) {
  if (!input || typeof input !== 'string') return false;
  
  return PROMPT_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Sanitize input to prevent XSS and injection
 * @param {string} input - User input
 * @param {number} maxLength - Maximum allowed length
 * @returns {string}
 */
function sanitizeInput(input, maxLength = 5000) {
  if (typeof input !== 'string') return '';
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Limit length
  sanitized = sanitized.substring(0, maxLength);
  
  return sanitized;
}

/**
 * Validate user input
 * @param {string} input - User input
 * @param {number} maxLength - Maximum allowed length
 * @returns {{valid: boolean, error?: string}}
 */
function validateUserInput(input, maxLength = 5000) {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'Input must be a non-empty string' };
  }

  const trimmed = input.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Input cannot be empty' };
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `Input exceeds maximum length of ${maxLength} characters` };
  }

  if (containsPromptInjection(trimmed)) {
    return { valid: false, error: 'Input contains potentially harmful content' };
  }

  return { valid: true };
}

module.exports = {
  sanitizeInput,
  validateInput: validateUserInput,
  containsPromptInjection
};

