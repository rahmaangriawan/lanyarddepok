import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { prisma } from "@/lib/db";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { ToastProvider } from "@/components/Toast";
import WhatsAppFloating from "@/components/WhatsAppFloating";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";

export const revalidate = 300; // Cache metadata SEO selama 5 menit

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let bingVerification = "";
  let siteName = "Lanyard Jakarta";
  let siteTitle = "Lanyard Jakarta | Custom Premium Lanyard Printing";
  let siteDesc = "Cetak lanyard premium cepat & murah di Jakarta. Layanan 1 hari jadi dengan kualitas cetak tajam, warna cerah, dan bahan awet untuk kebutuhan kantor, event, atau promosi Anda.";

  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ["bing_site_verification", "seo_meta_title", "seo_meta_description", "site_title"]
        }
      }
    });

    const bingSetting = settings.find((s) => s.key === "bing_site_verification");
    if (bingSetting) bingVerification = bingSetting.value;

    const siteNameSetting = settings.find((s) => s.key === "site_title");
    if (siteNameSetting && siteNameSetting.value) siteName = siteNameSetting.value;

    const titleSetting = settings.find((s) => s.key === "seo_meta_title");
    if (titleSetting && titleSetting.value) siteTitle = titleSetting.value;

    const descSetting = settings.find((s) => s.key === "seo_meta_description");
    if (descSetting && descSetting.value) siteDesc = descSetting.value;
  } catch (err) {
    console.error("Failed to fetch settings for metadata in layout", err);
  }

  return {
    title: {
      default: siteTitle,
      template: `%s - ${siteName}`,
    },
    description: siteDesc,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
        { url: "/favicon.svg", type: "image/svg+xml" }
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
    verification: bingVerification
      ? {
          other: {
            "msvalidate.01": [bingVerification],
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
  let measurementId = "";
  let whatsappNumber = "6282210200700"; // Fallback hotline

  try {
    const [gaSetting, waSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "google_analytics_measurement_id" } }),
      prisma.setting.findUnique({ where: { key: "contact_whatsapp" } }),
    ]);
    
    measurementId = gaSetting?.value || "";
    if (waSetting?.value) {
      whatsappNumber = waSetting.value;
    }
  } catch (err) {
    console.error("Failed to fetch settings in layout", err);
  }

  return (
    <html
      lang="id"
      className={`${rubik.variable} h-full`}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-full flex flex-col bg-white text-[#373f50]" suppressHydrationWarning>
        <GoogleAnalytics measurementId={measurementId} />
        <ToastProvider>
          {children}
        </ToastProvider>
        <WhatsAppFloating whatsappNumber={whatsappNumber} />
      </body>
    </html>
  );
}
