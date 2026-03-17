"use client";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Only import Sentry in production to avoid module errors in dev
    if (process.env.NODE_ENV === "production") {
      import("@sentry/nextjs")
        .then(({ captureException }) => {
          captureException(error);
        })
        .catch(() => {});
    } else {
      console.error("[GlobalError]", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
            padding: "1rem",
            background: "#f9fafb",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <div
              style={{
                width: 64,
                height: 64,
                background: "#fee2e2",
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 28,
              }}
            >
              ⚠️
            </div>
            <h1 style={{ color: "#1B3B6F", marginBottom: 8, fontSize: 22 }}>
              Something went wrong
            </h1>
            <p style={{ color: "#6b7280", marginBottom: 24, lineHeight: 1.6 }}>
              Our team has been notified. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                background: "#1B3B6F",
                color: "white",
                border: "none",
                padding: "12px 28px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                marginRight: 12,
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                color: "#1B3B6F",
                fontSize: 14,
                textDecoration: "underline",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
