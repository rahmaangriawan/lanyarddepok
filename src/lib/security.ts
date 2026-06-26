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

export function rateLimitResponse(
  message = "Terlalu banyak percobaan. Silakan coba lagi nanti.",
) {
  return NextResponse.json({ error: message }, { status: 429 });
}

export function isSameOriginRequest(request: Request) {
  const url = new URL(request.url);
  const forwardedProto =
    request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const forwardedHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  const forwardedOrigin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : "";

  // Kita ambil hostname saja untuk pencocokan yang lebih aman dari masalah skema proxy http/https
  const getHostname = (urlStr: string) => {
    try {
      if (!urlStr) return "";
      const formatted = urlStr.startsWith("http")
        ? urlStr
        : `https://${urlStr}`;
      return new URL(formatted).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  };

  const allowedHostnames = new Set(
    [
      getHostname(url.origin),
      getHostname(forwardedOrigin),
      getHostname(process.env.NEXT_PUBLIC_SITE_URL || ""),
      getHostname(process.env.SITE_URL || ""),
    ].filter(Boolean),
  );

  // Menambahkan log di console server agar membantu debug jika masih gagal
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  console.log(
    "CSRF Debug - Target:",
    url.hostname,
    "| Hostnames Diisi:",
    Array.from(allowedHostnames),
  );
  console.log(
    "CSRF Debug - Request Origin:",
    origin,
    "| Request Referer:",
    referer,
  );

  if (origin) {
    const originHostname = getHostname(origin);
    const isValid = allowedHostnames.has(originHostname);
    if (!isValid) {
      console.warn(
        `CSRF Blocked - Origin Hostname '${originHostname}' tidak terdaftar di allowedHostnames`,
      );
    }
    return isValid;
  }

  if (!referer) {
    return true;
  }

  try {
    const refererHostname = getHostname(referer);
    const isValid = allowedHostnames.has(refererHostname);
    if (!isValid) {
      console.warn(
        `CSRF Blocked - Referer Hostname '${refererHostname}' tidak terdaftar di allowedHostnames`,
      );
    }
    return isValid;
  } catch {
    return false;
  }
}

export function assertSameOrigin(request: Request) {
  if (isSameOriginRequest(request)) {
    return null;
  }

  return NextResponse.json(
    { error: "Invalid request origin" },
    { status: 403 },
  );
}
