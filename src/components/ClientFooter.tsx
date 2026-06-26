"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ClientFooter() {
  const pathname = usePathname();

  // Hide the footer on admin dashboard, API routes, and login pages
  if (
    pathname?.startsWith("/kawruh") ||
    pathname?.startsWith("/api") ||
    pathname?.startsWith("/login")
  ) {
    return null;
  }

  return <Footer />;
}
