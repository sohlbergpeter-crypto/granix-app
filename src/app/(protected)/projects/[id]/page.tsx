import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ProjectForm } from "@/components/projects/project-form";
import { deleteProjectAction } from "@/server/actions/projects";
import { withBasePath } from "@/lib/base-path";
import { fileSize, formatDate, weekNumber } from "@/lib/utils";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [project, teams, employees, machines, vehicles] = await Promise.all([
    db.project.findUnique({
      where: { id },
      include: {
        team: true,
        employees: { include: { employee: true } },
        machines: { include: { machine: true } },
        vehicles: { include: { vehicle: true } },
        files: { include: { uploadedBy: true }, orderBy: { createdAt: "desc" } },
      },
    }),
    db.team.findMany({ orderBy: { name: "asc" } }),
    db.employee.findMany({ orderBy: { name: "asc" } }),
    db.machine.findMany({ orderBy: { name: "asc" } }),
    db.vehicle.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!project) notFound();

  return (
    <div className="grid gap-6">
      <Card style={{ borderLeft: `10px solid ${project.color}` }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-granix-green px-3 py-1 text-xs font-black text-black">{project.projectNumber}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">{project.status}</span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black">Vecka {weekNumber(project.startDate)}</span>
            </div>
            <h1 className="mt-4 text-3xl font-black">{project.name}</h1>
            <p className="mt-2 text-white/60">{project.customerName} · {project.address}, {project.city}</p>
            <p className="mt-2 text-white/70">{formatDate(project.startDate)} - {formatDate(project.endDate)}</p>
          </div>
          {user.role === "admin" && (
            <form action={deleteProjectAction}>
              <input type="hidden" name="id" value={project.id} />
              <Button variant="danger" type="submit">Ta bort projekt</Button>
            </form>
          )}
        </div>
      </Card>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardTitle>Resurser</CardTitle>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            <p><strong className="text-white">Arbetslag:</strong> {project.team?.name || "Ej valt"}</p>
            <p><strong className="text-white">Anställda:</strong> {project.employees.map((entry) => entry.employee.name).join(", ") || "Inga"}</p>
            <p><strong className="text-white">Maskiner:</strong> {project.machines.map((entry) => entry.machine.name).join(", ") || "Inga"}</p>
            <p><strong className="text-white">Fordon:</strong> {project.vehicles.map((entry) => entry.vehicle.name).join(", ") || "Inga"}</p>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardTitle>Beskrivning</CardTitle>
          <div className="mt-4 grid gap-4 text-sm text-white/70 md:grid-cols-2">
            <div><p className="font-bold text-white">Extern beskrivning</p><p>{project.externalDescription || "Saknas"}</p></div>
            <div><p className="font-bold text-white">Intern anteckning</p><p>{project.internalNote || "Saknas"}</p></div>
          </div>
        </Card>
      </section>

      <Card>
        <CardTitle>Filer</CardTitle>
        {user.role === "admin" && (
          <form action={withBasePath(`/api/projects/${project.id}/files`)} method="post" encType="multipart/form-data" className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_auto]">
            <input className="text-sm text-white" type="file" name="file" accept=".pdf,.xlsx,.xls,.doc,.docx" required />
            <Button type="submit">Ladda upp fil</Button>
          </form>
        )}
        <div className="mt-4 grid gap-2">
          {project.files.length ? project.files.map((file) => (
            <a key={file.id} href={file.storageKey} target="_blank" className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-3 hover:border-granix-green/50 md:flex-row md:items-center md:justify-between">
              <span className="font-bold">{file.originalName}</span>
              <span className="text-sm text-white/55">{file.mimeType} · {fileSize(file.size)}</span>
            </a>
          )) : <p className="text-sm text-white/55">Inga filer uppladdade.</p>}
        </div>
      </Card>

      {user.role === "admin" && <ProjectForm project={project} teams={teams} employees={employees} machines={machines} vehicles={vehicles} />}
      <Link href="/projects" className="text-sm font-bold text-granix-green">Tillbaka till projektlista</Link>
    </div>
  );
}
