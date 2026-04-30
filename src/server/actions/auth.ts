"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyCredentials } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function loginAction(_: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Kontrollera inloggningen." };
  }

  const user = await verifyCredentials(parsed.data.identifier, parsed.data.password);
  if (!user) {
    return { error: "Fel användarnamn, e-post eller lösenord." };
  }

  await createSession(user);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
