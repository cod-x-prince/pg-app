# 📊 Monitoring & Dashboard Configuration

**Project:** Gharam (PGLife) - Production Monitoring  
**Tools:** Sentry (errors), Vercel Analytics (performance), Custom dashboard  
**Alert Channels:** Email, Slack, PagerDuty (critical)

---

## 📋 Table of Contents

1. [Monitoring Architecture](#monitoring-architecture)
2. [Sentry Configuration](#sentry-configuration)
3. [Performance Monitoring](#performance-monitoring)
4. [Custom Metrics](#custom-metrics)
5. [Alerting Rules](#alerting-rules)
6. [Dashboard Setup](#dashboard-setup)
7. [Log Aggregation](#log-aggregation)

---

## 🏗️ Monitoring Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Production Application                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Next.js  │  │  Prisma  │  │  Redis   │  │ Razorpay │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
└───────┼─────────────┼─────────────┼──────────────┼─────────┘
        │             │             │              │
        ▼             ▼             ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Sentry  │  │  Vercel  │  │  Custom  │  │  Uptime  │  │
│  │  (Errors)│  │Analytics │  │  Logger  │  │  Robot   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
└───────┼─────────────┼─────────────┼──────────────┼─────────┘
        │             │             │              │
        ▼             ▼             ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Alert & Visualization                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Slack   │  │  Email   │  │ Grafana  │  │PagerDuty │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Metrics to Monitor

1. **Application Health**
   - Response time (p50, p95, p99)
   - Error rate (5xx, 4xx)
   - Uptime/availability
   - Request throughput

2. **Business Metrics**
   - Bookings per hour
   - Payment success rate
   - User signups
   - Active listings

3. **Infrastructure**
   - Database connection pool
   - Redis memory usage
   - API rate limit triggers
   - CPU/Memory usage (Vercel functions)

4. **Security**
   - Failed login attempts
   - CSRF violations
   - Rate limit blocks
   - Suspicious IP activity

---

## 🔍 Sentry Configuration

### Enhanced Sentry Setup

**`sentry.server.config.ts`** (Updated)
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Error Sampling (capture all errors)
  sampleRate: 1.0,
  
  // Environment
  environment: process.env.VERCEL_ENV || "development",
  
  // Release tracking (for identifying which deployment caused issues)
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Integrations
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Prisma({ client: prisma }),
  ],
  
  // Before sending events
  beforeSend(event, hint) {
    // Filter out non-critical errors
    if (event.exception) {
      const error = hint.originalException;
      
      // Ignore CSRF errors (expected in normal operation)
      if (error?.message?.includes("CSRF")) {
        return null;
      }
      
      // Ignore rate limit errors (expected)
      if (event.request?.status === 429) {
        return null;
      }
    }
    
    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.authorization;
    }
    
    return event;
  },
  
  // Tag all events with useful context
  beforeBreadcrumb(breadcrumb) {
    // Add custom tags
    if (breadcrumb.category === "http") {
      breadcrumb.data = {
        ...breadcrumb.data,
        environment: process.env.NODE_ENV,
      };
    }
    return breadcrumb;
  },
  
  // Ignore specific errors
  ignoreErrors: [
    "ResizeObserver loop limit exceeded", // Browser noise
    "Non-Error promise rejection captured", // Client-side noise
    "Network request failed", // User connectivity issues
  ],
});
```

**`sentry.client.config.ts`** (Updated)
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Lower sample rate for client-side (more traffic)
  tracesSampleRate: 0.05,
  
  // Capture 100% of errors
  sampleRate: 1.0,
  
  // Replay sessions for debugging (10% of sessions)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0, // Always capture on error
  
  integrations: [
    new Sentry.Replay({
      maskAllText: false, // Show text for debugging
      blockAllMedia: true, // Block images/videos for privacy
    }),
  ],
  
  // Ignore noisy browser errors
  ignoreErrors: [
    "ResizeObserver loop",
    "Non-Error promise rejection",
    "Network request failed",
    "Failed to fetch",
    "Load failed",
  ],
  
  beforeSend(event) {
    // Remove PII from client-side events
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    
    if (event.user) {
      delete event.user.ip_address;
      delete event.user.email;
    }
    
    return event;
  },
});
```

### Sentry Alert Rules

**Create these alerts in Sentry dashboard:**

1. **High Error Rate**
   - Trigger: >10 errors/minute
   - Action: Slack + Email
   - Priority: P2

2. **Payment Verification Failures**
   - Trigger: Any error in `/api/payments/verify`
   - Action: Slack + PagerDuty
   - Priority: P1 (Critical)

3. **Database Connection Errors**
   - Trigger: Prisma connection errors
   - Action: Slack + PagerDuty
   - Priority: P1 (Critical)

4. **User Authentication Issues**
   - Trigger: >50 failed logins/hour
   - Action: Slack
   - Priority: P3

5. **New Release Regression**
   - Trigger: Error rate increases >50% after deployment
   - Action: Slack + Email
   - Priority: P2

---

## ⚡ Performance Monitoring

### Vercel Analytics Configuration

**Enable in `next.config.js`:**
```javascript
module.exports = {
  // ... existing config
  
  // Enable Vercel Analytics
  analyticsId: process.env.VERCEL_ANALYTICS_ID,
  
  // Speed Insights
  speedInsights: {
    enabled: true,
  },
  
  // Web Vitals tracking
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP', 'FID', 'FCP', 'TTFB'],
  },
};
```

**Custom Web Vitals Reporting**

**`src/app/layout.tsx`** (Add Web Vitals tracking)
```typescript
'use client'

import { useReportWebVitals } from 'next/web-vitals'
import * as Sentry from '@sentry/nextjs'

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Send to Sentry
    Sentry.captureMessage(`Web Vital: ${metric.name}`, {
      level: 'info',
      tags: {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
      },
    })

    // Send to custom analytics
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      body: JSON.stringify(metric),
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {
      // Fail silently (don't block user)
    })
  })

  return null
}
```

**`src/app/api/analytics/web-vitals/route.ts`**
```typescript
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const metric = await req.json();
    
    // Log performance metric
    logger.info("Web Vital", {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      url: req.headers.get("referer"),
    });

    // Store in database for aggregation (optional)
    // await prisma.webVital.create({ data: metric })

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### Performance Thresholds

Set these as targets:

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **LCP** (Largest Contentful Paint) | <2.5s | 2.5-4s | >4s |
| **FID** (First Input Delay) | <100ms | 100-300ms | >300ms |
| **CLS** (Cumulative Layout Shift) | <0.1 | 0.1-0.25 | >0.25 |
| **TTFB** (Time to First Byte) | <800ms | 800-1800ms | >1800ms |
| **API Response Time** (p95) | <500ms | 500-1000ms | >1000ms |

---

## 📈 Custom Metrics

### Metrics API Endpoint

**`src/app/api/metrics/route.ts`**
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/metrics
 * Return application metrics (admin only)
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Admin only
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Time ranges
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Fetch metrics in parallel
  const [
    totalUsers,
    totalProperties,
    totalBookings,
    recentSignups,
    recentBookings,
    pendingApprovals,
    paymentSuccessRate,
    activeListings,
  ] = await Promise.all([
    // Total counts
    prisma.user.count(),
    prisma.property.count(),
    prisma.booking.count(),
    
    // Recent activity (last 24h)
    prisma.user.count({
      where: { createdAt: { gte: oneDayAgo } },
    }),
    prisma.booking.count({
      where: { createdAt: { gte: oneDayAgo } },
    }),
    
    // Pending work
    prisma.property.count({
      where: { isVerified: false },
    }),
    
    // Payment metrics (last 24h)
    prisma.booking.findMany({
      where: { createdAt: { gte: oneDayAgo } },
      select: { status: true },
    }).then((bookings) => {
      const total = bookings.length;
      const confirmed = bookings.filter(b => b.status === "CONFIRMED").length;
      return total > 0 ? (confirmed / total) * 100 : 0;
    }),
    
    // Active listings
    prisma.property.count({
      where: { isActive: true, isVerified: true },
    }),
  ]);

  // Redis metrics
  const redisInfo = await redis.info("memory");
  const redisMemory = redisInfo.match(/used_memory_human:(.+)/)?.[1] || "unknown";

  return NextResponse.json({
    timestamp: now.toISOString(),
    
    // Totals
    totals: {
      users: totalUsers,
      properties: totalProperties,
      bookings: totalBookings,
      activeListings,
    },
    
    // Recent activity
    activity_24h: {
      signups: recentSignups,
      bookings: recentBookings,
    },
    
    // Health indicators
    health: {
      pendingApprovals,
      paymentSuccessRate: `${paymentSuccessRate.toFixed(1)}%`,
      redisMemory,
    },
  });
}
```

### Prometheus Metrics Exporter (Optional)

**`src/app/api/metrics/prometheus/route.ts`**
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/metrics/prometheus
 * Prometheus-compatible metrics endpoint
 */
export async function GET() {
  const metrics: string[] = [];

  // Business metrics
  const userCount = await prisma.user.count();
  const propertyCount = await prisma.property.count();
  const bookingCount = await prisma.booking.count();

  metrics.push(`# TYPE gharam_users_total counter`);
  metrics.push(`gharam_users_total ${userCount}`);
  
  metrics.push(`# TYPE gharam_properties_total counter`);
  metrics.push(`gharam_properties_total ${propertyCount}`);
  
  metrics.push(`# TYPE gharam_bookings_total counter`);
  metrics.push(`gharam_bookings_total ${bookingCount}`);

  // Active listings
  const activeListings = await prisma.property.count({
    where: { isActive: true, isVerified: true },
  });
  metrics.push(`# TYPE gharam_active_listings gauge`);
  metrics.push(`gharam_active_listings ${activeListings}`);

  // Pending approvals
  const pendingApprovals = await prisma.property.count({
    where: { isVerified: false },
  });
  metrics.push(`# TYPE gharam_pending_approvals gauge`);
  metrics.push(`gharam_pending_approvals ${pendingApprovals}`);

  return new NextResponse(metrics.join('\n'), {
    headers: { 'Content-Type': 'text/plain' },
  });
}
```

---

## 🚨 Alerting Rules

### Slack Webhook Integration

**`src/lib/alerts.ts`**
```typescript
import { logger } from "./logger";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

interface AlertMessage {
  title: string;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  details?: Record<string, any>;
}

export async function sendAlert(alert: AlertMessage) {
  if (!SLACK_WEBHOOK_URL) {
    logger.warn("Slack webhook not configured, skipping alert");
    return;
  }

  const color = {
    info: "#36a64f",
    warning: "#ff9800",
    error: "#f44336",
    critical: "#d32f2f",
  }[alert.severity];

  const emoji = {
    info: "ℹ️",
    warning: "⚠️",
    error: "❌",
    critical: "🚨",
  }[alert.severity];

  const payload = {
    attachments: [
      {
        color,
        title: `${emoji} ${alert.title}`,
        text: alert.message,
        fields: alert.details
          ? Object.entries(alert.details).map(([key, value]) => ({
              title: key,
              value: String(value),
              short: true,
            }))
          : [],
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      logger.error("Failed to send Slack alert", { status: response.status });
    }
  } catch (error) {
    logger.error("Error sending Slack alert", error);
  }
}

// Predefined alerts
export const Alerts = {
  paymentFailed: (bookingId: string, error: string) =>
    sendAlert({
      title: "Payment Verification Failed",
      severity: "critical",
      message: "A payment verification failed. Investigate immediately.",
      details: { bookingId, error, timestamp: new Date().toISOString() },
    }),

  databaseConnectionLost: () =>
    sendAlert({
      title: "Database Connection Lost",
      severity: "critical",
      message: "Cannot connect to PostgreSQL database.",
      details: { timestamp: new Date().toISOString() },
    }),

  rateLimitSpike: (endpoint: string, count: number) =>
    sendAlert({
      title: "Rate Limit Spike Detected",
      severity: "warning",
      message: `Endpoint ${endpoint} is being rate limited ${count} times/hour.`,
      details: { endpoint, count, timestamp: new Date().toISOString() },
    }),

  highErrorRate: (errorCount: number, timeWindow: string) =>
    sendAlert({
      title: "High Error Rate Detected",
      severity: "error",
      message: `${errorCount} errors in the last ${timeWindow}.`,
      details: { errorCount, timeWindow, timestamp: new Date().toISOString() },
    }),

  deploymentSuccess: (version: string) =>
    sendAlert({
      title: "Deployment Successful",
      severity: "info",
      message: `Version ${version} deployed successfully.`,
      details: { version, timestamp: new Date().toISOString() },
    }),
};
```

### Alert Monitoring Script

**`scripts/check-alerts.sh`**
```bash
#!/bin/bash
# Run this as a cron job to monitor application health

set -e

API_URL="https://gharam.com/api/metrics"

# Fetch metrics
METRICS=$(curl -s "$API_URL" -H "Authorization: Bearer $ADMIN_TOKEN")

# Parse metrics
PENDING_APPROVALS=$(echo "$METRICS" | jq -r '.health.pendingApprovals')
PAYMENT_SUCCESS_RATE=$(echo "$METRICS" | jq -r '.health.paymentSuccessRate' | sed 's/%//')

# Check thresholds
if [ "$PENDING_APPROVALS" -gt 50 ]; then
  echo "⚠️  Warning: $PENDING_APPROVALS pending approvals"
  # Send alert
  curl -X POST "$SLACK_WEBHOOK_URL" -d "{\"text\":\"⚠️ $PENDING_APPROVALS properties pending approval\"}"
fi

if (( $(echo "$PAYMENT_SUCCESS_RATE < 90" | bc -l) )); then
  echo "❌ Critical: Payment success rate is $PAYMENT_SUCCESS_RATE%"
  curl -X POST "$SLACK_WEBHOOK_URL" -d "{\"text\":\"🚨 Payment success rate dropped to $PAYMENT_SUCCESS_RATE%\"}"
fi

echo "✅ Health check complete"
```

**Make executable and add to cron:**
```bash
chmod +x scripts/check-alerts.sh

# Add to crontab (run every 15 minutes)
*/15 * * * * /path/to/scripts/check-alerts.sh
```

---

## 📊 Dashboard Setup

### Grafana Dashboard JSON

**`monitoring/grafana-dashboard.json`**
```json
{
  "dashboard": {
    "title": "Gharam Production Dashboard",
    "panels": [
      {
        "title": "Total Users",
        "type": "stat",
        "targets": [
          {
            "expr": "gharam_users_total",
            "refId": "A"
          }
        ]
      },
      {
        "title": "Active Listings",
        "type": "stat",
        "targets": [
          {
            "expr": "gharam_active_listings",
            "refId": "A"
          }
        ]
      },
      {
        "title": "API Response Time (p95)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "refId": "A"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "refId": "A"
          }
        ]
      },
      {
        "title": "Bookings per Hour",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(gharam_bookings_total[1h])",
            "refId": "A"
          }
        ]
      },
      {
        "title": "Payment Success Rate",
        "type": "gauge",
        "targets": [
          {
            "expr": "(sum(rate(bookings_confirmed_total[1h])) / sum(rate(bookings_created_total[1h]))) * 100",
            "refId": "A"
          }
        ],
        "thresholds": [
          { "value": 95, "color": "green" },
          { "value": 90, "color": "yellow" },
          { "value": 0, "color": "red" }
        ]
      }
    ]
  }
}
```

### Simple HTML Dashboard

**`public/dashboard.html`** (Internal admin dashboard)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gharam Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-50">
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-8">Gharam Production Dashboard</h1>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-4 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm">Total Users</h3>
        <p id="total-users" class="text-3xl font-bold mt-2">...</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm">Active Listings</h3>
        <p id="active-listings" class="text-3xl font-bold mt-2">...</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm">Bookings (24h)</h3>
        <p id="bookings-24h" class="text-3xl font-bold mt-2">...</p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm">Payment Success</h3>
        <p id="payment-success" class="text-3xl font-bold mt-2">...</p>
      </div>
    </div>
    
    <!-- Charts -->
    <div class="grid grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Signups Last 7 Days</h3>
        <canvas id="signups-chart"></canvas>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Bookings Last 7 Days</h3>
        <canvas id="bookings-chart"></canvas>
      </div>
    </div>
  </div>

  <script>
    // Fetch metrics
    async function fetchMetrics() {
      const response = await fetch('/api/metrics');
      return response.json();
    }

    // Update dashboard
    async function updateDashboard() {
      const data = await fetchMetrics();
      
      document.getElementById('total-users').textContent = data.totals.users;
      document.getElementById('active-listings').textContent = data.totals.activeListings;
      document.getElementById('bookings-24h').textContent = data.activity_24h.bookings;
      document.getElementById('payment-success').textContent = data.health.paymentSuccessRate;
    }

    // Initial load
    updateDashboard();
    
    // Auto-refresh every 30 seconds
    setInterval(updateDashboard, 30000);
  </script>
</body>
</html>
```

