import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[28px] border border-[rgba(34,51,59,0.12)] bg-[rgba(255,251,244,0.88)] p-5 shadow-[0_26px_80px_rgba(19,41,47,0.12)] backdrop-blur", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-[1.35rem] font-black tracking-tight text-[#1b2b31]", className)} {...props} />;
}
