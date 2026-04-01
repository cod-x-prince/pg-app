import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";

export interface ComingSoonFeature {
  key: string;
  title: string;
  description: string;
  active: boolean;
}

const MAINTENANCE_KEY = "sys:maintenance:enabled";

const DEFAULT_COMING_SOON_FEATURES: ComingSoonFeature[] = [
  {
    key: "digilocker_kyc",
    title: "DigiLocker KYC",
    description: "Faster identity verification for owners and tenants.",
    active: false,
  },
  {
    key: "whatsapp_notifications",
    title: "WhatsApp Notifications",
    description: "Booking and approval alerts on WhatsApp.",
    active: false,
  },
  {
    key: "broker_portal",
    title: "Broker Portal",
    description: "Dedicated workflow and analytics for broker accounts.",
    active: false,
  },
  {
    key: "hindi_localization",
    title: "Hindi Language Support",
    description: "Localized UI and key flows for Hindi-speaking users.",
    active: false,
  },
  {
    key: "mobile_app",
    title: "Mobile App",
    description: "Native tenant and owner app experience.",
    active: false,
  },
];

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redis;
}

export function getDefaultComingSoonFeatures(): ComingSoonFeature[] {
  return DEFAULT_COMING_SOON_FEATURES;
}

export async function getMaintenanceMode(): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;

  try {
    const value = await client.get<string>(MAINTENANCE_KEY);
    return value === "1";
  } catch (err) {
    logger.error("[SystemControl] Failed to read maintenance mode", err);
    return false;
  }
}

export async function setMaintenanceMode(enabled: boolean): Promise<void> {
  const client = getRedis();
  if (!client) {
    throw new Error(
      "Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
  }

  await client.set(MAINTENANCE_KEY, enabled ? "1" : "0");
}
