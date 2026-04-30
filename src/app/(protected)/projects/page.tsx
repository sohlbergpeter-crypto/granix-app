import Link from "next/link";
import { ProjectStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { ProjectList } from "@/components/projects/project-list";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const params = await searchParams;
  const query = params.q || "";
  const status = params.status || "alla";
  const city = params.city || "";

  const projects = await db.project.findMany({
    where: {
      ...(status !== "alla" ? { status: status as ProjectStatus } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { projectNumber: { contains: query, mode: "insensitive" } },
              { customerName: { contains: query, mode: "insensitive" } },
              { address: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { employees: { include: { employee: true } } },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black">Projekt</h1>
          <p className="text-white/60">Sök, filtrera och öppna projektdetaljer.</p>
        </div>
        {user.role === "admin" && <Link href="/projects/new"><Button>Skapa projekt</Button></Link>}
      </div>
      <Card>
        <form className="grid gap-3 md:grid-cols-[1fr_220px_220px_auto]">
          <Input name="q" placeholder="Sök projekt, kund, adress..." defaultValue={query} />
          <Select name="status" defaultValue={status}>
            <option value="alla">Alla statusar</option>
            {Object.values(ProjectStatus).map((entry) => <option key={entry} value={entry}>{entry}</option>)}
          </Select>
          <Input name="city" placeholder="Ort" defaultValue={city} />
          <Button type="submit">Filtrera</Button>
        </form>
      </Card>
      <ProjectList projects={projects} />
    </div>
  );
}
