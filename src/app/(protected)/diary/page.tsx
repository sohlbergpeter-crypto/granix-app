import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { DiaryModule } from "@/components/diary/diary-module";

function parseDate(value: string | undefined, endOfDay = false) {
  if (!value) return null;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default async function DiaryPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const params = await searchParams;
  const from = parseDate(params.from);
  const to = parseDate(params.to, true);
  const employeeId = params.employeeId || "";
  const [projects, employees, myEntriesRaw, allEntriesRaw] = await Promise.all([
    db.project.findMany({ where: { status: { notIn: ["klart", "fakturerat", "installt"] } }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    user.role === "admin" ? db.employee.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }) : Promise.resolve([]),
    db.diaryEntry.findMany({
      where: user.employeeId ? { employeeId: user.employeeId } : { id: "__none__" },
      include: { project: true, employee: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    user.role === "admin"
      ? db.diaryEntry.findMany({
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

  const mapEntry = (entry: typeof myEntriesRaw[number]) => ({
    id: entry.id,
    date: entry.date.toISOString().slice(0, 10),
    happenedToday: entry.happenedToday,
    completedToday: entry.completedToday,
    extraWork: entry.extraWork,
    projectName: entry.project.name,
    employeeName: entry.employee.name,
    projectId: entry.projectId,
  });

  return (
    <DiaryModule
      projects={projects}
      employees={employees}
      myEntries={myEntriesRaw.map(mapEntry)}
      allEntries={allEntriesRaw.map(mapEntry)}
      isAdmin={user.role === "admin"}
      filterFrom={params.from || ""}
      filterTo={params.to || ""}
      filterEmployeeId={employeeId}
    />
  );
}
