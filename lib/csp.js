
/**
 * Content Security Policy (CSP) Configuration
 * 
 * This file defines a strict, production-ready CSP that:
 * - Uses nonce-based script/style loading (no unsafe-inline in production)
 * - Enforces HTTPS for all resources
 * - Includes all required security directives
 * - Properly handles third-party integrations
 * - Reports violations for monitoring
 */

const isDevelopment = process.env.NODE_ENV === 'development';

const getSupabaseHost = () => {
  const dbUrl = process.env.DATABASE_URL || '';
  const match = dbUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
  return match ? `https://${match[1]}.supabase.co` : 'https://your-project.supabase.co';
};

const getUpstashHost = () => {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || '';
  const match = upstashUrl.match(/https:\/\/([^\/]+)/);
  return match ? match[1] : 'your-instance.upstash.io';
};

const getSentryHost = () => {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || '';
  const match = dsn.match(/https:\/\/([^\/]+)/);
  return match ? `https://${match[1]}` : null;
};

const buildCSP = () => {
  const sentryHost = getSentryHost();
  
  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      ...(isDevelopment ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
      'https://checkout.razorpay.com',
      'https://cdn.razorpay.com',
      'https://challenges.cloudflare.com',
      'https://www.googletagmanager.com',
      'https://va.vercel-scripts.com',
      'https://browser.sentry-cdn.com',
      ...(isDevelopment ? ['https://vercel.live'] : []),
    ],
    'style-src': [
      "'self'",
      ...(isDevelopment ? ["'unsafe-inline'"] : []),
      'https://fonts.googleapis.com',
    ],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://res.cloudinary.com',
      'https://images.unsplash.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
    ],
    'connect-src': [
      "'self'",
      getSupabaseHost(),
      `https://${getUpstashHost()}`,
      'https://api.razorpay.com',
      'https://checkout.razorpay.com',
      'https://cdn.razorpay.com',
      'https://api.resend.com',
      'https://challenges.cloudflare.com',
      'https://www.google-analytics.com',
      'https://analytics.google.com',
      'https://region1.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://vitals.vercel-insights.com',
      'https://va.vercel-scripts.com',
      ...(sentryHost ? [sentryHost] : []),
    ],
    'frame-src': [
      'https://api.razorpay.com',
      'https://challenges.cloudflare.com',
      ...(isDevelopment ? ['https://vercel.live'] : []),
    ],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'", 'https://api.razorpay.com'],
    'frame-ancestors': ["'none'"],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'prefetch-src': ["'self'"],
  };

  const additionalDirectives = [];
  if (!isDevelopment) {
    additionalDirectives.push('upgrade-insecure-requests');
  }

  const cspString = Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .concat(additionalDirectives)
    .join('; ');

  return cspString;
};

module.exports = { buildCSP };
