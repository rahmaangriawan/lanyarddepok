import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { getCachedSiteChromeSettings } from "@/lib/settings-cache";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { ToastProvider } from "@/components/Toast";
import WhatsAppFloating from "@/components/WhatsAppFloating";
import ClientHeader from "@/components/ClientHeader";
import ClientFooter from "@/components/ClientFooter";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";

export const revalidate = 300; // Cache metadata SEO selama 5 menit

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteChromeSettings();

  return {
    title: {
      default: settings.siteTitle,
      template: `%s - ${settings.siteName}`,
    },
    description: settings.siteDescription,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
    verification: settings.bingVerification
      ? {
          other: {
            "msvalidate.01": [settings.bingVerification],
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
      className={`${rubik.variable} h-full`}
      suppressHydrationWarning
    >
      <head />
      <body
        className="min-h-full flex flex-col bg-white text-[#373f50]"
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
