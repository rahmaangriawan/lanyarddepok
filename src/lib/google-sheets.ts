import crypto from "crypto";

// Helper to generate Google OAuth JWT
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

  const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signatureInput);
  const signature = sign.sign(formattedPrivateKey, "base64url");

  return `${signatureInput}.${signature}`;
}

// Helper to retrieve OAuth Access Token
async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
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

export interface SpreadsheetProduct {
  sku: string;
  name: string;
  specs: string;
  accessories: string;
  basePrice: string;
  minOrder: string;
  slug: string;
  shortDesc: string;
  longDesc: string;
  [key: string]: string; // Fallback index signature for other columns
}

// Fetch spreadsheet values and parse rows to objects
export async function fetchSpreadsheetProducts(
  clientEmail: string,
  privateKey: string,
  spreadsheetId: string,
  range = "Sheet1!A1:Z10000"
): Promise<SpreadsheetProduct[]> {
  const accessToken = await getAccessToken(clientEmail, privateKey);
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || res.statusText || "Failed to fetch spreadsheet data");
  }

  const rows: string[][] = data.values;
  if (!rows || rows.length === 0) {
    return [];
  }

  // Header row to define property mapping
  const headers = rows[0].map((h) => h.trim().toLowerCase());

  // Find standard column indexes
  const skuIdx = headers.findIndex((h) => h === "sku" || h === "kode");
  const nameIdx = headers.findIndex((h) => h.includes("nama") || h.includes("title") || h === "name");
  const specsIdx = headers.findIndex((h) => h.includes("spek") || h.includes("spesifikasi") || h.includes("specs"));
  const accIdx = headers.findIndex((h) => h.includes("aksesoris") || h.includes("accessories") || h.includes("acc"));
  const priceIdx = headers.findIndex((h) => h.includes("harga") || h.includes("price"));
  const minOrderIdx = headers.findIndex((h) => h.includes("min") || h.includes("minimal") || h.includes("qty"));
  
  // Custom columns for user's spreadsheet
  const slugIdx = headers.findIndex((h) => h.includes("slug"));
  const shortDescIdx = headers.findIndex((h) => h.includes("singkat") || h.includes("short"));
  const longDescIdx = headers.findIndex((h) => h.includes("lengkap") || h.includes("long") || h.includes("html"));

  if (skuIdx === -1) {
    throw new Error("Kolom 'SKU' atau 'Kode' tidak ditemukan di baris pertama Spreadsheet.");
  }

  const products: SpreadsheetProduct[] = [];

  // Parse starting from row 1 (excluding header)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Skip empty rows or rows without SKU
    if (!row || !row[skuIdx]) continue;

    const sku = row[skuIdx].trim();
    if (!sku) continue;

    const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].trim() : "Produk Lanyard";
    const specs = specsIdx !== -1 && row[specsIdx] ? row[specsIdx].trim() : "";
    const accessories = accIdx !== -1 && row[accIdx] ? row[accIdx].trim() : "";
    const basePrice = priceIdx !== -1 && row[priceIdx] ? row[priceIdx].trim() : "0";
    const minOrder = minOrderIdx !== -1 && row[minOrderIdx] ? row[minOrderIdx].trim() : "0";
    
    const slug = slugIdx !== -1 && row[slugIdx] ? row[slugIdx].trim() : "";
    const shortDesc = shortDescIdx !== -1 && row[shortDescIdx] ? row[shortDescIdx].trim() : "";
    const longDesc = longDescIdx !== -1 && row[longDescIdx] ? row[longDescIdx].trim() : "";

    const productObj: SpreadsheetProduct = {
      sku,
      name,
      specs,
      accessories,
      basePrice,
      minOrder,
      slug,
      shortDesc,
      longDesc,
    };

    // Store other unmapped columns
    headers.forEach((header, idx) => {
      if (
        idx !== skuIdx &&
        idx !== nameIdx &&
        idx !== specsIdx &&
        idx !== accIdx &&
        idx !== priceIdx &&
        idx !== minOrderIdx &&
        idx !== slugIdx &&
        idx !== shortDescIdx &&
        idx !== longDescIdx &&
        row[idx]
      ) {
        productObj[header] = row[idx].trim();
      }
    });

    products.push(productObj);
  }

  return products;
}
