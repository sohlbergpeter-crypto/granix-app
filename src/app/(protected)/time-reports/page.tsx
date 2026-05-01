import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { TimeReportModule } from "@/components/time/time-report-module";

export default async function TimeReportsPage() {
  const user = await requireUser();
  const [projects, myReportsRaw, allReportsRaw] = await Promise.all([
    db.project.findMany({ where: { status: { notIn: ["klart", "fakturerat", "installt"] } }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.timeReport.findMany({
      where: user.employeeId ? { employeeId: user.employeeId } : { id: "__none__" },
      include: { project: true, employee: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    user.role === "admin"
      ? db.timeReport.findMany({
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
      myReports={myReportsRaw.map(mapReport)}
      allReports={allReportsRaw.map(mapReport)}
      isAdmin={user.role === "admin"}
    />
  );
}
