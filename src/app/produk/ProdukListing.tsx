"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch, MouseEvent, ReactNode, SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { DEFAULT_PRODUCTS, UnifiedProduct } from "@/lib/products-service";
import { animateWishlistFly } from "@/lib/wishlist-animation";
import { getWishlist, saveWishlist, checkRateLimit } from "@/lib/wishlist-storage";
import { useToast } from "@/components/Toast";
import { getPaginationItems } from "@/lib/pagination";

type ProdukListingProps = {
  initialProducts?: UnifiedProduct[];
};

type FilterOption = {
  label: string;
  keywords: string[];
};

const ITEMS_PER_PAGE = 12;

const materialOptions: FilterOption[] = [
  { label: "Polyester", keywords: ["polyester"] },
  { label: "Tisu", keywords: ["tisu", "tissue"] },
  { label: "Satin", keywords: ["satin"] },
  { label: "Nylon", keywords: ["nylon"] },
];

const widthOptions: FilterOption[] = [
  { label: "1.5 cm", keywords: ["1.5cm", "1,5cm", "1.5 cm", "1,5 cm"] },
  { label: "2 cm", keywords: ["2cm", "2 cm"] },
  { label: "2.5 cm", keywords: ["2.5cm", "2,5cm", "2.5 cm", "2,5 cm"] },
];

function getProductText(product: UnifiedProduct) {
  return [
    product.name,
    product.sku,
    product.specs,
    product.accessories,
    product.description,
    product.category?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function parsePrice(price: string) {
  const value = Number(price.replace(/[^\d]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\s/g, " ");
}

function countMatches(products: UnifiedProduct[], option: FilterOption) {
  return products.filter((product) => {
    const text = getProductText(product);
    return option.keywords.some((keyword) => text.includes(keyword));
  }).length;
}

function matchesSelectedOptions(product: UnifiedProduct, selected: string[], options: FilterOption[]) {
  if (selected.length === 0) {
    return true;
  }

  const text = getProductText(product);
  return selected.some((label) => {
    const option = options.find((item) => item.label === label);
    return option ? option.keywords.some((keyword) => text.includes(keyword)) : false;
  });
}

function ProductImage({ eager = false, product }: { eager?: boolean; product: UnifiedProduct }) {
  if (!product.featuredImage) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-public-amber">
        <span className="text-2xl font-black tracking-wider">{product.sku.substring(0, 2)}</span>
        <span className="mt-1 text-[9px] font-bold uppercase tracking-widest">Lanyard</span>
      </div>
    );
  }

  if (product.featuredImage.startsWith("http")) {
    return (
      // External images may not be configured for next/image in this project.
      // Keep this fallback aspect-safe and contained.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.featuredImage}
        alt={product.name}
        className="h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]"
        fetchPriority={eager ? "high" : "auto"}
        loading={eager ? "eager" : "lazy"}
      />
    );
  }

  return (
    <Image
      src={product.featuredImage}
      alt={product.name}
      fill
      fetchPriority={eager ? "high" : "auto"}
      loading={eager ? "eager" : "lazy"}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]"
    />
  );
}

