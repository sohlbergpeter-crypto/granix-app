"use client";

import { useActionState } from "react";
import { loginAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <Card className="w-full max-w-md">
      <div className="mb-8">
        <div className="mb-5 inline-grid h-16 w-16 place-items-center rounded-3xl bg-granix-green text-4xl font-black text-black">
          G
        </div>
        <CardTitle>Logga in</CardTitle>
        <p className="mt-2 text-sm text-white/60">Planering, resurser, filer och notiser i samma system.</p>
      </div>
      <form action={action} className="grid gap-4">
        <Field label="E-post eller användarnamn">
          <Input name="identifier" autoComplete="username" placeholder="admin eller admin@granix.se" required />
        </Field>
        <Field label="Lösenord">
          <Input name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
        </Field>
        {state?.error && <p className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100">{state.error}</p>}
        <Button type="submit" disabled={pending}>{pending ? "Loggar in..." : "Logga in"}</Button>
      </form>
      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-white/60">
        Testkonto efter seed: <strong className="text-white">admin</strong> / <strong className="text-white">admin123</strong>
      </div>
    </Card>
  );
}
