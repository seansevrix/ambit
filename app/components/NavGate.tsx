"use client";

import { usePathname } from "next/navigation";
import SiteNav from "./SiteNav";

export default function NavGate() {
  const pathname = usePathname() || "";

  const isGetStarted =
    pathname === "/get-started" || pathname.startsWith("/get-started/");

  return <SiteNav mode={isGetStarted ? "static" : "sticky"} />;
}
