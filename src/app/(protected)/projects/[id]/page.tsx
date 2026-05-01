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
      <Card className="glass-card p-5" style={{ borderLeft: `10px solid ${project.color}` }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="eyebrow">Projekt</p>
            <div className="flex flex-wrap gap-2">
              <span className="type-badge">{project.projectNumber}</span>
              <span className="status-badge status-pagaende">{project.status}</span>
              <span className="type-badge">Vecka {weekNumber(project.startDate)}</span>
            </div>
            <h1 className="mt-4 text-[2rem] font-black text-[#1b2b31]">{project.name}</h1>
            <p className="mt-2 text-[#59707a]">{project.customerName} · {project.address}, {project.city}</p>
            <p className="mt-2 text-sm text-[#59707a]">{formatDate(project.startDate)} till {formatDate(project.endDate)}</p>
          </div>
          {user.role === "admin" ? (
            <form action={deleteProjectAction}>
              <input type="hidden" name="id" value={project.id} />
              <Button variant="danger" type="submit">Ta bort projekt</Button>
            </form>
          ) : null}
        </div>
      </Card>

      <section className="workspace-grid">
        <Card className="glass-card detail-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Projekt</p>
              <CardTitle>Resurser</CardTitle>
            </div>
          </div>
          <div className="selected-day-list">
            <div className="detail-item">
              <p className="item-title">Arbetslag</p>
              <p className="item-meta">{project.team?.name || "Ej valt"}</p>
            </div>
            <div className="detail-item">
              <p className="item-title">Anställda</p>
              <p className="item-meta">{project.employees.map((entry) => entry.employee.name).join(", ") || "Inga kopplade"}</p>
            </div>
            <div className="detail-item">
              <p className="item-title">Maskiner</p>
              <p className="item-meta">{project.machines.map((entry) => entry.machine.name).join(", ") || "Inga kopplade"}</p>
            </div>
            <div className="detail-item">
              <p className="item-title">Fordon</p>
              <p className="item-meta">{project.vehicles.map((entry) => entry.vehicle.name).join(", ") || "Inga kopplade"}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card detail-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Projekt</p>
              <CardTitle>Beskrivning</CardTitle>
            </div>
          </div>
          <div className="selected-day-list">
            <div className="detail-item">
              <p className="item-title">Extern beskrivning</p>
              <p className="item-meta">{project.externalDescription || "Saknas"}</p>
            </div>
            <div className="detail-item">
              <p className="item-title">Intern anteckning</p>
              <p className="item-meta">{project.internalNote || "Saknas"}</p>
            </div>
          </div>
        </Card>
      </section>

      <Card className="glass-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Projektfiler</p>
            <CardTitle>Filer</CardTitle>
          </div>
        </div>
        {user.role === "admin" ? (
          <form action={withBasePath(`/api/projects/${project.id}/files`)} method="post" encType="multipart/form-data" className="mb-4 grid gap-3 rounded-[20px] border border-[rgba(27,43,49,0.12)] bg-[rgba(255,255,255,0.72)] p-4 md:grid-cols-[1fr_auto]">
            <input className="min-h-11 rounded-[14px] border border-[rgba(27,43,49,0.12)] bg-[rgba(255,255,255,0.96)] px-3 py-2 text-sm text-[#1b2b31]" type="file" name="file" accept=".pdf,.xlsx,.xls,.doc,.docx" required />
            <Button type="submit">Ladda upp fil</Button>
          </form>
        ) : null}
        <div className="selected-day-list">
          {project.files.length ? project.files.map((file) => (
            <a key={file.id} href={file.storageKey} target="_blank" className="detail-item transition hover:-translate-y-0.5">
              <div className="detail-top">
                <p className="item-title">{file.originalName}</p>
                <span className="type-badge">{fileSize(file.size)}</span>
              </div>
              <p className="item-meta">{file.mimeType} · uppladdad av {file.uploadedBy?.username || "okänd användare"}</p>
            </a>
          )) : <div className="empty-state">Inga filer uppladdade.</div>}
        </div>
      </Card>

      {user.role === "admin" ? <ProjectForm project={project} teams={teams} employees={employees} machines={machines} vehicles={vehicles} /> : null}
      <Link href="/projects" className="text-sm font-bold text-[#115e59]">Tillbaka till projektlista</Link>
    </div>
  );
}
