import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <main className="grid min-h-screen place-items-center px-4 py-6">
      <div className="grid w-full max-w-[1100px] grid-cols-1 items-center gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(320px,420px)]">
        <section className="p-4">
          <p className="eyebrow">Internt planeringssystem</p>
          <div className="brand-wordmark">
            <span className="brand-mark">G</span>
            <div>
              <h1 className="text-5xl font-black tracking-tight text-[#1b2b31]">GRANIX</h1>
              <p className="mt-1 text-sm font-bold uppercase tracking-[0.18em] text-[#115e59]">Planering och rapportering</p>
            </div>
          </div>
          <p className="hero-copy">
            Lokal planering med inloggning, projektstyrning, veckonummer och administration av användare samt anställda.
          </p>
        </section>
        <LoginForm />
      </div>
    </main>
  );
}