export default function ProdukListing({ initialProducts = [] }: ProdukListingProps) {
  const [products, setProducts] = useState<UnifiedProduct[]>(
    initialProducts.length > 0 ? initialProducts : DEFAULT_PRODUCTS,
  );
  const [lovedSkus, setLovedSkus] = useState<string[]>([]);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedWidths, setSelectedWidths] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("terbaru");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftPrice, setDraftPrice] = useState<[number, number] | null>(null);
  const [appliedPrice, setAppliedPrice] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialProducts.length > 0) {
      return;
    }

    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (res.ok && data.success && data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          setProducts(DEFAULT_PRODUCTS);
        }
      } catch (err) {
        console.error("Failed to load products listing:", err);
        setProducts(DEFAULT_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [initialProducts.length]);

  useEffect(() => {
    const loadLoved = () => setLovedSkus(getWishlist());
    const timer = window.setTimeout(loadLoved, 0);
    window.addEventListener("wishlist-updated", loadLoved);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("wishlist-updated", loadLoved);
    };
  }, []);

  const priceBounds = useMemo(() => {
    const prices = products.map((product) => parsePrice(product.basePrice)).filter((price) => price > 0);
    if (prices.length === 0) {
      return { min: 0, max: 0 };
    }

    return {
      min: Math.floor(Math.min(...prices) / 500) * 500,
      max: Math.ceil(Math.max(...prices) / 500) * 500,
    };
  }, [products]);

  useEffect(() => {
    setDraftPrice([priceBounds.min, priceBounds.max]);
    setAppliedPrice([priceBounds.min, priceBounds.max]);
  }, [priceBounds.min, priceBounds.max]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((product) => {
      const category = product.category?.name || "Lanyard";
      counts.set(category, (counts.get(category) || 0) + 1);
    });

    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  const materialCounts = useMemo(
    () => materialOptions.map((option) => ({ ...option, count: countMatches(products, option) })),
    [products],
  );

  const widthCounts = useMemo(
    () => widthOptions.map((option) => ({ ...option, count: countMatches(products, option) })),
    [products],
  );

  const toggleValue = (
    value: string,
    selected: string[],
    setSelected: Dispatch<SetStateAction<string[]>>,
  ) => {
    setSelected((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedMaterials([]);
    setSelectedWidths([]);
    setSortBy("terbaru");
    setDraftPrice([priceBounds.min, priceBounds.max]);
    setAppliedPrice([priceBounds.min, priceBounds.max]);
    setCurrentPage(1);
  };

  const handleToggleLoved = (sku: string, event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const limit = checkRateLimit();
    if (!limit.allowed) {
      toast.warning(`Terlalu cepat! Batas klik favorit tercapai. Coba lagi dalam ${limit.waitTimeSec} detik.`);
      return;
    }

    const skus = getWishlist();
    let updatedSkus: string[];

    if (skus.includes(sku)) {
      updatedSkus = skus.filter((item) => item !== sku);
    } else {
      updatedSkus = [...skus, sku];
      animateWishlistFly(event.currentTarget as HTMLElement);
    }

    saveWishlist(updatedSkus);
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const filteredProducts = useMemo(() => {
    const activePrice = appliedPrice || [priceBounds.min, priceBounds.max];
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const text = getProductText(product);
      const productPrice = parsePrice(product.basePrice);
      const category = product.category?.name || "Lanyard";

      const matchesSearch = query.length === 0 || text.includes(query);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(category);
      const matchesMaterial = matchesSelectedOptions(product, selectedMaterials, materialOptions);
      const matchesWidth = matchesSelectedOptions(product, selectedWidths, widthOptions);
      const matchesPrice = productPrice >= activePrice[0] && productPrice <= activePrice[1];

      return matchesSearch && matchesCategory && matchesMaterial && matchesWidth && matchesPrice;
    });
  }, [
    appliedPrice,
    priceBounds.max,
    priceBounds.min,
    products,
    searchQuery,
    selectedCategories,
    selectedMaterials,
    selectedWidths,
  ]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === "harga-terendah") {
        return parsePrice(a.basePrice) - parsePrice(b.basePrice);
      }

      if (sortBy === "harga-tertinggi") {
        return parsePrice(b.basePrice) - parsePrice(a.basePrice);
      }

      if (sortBy === "nama-az") {
        return a.name.localeCompare(b.name);
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredProducts, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const paginationItems = useMemo(() => getPaginationItems(currentPage, totalPages), [currentPage, totalPages]);
  const pageStart = sortedProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, sortedProducts.length);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, sortedProducts]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!filterOpen) {
      delete document.body.dataset.productFilterOpen;
      window.dispatchEvent(new Event("product-filter-visibility-change"));
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.dataset.productFilterOpen = "true";
    window.dispatchEvent(new Event("product-filter-visibility-change"));

    return () => {
      document.body.style.overflow = originalOverflow;
      delete document.body.dataset.productFilterOpen;
      window.dispatchEvent(new Event("product-filter-visibility-change"));
    };
  }, [filterOpen]);

  const filterContent = (
    <div className="space-y-6">
      <FilterGroup title="Kategori">
        <FilterCheckbox
          label="Semua Produk"
          count={products.length}
          checked={selectedCategories.length === 0}
          onChange={() => {
            setSelectedCategories([]);
            setCurrentPage(1);
          }}
        />
        {categories.map(([category, count]) => (
          <FilterCheckbox
            key={category}
            label={category}
            count={count}
            checked={selectedCategories.includes(category)}
            onChange={() => toggleValue(category, selectedCategories, setSelectedCategories)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Bahan">
        {materialCounts.map((option) => (
          <FilterCheckbox
            key={option.label}
            label={option.label}
            count={option.count}
            checked={selectedMaterials.includes(option.label)}
            disabled={option.count === 0}
            onChange={() => toggleValue(option.label, selectedMaterials, setSelectedMaterials)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Lebar">
        {widthCounts.map((option) => (
          <FilterCheckbox
            key={option.label}
            label={option.label}
            count={option.count}
            checked={selectedWidths.includes(option.label)}
            disabled={option.count === 0}
            onChange={() => toggleValue(option.label, selectedWidths, setSelectedWidths)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Harga">
        <div className="space-y-4 pt-1">
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-500" htmlFor="produk-min-price">
              Harga minimum
            </label>
            <input
              id="produk-min-price"
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={500}
              value={draftPrice?.[0] ?? priceBounds.min}
              onChange={(event) => {
                const nextValue = Number(event.target.value);
                setDraftPrice((current) => {
                  const max = current?.[1] ?? priceBounds.max;
                  return [Math.min(nextValue, max), max];
                });
              }}
              className="w-full accent-public-amber"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-500" htmlFor="produk-max-price">
              Harga maksimum
            </label>
            <input
              id="produk-max-price"
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={500}
              value={draftPrice?.[1] ?? priceBounds.max}
              onChange={(event) => {
                const nextValue = Number(event.target.value);
                setDraftPrice((current) => {
                  const min = current?.[0] ?? priceBounds.min;
                  return [min, Math.max(nextValue, min)];
                });
              }}
              className="w-full accent-public-amber"
            />
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-gray-600">
            <span>{formatRupiah(draftPrice?.[0] ?? priceBounds.min)}</span>
            <span>{formatRupiah(draftPrice?.[1] ?? priceBounds.max)}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setAppliedPrice(draftPrice || [priceBounds.min, priceBounds.max]);
              setCurrentPage(1);
              setFilterOpen(false);
            }}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-public-amber px-4 text-sm font-extrabold text-gray-950 transition hover:bg-public-amber-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber"
          >
            Terapkan Filter
            <Icon icon="lucide:sliders-horizontal" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center rounded-lg border border-public-border bg-white px-4 text-xs font-bold text-gray-600 transition hover:border-public-amber hover:text-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber"
          >
            Reset Filter
          </button>
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border border-public-border bg-white p-5 shadow-sm">
          {filterContent}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <p className="hidden text-sm font-semibold text-gray-700 sm:block">
            Menampilkan {pageStart}-{pageEnd} dari {sortedProducts.length} produk
          </p>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
            <div className="relative w-full md:w-60 xl:w-64">
              <input
                type="search"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
                className="min-h-11 w-full rounded-lg border border-public-border bg-white px-4 pr-10 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-public-amber focus:ring-2 focus:ring-public-amber/20"
              />
              <Icon
                icon="lucide:search"
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              />
            </div>

            <div className="grid w-full grid-cols-2 gap-3 md:flex md:w-auto md:items-center md:gap-2">
              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setCurrentPage(1);
                }}
                className="min-h-11 w-full cursor-pointer rounded-lg border border-public-border bg-white px-3 text-[13px] font-bold text-gray-800 outline-none transition focus:border-public-amber focus:ring-2 focus:ring-public-amber/20 md:w-auto md:px-4 md:text-sm"
                aria-label="Urutkan produk"
              >
                <option value="terbaru">Terbaru</option>
                <option value="harga-terendah">Harga Terendah</option>
                <option value="harga-tertinggi">Harga Tertinggi</option>
                <option value="nama-az">Nama A-Z</option>
              </select>

              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-public-border bg-white px-3 text-[13px] font-bold text-gray-800 transition hover:border-public-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber md:w-auto md:px-4 md:text-sm lg:hidden"
                aria-controls="produk-mobile-filter"
                aria-expanded={filterOpen}
              >
                <Icon icon="lucide:filter" className="h-4 w-4" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {filterOpen && (
          <div
            className="fixed inset-0 z-[80] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="produk-mobile-filter-title"
          >
            <button
              type="button"
              className="absolute inset-0 cursor-pointer bg-gray-950/45"
              aria-label="Tutup panel filter"
              onClick={() => setFilterOpen(false)}
            />
            <aside
              id="produk-mobile-filter"
              className="absolute right-0 top-0 h-full w-[min(88vw,360px)] overflow-y-auto bg-white p-5 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between gap-4 border-b border-public-border pb-4">
                <h2 id="produk-mobile-filter-title" className="text-base font-extrabold text-gray-950">
                  Filter Produk
                </h2>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-public-border text-gray-600 transition hover:border-public-amber hover:text-public-amber-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber"
                  aria-label="Tutup filter"
                >
                  <Icon icon="lucide:x" className="h-5 w-5" />
                </button>
              </div>
              {filterContent}
            </aside>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="min-h-[285px] rounded-xl border border-public-border bg-white p-4 shadow-sm">
                <div className="aspect-square animate-pulse rounded-lg bg-public-soft" />
                <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-public-soft" />
                <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-public-soft" />
                <div className="mt-4 h-10 animate-pulse rounded-lg bg-public-soft" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="rounded-xl border border-public-border bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-public-soft text-public-amber">
              <Icon icon="lucide:shopping-bag" className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-lg font-extrabold text-gray-950">Produk tidak ditemukan</h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-gray-600">
              Tidak ada produk yang cocok dengan filter saat ini. Coba reset filter atau gunakan kata kunci
              lain.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-public-amber px-5 text-sm font-extrabold text-gray-950 transition hover:bg-public-amber-strong"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="space-y-7">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {paginatedProducts.map((product, index) => {
                const isLoved = lovedSkus.includes(product.sku);
                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                const isBestSeller = (product.order ?? globalIndex) <= 3;

                return (
                  <Link
                    key={product.sku}
                    href={`/produk/${product.slug}`}
                    className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-xl border border-public-border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-public-amber/45 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber"
                  >
                    {isBestSeller && (
                      <span className="absolute left-3 top-3 z-20 rounded-full bg-public-amber/90 px-2.5 py-1 text-[9px] font-extrabold text-gray-950 shadow-sm">
                        Best Seller
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(event) => handleToggleLoved(product.sku, event)}
                      className="absolute right-3 top-3 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-public-border bg-white/95 text-gray-400 shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition hover:border-public-amber hover:text-public-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber"
                      aria-label={isLoved ? "Hapus dari favorit" : "Tambah ke favorit"}
                    >
                      <Icon
                        icon={isLoved ? "mdi:heart" : "lucide:heart"}
                        className={`h-4 w-4 ${isLoved ? "text-public-amber" : ""}`}
                      />
                    </button>

                    <div className="relative aspect-square bg-public-soft/45">
                      <ProductImage eager={currentPage === 1 && index === 0} product={product} />
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h2 className="line-clamp-2 min-h-[2.75rem] text-sm font-extrabold leading-snug text-gray-950">
                        {product.name}
                      </h2>
                      <p className="mt-2 text-sm font-extrabold text-gray-950">{product.basePrice}</p>
                      <div className="mt-auto pt-4">
                        <span className="inline-flex items-center gap-2 text-xs font-extrabold text-gray-950 transition group-hover:text-public-amber-strong">
                          Lihat Detail
                          <Icon
                            icon="lucide:arrow-right"
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <PaginationButton
                  disabled={currentPage === 1}
                  label="Halaman sebelumnya"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  <Icon icon="lucide:chevron-left" className="h-4 w-4" />
                </PaginationButton>

                {paginationItems.map((pageNumber) => {
                  if (typeof pageNumber === "string") {
                    return (
                      <span
                        key={pageNumber}
                        className="inline-flex h-9 w-9 items-center justify-center text-xs font-bold text-gray-400"
                      >
                        ...
                      </span>
                    );
                  }

                  const active = pageNumber === currentPage;
                  return (
                    <button
                      type="button"
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border text-xs font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber ${
                        active
                          ? "border-public-amber bg-public-amber text-gray-950"
                          : "border-public-border bg-white text-gray-700 hover:border-public-amber"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <PaginationButton
                  disabled={currentPage === totalPages}
                  label="Halaman berikutnya"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  <Icon icon="lucide:chevron-right" className="h-4 w-4" />
                </PaginationButton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="border-b border-public-border pb-5 last:border-b-0 last:pb-0">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-gray-950">{title}</h3>
        <span className="h-0.5 w-2 rounded-full bg-public-amber" />
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function FilterCheckbox({
  checked,
  count,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  count: number;
  disabled?: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex min-h-6 items-center gap-3 text-sm font-semibold ${
        disabled ? "cursor-not-allowed text-gray-300" : "cursor-pointer text-gray-700"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="h-4 w-4 cursor-pointer rounded border-public-border text-public-amber accent-public-amber focus:ring-public-amber disabled:cursor-not-allowed"
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="text-xs text-gray-400">({count})</span>
    </label>
  );
}

function PaginationButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: ReactNode;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  if (disabled) {
    return (
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-public-border bg-white text-gray-300"
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-public-border bg-white text-gray-700 transition hover:border-public-amber hover:text-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber"
      aria-label={label}
    >
      {children}
    </button>
  );
}
