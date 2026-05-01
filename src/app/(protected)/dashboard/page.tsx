import Link from "next/link";
import { ProjectStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectCalendar } from "@/components/calendar/project-calendar";
import { withBasePath } from "@/lib/base-path";
import { formatDate, isActiveProjectStatus, weekNumber } from "@/lib/utils";

function MetricCard({ label, value, subtext, accent = false }: { label: string; value: number; subtext?: string; accent?: boolean }) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <span className={`metric-value ${accent ? "text-[#0f766e]" : "text-[#1b2b31]"}`}>{value}</span>
      {subtext ? <span className="metric-subtext">{subtext}</span> : null}
    </div>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser();
  const projects = await db.project.findMany({
    include: {
      employees: { include: { employee: true } },
      machines: { include: { machine: true } },
      vehicles: { include: { vehicle: true } },
    },
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

  const today = new Date();
  const filterFrom = params.from || "";
  const filterTo = params.to || "";
  const todaysProjects = myProjects.filter((project) => project.startDate <= today && project.endDate >= today);
  const upcomingProjects = myProjects.filter((project) => project.startDate >= today).slice(0, 5);
  const teamSummary = [
    {
      label: "Anställda bokade",
      value: new Set(active.flatMap((project) => project.employees.map((entry) => entry.employeeId))).size,
    },
    {
      label: "Maskiner kopplade",
      value: new Set(active.flatMap((project) => project.machines.map((entry) => entry.machineId))).size,
    },
    {
      label: "Fordon bokade",
      value: new Set(active.flatMap((project) => project.vehicles.map((entry) => entry.vehicleId))).size,
    },
  ];

  return (
    <div>
      <section className="dashboard-grid">
        <Card className="metrics-card glass-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Översikt</p>
              <CardTitle>Nyckeltal</CardTitle>
            </div>
          </div>
          <div className="metrics-grid">
            <MetricCard label="Aktiva projekt" value={active.length} subtext="Allt som inte är klart eller avslutat" accent />
            <MetricCard label="Pågående" value={projects.filter((project) => project.status === ProjectStatus.pagaende).length} />
            <MetricCard label="Mina projekt" value={myProjects.length} />
            <MetricCard label="Konflikter" value={conflicts.length} subtext="Dubbelbokade resurser" />
          </div>
        </Card>

        <Card className="filters-card glass-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Styrning</p>
              <CardTitle>Planeringsläge</CardTitle>
            </div>
          </div>
          <div className="stack-block">
            <p className="dashboard-note">
              Här ser du alla aktiva projekt med tydliga veckonummer, färgkodning och snabb åtkomst till projekt, resurser och rapporter.
            </p>
            <div className="summary-grid">
              <div className="summary-chip">
                <strong>v.{weekNumber(today)}</strong>
                <span>Aktuell vecka</span>
              </div>
              <div className="summary-chip">
                <strong>{todaysProjects.length}</strong>
                <span>Projekt idag</span>
              </div>
              <div className="summary-chip">
                <strong>{notifications.length}</strong>
                <span>Nya notiser</span>
              </div>
            </div>
            <div className="filters-layout">
              <Link href="/projects">
                <Button variant="secondary" className="w-full justify-center" type="button">Visa projekt</Button>
              </Link>
              <Link href="/time-reports">
                <Button variant="ghost" className="w-full justify-center" type="button">Tidrapportering</Button>
              </Link>
              <Link href="/diary">
                <Button variant="ghost" className="w-full justify-center" type="button">Dagbok</Button>
              </Link>
              {user.role === "admin" ? (
                <Link href="/projects/new">
                  <Button className="w-full justify-center" type="button">Nytt projekt</Button>
                </Link>
              ) : (
                <Link href="/projects?q=&status=pagaende">
                  <Button variant="ghost" className="w-full justify-center" type="button">Pågående</Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      </section>

      <section className="workspace-grid">
        <Card className="planner-card glass-card overflow-hidden">
          <div className="card-header planner-header">
            <div>
              <p className="eyebrow">Planering</p>
              <CardTitle>Kalender</CardTitle>
            </div>
            <div className="toolbar-actions">
              <span className="hero-meta-chip">År, månad, vecka och dag</span>
              {user.role === "admin" ? (
                <Link href="/projects/new">
                  <Button type="button">Lägg till projekt</Button>
                </Link>
              ) : null}
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

        <div className="sidebar-stack">
          <Card className="detail-card glass-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Vald dag</p>
                <CardTitle>{formatDate(today)}</CardTitle>
              </div>
              <span className="type-badge">v.{weekNumber(today)}</span>
            </div>
            <div className="selected-day-list">
              {todaysProjects.length ? todaysProjects.map((project) => (
                <div key={project.id} className="detail-item" style={{ borderLeft: `6px solid ${project.color}` }}>
                  <div className="detail-top">
                    <div>
                      <p className="item-title">{project.name}</p>
                      <p className="item-meta">{project.projectNumber} · {project.customerName}</p>
                    </div>
                    <span className={`status-badge status-${project.status}`}>{project.status}</span>
                  </div>
                  <p className="item-meta">{project.city} · {formatDate(project.startDate)} till {formatDate(project.endDate)}</p>
                </div>
              )) : <div className="empty-state">Inga aktiva projekt ligger på dagens datum.</div>}
            </div>
          </Card>

          <Card className="detail-card glass-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Nästa steg</p>
                <CardTitle>Notiser</CardTitle>
              </div>
            </div>
            <div className="selected-day-list">
              {notifications.length ? notifications.map((notification) => (
                <div key={notification.id} className="detail-item">
                  <p className="item-title">{notification.title}</p>
                  <p className="item-meta">{notification.body}</p>
                </div>
              )) : <div className="empty-state">Inga nya notiser just nu.</div>}
            </div>
          </Card>

          <Card className="detail-card glass-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Projekt</p>
                <CardTitle>Konflikter</CardTitle>
              </div>
            </div>
            <p className="dashboard-note">
              Systemet blockerar inte dubbelbokning, men markerar överlappande resurser så att admin kan planera om vid behov.
            </p>
            <p className="mt-4 text-4xl font-extrabold text-[#1b2b31]">{conflicts.length}</p>
          </Card>
        </div>
      </section>

      <section className="bottom-grid">
        <Card className="agenda-card glass-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Kommande</p>
              <CardTitle>{user.role === "admin" ? "Projekt och tidslinjer" : "Mina projekt"}</CardTitle>
            </div>
            <Link className="text-sm font-bold text-[#115e59]" href="/projects">Visa alla</Link>
          </div>
          <div className="agenda-list">
            {upcomingProjects.length ? upcomingProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="agenda-item" style={{ borderLeft: `6px solid ${project.color}` }}>
                <div className="agenda-top">
                  <div>
                    <p className="item-title">{project.name}</p>
                    <p className="item-meta">{project.projectNumber} · {project.customerName}</p>
                  </div>
                  <span className={`status-badge status-${project.status}`}>{project.status}</span>
                </div>
                <p className="item-meta">{formatDate(project.startDate)} till {formatDate(project.endDate)} · {project.city}</p>
              </Link>
            )) : <div className="empty-state">Det finns inga kommande projekt i ditt urval just nu.</div>}
          </div>
        </Card>

        <Card className="team-card glass-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Arbetsläge</p>
              <CardTitle>Resurser idag</CardTitle>
            </div>
          </div>
          <div className="team-summary">
            {teamSummary.map((entry) => (
              <div key={entry.label} className="team-item">
                <div className="team-top">
                  <p className="item-title">{entry.label}</p>
                  <span className="type-badge">{entry.value}</span>
                </div>
                <p className="team-meta">Baseras på alla aktiva projekt i systemet.</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {user.role === "admin" ? (
        <section className="admin-grid">
          <Card className="admin-card glass-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Administration</p>
                <CardTitle>Åtgärder</CardTitle>
              </div>
            </div>
            <div className="list-block">
              <Link href="/admin">
                <Button variant="secondary" className="w-full justify-center" type="button">Hantera användare och resurser</Button>
              </Link>
              <Link href="/projects/new">
                <Button variant="ghost" className="w-full justify-center" type="button">Skapa nytt projekt</Button>
              </Link>
            </div>
          </Card>

          <Card className="admin-card glass-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Planering</p>
                <CardTitle>Exportera planering</CardTitle>
              </div>
            </div>
            <form method="get" className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-[0.85rem] font-bold text-[#59707a]">Från datum</span>
                  <input
                    className="min-h-11 rounded-[14px] border border-[rgba(27,43,49,0.12)] bg-[rgba(255,255,255,0.96)] px-3 py-2 text-[#1b2b31]"
                    name="from"
                    type="date"
                    defaultValue={filterFrom}
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-[0.85rem] font-bold text-[#59707a]">Till datum</span>
                  <input
                    className="min-h-11 rounded-[14px] border border-[rgba(27,43,49,0.12)] bg-[rgba(255,255,255,0.96)] px-3 py-2 text-[#1b2b31]"
                    name="to"
                    type="date"
                    defaultValue={filterTo}
                  />
                </label>
              </div>
              <p className="dashboard-note">Hämta en PDF med alla projekt som överlappar vald tidsperiod.</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" type="submit">Visa period</Button>
                <a
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0f766e] px-4 py-2 text-sm font-bold text-white transition duration-150 hover:-translate-y-0.5 hover:bg-[#115e59]"
                  href={withBasePath(`/api/exports/planning?from=${encodeURIComponent(filterFrom)}&to=${encodeURIComponent(filterTo)}`)}
                >
                  Ladda ned PDF
                </a>
                <a
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(27,43,49,0.14)] bg-transparent px-4 py-2 text-sm font-bold text-[#1b2b31] transition duration-150 hover:-translate-y-0.5 hover:bg-white/80"
                  href={withBasePath(`/api/exports/planning?mode=customer&from=${encodeURIComponent(filterFrom)}&to=${encodeURIComponent(filterTo)}`)}
                >
                  Ladda ned kund-PDF
                </a>
              </div>
            </form>
          </Card>

          <Card className="admin-card glass-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Projekt</p>
                <CardTitle>Statusfördelning</CardTitle>
              </div>
            </div>
            <div className="team-summary">
              {Object.values(ProjectStatus).map((status) => (
                <div key={status} className="team-item">
                  <div className="team-top">
                    <p className="item-title">{status}</p>
                    <span className="type-badge">{projects.filter((project) => project.status === status).length}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
