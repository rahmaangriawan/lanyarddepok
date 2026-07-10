import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://lanyarddepok.com";

export const SITE_NAME = "Lanyard Bogor";
export const DEFAULT_OG_IMAGE = "/uploads/lanyarddepok-logo.webp";

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function absoluteImageUrl(image?: string | null): string {
  return absoluteUrl(image || DEFAULT_OG_IMAGE);
}

export function getRequestSiteUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return SITE_URL;
  }

  const host = request.headers.get("host") || "lanyarddepok.com";
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  return `${protocol}://${host}`.replace(/\/+$/, "");
}

export function createOpenGraphMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
}): Pick<Metadata, "openGraph" | "twitter"> {
  const imageUrl = absoluteImageUrl(image);

  return {
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      locale: "id_ID",
      type,
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteImageUrl(DEFAULT_OG_IMAGE),
    },
    image: absoluteImageUrl(DEFAULT_OG_IMAGE),
    telephone: "+6282210200700",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+6282210200700",
      contactType: "customer service",
      areaServed: "ID",
      availableLanguage: ["id", "en"],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bogor",
      addressRegion: "Jawa Barat",
      addressCountry: "ID",
    },
  };
}

export function breadcrumbSchema(
  pathItems: Array<{ name: string; url: string }>,
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: pathItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}
