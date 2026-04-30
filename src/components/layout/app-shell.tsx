import Link from "next/link";
import { Role } from "@prisma/client";
import { logoutAction } from "@/server/actions/auth";

export function AppShell({
  user,
  children,
}: {
  user: { username: string; role: Role };
  children: React.ReactNode;
}) {
  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Internt planeringssystem</p>
          <Link href="/dashboard" className="brand-wordmark">
            <span className="brand-mark">G</span>
            <span>
              <span className="block text-[3rem] font-black leading-none tracking-tight text-[#1b2b31]">GRANIX</span>
              <span className="mt-2 block text-sm font-bold uppercase tracking-[0.18em] text-[#115e59]">Planering</span>
            </span>
          </Link>
          <p className="hero-copy">
            Veckobaserad planering för team, projekt och uppföljning. All data sparas i databasen och är delad mellan användare.
          </p>
        </div>

        <div className="hero-actions">
          <div className="session-pill">
            <span className="font-bold text-[#1b2b31]">{user.username}</span>
            <span className="type-badge">{user.role}</span>
          </div>
          <Link href="/dashboard" className="secondary-button">Planering</Link>
          <Link href="/projects" className="ghost-button">Projekt</Link>
          {user.role === "admin" ? <Link href="/admin" className="ghost-button">Administration</Link> : null}
          <form action={logoutAction}>
            <button className="ghost-button" type="submit">Logga ut</button>
          </form>
        </div>
      </section>

      <section className="view-switcher">
        <Link href="/dashboard" className="secondary-button is-active">Planering</Link>
        <Link href="/projects" className="ghost-button">Projekt</Link>
        {user.role === "admin" ? <Link href="/admin" className="ghost-button">Administration</Link> : null}
      </section>

      {children}
    </main>
  );
}
