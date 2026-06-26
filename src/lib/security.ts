import { NextResponse } from "next/server";

type RateLimitBucket = {
  timestamps: number[];
};

const buckets = new Map<string, RateLimitBucket>();

export function getClientIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1"
  );
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key) || { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((time) => now - time < windowMs);

  if (bucket.timestamps.length >= limit) {
    buckets.set(key, bucket);
    return false;
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return true;
}

export function rateLimitResponse(message = "Terlalu banyak percobaan. Silakan coba lagi nanti.") {
  return NextResponse.json({ error: message }, { status: 429 });
}

export function isSameOriginRequest(request: Request) {
  const url = new URL(request.url);
  const allowedOrigins = new Set([
    url.origin,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
  ].filter(Boolean));

  const origin = request.headers.get("origin");
  if (origin) {
    return allowedOrigins.has(origin);
  }

  const referer = request.headers.get("referer");
  if (!referer) {
    return false;
  }

  try {
    return allowedOrigins.has(new URL(referer).origin);
  } catch {
    return false;
  }
}

export function assertSameOrigin(request: Request) {
  if (isSameOriginRequest(request)) {
    return null;
  }

  return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
}
