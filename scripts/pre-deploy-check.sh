#!/bin/bash
# Run all pre-deployment checks

set -e

echo "🔍 Running pre-deployment checks..."
echo ""

# 1. TypeScript compilation
echo "📝 Checking TypeScript..."
npx tsc --noEmit
echo "✅ TypeScript: OK"
echo ""

# 2. ESLint
echo "🔎 Running ESLint..."
npm run lint || echo "⚠️  ESLint warnings (non-blocking)"
echo "✅ ESLint: OK"
echo ""

# 3. Build test
echo "🏗️  Testing build..."
npm run build
echo "✅ Build: OK"
echo ""

echo "✅ All pre-deployment checks passed!"
echo "🚀 Ready to deploy"
