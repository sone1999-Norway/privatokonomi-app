"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Forside" },
  { href: "/onboarding", label: "Start her" },
  { href: "/budget", label: "Budsjett" },
  { href: "/dashboard", label: "Oversikt" },
  { href: "/help", label: "Hjelp" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="Hovedmeny">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive ? "nav-item nav-item-active" : "nav-item"}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
