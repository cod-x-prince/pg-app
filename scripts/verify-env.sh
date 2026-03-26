#!/bin/bash
# Verify all required environment variables are set

set -e

echo "🔍 Verifying environment variables..."

REQUIRED_VARS=(
  "DATABASE_URL"
  "DIRECT_URL"
  "NEXTAUTH_URL"
  "NEXTAUTH_SECRET"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "RAZORPAY_KEY_ID"
  "RAZORPAY_KEY_SECRET"
  "NEXT_PUBLIC_RAZORPAY_KEY_ID"
  "RESEND_API_KEY"
  "CLOUDINARY_CLOUD_NAME"
  "CLOUDINARY_API_KEY"
  "CLOUDINARY_API_SECRET"
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
  "TURNSTILE_SITE_KEY"
  "TURNSTILE_SECRET_KEY"
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY"
  "UPSTASH_REDIS_REST_URL"
  "UPSTASH_REDIS_REST_TOKEN"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
    echo "❌ Missing: $var"
  else
    echo "✅ Found: $var"
  fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo ""
  echo "❌ Deployment blocked: ${#MISSING_VARS[@]} environment variable(s) missing"
  exit 1
fi

echo ""
echo "✅ All environment variables configured"
