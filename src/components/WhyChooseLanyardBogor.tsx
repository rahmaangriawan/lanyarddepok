"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";

const BENEFITS = [
  {
    icon: "lucide:award",
    title: "Kualitas Premium",
    desc: "Bahan pilihan, jahitan rapi, dan print tajam tahan lama.",
  },
  {
    icon: "lucide:pen-tool",
    title: "Desain Tanpa Batas",
    desc: "Bebas custom, full color, desain sesuai kebutuhan.",
  },
  {
    icon: "lucide:badge-percent",
    title: "Harga Kompetitif",
    desc: "Harga terbaik dengan kualitas yang tidak perlu diragukan.",
  },
  {
    icon: "lucide:headphones",
    title: "Layanan Responsif",
    desc: "Fast response dan komunikasi aktif setiap saat.",
  },
];

export default function WhyChooseLanyardBogor() {
  return (
    <section className="why-choose-section">
      <div className="why-choose-container">
        <div className="why-choose-heading">
          <div className="why-choose-kicker">
            <strong>Keunggulan Kami</strong>
          </div>
          <h2>Kenapa Ribuan Klien Memilih Lanyard Bogor?</h2>
          <p>
            Kami hadir dengan kualitas terbaik, desain fleksibel, dan layanan
            yang selalu mengutamakan kepuasan Anda.
          </p>
        </div>

        <div className="why-choose-grid">
          <article className="why-choose-showcase">
            <div className="why-choose-label">
              <Icon icon="lucide:gem" />
              <span>Premium Quality</span>
            </div>
            <div className="why-choose-image-wrap">
              <Image
                src="/uploads/why-choose-lanyard-showcase.webp"
                alt="Contoh lanyard custom premium Lanyard Bogor"
                width={760}
                height={520}
                className="why-choose-image"
                sizes="(min-width: 1100px) 42vw, 92vw"
              />
            </div>
            <div className="why-choose-tags" aria-label="Fitur produk">
              <span />
              <span />
              <span />
              <small>Custom Lanyard</small>
              <small>Premium Material</small>
              <small>Full Color Printing</small>
            </div>
          </article>

          <article
            className="why-choose-stats"
            aria-label="Statistik pelanggan"
          >
            <div className="why-choose-stat">
              <span className="why-choose-stat-icon">
                <Icon icon="lucide:users-round" />
              </span>
              <strong>1.000+</strong>
              <p>Klien Puas di Seluruh Indonesia</p>
            </div>
            <div className="why-choose-stat-divider" />
            <div className="why-choose-stat">
              <span className="why-choose-stat-icon">
                <Icon icon="lucide:star" />
              </span>
              <strong>98%</strong>
              <p>Tingkat Kepuasan Pelanggan</p>
            </div>
          </article>

          <div className="why-choose-benefits">
            {BENEFITS.map((benefit) => (
              <article className="why-choose-benefit" key={benefit.title}>
                <span className="why-choose-benefit-icon">
                  <Icon icon={benefit.icon} />
                </span>
                <h3>{benefit.title}</h3>
                <span className="why-choose-benefit-rule" />
                <p>{benefit.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
