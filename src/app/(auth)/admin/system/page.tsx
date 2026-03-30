"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { SessionUser } from "@/types";

interface ComingSoonFeature {
  key: string;
  title: string;
  description: string;
  active: boolean;
}

interface SystemResponse {
  maintenance: boolean;
  features: ComingSoonFeature[];
  redisConfigured: boolean;
}

export default function AdminSystemPage() {
  const { data: session, status } = useSession();
  const user = session?.user as SessionUser | undefined;
  const isAdmin = user?.role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const [redisConfigured, setRedisConfigured] = useState(true);
  const [features, setFeatures] = useState<ComingSoonFeature[]>([]);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    fetch("/api/admin/system")
      .then((r) => r.json())
      .then((data: SystemResponse) => {
        setMaintenance(Boolean(data.maintenance));
        setRedisConfigured(Boolean(data.redisConfigured));
        setFeatures(Array.isArray(data.features) ? data.features : []);
      })
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const toggleMaintenance = async () => {
    setSaving(true);
    setMsg("");

    try {
      const next = !maintenance;
      const res = await fetch("/api/admin/system", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenance: next }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Failed to update maintenance mode");
      } else {
        setMaintenance(next);
        setMsg(next ? "Maintenance mode enabled" : "Maintenance mode disabled");
      }
    } catch {
      setMsg("Failed to update maintenance mode");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <>
        <Navbar forceWhite />
        <main>
          <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
            <p className="font-body text-muted-foreground">
              Loading system controls...
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Navbar forceWhite />
        <main>
          <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
            <div className="text-center">
              <h1 className="font-display font-bold text-2xl text-foreground mb-2">
                Access Denied
              </h1>
              <p className="font-body text-sm text-muted-foreground">
                Admin access required.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar forceWhite />
      <main>
        <div className="min-h-screen bg-background pt-16">
          <div className="bg-popover border-b border-border">
            <div className="section-wrap py-8 flex items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-bold text-2xl text-foreground">
                  System Control
                </h1>
                <p className="font-body text-sm text-muted-foreground">
                  Maintenance mode and feature rollout visibility.
                </p>
              </div>
              <Link href="/admin" className="btn-outline btn-sm">
                Back to Admin
              </Link>
            </div>
          </div>

          <div className="section-wrap py-8 space-y-6">
            <div className="rounded-xl bg-popover shadow-soft p-6 border border-border">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-display font-semibold text-lg text-foreground mb-1">
                    Maintenance Mode
                  </h2>
                  <p className="font-body text-sm text-muted-foreground">
                    When enabled, non-admin users are redirected to the
                    maintenance page.
                  </p>
                  {!redisConfigured && (
                    <p className="font-body text-xs text-destructive mt-2">
                      Redis is not configured. Set UPSTASH_REDIS_REST_URL and
                      UPSTASH_REDIS_REST_TOKEN.
                    </p>
                  )}
                </div>
                <button
                  onClick={toggleMaintenance}
                  disabled={saving || !redisConfigured}
                  className={
                    maintenance ? "btn-danger btn-sm" : "btn-primary btn-sm"
                  }
                >
                  {saving
                    ? "Updating..."
                    : maintenance
                      ? "Disable Maintenance"
                      : "Enable Maintenance"}
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`badge ${maintenance ? "badge-danger" : "badge-success"}`}
                >
                  {maintenance
                    ? "LIVE: Maintenance ON"
                    : "LIVE: Maintenance OFF"}
                </span>
              </div>

              {msg && (
                <p className="font-body text-sm mt-3 text-foreground">{msg}</p>
              )}
            </div>

            <div className="rounded-xl bg-popover shadow-soft p-6 border border-border">
              <h2 className="font-display font-semibold text-lg text-foreground mb-1">
                Coming Soon Features
              </h2>
              <p className="font-body text-sm text-muted-foreground mb-4">
                These are currently inactive and can be shown on the public
                coming-soon page.
              </p>

              <div className="space-y-3">
                {features.map((feature) => (
                  <div
                    key={feature.key}
                    className="rounded-lg border border-border p-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h3 className="font-display font-semibold text-sm text-foreground">
                        {feature.title}
                      </h3>
                      <p className="font-body text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    <span
                      className={`badge ${feature.active ? "badge-success" : "badge-pending"}`}
                    >
                      {feature.active ? "Active" : "Not Active"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-popover shadow-soft p-6 border border-border">
              <h2 className="font-display font-semibold text-lg text-foreground mb-2">
                Monitoring Panel Status
              </h2>
              <p className="font-body text-sm text-muted-foreground mb-3">
                No dedicated monitoring dashboard is currently configured in
                this repository.
              </p>
              <p className="font-body text-sm text-muted-foreground mb-2">
                Suggested checks:
              </p>
              <ul className="font-body text-sm text-foreground space-y-1">
                <li>1. API health snapshot: /api/stats</li>
                <li>2. Maintenance page: /maintenance</li>
                <li>3. Error tracking: Sentry (if DSN configured)</li>
                <li>4. Deployment/runtime logs: Vercel dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
