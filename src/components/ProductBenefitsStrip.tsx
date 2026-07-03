"use client";

import { Icon } from "@iconify/react";

const BENEFITS = [
  {
    icon: "lucide:timer",
    title: "Produksi Cepat",
    desc: "Ready 1-3 hari kerja",
  },
  {
    icon: "lucide:file-text",
    title: "Desain Bebas",
    desc: "Custom desain tanpa batas",
  },
  {
    icon: "lucide:grid-2x2",
    title: "MOQ Fleksibel",
    desc: "Mulai dari 50 pcs",
  },
  {
    icon: "lucide:user-round",
    title: "Ribuan Klien Puas",
    desc: "Kualitas & layanan terbaik",
  },
];

export default function ProductBenefitsStrip() {
  return (
    <section className="product-benefits-strip-section homepage-deferred-section">
      <div className="product-benefits-strip">
        {BENEFITS.map((benefit) => (
          <div className="product-benefits-item" key={benefit.title}>
            <span className="product-benefits-icon">
              <Icon icon={benefit.icon} />
            </span>
            <span className="product-benefits-copy">
              <strong>{benefit.title}</strong>
              <small>{benefit.desc}</small>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
