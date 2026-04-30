import Link from "next/link";
import { ProjectStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
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
    <div className="grid gap-4">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Projekt</p>
          <h1 className="text-[1.8rem] font-black text-[#1b2b31]">Projekt och tidslinjer</h1>
          <p className="mt-2 text-[#59707a]">Sök, filtrera och öppna projektdetaljer.</p>
        </div>
        {user.role === "admin" && <Link href="/projects/new"><Button type="button">Lägg till projekt</Button></Link>}
      </section>

      <Card>
        <div className="mb-4">
          <p className="eyebrow">Styrning</p>
          <CardTitle>Filter och arbetsläge</CardTitle>
        </div>
        <form className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
          <Input name="q" placeholder="Titel, kund, adress eller projektnummer" defaultValue={query} />
          <Select name="status" defaultValue={status}>
            <option value="alla">Alla statusar</option>
            {Object.values(ProjectStatus).map((entry) => <option key={entry} value={entry}>{entry}</option>)}
          </Select>
          <Input name="city" placeholder="Ort" defaultValue={city} />
          <Button variant="ghost" type="submit">Filtrera</Button>
        </form>
      </Card>

      <ProjectList projects={projects} />
    </div>
  );
}
