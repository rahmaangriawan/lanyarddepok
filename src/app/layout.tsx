import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getCachedSiteChromeSettings } from "@/lib/settings-cache";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { ToastProvider } from "@/components/Toast";
import WhatsAppFloating from "@/components/WhatsAppFloating";
import ClientHeader from "@/components/ClientHeader";
import ClientFooter from "@/components/ClientFooter";
import { createOpenGraphMetadata, DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardbogor.com";
const faviconVersion = "20260702";

export const revalidate = 300; // Cache metadata SEO selama 5 menit

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteChromeSettings();
  const title = settings.siteTitle || SITE_NAME;
  const description = settings.siteDescription;
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return {
    title: {
      default: title,
      template: `%s - ${settings.siteName}`,
    },
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
    },
    ...createOpenGraphMetadata({
      title,
      description,
      path: "/",
      image: DEFAULT_OG_IMAGE,
    }),
    icons: {
      icon: [
        { url: `/favicon.ico?v=${faviconVersion}`, sizes: "any" },
        { url: `/favicon.png?v=${faviconVersion}`, sizes: "32x32", type: "image/png" },
        { url: `/favicon-96x96.png?v=${faviconVersion}`, sizes: "96x96", type: "image/png" },
        { url: `/uploads/lanyardbogor-favicon.webp?v=${faviconVersion}`, type: "image/webp" },
      ],
      apple: `/apple-touch-icon.png?v=${faviconVersion}`,
    },
    manifest: `/site.webmanifest?v=${faviconVersion}`,
    verification: settings.bingVerification || googleVerification
      ? {
          google: googleVerification,
          other: {
            ...(settings.bingVerification
              ? { "msvalidate.01": [settings.bingVerification] }
              : {}),
          },
        }
      : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getCachedSiteChromeSettings();

  return (
    <html
      lang="id"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://api.iconify.design" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.className} min-h-full flex flex-col bg-white text-[#373f50]`}
        suppressHydrationWarning
      >
        <GoogleAnalytics measurementId={settings.measurementId} />
        <ToastProvider>
          <ClientHeader />
          {children}
          <ClientFooter />
        </ToastProvider>
        <WhatsAppFloating whatsappNumber={settings.whatsappNumber} />
      </body>
    </html>
  );
}
