import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-bold transition duration-150 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/25 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-[#0f766e] text-white hover:-translate-y-0.5 hover:bg-[#115e59]",
        variant === "secondary" && "bg-[rgba(15,118,110,0.12)] text-[#115e59] hover:-translate-y-0.5 hover:bg-[rgba(15,118,110,0.18)]",
        variant === "danger" && "bg-[rgba(239,68,68,0.12)] text-[#b91c1c] hover:-translate-y-0.5 hover:bg-[rgba(239,68,68,0.18)]",
        variant === "ghost" && "border border-[rgba(27,43,49,0.14)] bg-transparent text-[#1b2b31] hover:-translate-y-0.5 hover:bg-white/80",
        className
      )}
      {...props}
    />
  );
}