---

## 📝 Log Aggregation

### Vercel Log Drains (Recommended)

**Setup log drain to external service:**

1. **Option 1: Datadog**
   ```bash
   vercel log-drains add datadog \
     --endpoint https://http-intake.logs.datadoghq.com/v1/input \
     --headers "DD-API-KEY=your-api-key"
   ```

2. **Option 2: LogDNA**
   ```bash
   vercel log-drains add https \
     --endpoint https://logs.logdna.com/logs/ingest \
     --headers "apikey=your-api-key"
   ```

3. **Option 3: Custom endpoint**
   ```bash
   vercel log-drains add https \
     --endpoint https://your-server.com/logs
   ```

### Custom Log Aggregator

**`src/app/api/logs/route.ts`**
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/logs
 * Receive logs from Vercel log drain
 */
export async function POST(req: Request) {
  try {
    const logs = await req.json();
    
    // Store in database or forward to external service
    for (const log of logs) {
      if (log.type === "stdout" && log.level === "error") {
        // Store error logs
        await prisma.errorLog.create({
          data: {
            timestamp: new Date(log.timestamp),
            message: log.message,
            source: log.source,
            metadata: log,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

---

## 🎯 Monitoring SLA

### Target Metrics
- **Uptime:** 99.9% (43 minutes downtime/month max)
- **Response Time (p95):** <500ms
- **Error Rate:** <0.1%
- **Payment Success Rate:** >95%
- **Alert Response Time:** <5 minutes

### On-Call Rotation
- **Primary:** Developer on call (24/7)
- **Secondary:** DevOps engineer
- **Escalation:** CTO (critical issues only)

### Incident Response SLA
- **P1 (Critical):** Response within 15 minutes
- **P2 (High):** Response within 1 hour
- **P3 (Medium):** Response within 4 hours
- **P4 (Low):** Response within 24 hours

---

## 📖 Monitoring Checklist

**Daily:**
- [ ] Check Sentry for new errors
- [ ] Review deployment metrics
- [ ] Check payment success rate
- [ ] Verify no pending critical alerts

**Weekly:**
- [ ] Review performance trends
- [ ] Check database query performance
- [ ] Review rate limit patterns
- [ ] Audit security logs

**Monthly:**
- [ ] Review SLA compliance
- [ ] Update alert thresholds
- [ ] Optimize slow queries
- [ ] Clean up old logs

---

**What gets measured gets improved.** 📊

Let's monitor everything! 🚀
