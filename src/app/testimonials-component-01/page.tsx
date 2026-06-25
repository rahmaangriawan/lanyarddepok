import TestimonialsComponent from "@/components/shadcn-studio/blocks/testimonials-component-01/testimonials-component-01";
import type { TestimonialItem } from "@/components/shadcn-studio/blocks/testimonials-component-01/testimonials-component-01";

const testimonials: TestimonialItem[] = [
  {
    name: "Rizky Pratama",
    role: "Event Officer",
    company: "Bank Indonesia",
    avatar: "/images/logo.webp",
    rating: 5,
    content: "Hasil printing tajam, bahan nyaman dipakai, dan pengerjaan sangat cepat untuk kebutuhan event kantor kami.",
  },
  {
    name: "Dewi Lestari",
    role: "Marketing Communication",
    company: "Telkomsel",
    avatar: "/images/logo.webp",
    rating: 5,
    content: "Desain sesuai request dan hasilnya lebih bagus dari ekspektasi. Timnya responsif dan prosesnya mudah.",
  },
  {
    name: "Farhan Ramadhan",
    role: "Koordinator Acara",
    company: "Universitas Indonesia",
    avatar: "/images/logo.webp",
    rating: 5,
    content: "Pesan untuk event kampus, warna cerah, bahan tebal, dan semua selesai tepat waktu.",
  },
  {
    name: "Budi Santoso",
    role: "Procurement Specialist",
    company: "BCA",
    avatar: "/images/logo.webp",
    rating: 5,
    content: "Pelayanan ramah, cetakan rapi, dan pengiriman aman sampai tujuan. Cocok untuk pemesanan corporate.",
  },
];

const TestimonialsComponentPage = () => {
  return <TestimonialsComponent testimonials={testimonials} />;
};

export default TestimonialsComponentPage;
