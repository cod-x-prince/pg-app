/**
 * Environment Variable Validation
 * Run at application startup to ensure all required env vars are present
 * Prevents runtime crashes due to missing configuration
 */

const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RESEND_API_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

const OPTIONAL_ENV_VARS = [
  "DIRECT_URL", // For Prisma migrations
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
] as const;

interface ValidationResult {
  valid: boolean;
  missing: string[];
  missingOptional: string[];
}

export function validateEnv(): ValidationResult {
  const missing: string[] = [];
  const missingOptional: string[] = [];

  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check optional variables (for warnings)
  for (const varName of OPTIONAL_ENV_VARS) {
    if (!process.env[varName]) {
      missingOptional.push(varName);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    missingOptional,
  };
}

export function validateEnvOrThrow(): void {
  const result = validateEnv();

  if (!result.valid) {
    console.error("❌ Missing required environment variables:");
    result.missing.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error("\n💡 Copy .env.example to .env and fill in the values\n");
    throw new Error("Missing required environment variables. Application cannot start.");
  }

  if (result.missingOptional.length > 0) {
    console.warn("⚠️  Missing optional environment variables (some features may be disabled):");
    result.missingOptional.forEach((varName) => {
      console.warn(`   - ${varName}`);
    });
  }

  console.log("✅ Environment variables validated successfully");
}

// Run validation in non-production environments
if (process.env.NODE_ENV !== "production") {
  try {
    validateEnvOrThrow();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
