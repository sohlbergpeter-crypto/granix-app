import { cn } from "@/lib/utils";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.85rem] font-bold text-[#59707a]">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-11 w-full rounded-[14px] border border-[rgba(27,43,49,0.12)] bg-[rgba(255,255,255,0.96)] px-3 py-2 text-[#1b2b31] outline-none ring-0 placeholder:text-[#59707a] focus:border-[rgba(15,118,110,0.4)] focus:ring-2 focus:ring-[rgba(15,118,110,0.18)]";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, props.className)} {...props} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClass, "min-h-28 resize-y", props.className)} {...props} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(inputClass, props.className)} {...props} />;
}
