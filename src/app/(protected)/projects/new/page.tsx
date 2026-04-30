import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ProjectForm } from "@/components/projects/project-form";

export default async function NewProjectPage() {
  await requireAdmin();
  const [teams, employees, machines, vehicles] = await Promise.all([
    db.team.findMany({ orderBy: { name: "asc" } }),
    db.employee.findMany({ orderBy: { name: "asc" } }),
    db.machine.findMany({ orderBy: { name: "asc" } }),
    db.vehicle.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <ProjectForm teams={teams} employees={employees} machines={machines} vehicles={vehicles} />;
}
