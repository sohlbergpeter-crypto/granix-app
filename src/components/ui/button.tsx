import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font800 font-bold transition focus:outline-none focus:ring-2 focus:ring-granix-green disabled:opacity-50",
        variant === "primary" && "bg-granix-green text-black hover:bg-[#29d765]",
        variant === "secondary" && "border border-white/15 bg-white/10 text-white hover:bg-white/15",
        variant === "danger" && "bg-red-500 text-white hover:bg-red-400",
        variant === "ghost" && "text-white hover:bg-white/10",
        className
      )}
      {...props}
    />
  );
}
