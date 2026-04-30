import Link from "next/link";
import { ProjectStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectCalendar } from "@/components/calendar/project-calendar";
import { ProjectList } from "@/components/projects/project-list";
import { isActiveProjectStatus } from "@/lib/utils";

function MetricCard({ label, value, subtext, accent = false }: { label: string; value: number; subtext?: string; accent?: boolean }) {
  return (
    <div className="rounded-[20px] border border-[rgba(20,51,58,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(242,248,246,0.9))] p-4">
      <span className="block text-[0.85rem] text-[#59707a]">{label}</span>
      <span className={`mt-2 block text-[clamp(1.35rem,2.2vw,2rem)] font-bold leading-[1.15] ${accent ? "text-[#0f766e]" : "text-[#1b2b31]"}`}>{value}</span>
      {subtext ? <span className="mt-1 block text-[0.82rem] text-[#59707a]">{subtext}</span> : null}
    </div>
  );
}

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
    <div className="grid gap-4">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Översikt</p>
              <CardTitle>Nyckeltal</CardTitle>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Aktiva projekt" value={active.length} subtext="Allt som inte är klart eller avslutat" accent />
            <MetricCard label="Pågående" value={projects.filter((p) => p.status === ProjectStatus.pagaende).length} />
            <MetricCard label="Mina projekt" value={myProjects.length} />
            <MetricCard label="Konflikter" value={conflicts.length} subtext="Dubbelbokade resurser" />
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <p className="eyebrow">Styrning</p>
            <CardTitle>Snabbval</CardTitle>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/projects"><Button variant="secondary" className="w-full justify-center" type="button">Visa alla projekt</Button></Link>
            {user.role === "admin" && <Link href="/projects/new"><Button className="w-full justify-center" type="button">Lägg till projekt</Button></Link>}
            <Link href="/projects?q=&status=planerat"><Button variant="ghost" className="w-full justify-center" type="button">Planerade projekt</Button></Link>
            <Link href="/projects?q=&status=pagaende"><Button variant="ghost" className="w-full justify-center" type="button">Pågående projekt</Button></Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,0.95fr)]">
        <Card className="overflow-hidden p-5">
          <div className="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="eyebrow">Planering</p>
              <CardTitle>Kalender</CardTitle>
            </div>
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

        <div className="grid gap-4">
          <Card>
            <div className="mb-4">
              <p className="eyebrow">Nästa steg</p>
              <CardTitle>Notiser</CardTitle>
            </div>
            <div className="grid gap-3">
              {notifications.length ? notifications.map((notification) => (
                <div key={notification.id} className="rounded-[20px] border border-[rgba(20,51,58,0.08)] bg-[rgba(255,255,255,0.92)] p-4">
                  <p className="font-bold text-[#1b2b31]">{notification.title}</p>
                  <p className="mt-1 text-sm text-[#59707a]">{notification.body}</p>
                </div>
              )) : <div className="rounded-[20px] border border-dashed border-[rgba(20,51,58,0.14)] bg-[rgba(255,255,255,0.68)] p-4 text-sm text-[#59707a]">Inga nya notiser.</div>}
            </div>
          </Card>

          <Card>
            <div className="mb-4">
              <p className="eyebrow">Projekt</p>
              <CardTitle>Konflikter</CardTitle>
            </div>
            <p className="text-sm leading-6 text-[#59707a]">
              Systemet blockerar inte dubbelbokning, men markerar överlappande resurser så att admin kan fatta beslut.
            </p>
            <p className="mt-4 text-4xl font-extrabold text-[#1b2b31]">{conflicts.length}</p>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="eyebrow">Projekt</p>
              <h2 className="text-[1.35rem] font-black text-[#1b2b31]">{user.role === "admin" ? "Projekt och tidslinjer" : "Mina projekt"}</h2>
            </div>
            <Link className="text-sm font-bold text-[#115e59]" href="/projects">Visa alla</Link>
          </div>
          <ProjectList projects={myProjects.slice(0, 6)} />
        </div>

        <Card>
          <div className="mb-4">
            <p className="eyebrow">Arbetsläge</p>
            <CardTitle>Resurser idag</CardTitle>
          </div>
          <div className="grid gap-3 text-sm text-[#59707a]">
            <div className="rounded-[20px] border border-[rgba(20,51,58,0.08)] bg-[rgba(255,255,255,0.92)] p-4">
              <p className="font-bold text-[#1b2b31]">Anställda i aktiva projekt</p>
              <p className="mt-1">{new Set(active.flatMap((project) => project.employees.map((entry) => entry.employeeId))).size} personer bokade</p>
            </div>
            <div className="rounded-[20px] border border-[rgba(20,51,58,0.08)] bg-[rgba(255,255,255,0.92)] p-4">
              <p className="font-bold text-[#1b2b31]">Maskiner i aktiva projekt</p>
              <p className="mt-1">{new Set(active.flatMap((project) => project.machines.map((entry) => entry.machineId))).size} maskiner kopplade</p>
            </div>
            <div className="rounded-[20px] border border-[rgba(20,51,58,0.08)] bg-[rgba(255,255,255,0.92)] p-4">
              <p className="font-bold text-[#1b2b31]">Fordon i aktiva projekt</p>
              <p className="mt-1">{new Set(active.flatMap((project) => project.vehicles.map((entry) => entry.vehicleId))).size} fordon bokade</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
