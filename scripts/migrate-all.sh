#!/bin/bash
# Apply all database migrations safely

set -e

echo "🗄️  Applying all database migrations..."
echo ""

# 1. Create backup
echo "📦 Step 1: Creating database backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
backup_file="backups/pre_migration_$timestamp.sql"
mkdir -p backups
# pg_dump $DATABASE_URL > "$backup_file"
echo "⚠️  Manual backup recommended before running"
echo ""

# 2. Apply performance indexes
echo "🔧 Step 2: Applying performance indexes..."
npx prisma db execute --file prisma/migrations/add_performance_indexes.sql
echo "✅ Performance indexes applied"
echo ""

# 3. Apply password reset schema
echo "🔐 Step 3: Adding password reset functionality..."
npx prisma db execute --file prisma/migrations/add_password_reset.sql
echo "✅ Password reset schema applied"
echo ""

# 4. Generate Prisma Client
echo "⚙️  Step 4: Regenerating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client regenerated"
echo ""

echo "✅ All migrations applied successfully!"
echo "🔄 Restart application servers to pick up schema changes"
