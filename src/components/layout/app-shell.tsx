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
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-granix-green text-2xl font-black text-black">G</span>
            <span>
              <span className="block text-lg font-black leading-none">GRANIX</span>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-granix-green">Planering</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            <Link className="rounded-xl px-3 py-2 text-sm font-bold text-white/80 hover:bg-white/10" href="/dashboard">Dashboard</Link>
            <Link className="rounded-xl px-3 py-2 text-sm font-bold text-white/80 hover:bg-white/10" href="/projects">Projekt</Link>
            {user.role === "admin" && <Link className="rounded-xl px-3 py-2 text-sm font-bold text-white/80 hover:bg-white/10" href="/admin">Admin</Link>}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden text-right text-sm sm:block">
              <span className="block font-bold">{user.username}</span>
              <span className="text-white/50">{user.role}</span>
            </span>
            <form action={logoutAction}>
              <Button variant="secondary" type="submit">Logga ut</Button>
            </form>
          </div>
        </div>
        <nav className="grid grid-cols-3 border-t border-white/10 md:hidden">
          <Link className="px-3 py-3 text-center text-sm font-bold text-white/80" href="/dashboard">Dashboard</Link>
          <Link className="px-3 py-3 text-center text-sm font-bold text-white/80" href="/projects">Projekt</Link>
          <Link className="px-3 py-3 text-center text-sm font-bold text-white/80" href={user.role === "admin" ? "/admin" : "/dashboard"}>Admin</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
