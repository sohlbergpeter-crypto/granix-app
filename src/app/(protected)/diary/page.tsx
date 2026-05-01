import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { DiaryModule } from "@/components/diary/diary-module";

export default async function DiaryPage() {
  const user = await requireUser();
  const [projects, myEntriesRaw, allEntriesRaw] = await Promise.all([
    db.project.findMany({ where: { status: { notIn: ["klart", "fakturerat", "installt"] } }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.diaryEntry.findMany({
      where: user.employeeId ? { employeeId: user.employeeId } : { id: "__none__" },
      include: { project: true, employee: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    user.role === "admin"
      ? db.diaryEntry.findMany({
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
      myEntries={myEntriesRaw.map(mapEntry)}
      allEntries={allEntriesRaw.map(mapEntry)}
      isAdmin={user.role === "admin"}
    />
  );
}
