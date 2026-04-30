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
    <div className="grid gap-4">
      <Card className="p-5" style={{ borderLeft: `10px solid ${project.color}` }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="eyebrow">Projekt</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[rgba(20,51,58,0.08)] px-3 py-1 text-xs font-bold text-[#1b2b31]">{project.projectNumber}</span>
              <span className="rounded-full bg-[rgba(15,118,110,0.12)] px-3 py-1 text-xs font-bold text-[#115e59]">{project.status}</span>
              <span className="rounded-full border border-[rgba(20,51,58,0.12)] px-3 py-1 text-xs font-bold text-[#59707a]">Vecka {weekNumber(project.startDate)}</span>
            </div>
            <h1 className="mt-4 text-[2rem] font-black text-[#1b2b31]">{project.name}</h1>
            <p className="mt-2 text-[#59707a]">{project.customerName} · {project.address}, {project.city}</p>
            <p className="mt-2 text-sm text-[#59707a]">{formatDate(project.startDate)} - {formatDate(project.endDate)}</p>
          </div>
          {user.role === "admin" && (
            <form action={deleteProjectAction}>
              <input type="hidden" name="id" value={project.id} />
              <Button variant="danger" type="submit">Ta bort projekt</Button>
            </form>
          )}
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="mb-4">
            <p className="eyebrow">Projekt</p>
            <CardTitle>Resurser</CardTitle>
          </div>
          <div className="grid gap-3 text-sm leading-6 text-[#59707a]">
            <p><strong className="text-[#1b2b31]">Arbetslag:</strong> {project.team?.name || "Ej valt"}</p>
            <p><strong className="text-[#1b2b31]">Anställda:</strong> {project.employees.map((entry) => entry.employee.name).join(", ") || "Inga"}</p>
            <p><strong className="text-[#1b2b31]">Maskiner:</strong> {project.machines.map((entry) => entry.machine.name).join(", ") || "Inga"}</p>
            <p><strong className="text-[#1b2b31]">Fordon:</strong> {project.vehicles.map((entry) => entry.vehicle.name).join(", ") || "Inga"}</p>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <div className="mb-4">
            <p className="eyebrow">Projekt</p>
            <CardTitle>Beskrivning</CardTitle>
          </div>
          <div className="grid gap-4 text-sm leading-6 text-[#59707a] md:grid-cols-2">
            <div className="rounded-[20px] border border-[rgba(20,51,58,0.08)] bg-[rgba(255,255,255,0.92)] p-4">
              <p className="font-bold text-[#1b2b31]">Extern beskrivning</p>
              <p className="mt-1">{project.externalDescription || "Saknas"}</p>
            </div>
            <div className="rounded-[20px] border border-[rgba(20,51,58,0.08)] bg-[rgba(255,255,255,0.92)] p-4">
              <p className="font-bold text-[#1b2b31]">Intern anteckning</p>
              <p className="mt-1">{project.internalNote || "Saknas"}</p>
            </div>
          </div>
        </Card>
      </section>

      <Card>
        <div className="mb-4">
          <p className="eyebrow">Projektfiler</p>
          <CardTitle>Filer</CardTitle>
        </div>
        {user.role === "admin" && (
          <form action={withBasePath(`/api/projects/${project.id}/files`)} method="post" encType="multipart/form-data" className="mb-4 grid gap-3 rounded-[20px] border border-[rgba(27,43,49,0.12)] bg-[rgba(255,255,255,0.72)] p-4 md:grid-cols-[1fr_auto]">
            <input className="min-h-11 rounded-[14px] border border-[rgba(27,43,49,0.12)] bg-[rgba(255,255,255,0.96)] px-3 py-2 text-sm text-[#1b2b31]" type="file" name="file" accept=".pdf,.xlsx,.xls,.doc,.docx" required />
            <Button type="submit">Ladda upp fil</Button>
          </form>
        )}
        <div className="grid gap-3">
          {project.files.length ? project.files.map((file) => (
            <a key={file.id} href={file.storageKey} target="_blank" className="flex flex-col rounded-[20px] border border-[rgba(20,51,58,0.08)] bg-[rgba(255,255,255,0.92)] p-4 transition hover:-translate-y-0.5 md:flex-row md:items-center md:justify-between">
              <span className="font-bold text-[#1b2b31]">{file.originalName}</span>
              <span className="text-sm text-[#59707a]">{file.mimeType} · {fileSize(file.size)}</span>
            </a>
          )) : <div className="rounded-[20px] border border-dashed border-[rgba(20,51,58,0.14)] bg-[rgba(255,255,255,0.68)] p-4 text-sm text-[#59707a]">Inga filer uppladdade.</div>}
        </div>
      </Card>

      {user.role === "admin" && <ProjectForm project={project} teams={teams} employees={employees} machines={machines} vehicles={vehicles} />}
      <Link href="/projects" className="text-sm font-bold text-[#115e59]">Tillbaka till projektlista</Link>
    </div>
  );
}
