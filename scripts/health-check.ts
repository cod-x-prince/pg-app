/**
 * PGLife Production Health Check
 * Tests every route and API endpoint against your live Vercel deployment
 *
 * Usage: npx tsx scripts/health-check.ts https://pg-app-i1h8.vercel.app
 */

const BASE_URL = process.argv[2] || "https://pg-app-i1h8.vercel.app";

interface r {
  route: string;
  method: string;
  status: number;
  ok: boolean;
  ms: number;
  error?: string;
  note?: string;
}

const results: r[] = [];
let passed = 0;
let failed = 0;

async function check(
  method: string,
  path: string,
  options: {
    body?: object;
    expectedStatus?: number;
    headers?: Record<string, string>;
    note?: string;
  } = {},
): Promise<r> {
  const { expectedStatus = 200, body, headers = {}, note } = options;
  const url = `${BASE_URL}${path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "PGLife-HealthCheck/1.0",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      redirect: "manual",
    });
    const ms = Date.now() - start;
    return {
      route: path,
      method,
      status: res.status,
      ok: res.status === expectedStatus,
      ms,
      note,
    };
  } catch (err: any) {
    return {
      route: path,
      method,
      status: 0,
      ok: false,
      ms: Date.now() - start,
      error: err.message,
      note,
    };
  }
}

function log(r: r) {
  const icon = r.ok ? "OK " : r.status === 0 ? "ERR" : "FAI";
  const time = r.ms > 3000 ? `SLOW ${r.ms}ms` : `${r.ms}ms`;
  const note = r.note ? ` (${r.note})` : "";
  const err = r.error ? ` ERROR: ${r.error}` : "";
  console.log(
    `${icon} ${r.method.padEnd(6)} ${String(r.status).padEnd(4)} ${r.route}${note} ${time}${err}`,
  );
  results.push(r);
  if (r.ok) passed++;
  else failed++;
}

function section(title: string) {
  console.log("\n" + "-".repeat(65));
  console.log("  " + title);
  console.log("-".repeat(65));
}

async function run() {
  console.log("\nPGLife Production Health Check");
  console.log("Target: " + BASE_URL);
  console.log("Started: " + new Date().toISOString() + "\n");

  section("Public Pages");
  log(await check("GET", "/", { note: "Homepage" }));
  log(await check("GET", "/auth/login", { note: "Login page" }));
  log(await check("GET", "/auth/signup", { note: "Signup page" }));
  log(await check("GET", "/auth/pending", { note: "Pending page" }));
  log(await check("GET", "/properties/bangalore", { note: "City listings" }));
  log(await check("GET", "/properties/mumbai", { note: "City listings" }));
  log(await check("GET", "/properties/delhi", { note: "City listings" }));
  log(await check("GET", "/properties/jammu", { note: "Home city" }));
  log(
    await check("GET", "/properties/fakecity", {
      note: "Unknown city no crash",
    }),
  );

  section("SEO Routes");
  log(await check("GET", "/sitemap.xml", { note: "Dynamic sitemap" }));
  log(await check("GET", "/robots.txt", { note: "Robots directive" }));

  section("API: Auth endpoints");
  log(await check("GET", "/api/auth/session", { note: "Session" }));
  log(await check("GET", "/api/auth/providers", { note: "Providers" }));
  log(await check("GET", "/api/auth/csrf", { note: "CSRF token" }));

  section("API: Signup validation (must reject bad input)");
  log(
    await check("POST", "/api/auth/signup", {
      body: { name: "", email: "notanemail", password: "x" },
      expectedStatus: 400,
      note: "Bad input should 400",
    }),
  );
  log(
    await check("POST", "/api/auth/signup", {
      body: { name: "Test", email: "test@test.com", password: "short" },
      expectedStatus: 400,
      note: "Weak password should 400",
    }),
  );

  section("API: Properties");
  log(await check("GET", "/api/properties", { note: "All listings" }));
  log(
    await check("GET", "/api/properties?city=Bangalore", {
      note: "Filter by city",
    }),
  );
  log(
    await check("GET", "/api/properties?gender=FEMALE", {
      note: "Filter by gender",
    }),
  );
  log(
    await check("GET", "/api/properties?page=1&limit=5", {
      note: "Pagination",
    }),
  );
  log(
    await check("GET", "/api/properties?city=InvalidCity", {
      note: "Invalid city empty not crash",
    }),
  );
  log(await check("GET", "/api/stats", { note: "Platform stats" }));

  section("API: Auth guards (all must 401 without session)");
  log(
    await check("GET", "/api/bookings", {
      expectedStatus: 401,
      note: "GET bookings",
    }),
  );
  log(
    await check("POST", "/api/bookings", {
      expectedStatus: 401,
      body: {},
      note: "POST bookings",
    }),
  );
  log(
    await check("GET", "/api/admin/owners", {
      expectedStatus: 401,
      note: "GET admin owners",
    }),
  );
  log(
    await check("POST", "/api/upload", {
      expectedStatus: 401,
      note: "POST upload",
    }),
  );
  log(
    await check("POST", "/api/reviews", {
      expectedStatus: 401,
      body: {},
      note: "POST reviews",
    }),
  );
  log(
    await check("POST", "/api/properties", {
      expectedStatus: 401,
      body: {},
      note: "POST property",
    }),
  );
  log(
    await check("GET", "/api/owner/bookings", {
      expectedStatus: 401,
      note: "GET owner bookings",
    }),
  );

  section("API: Security without auth");
  log(
    await check("PUT", "/api/properties/fake-id", {
      expectedStatus: 401,
      note: "Update",
    }),
  );
  log(
    await check("DELETE", "/api/properties/fake-id", {
      expectedStatus: 401,
      note: "Delete",
    }),
  );
  log(
    await check("PUT", "/api/admin/owners/fake-id", {
      expectedStatus: 401,
      note: "Admin owner",
    }),
  );
  log(
    await check("PUT", "/api/admin/properties/fake-id", {
      expectedStatus: 401,
      note: "Admin property",
    }),
  );

  section("404 and Error handling");
  log(await check("GET", "/this-page-does-not-exist", { expectedStatus: 404 }));
  log(
    await check("GET", "/api/properties/completely-nonexistent-id-xyz123", {
      expectedStatus: 404,
    }),
  );

  section("Performance");
  const slow = results.filter((r) => r.ms > 3000);
  if (slow.length === 0) console.log("  All routes under 3 seconds");
  else
    slow.forEach((r) =>
      console.log(`  SLOW: ${r.method} ${r.route} ${r.ms}ms`),
    );
  const avgMs = Math.round(
    results.reduce((s, r) => s + r.ms, 0) / results.length,
  );
  const slowest = [...results].sort((a, b) => b.ms - a.ms)[0];
  console.log(
    `  Average: ${avgMs}ms | Slowest: ${slowest.route} (${slowest.ms}ms)`,
  );

  console.log("\n" + "=".repeat(65));
  console.log(
    `  PASSED: ${passed} | FAILED: ${failed} | TOTAL: ${results.length}`,
  );
  console.log(`  TARGET: ${BASE_URL}`);
  console.log("=".repeat(65));

  if (failed > 0) {
    console.log("\nFailed routes:");
    results
      .filter((r) => !r.ok)
      .forEach((r) => {
        console.log(`  ${r.method.padEnd(6)} ${r.route} got ${r.status}`);
        if (r.error) console.log(`         Error: ${r.error}`);
      });
  } else {
    console.log("\nAll checks passed! PGLife is healthy.");
  }
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Health check crashed:", err);
  process.exit(1);
});
