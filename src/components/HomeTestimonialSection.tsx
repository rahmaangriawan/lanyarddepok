import { TestimonialSlider, type TestimonialReview } from "@/components/ui/testimonial-slider-1";

const TESTIMONIAL_REVIEWS: TestimonialReview[] = [
  {
    id: 1,
    name: "Rizky Pratama",
    affiliation: "Event Officer, Bank Indonesia",
    quote:
      "Hasil printing tajam, bahan nyaman dipakai, dan pengerjaan lanyard untuk event kami selesai cepat.",
    imageSrc: "/images/testimonials/rizky-pratama.webp",
    thumbnailSrc: "/images/testimonials/rizky-pratama.webp",
  },
  {
    id: 2,
    name: "Dewi Lestari",
    affiliation: "Marketing Communication, Telkomsel",
    quote:
      "Desain sesuai request dan hasilnya rapi. Timnya responsif dari mockup sampai pengiriman.",
    imageSrc: "/images/testimonials/dewi-lestari.webp",
    thumbnailSrc: "/images/testimonials/dewi-lestari.webp",
  },
  {
    id: 3,
    name: "Farhan Ramadhan",
    affiliation: "Koordinator Acara, Universitas Indonesia",
    quote:
      "Pesanan untuk event kampus memuaskan. Warna cerah, bahan tebal, dan semuanya tepat waktu.",
    imageSrc: "/images/testimonials/farhan-ramadhan.webp",
    thumbnailSrc: "/images/testimonials/farhan-ramadhan.webp",
  },
  {
    id: 4,
    name: "Septiana Andini",
    affiliation: "Procurement Specialist, BCA",
    quote:
      "Pelayanan ramah, cetakan rapi, dan pengiriman aman sampai tujuan. Prosesnya terasa mudah.",
    imageSrc: "/images/testimonials/septiana-andini.webp",
    thumbnailSrc: "/images/testimonials/septiana-andini.webp",
  },
  {
    id: 5,
    name: "Amanda Putri",
    affiliation: "Humas Kesehatan, Kemenkes RI",
    quote:
      "Pemesanan lanyard instansi dalam jumlah besar selesai tepat waktu dengan kualitas yang seragam.",
    imageSrc: "/images/testimonials/amanda-putri.webp",
    thumbnailSrc: "/images/testimonials/amanda-putri.webp",
  },
];

export default function HomeTestimonialSection() {
  return (
    <section className="border-b border-border bg-[#fff] px-4 py-20 text-foreground sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <p className="text-xs font-extrabold uppercase leading-5 tracking-normal text-primary">
            Testimoni Klien
          </p>
          <h2 className="mt-6 text-[2rem] font-extrabold leading-[1.08] tracking-normal text-foreground sm:text-[2.4rem] lg:text-[2.75rem]">
            Dipercaya untuk kebutuhan lanyard berbagai instansi.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Cerita singkat dari klien yang memakai lanyard custom untuk event,
            identitas tim, dan kebutuhan branding.
          </p>
        </div>

        <TestimonialSlider reviews={TESTIMONIAL_REVIEWS} />
      </div>
    </section>
  );
}
