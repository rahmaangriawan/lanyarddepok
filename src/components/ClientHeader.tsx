"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ClientHeader() {
  const pathname = usePathname();

  // Hide the header on admin dashboard, API routes, and login pages
  if (
    pathname?.startsWith("/kawruh") ||
    pathname?.startsWith("/api") ||
    pathname?.startsWith("/login")
  ) {
    return null;
  }

  return <Header />;
}
