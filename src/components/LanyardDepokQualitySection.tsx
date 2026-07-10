import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  PenTool,
  Printer,
  RefreshCcw,
  type LucideIcon,
} from "lucide-react";

type BenefitItem = {
  title: string;
  description: string;
  Icon: LucideIcon;
};

const BENEFITS: BenefitItem[] = [
  {
    title: "Hasil Cetak Tajam",
    description: "Warna solid, detail jelas, dan tahan lama.",
    Icon: Printer,
  },
  {
    title: "Material Nyaman",
    description: "Kain halus, kuat, dan nyaman dipakai.",
    Icon: ClipboardCheck,
  },
  {
    title: "Desain Fleksibel",
    description: "Bebas desain custom sesuai identitas Anda.",
    Icon: PenTool,
  },
  {
    title: "Proses Cepat",
    description: "Pengerjaan efisien tanpa mengurangi kualitas.",
    Icon: RefreshCcw,
  },
];

export default function LanyardDepokQualitySection() {
  return (
    <section className="border-b border-border bg-background px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.95fr_1.95fr]">
        <article className="relative flex min-h-[20rem] flex-col overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground shadow-sm sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,var(--secondary),transparent_32%)] opacity-20" />
          <div className="relative z-10 flex h-full flex-col gap-5">
            <p className="max-w-none whitespace-nowrap text-xs font-extrabold uppercase leading-5 tracking-normal text-primary-foreground/80 sm:max-w-40 sm:whitespace-normal">
              Kenapa Memilih Lanyard Depok?
            </p>
            <h2 className="max-w-sm text-[1.7rem] font-extrabold leading-[1.08] tracking-normal sm:text-[2.4rem] lg:text-[2.4rem]">
              Kualitas yang terlihat, pelayanan yang terasa.
            </h2>
            <p className="max-w-sm text-sm font-medium leading-6 text-primary-foreground/85">
              Kami mengutamakan hasil terbaik di setiap detail, didukung
              layanan yang mudah dan responsif.
            </p>
            <Link
              href="/kontak"
              aria-label="Hubungi Lanyard Depok"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-foreground text-primary shadow-sm transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-foreground/70"
            >
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </article>

        <div className="grid gap-5 md:grid-cols-2">
          {BENEFITS.map(({ title, description, Icon }) => (
            <article
              key={title}
              className="flex min-h-[10rem] items-center gap-6 rounded-2xl border border-border bg-card p-7 shadow-xs sm:min-h-[11rem] sm:p-8"
            >
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-extrabold leading-tight tracking-normal text-foreground">
                  {title}
                </h3>
                <p className="mt-3 max-w-[15rem] text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
