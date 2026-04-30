import Link from "next/link";
import { Role } from "@prisma/client";
import { logoutAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

export function AppShell({
  user,
  children,
}: {
  user: { username: string; role: Role };
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <main className="mx-auto w-[min(1440px,calc(100%-2rem))] py-8">
        <section className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">Internt planeringssystem</p>
            <Link href="/dashboard" className="brand-wordmark">
              <span className="brand-mark">G</span>
              <span>
                <span className="block text-5xl font-black leading-none tracking-tight text-[#1b2b31]">GRANIX</span>
                <span className="mt-2 block text-sm font-bold uppercase tracking-[0.2em] text-[#115e59]">Planering</span>
              </span>
            </Link>
            <p className="hero-copy">
              Veckobaserad planering för team, projekt och uppföljning. All data sparas i den riktiga databasen bakom appen.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="grid gap-1 rounded-full border border-[rgba(27,43,49,0.1)] bg-[rgba(255,255,255,0.78)] px-4 py-3 text-sm">
              <span className="font-bold text-[#1b2b31]">{user.username}</span>
              <span className="text-[#59707a]">{user.role}</span>
            </div>
            <form action={logoutAction}>
              <Button variant="ghost" type="submit">Logga ut</Button>
            </form>
          </div>
        </section>

        <section className="mb-4 flex flex-wrap gap-3">
          <Link href="/dashboard"><Button variant="secondary" type="button">Planering</Button></Link>
          <Link href="/projects"><Button variant="ghost" type="button">Projekt</Button></Link>
          {user.role === "admin" && <Link href="/admin"><Button variant="ghost" type="button">Administration</Button></Link>}
        </section>

        {children}
      </main>
    </div>
  );
}
