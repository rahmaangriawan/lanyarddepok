# Catatan Fixing — 24 Juni 2026

## 1. Fix Settings — Service Account JSON Kehapus Tiap Render

**File:** `src/app/kawruh/settings/page.tsx`

**Masalah:** `useEffect` pakai dependency `[toast]` → setiap re-render (termasuk saat upload file) data settings (service account JSON, Spreadsheet ID) kehapus.

**Fix:** Ganti dependency jadi `[]`.

---

## 2. API Single Product — Auto-Create Local Entry + Published

**File:** `src/app/api/cms/products/[sku]/route.ts`

**Masalah:** Produk dari spreadsheet gak punya local entry di database → edit page kosong.

**Fix:** Kalau `localProduct` null, auto-create dengan `published: true`.

---

## 3. API List Produk & Public — Auto-Insert dengan `published: true`

**File:** `src/app/api/cms/products/route.ts` + `src/lib/products-server.ts`

**Masalah:** Produk auto-insert dengan `published: false` → gak muncul di halaman publik.

**Fix:** Ubah jadi `published: true`.

---

## 4. Default Meta Title & Description dari Spreadsheet

**File:** `src/app/api/cms/products/[sku]/route.ts`, `src/app/api/cms/products/route.ts`, `src/lib/products-server.ts`

**Masalah:** `metaTitle` dan `metaDescription` kosong meskipun spreadsheet punya nama & deskripsi.

**Fix:** Default `metaTitle = baseProduct?.name`, `metaDescription = baseProduct?.shortDesc`.

---

## 5. Case-Insensitive SKU Matching

**File:** `src/app/api/cms/products/[sku]/route.ts`

**Masalah:** `p.sku === sku` gagal kalau beda kapital antara URL dan spreadsheet.

**Fix:** `p.sku.toLowerCase() === sku.toLowerCase()`.

---

## 6. Edit Page — `params` dari Next.js 16 Pakai Promise

**File:** `src/app/kawruh/products/edit/[sku]/page.tsx`

**Masalah:** Next.js 16 ngirim `params` sebagai Promise ke client component. Destructure langsung dapet `undefined`.

**Fix:** Import `use` dari React, pake `const { sku: encodedSku } = use(params)`.

---

## 7. API — Fallback SKU dari URL Path

**File:** `src/app/api/cms/products/[sku]/route.ts`

**Masalah:** Kadang `params.sku` kosong.

**Fix:** Tambah fallback extract SKU dari `request.url.split("/")`.

---

## 8. Admin List Produk — Image Dibesarin + Border Dihapus

**File:** `src/app/kawruh/products/page.tsx`

**Masalah:** Thumbnail produk kecil (`h-10 w-10` = 40px) dan ada border solid.

**Fix:**
- `h-10 w-10` → `h-14 w-14` (56px)
- Hapus `border border-gray-150`
- Icon placeholder: `h-5 w-5` → `h-6 w-6`
- Kolom: `w-44` → `w-56`
