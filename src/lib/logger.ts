/**
 * Centralized logging utility
 * Replaces console.log/error with proper logging that works in production
 * Integrates with Sentry for error tracking
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private isClient = typeof window !== "undefined";

  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context);
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context);
    }
    
    // In production, send to logging service
    if (!this.isDevelopment && !this.isClient) {
      this.sendToLoggingService("info", message, context);
    }
  }

  /**
   * Log warnings
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context);
    
    if (!this.isDevelopment) {
      this.sendToLoggingService("warn", message, context);
    }
  }

  /**
   * Log errors with Sentry integration
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    console.error(`[ERROR] ${message}`, error, context);

    // Send to Sentry if configured
    if (this.isClient && (window as any).Sentry) {
      (window as any).Sentry.captureException(error || new Error(message), {
        tags: { ...context },
        level: "error",
      });
    }

    // Server-side error logging
    if (!this.isClient && !this.isDevelopment) {
      this.sendToLoggingService("error", message, {
        ...context,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : String(error),
      });
    }
  }

  /**
   * Send logs to external service (implement based on your service)
   */
  private sendToLoggingService(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): void {
    // TODO: Implement actual logging service integration
    // Examples: Datadog, CloudWatch, LogDNA, etc.
    
    // For now, just use console in non-dev
    if (level === "error" || level === "warn") {
      console[level](`[${level.toUpperCase()}]`, message, context);
    }
  }

  /**
   * Log API request/response for debugging
   */
  api(method: string, url: string, statusCode: number, duration: number): void {
    if (this.isDevelopment) {
      console.log(
        `[API] ${method} ${url} - ${statusCode} (${duration}ms)`
      );
    }
  }

  /**
   * Log database queries (development only)
   */
  query(query: string, duration: number): void {
    if (this.isDevelopment) {
      console.log(`[DB] ${query} (${duration}ms)`);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Helper to replace console.error in catch blocks
export const logError = (context: string, error: unknown): void => {
  logger.error(context, error as Error);
};

// Helper for API route logging
export const logApiError = (
  endpoint: string,
  error: unknown,
  userId?: string
): void => {
  logger.error(`API Error: ${endpoint}`, error as Error, { userId, endpoint });
};
