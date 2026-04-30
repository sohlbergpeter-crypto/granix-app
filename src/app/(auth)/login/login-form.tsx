"use client";

import { useActionState } from "react";
import { loginAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <Card className="w-full max-w-[420px] p-5">
      <div className="mb-8">
        <p className="eyebrow">Säker access</p>
        <CardTitle>Logga in</CardTitle>
      </div>
      <form action={action} className="grid gap-4">
        <Field label="Användarnamn eller e-post">
          <Input name="identifier" autoComplete="username" placeholder="admin eller admin@granix.se" required />
        </Field>
        <Field label="Lösenord">
          <Input name="password" type="password" autoComplete="current-password" placeholder="********" required />
        </Field>
        {state?.error && <p className="rounded-[20px] border border-[rgba(185,28,28,0.18)] bg-[rgba(239,68,68,0.08)] p-3 text-sm text-[#b91c1c]">{state.error}</p>}
        <Button type="submit" disabled={pending}>{pending ? "Loggar in..." : "Logga in"}</Button>
      </form>
      <div className="mt-6 grid gap-1 rounded-[20px] border border-[rgba(34,51,59,0.1)] bg-[rgba(255,255,255,0.72)] p-4 text-sm text-[#59707a]">
        <strong className="text-[#1b2b31]">Standardkonto</strong>
        <span>Användare: <code>admin</code></span>
        <span>Lösenord: <code>admin123</code></span>
      </div>
    </Card>
  );
}
