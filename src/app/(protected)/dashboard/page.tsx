import Link from "next/link";
import { ProjectStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectCalendar } from "@/components/calendar/project-calendar";
import { ProjectList } from "@/components/projects/project-list";
import { isActiveProjectStatus } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await db.project.findMany({
    include: { employees: { include: { employee: true } }, machines: { include: { machine: true } }, vehicles: { include: { vehicle: true } } },
    orderBy: { startDate: "asc" },
  });
  const notifications = await db.notification.findMany({
    where: { OR: [{ userId: user.id }, { userId: null }], read: false },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const active = projects.filter((project) => isActiveProjectStatus(project.status));
  const myProjects = user.role === "user" && user.employeeId
    ? active.filter((project) => project.employees.some((entry) => entry.employeeId === user.employeeId))
    : active;

  const conflicts = projects.flatMap((project) =>
    project.employees
      .filter((entry) =>
        projects.some(
          (other) =>
            other.id !== project.id &&
            other.employees.some((otherEntry) => otherEntry.employeeId === entry.employeeId) &&
            other.startDate <= project.endDate &&
            other.endDate >= project.startDate
        )
      )
      .map((entry) => ({ project: project.name, employeeId: entry.employeeId }))
  );

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-white/50">Aktiva projekt</p><p className="mt-2 text-4xl font-black text-granix-green">{active.length}</p></Card>
        <Card><p className="text-sm text-white/50">Pågående</p><p className="mt-2 text-4xl font-black">{projects.filter((p) => p.status === ProjectStatus.pagaende).length}</p></Card>
        <Card><p className="text-sm text-white/50">Mina projekt</p><p className="mt-2 text-4xl font-black">{myProjects.length}</p></Card>
        <Card><p className="text-sm text-white/50">Konflikter</p><p className="mt-2 text-4xl font-black text-amber-300">{conflicts.length}</p></Card>
      </section>

      <Card className="overflow-hidden">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Kalenderöversikt</CardTitle>
            <p className="text-sm text-white/55">Månad, vecka och dag med tydliga veckonummer och färgkodade projekt.</p>
          </div>
          {user.role === "admin" && <Link href="/projects/new"><Button>Skapa projekt</Button></Link>}
        </div>
        <ProjectCalendar
          canEdit={user.role === "admin"}
          projects={active.map((project) => ({
            id: project.id,
            title: `${project.projectNumber} ${project.name}`,
            start: project.startDate.toISOString(),
            end: new Date(project.endDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            color: project.color,
            status: project.status,
            city: project.city,
          }))}
        />
      </Card>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-black">{user.role === "admin" ? "Aktiva projekt" : "Mina projekt"}</h2>
            <Link className="text-sm font-bold text-granix-green" href="/projects">Visa alla</Link>
          </div>
          <ProjectList projects={myProjects.slice(0, 6)} />
        </div>
        <div className="grid gap-4">
          <Card>
            <CardTitle>Notiser</CardTitle>
            <div className="mt-4 grid gap-3">
              {notifications.length ? notifications.map((notification) => (
                <div key={notification.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="font-bold">{notification.title}</p>
                  <p className="text-sm text-white/60">{notification.body}</p>
                </div>
              )) : <p className="text-sm text-white/55">Inga nya notiser.</p>}
            </div>
          </Card>
          <Card>
            <CardTitle>Dubbelbokningar</CardTitle>
            <p className="mt-2 text-sm text-white/60">Systemet blockerar inte dubbelbokning, men markerar överlapp visuellt här.</p>
            <p className="mt-4 text-3xl font-black text-amber-300">{conflicts.length}</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
