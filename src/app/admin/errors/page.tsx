"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/types";

export default function AdminErrorsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as SessionUser | undefined;

  if (!user || user.role !== "ADMIN") {
    if (typeof window !== "undefined") router.push("/");
    return null;
  }

  return (
    <div className="section-wrap py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display font-bold text-2xl mb-6">
          Error Monitoring
        </h1>

        <div className="grid gap-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-lg mb-4">Sentry Dashboard</h2>
            <p className="text-sm text-muted-foreground mb-4">
              View detailed error reports, stack traces, and user impact
              analysis.
            </p>
            <a
              href="https://sentry.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block"
            >
              Open Sentry Dashboard →
            </a>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-lg mb-4">System Health</h2>
            <HealthCheck />
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthCheck() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ status: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="animate-pulse bg-muted h-24 rounded-lg" />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Overall Status</span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            status?.status === "healthy"
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {status?.status || "Unknown"}
        </span>
      </div>

      {status?.checks &&
        Object.entries(status.checks).map(([service, check]: [string, any]) => (
          <div
            key={service}
            className="flex items-center justify-between py-2 border-t border-border"
          >
            <span className="text-sm capitalize">{service}</span>
            <span
              className={`text-xs px-2 py-1 rounded ${
                check.status === "healthy"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {check.status}
            </span>
          </div>
        ))}

      <p className="text-xs text-muted-foreground pt-2">
        Last checked:{" "}
        {status?.timestamp
          ? new Date(status.timestamp).toLocaleString("en-IN")
          : "N/A"}
      </p>
    </div>
  );
}
