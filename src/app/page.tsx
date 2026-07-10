import type { Metadata } from "next";
import { getProducts } from "@/lib/products-server";
import type { UnifiedProduct } from "@/lib/products-service";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";
import HomeHero from "@/components/HomeHero";
import HomeTestimonialSection from "@/components/HomeTestimonialSection";
import HomepageFaqSection from "@/components/HomepageFaqSection";
import LanyardDepokQualitySection from "@/components/LanyardDepokQualitySection";
import PartnerLogoCarousel, {
  type LogoCarouselItem,
} from "@/components/PartnerLogoCarousel";
import HomePreviewClient from "./HomePreviewClient";

const HOMEPAGE_TITLE = "Lanyard Depok: Cetak Custom No Worry Ongkir";

export const metadata: Metadata = {
  title: {
    absolute: HOMEPAGE_TITLE,
  },
  openGraph: {
    title: HOMEPAGE_TITLE,
  },
  twitter: {
    title: HOMEPAGE_TITLE,
  },
};

const PARTNER_LOGOS: LogoCarouselItem[] = [
  { id: 1, name: "Bank Indonesia", src: "/images/logos/bank-indonesia.svg", alt: "Bank Indonesia", href: "https://www.bi.go.id", width: 112, height: 32 },
  { id: 2, name: "Telkomsel", src: "/images/logos/telkomsel.svg", alt: "Telkomsel", href: "https://www.telkomsel.com", width: 96, height: 32 },
  { id: 3, name: "Kemenkes RI", src: "/images/logos/kemenkes.svg", alt: "Kemenkes RI", href: "https://www.kemkes.go.id", width: 96, height: 32 },
  { id: 4, name: "BCA", src: "/images/logos/bca.svg", alt: "BCA", href: "https://www.bca.co.id", width: 96, height: 32 },
  { id: 5, name: "Universitas Indonesia", src: "/images/logos/universitas-indonesia.png", alt: "Universitas Indonesia", href: "https://www.ui.ac.id", width: 104, height: 32 },
  { id: 6, name: "BUMN", src: "/images/logos/bumn.svg", alt: "BUMN", href: "https://www.bumn.go.id", width: 80, height: 32 },
  { id: 7, name: "Biznet", src: "/images/logos/biznet.svg", alt: "Biznet", href: "https://www.biznetnetworks.com", width: 96, height: 32 },
  { id: 8, name: "Komdigi", src: "/images/logos/komdigi.svg", alt: "Komdigi", href: "https://www.kominfo.go.id", width: 96, height: 32 },
];

const HOMEPAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://lanyarddepok.com/#organization",
      name: "Lanyard Bogor",
      url: "https://lanyarddepok.com",
      logo: "https://lanyarddepok.com/uploads/lanyarddepok-logo.webp",
      image: "https://lanyarddepok.com/uploads/lanyarddepok-logo.webp",
      description: "Produsen cetak tali lanyard custom premium cepat dan murah di Bogor.",
      telephone: "+6282210200700",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Bogor",
        addressLocality: "Bogor",
        addressRegion: "Bogor",
        postalCode: "10000",
        addressCountry: "ID",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+6282210200700",
        contactType: "customer service",
        areaServed: "ID",
        availableLanguage: ["id", "en"],
      },
      sameAs: [
        "https://www.facebook.com/lanyarddepok",
        "https://www.instagram.com/lanyarddepok",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://lanyarddepok.com/#website",
      url: "https://lanyarddepok.com",
      name: "Lanyard Bogor",
      publisher: {
        "@id": "https://lanyarddepok.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://lanyarddepok.com/blog?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://lanyarddepok.com/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Beranda",
          item: "https://lanyarddepok.com",
        },
      ],
    },
  ],
};

export const revalidate = 600;

export default async function Home() {
  let homepageProducts: UnifiedProduct[] = [];

  try {
    homepageProducts = await getProducts();
  } catch (err) {
    console.error("Failed to fetch homepage products:", err);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOMEPAGE_SCHEMA) }}
      />
      <HomePreviewClient />

      <main className="flex-grow">
        <HomeHero />
        <PartnerLogoCarousel logos={PARTNER_LOGOS} />
        <LanyardDepokQualitySection />
        <FeaturedProductsSection products={homepageProducts} />
        <HomeTestimonialSection />
        <HomepageFaqSection />
      </main>
    </div>
  );
}
