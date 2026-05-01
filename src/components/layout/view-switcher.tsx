"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

export function ViewSwitcher({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <section className="view-switcher">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link key={item.href} href={item.href} className={cn(active ? "secondary-button is-active" : "ghost-button")}>
            {item.label}
          </Link>
        );
      })}
    </section>
  );
}
