"use client";

import dynamic from "next/dynamic";

const LanyardRadialGallerySection = dynamic(
  () => import("@/components/LanyardRadialGallerySection"),
  {
    loading: () => <div className="min-h-[520px] bg-white" aria-hidden="true" />,
  },
);

const AnimatedTestimonialsSection = dynamic(
  () => import("@/components/AnimatedTestimonialsSection"),
  {
    loading: () => <div className="min-h-[420px] bg-white" aria-hidden="true" />,
  },
);

const HomepageFaqSection = dynamic(() => import("@/components/HomepageFaqSection"), {
  loading: () => <div className="min-h-[420px] bg-white" aria-hidden="true" />,
});

const OrderForm = dynamic(() => import("@/components/OrderForm"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center rounded-2xl bg-gray-50/50">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#e13b3d]" />
    </div>
  ),
});

export default function DeferredHomeSections() {
  return (
    <>
      <LanyardRadialGallerySection />
      <AnimatedTestimonialsSection />
      <HomepageFaqSection />
      <OrderForm />
    </>
  );
}
