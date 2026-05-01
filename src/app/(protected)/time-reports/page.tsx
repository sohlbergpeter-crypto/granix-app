import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { TimeReportModule } from "@/components/time/time-report-module";

function parseDate(value: string | undefined, endOfDay = false) {
  if (!value) return null;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default async function TimeReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const params = await searchParams;
  const from = parseDate(params.from);
  const to = parseDate(params.to, true);
  const employeeId = params.employeeId || "";
  const [projects, employees, myReportsRaw, allReportsRaw] = await Promise.all([
    db.project.findMany({ where: { status: { notIn: ["klart", "fakturerat", "installt"] } }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    user.role === "admin" ? db.employee.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }) : Promise.resolve([]),
    db.timeReport.findMany({
      where: user.employeeId ? { employeeId: user.employeeId } : { id: "__none__" },
      include: { project: true, employee: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    user.role === "admin"
      ? db.timeReport.findMany({
          where: {
            ...(employeeId ? { employeeId } : {}),
            ...(from || to
              ? {
                  date: {
                    ...(from ? { gte: from } : {}),
                    ...(to ? { lte: to } : {}),
                  },
                }
              : {}),
          },
          include: { project: true, employee: true },
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        })
      : Promise.resolve([]),
  ]);

  const mapReport = (report: typeof myReportsRaw[number]) => ({
    id: report.id,
    date: report.date.toISOString().slice(0, 10),
    hours: report.hours,
    travelWithinHours: report.travelWithinHours,
    travelOutsideHours: report.travelOutsideHours,
    allowance: report.allowance,
    notes: report.notes,
    projectName: report.project.name,
    employeeName: report.employee.name,
    projectId: report.projectId,
  });

  return (
    <TimeReportModule
      projects={projects}
      employees={employees}
      myReports={myReportsRaw.map(mapReport)}
      allReports={allReportsRaw.map(mapReport)}
      isAdmin={user.role === "admin"}
      filterFrom={params.from || ""}
      filterTo={params.to || ""}
      filterEmployeeId={employeeId}
      filterProjectId={params.projectId || ""}
    />
  );
}
