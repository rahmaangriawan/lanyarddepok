"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

export default function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();

  // Return nothing if measurementId is not configured, or if the current page is an admin page or api route
  if (!measurementId || pathname?.startsWith("/kawruh") || pathname?.startsWith("/api")) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
