import TestimonialsComponent from "@/components/shadcn-studio/blocks/testimonials-component-01/testimonials-component-01";
import type { TestimonialItem } from "@/components/shadcn-studio/blocks/testimonials-component-01/testimonials-component-01";

export default function Testimonials() {
  const testimonials: TestimonialItem[] = [
    {
      name: "Rizky Pratama",
      role: "Event Officer",
      company: "Bank Indonesia",
      avatar: "/images/testimonials/rizky-pratama.webp",
      rating: 5,
      content: "Lanyard dari sini kualitasnya luar biasa. Hasil printing tajam, bahan nyaman dipakai, dan pengerjaan sangat cepat.",
    },
    {
      name: "Dewi Lestari",
      role: "Marketing Communication",
      company: "Telkomsel",
      avatar: "/images/testimonials/dewi-lestari.webp",
      rating: 5,
      content: "Desain sesuai request dan hasilnya bahkan lebih bagus dari ekspektasi. Timnya responsif dan prosesnya mudah.",
    },
    {
      name: "Farhan Ramadhan",
      role: "Koordinator Acara",
      company: "Universitas Indonesia",
      avatar: "/images/testimonials/farhan-ramadhan.webp",
      rating: 5,
      content: "Pesan untuk event kampus, hasilnya memuaskan. Warna cerah, bahan tebal, dan semua tepat waktu.",
    },
    {
      name: "Septiana Andini",
      role: "Procurement Specialist",
      company: "BCA",
      avatar: "/images/testimonials/septiana-andini.webp",
      rating: 5,
      content: "Sangat puas dengan hasilnya. Pelayanan ramah, cetakan rapi, dan pengiriman aman sampai tujuan.",
    },
    {
      name: "Amanda Putri",
      role: "Humas Kesehatan",
      company: "Kemenkes RI",
      avatar: "/images/testimonials/amanda-putri.webp",
      rating: 5,
      content: "Pemesanan lanyard instansi dalam jumlah besar selesai tepat waktu dengan kualitas yang seragam.",
    },
  ];

  return (
    <TestimonialsComponent
      testimonials={testimonials}
      eyebrow="Testimoni pelanggan"
      title="Apa Kata Mereka"
      description="Kepuasan pelanggan adalah prioritas kami, dari kebutuhan event cepat sampai pesanan corporate dalam jumlah besar."
    />
  );
}
