import Image from "next/image";
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
          <div className="login-kicker">Granix internt system</div>
          <div className="brand-wordmark">
            <Image src="/brand/granix-logo.png" alt="Granix" width={900} height={353} className="brand-logo" priority />
          </div>
          <p className="hero-copy">
            Planering, projektstyrning, tidrapportering och dagbok i samma system. Logga in för att se kalender, aktiva projekt och administration.
          </p>
          <div className="hero-meta">
            <span className="hero-meta-chip">Veckonummer tydligt i planeringen</span>
            <span className="hero-meta-chip">Projekt, resurser och rapportering</span>
            <span className="hero-meta-chip">Delad data för hela företaget</span>
          </div>
        </div>
        <LoginForm />
      </div>
    </section>
  );
}
