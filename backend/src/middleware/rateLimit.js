const { config } = require('../config/env');

class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  /**
   * Check if request is within rate limit
   * @param {string} userId - User identifier
   * @returns {Object}
   */
  checkLimit(userId) {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];

    // Remove old requests outside the window
    const recentRequests = userRequests.filter(
      time => now - time < config.rateLimit.windowMs
    );

    if (recentRequests.length >= config.rateLimit.maxRequests) {
      const retryAfter = Math.ceil(
        (recentRequests[0] + config.rateLimit.windowMs - now) / 1000
      );
      return { allowed: false, retryAfter };
    }

    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    return { allowed: true };
  }

  /**
   * Express middleware for rate limiting
   */
  middleware() {
    return (req, res, next) => {
      const userId = req.body?.userId || req.params?.userId;

      if (!userId) {
        return next();
      }

      const result = this.checkLimit(userId);

      if (!result.allowed) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: result.retryAfter
        });
      }

      next();
    };
  }
}

module.exports = new RateLimiter();
