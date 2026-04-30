import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <section className="login-screen">
      <div className="login-shell">
        <div className="login-copy">
          <p className="eyebrow">Internt planeringssystem</p>
          <div className="brand-wordmark">
            <span className="brand-mark">G</span>
            <div>
              <h1 className="text-[4rem] font-black leading-none tracking-tight text-[#1b2b31]">GRANIX</h1>
              <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-[#115e59]">Planering och rapportering</p>
            </div>
          </div>
          <p className="hero-copy">
            Lokal planering med inloggning, projektstyrning, veckonummer och administration av användare samt anställda.
          </p>
        </div>
        <LoginForm />
      </div>
    </section>
  );
}
