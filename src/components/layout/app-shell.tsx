import Image from "next/image";
import Link from "next/link";
import { Role } from "@prisma/client";
import { logoutAction } from "@/server/actions/auth";
import { ViewSwitcher } from "@/components/layout/view-switcher";

export function AppShell({
  user,
  children,
}: {
  user: { username: string; role: Role };
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/dashboard", label: "Planering" },
    { href: "/time-reports", label: "Tidrapportering" },
    { href: "/diary", label: "Dagbok" },
    { href: "/projects", label: "Projekt" },
    ...(user.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Internt planeringssystem</p>
          <Link href="/dashboard" className="brand-wordmark">
            <Image src="/brand/granix-logo.png" alt="Granix" width={900} height={353} className="brand-logo" priority />
          </Link>
          <p className="hero-copy">
            Veckobaserad planering för team, projekt och uppföljning. All data sparas i databasen och delas mellan användare med riktiga roller och inloggning.
          </p>
          <div className="hero-meta">
            <span className="hero-meta-chip">Planering med tydliga veckonummer</span>
            <span className="hero-meta-chip">Tidrapportering och dagbok i samma system</span>
            <span className="hero-meta-chip">Granix intern överblick i realtid</span>
          </div>
        </div>

        <div className="hero-actions">
          <div className="session-pill">
            <span className="font-bold text-[#1b2b31]">{user.username}</span>
            <span className="type-badge">{user.role}</span>
          </div>
          <form action={logoutAction}>
            <button className="ghost-button" type="submit">Logga ut</button>
          </form>
        </div>
      </section>

      <ViewSwitcher items={navItems} />

      {children}
    </main>
  );
}
