"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";

type DeleteState = { error?: string; ok?: boolean } | null;

export function AdminDeleteForm({
  action,
  id,
  label,
  disabled,
  disabledReason,
}: {
  action: (state: DeleteState, formData: FormData) => Promise<DeleteState>;
  id: string;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [state, formAction, pending] = useActionState<DeleteState, FormData>(action, null);

  return (
    <form action={formAction} className="mt-3 grid gap-2">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="danger" disabled={disabled || pending}>
        {pending ? "Tar bort..." : label}
      </Button>
      {disabledReason ? <p className="text-xs text-[#59707a]">{disabledReason}</p> : null}
      {state?.error ? <p className="text-xs text-[#b91c1c]">{state.error}</p> : null}
      {state?.ok ? <p className="text-xs text-[#115e59]">Borttagen.</p> : null}
    </form>
  );
}
