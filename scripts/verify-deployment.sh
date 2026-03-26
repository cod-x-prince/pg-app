#!/bin/bash
# Verify production deployment is healthy

set -e

PROD_URL=${1:-https://gharam.com}

echo "🔍 Verifying deployment at $PROD_URL..."
echo ""

# 1. Health check
echo "❤️  Checking application health..."
HEALTH_STATUS=$(curl -s "$PROD_URL/api/health" | jq -r '.status' 2>/dev/null || echo "error")
if [ "$HEALTH_STATUS" = "healthy" ]; then
  echo "✅ Health check: OK"
else
  echo "❌ Health check: FAILED"
  curl -s "$PROD_URL/api/health" | jq '.' || echo "Could not parse response"
  exit 1
fi
echo ""

# 2. Homepage loads
echo "🏠 Checking homepage..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/")
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Homepage: OK"
else
  echo "❌ Homepage: FAILED ($HTTP_STATUS)"
  exit 1
fi
echo ""

# 3. API endpoint test
echo "🔌 Checking API..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/api/properties?city=Mumbai")
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ API: OK"
else
  echo "❌ API: FAILED ($HTTP_STATUS)"
  exit 1
fi
echo ""

echo "✅ All verification checks passed!"
echo "🎉 Deployment is healthy"
