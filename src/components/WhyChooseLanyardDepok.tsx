import Image from "next/image";
import { Award, BadgePercent, Gem, Headphones, PenTool, Star, UsersRound } from "lucide-react";

const BENEFITS = [
  {
    Icon: Award,
    title: "Kualitas Premium",
    desc: "Bahan pilihan, jahitan rapi, dan print tajam tahan lama.",
  },
  {
    Icon: PenTool,
    title: "Desain Tanpa Batas",
    desc: "Bebas custom, full color, desain sesuai kebutuhan.",
  },
  {
    Icon: BadgePercent,
    title: "Harga Kompetitif",
    desc: "Harga terbaik dengan kualitas yang tidak perlu diragukan.",
  },
  {
    Icon: Headphones,
    title: "Layanan Responsif",
    desc: "Fast response dan komunikasi aktif setiap saat.",
  },
];

export default function WhyChooseLanyardDepok() {
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
              <Gem aria-hidden="true" />
              <span>Premium Quality</span>
            </div>
            <div className="why-choose-image-wrap">
              <Image
                src="/uploads/why-choose-lanyard-showcase-mobile.webp"
                alt="Contoh lanyard custom premium Lanyard Bogor"
                width={360}
                height={214}
                className="why-choose-image"
                sizes="(min-width: 1100px) 320px, (min-width: 720px) 46vw, 86vw"
                quality={58}
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
                <UsersRound aria-hidden="true" />
              </span>
              <strong>1.000+</strong>
              <p>Klien Puas di Seluruh Indonesia</p>
            </div>
            <div className="why-choose-stat-divider" />
            <div className="why-choose-stat">
              <span className="why-choose-stat-icon">
                <Star aria-hidden="true" />
              </span>
              <strong>98%</strong>
              <p>Tingkat Kepuasan Pelanggan</p>
            </div>
          </article>

          <div className="why-choose-benefits">
            {BENEFITS.map((benefit) => (
              <article className="why-choose-benefit" key={benefit.title}>
                <span className="why-choose-benefit-icon">
                  <benefit.Icon aria-hidden="true" />
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
