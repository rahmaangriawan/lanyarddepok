import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import crypto from "crypto";

function generateGoogleJWT(clientEmail: string, privateKey: string, scopes: string[]) {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: scopes.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Claim = Buffer.from(JSON.stringify(claim)).toString("base64url");
  const signatureInput = `${base64Header}.${base64Claim}`;

  // Clean private key formatting robustly (fixes decoder unsupported errors)
  let formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
  formattedPrivateKey = formattedPrivateKey.replace(/\r/g, "");
  formattedPrivateKey = formattedPrivateKey.trim();
  if (formattedPrivateKey.startsWith('"') && formattedPrivateKey.endsWith('"')) {
    formattedPrivateKey = formattedPrivateKey.slice(1, -1);
  }

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signatureInput);
  const signature = sign.sign(formattedPrivateKey, "base64url");

  return `${signatureInput}.${signature}`;
}

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const scopes = [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/webmasters.readonly",
  ];
  const jwt = generateGoogleJWT(clientEmail, privateKey, scopes);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || "Failed to fetch OAuth token");
  }

  return data.access_token;
}

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settingsList = await prisma.setting.findMany();
    const settings: Record<string, string> = {};
    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });

    const serviceAccountJson = settings.google_service_account_json;
    const propertyId = settings.google_analytics_property_id;
    const siteUrl = settings.google_search_console_site_url;

    if (!serviceAccountJson || !propertyId || !siteUrl) {
      return NextResponse.json({ success: false, notConfigured: true });
    }

    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch (e) {
      return NextResponse.json({ success: false, error: "Format JSON Google Service Account tidak valid." });
    }

    const { client_email, private_key } = credentials;
    if (!client_email || !private_key) {
      return NextResponse.json({ success: false, error: "JSON Google Service Account tidak memiliki client_email atau private_key." });
    }

    const searchParams = new URL(request.url).searchParams;
    const range = searchParams.get("range") || "30days";

    let days = 30;
    if (range === "7days") days = 7;
    else if (range === "90days") days = 90;

    const endDateObj = new Date();
    const startDateObj = new Date();
    startDateObj.setDate(endDateObj.getDate() - days);

    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const startDate = formatDate(startDateObj);
    const endDate = formatDate(endDateObj);

    let accessToken: string;
    try {
      accessToken = await getAccessToken(client_email, private_key);
    } catch (err: any) {
      console.error("Auth Token Fetch Error:", err);
      return NextResponse.json({ success: false, error: `Autentikasi gagal: ${err.message}` });
    }

    // Prepare headers for Google API requests
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // --- GOOGLE ANALYTICS (GA4) API CALLS ---
    const ga4ReportUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

    // Filter to exclude admin dashboard (/kawruh) and API paths
    const ga4ExcludeAdminFilter = {
      notExpression: {
        orGroup: {
          expressions: [
            {
              filter: {
                fieldName: "pagePath",
                stringFilter: {
                  matchType: "BEGINS_WITH",
                  value: "/kawruh",
                },
              },
            },
            {
              filter: {
                fieldName: "pagePath",
                stringFilter: {
                  matchType: "BEGINS_WITH",
                  value: "/api",
                },
              },
            },
          ],
        },
      },
    };

    // GA4 Trend report
    const ga4TrendBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      dimensions: [{ name: "date" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
      dimensionFilter: ga4ExcludeAdminFilter,
    };

    // GA4 Pages report
    const ga4PagesBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      dimensions: [{ name: "pagePath" }],
      dimensionFilter: ga4ExcludeAdminFilter,
      limit: 10,
    };

    // GA4 Sources report
    const ga4SourcesBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "activeUsers" }],
      dimensions: [{ name: "sessionSourceMedium" }],
      dimensionFilter: ga4ExcludeAdminFilter,
      limit: 10,
    };

    // GA4 Countries report
    const ga4CountriesBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "activeUsers" }],
      dimensions: [{ name: "country" }],
      dimensionFilter: ga4ExcludeAdminFilter,
      limit: 10,
    };

    // --- GOOGLE SEARCH CONSOLE API CALLS ---
    const encodedSiteUrl = encodeURIComponent(siteUrl);
    const gscUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`;

    // GSC Trend body
    const gscTrendBody = {
      startDate,
      endDate,
      dimensions: ["date"],
      rowLimit: 1000,
    };

    // GSC Queries body
    const gscQueriesBody = {
      startDate,
      endDate,
      dimensions: ["query"],
      rowLimit: 10,
    };

    // GSC Pages body
    const gscPagesBody = {
      startDate,
      endDate,
      dimensions: ["page"],
      rowLimit: 10,
    };

    // GSC Devices body
    const gscDevicesBody = {
      startDate,
      endDate,
      dimensions: ["device"],
      rowLimit: 10,
    };

    // GSC Countries body
    const gscCountriesBody = {
      startDate,
      endDate,
      dimensions: ["country"],
      rowLimit: 10,
    };

    // Fetch reports in parallel using Promise.all
    const [
      ga4TrendRes,
      ga4PagesRes,
      ga4SourcesRes,
      ga4CountriesRes,
      gscTrendRes,
      gscQueriesRes,
      gscPagesRes,
      gscDevicesRes,
      gscCountriesRes,
    ] = await Promise.all([
      fetch(ga4ReportUrl, { method: "POST", headers, body: JSON.stringify(ga4TrendBody) }),
      fetch(ga4ReportUrl, { method: "POST", headers, body: JSON.stringify(ga4PagesBody) }),
      fetch(ga4ReportUrl, { method: "POST", headers, body: JSON.stringify(ga4SourcesBody) }),
      fetch(ga4ReportUrl, { method: "POST", headers, body: JSON.stringify(ga4CountriesBody) }),
      fetch(gscUrl, { method: "POST", headers, body: JSON.stringify(gscTrendBody) }),
      fetch(gscUrl, { method: "POST", headers, body: JSON.stringify(gscQueriesBody) }),
      fetch(gscUrl, { method: "POST", headers, body: JSON.stringify(gscPagesBody) }),
      fetch(gscUrl, { method: "POST", headers, body: JSON.stringify(gscDevicesBody) }),
      fetch(gscUrl, { method: "POST", headers, body: JSON.stringify(gscCountriesBody) }),
    ]);

    // Check for response errors and handle them
    if (!ga4TrendRes.ok) {
      const errorJson = await ga4TrendRes.json();
      return NextResponse.json({
        success: false,
        error: `Google Analytics API Error: ${errorJson.error?.message || ga4TrendRes.statusText}`,
      });
    }

    if (!gscTrendRes.ok) {
      const errorJson = await gscTrendRes.json();
      return NextResponse.json({
        success: false,
        error: `Google Search Console API Error: ${errorJson.error?.message || gscTrendRes.statusText}`,
      });
    }

    // Parse JSON payloads
    const [
      ga4Trend,
      ga4Pages,
      ga4Sources,
      ga4Countries,
      gscTrend,
      gscQueries,
      gscPages,
      gscDevices,
      gscCountries,
    ] = await Promise.all([
      ga4TrendRes.json(),
      ga4PagesRes.json(),
      ga4SourcesRes.json(),
      ga4CountriesRes.json(),
      gscTrendRes.json(),
      gscQueriesRes.json(),
      gscPagesRes.json(),
      gscDevicesRes.json(),
      gscCountriesRes.json(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        analytics: {
          trend: ga4Trend,
          pages: ga4Pages,
          sources: ga4Sources,
          countries: ga4Countries,
        },
        searchConsole: {
          trend: gscTrend,
          queries: gscQueries,
          pages: gscPages,
          devices: gscDevices,
          countries: gscCountries,
        },
      },
    });
  } catch (error: any) {
    console.error("Fetch Google API Consolidated Data Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal server" }, { status: 500 });
  }
}
