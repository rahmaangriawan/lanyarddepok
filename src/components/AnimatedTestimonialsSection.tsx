"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";

type TestimonialItem = {
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  content: string;
};

const TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Rizky Pratama",
    role: "Event Officer",
    company: "Bank Indonesia",
    avatar: "/images/testimonials/rizky-pratama.webp",
    rating: 5,
    content:
      "Lanyard dari sini kualitasnya luar biasa. Hasil printing tajam, bahan nyaman dipakai, dan pengerjaan sangat cepat.",
  },
  {
    name: "Dewi Lestari",
    role: "Marketing Communication",
    company: "Telkomsel",
    avatar: "/images/testimonials/dewi-lestari.webp",
    rating: 5,
    content:
      "Desain sesuai request dan hasilnya bahkan lebih bagus dari ekspektasi. Timnya responsif dan prosesnya mudah.",
  },
  {
    name: "Farhan Ramadhan",
    role: "Koordinator Acara",
    company: "Universitas Indonesia",
    avatar: "/images/testimonials/farhan-ramadhan.webp",
    rating: 5,
    content:
      "Pesan untuk event kampus, hasilnya memuaskan. Warna cerah, bahan tebal, dan semua tepat waktu.",
  },
  {
    name: "Septiana Andini",
    role: "Procurement Specialist",
    company: "BCA",
    avatar: "/images/testimonials/septiana-andini.webp",
    rating: 5,
    content:
      "Sangat puas dengan hasilnya. Pelayanan ramah, cetakan rapi, dan pengiriman aman sampai tujuan.",
  },
  {
    name: "Amanda Putri",
    role: "Humas Kesehatan",
    company: "Kemenkes RI",
    avatar: "/images/testimonials/amanda-putri.webp",
    rating: 5,
    content:
      "Pemesanan lanyard instansi dalam jumlah besar selesai tepat waktu dengan kualitas yang seragam.",
  },
];

const ROTATIONS = [-4, 3, -2, 4, -3];

export default function AnimatedTestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTestimonial = TESTIMONIALS[activeIndex];

  const visibleImages = useMemo(
    () =>
      [0, 1, 2].map((offset) => {
        const index = (activeIndex + offset) % TESTIMONIALS.length;

        return {
          ...TESTIMONIALS[index],
          index,
          offset,
          rotate: ROTATIONS[index % ROTATIONS.length],
        };
      }),
    [activeIndex]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % TESTIMONIALS.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const showPrevious = () => {
    setActiveIndex(
      (current) => (current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
    );
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % TESTIMONIALS.length);
  };

  return (
    <section id="testimoni" className="animated-testimonials-section">
      <div className="animated-testimonials-container">
        <div className="animated-testimonials-visual" aria-hidden="true">
          <AnimatePresence mode="popLayout">
            {visibleImages.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                className="animated-testimonials-image-card"
                initial={{ opacity: 0, x: 34, rotate: testimonial.rotate }}
                animate={{
                  opacity: testimonial.offset === 0 ? 1 : 0.55,
                  x: testimonial.offset * 26,
                  y: testimonial.offset * 18,
                  scale: 1 - testimonial.offset * 0.08,
                  rotate: testimonial.rotate,
                  zIndex: 3 - testimonial.offset,
                }}
                exit={{ opacity: 0, x: -34, scale: 0.94 }}
                transition={{ duration: 0.38, ease: "easeOut" }}
              >
                <Image
                  src={testimonial.avatar}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 210px, 280px"
                  className="animated-testimonials-image"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="animated-testimonials-card">
          <div className="animated-testimonials-controls">
            <button
              type="button"
              className="animated-testimonials-arrow"
              aria-label="Testimoni sebelumnya"
              onClick={showPrevious}
            >
              <ArrowLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              className="animated-testimonials-arrow"
              aria-label="Testimoni berikutnya"
              onClick={showNext}
            >
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              <div className="animated-testimonials-rating" aria-label="Rating 5 dari 5">
                {Array.from({ length: activeTestimonial.rating }).map((_, index) => (
                  <Star key={index} aria-hidden="true" />
                ))}
              </div>
              <blockquote className="animated-testimonials-quote">
                &quot;{activeTestimonial.content}&quot;
              </blockquote>
              <div className="animated-testimonials-person">
                <Image
                  src={activeTestimonial.avatar}
                  alt={activeTestimonial.name}
                  width={56}
                  height={56}
                  className="animated-testimonials-avatar"
                />
                <div>
                  <p>{activeTestimonial.name}</p>
                  <span>
                    {activeTestimonial.role}, {activeTestimonial.company}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
