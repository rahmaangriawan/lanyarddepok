import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
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

export const revalidate = 300; // Cache metadata SEO selama 5 menit

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
        { url: "/uploads/lanyardbogor-favicon.webp", type: "image/webp" },
        { url: "/favicon.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
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
      className={`${inter.variable} ${sourceSerif.variable} ${jetBrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head />
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
