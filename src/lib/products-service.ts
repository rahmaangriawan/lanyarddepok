export interface UnifiedProduct {
  id: number | null;
  sku: string;
  name: string;
  slug: string;
  specs: string;
  accessories: string;
  basePrice: string;
  minOrder: string;
  featuredImage: string | null;
  description: string;
  published: boolean;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string | null;
  sheetStatus?: string;
  sites?: string;
  order?: number | null;
  categoryId?: number | null;
  category?: { id: number; name: string; slug?: string } | null;
}

export const DEFAULT_PRODUCTS: UnifiedProduct[] = [
  {
    id: 10001,
    sku: "LY-SUB-01",
    name: "Lanyard Sublimasi Premium",
    slug: "lanyard-sublimasi-premium",
    specs: "Bahan Tissue Premium, Kait Besi Chrome, Lebar 2cm",
    accessories: "Stopper Plastik, Card Holder Premium",
    basePrice: "Rp 7.500",
    minOrder: "50 pcs",
    featuredImage: "/uploads/aset-lanyard-4-1782114161098.webp",
    description: "Cetak tali lanyard sublimasi kualitas premium dengan hasil cetak tajam, warna cerah dan tidak luntur. Sangat cocok untuk ID card kantor, event, maupun branding instansi Anda.",
    published: true,
    metaTitle: "Lanyard Sublimasi Premium Custom - Lanyard Jakarta",
    metaDescription: "Cetak lanyard sublimasi premium custom di Jakarta. Bahan tissue lembut, cetak full color presisi.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 10002,
    sku: "LY-WOV-02",
    name: "Lanyard Anyaman (Woven)",
    slug: "lanyard-anyaman-woven",
    specs: "Bahan Polyester Woven, Kait Stainless Steel, Lebar 2cm",
    accessories: "Kait Besi, Stopper Plastik",
    basePrice: "Rp 6.500",
    minOrder: "100 pcs",
    featuredImage: "/uploads/aset-lanyard-3-1782112472764.webp",
    description: "Tali lanyard anyaman woven dengan desain logo rajut yang elegan dan tahan lama. Ideal untuk kebutuhan perusahaan jangka panjang.",
    published: true,
    metaTitle: "Lanyard Anyaman Woven Custom - Lanyard Jakarta",
    metaDescription: "Cetak lanyard rajut woven berkualitas tinggi di Jakarta. Awet, tulisan rajut tebal dan rapi.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 10003,
    sku: "LY-BDL-03",
    name: "Lanyard Paket Bundling Holder",
    slug: "lanyard-paket-bundling-holder",
    specs: "Lanyard Tissue, Card Holder Akrilik/Kulit, Lebar 2cm",
    accessories: "Casing Karet, Akrilik Transparan, Kulit Sintetis",
    basePrice: "Rp 12.000",
    minOrder: "50 pcs",
    featuredImage: "/uploads/paket-bundling-1782194588004.webp",
    description: "Paket lengkap hemat cetak lanyard sublimasi tissue premium yang sudah termasuk dengan casing pelindung ID Card (Card Holder) pilihan bahan karet, akrilik, maupun kulit mewah.",
    published: true,
    metaTitle: "Paket Bundling Lanyard & Holder Premium - Lanyard Jakarta",
    metaDescription: "Paket hemat cetak lanyard lengkap dengan holder ID card berkualitas tinggi di Jakarta.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 10004,
    sku: "LY-PRT-04",
    name: "Lanyard Digital Printing Kilat",
    slug: "lanyard-digital-printing-kilat",
    specs: "Bahan Polyester, Cetak Digital Sublim, Lebar 1.5cm/2cm",
    accessories: "Kait Stainless Steel, Stopper",
    basePrice: "Rp 5.000",
    minOrder: "50 pcs",
    featuredImage: "/uploads/gratis-layanan-desain-mockup-1782194427111.webp",
    description: "Layanan cetak tali lanyard printing kilat pengerjaan cepat 1-2 hari kerja untuk kebutuhan event mendesak dengan harga super ekonomis.",
    published: true,
    metaTitle: "Lanyard Digital Printing Kilat Ekonomis - Lanyard Jakarta",
    metaDescription: "Cetak lanyard printing cepat murah berkualitas di Jakarta. Selesai tepat waktu untuk event Anda.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
