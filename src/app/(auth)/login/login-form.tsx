"use client";

import { useActionState } from "react";
import { loginAction } from "@/server/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form action={action} className="glass-card login-card grid gap-4 p-5">
      <div className="card-header">
        <div>
          <p className="section-label">Säker access</p>
          <h2 className="text-[1.35rem] font-black text-[#1b2b31]">Logga in</h2>
        </div>
      </div>

      <label className="grid gap-2">
        <span className="text-[0.85rem] font-bold text-[#59707a]">Användarnamn</span>
        <input className="min-h-11 rounded-[14px] border border-[rgba(27,43,49,0.12)] bg-[rgba(255,255,255,0.96)] px-3 py-2 text-[#1b2b31]" name="identifier" autoComplete="username" required />
      </label>

      <label className="grid gap-2">
        <span className="text-[0.85rem] font-bold text-[#59707a]">Lösenord</span>
        <input className="min-h-11 rounded-[14px] border border-[rgba(27,43,49,0.12)] bg-[rgba(255,255,255,0.96)] px-3 py-2 text-[#1b2b31]" name="password" type="password" autoComplete="current-password" required />
      </label>

      <button className="primary-button" type="submit" disabled={pending}>{pending ? "Loggar in..." : "Logga in"}</button>
      <p className="text-sm text-[#b91c1c]">{state?.error || ""}</p>
    </form>
  );
}
