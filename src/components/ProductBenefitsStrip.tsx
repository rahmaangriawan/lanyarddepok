import { FileText, Grid2X2, Timer, UserRound } from "lucide-react";

const BENEFITS = [
  {
    Icon: Timer,
    title: "Produksi Cepat",
    desc: "Ready 1-3 hari kerja",
  },
  {
    Icon: FileText,
    title: "Desain Bebas",
    desc: "Custom desain tanpa batas",
  },
  {
    Icon: Grid2X2,
    title: "MOQ Fleksibel",
    desc: "Mulai dari 50 pcs",
  },
  {
    Icon: UserRound,
    title: "Ribuan Klien Puas",
    desc: "Kualitas & layanan terbaik",
  },
];

export default function ProductBenefitsStrip() {
  return (
    <section className="product-benefits-strip-section">
      <div className="product-benefits-strip">
        {BENEFITS.map((benefit) => (
          <div className="product-benefits-item" key={benefit.title}>
            <span className="product-benefits-icon">
              <benefit.Icon aria-hidden="true" />
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
