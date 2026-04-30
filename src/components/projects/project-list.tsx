import Link from "next/link";
import type { ProjectStatus } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { formatDate, isActiveProjectStatus, weekNumber } from "@/lib/utils";

type ProjectListItem = {
  id: string;
  name: string;
  projectNumber: string;
  customerName: string;
  city: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  color: string;
  employees: { employee: { name: string } }[];
};

export function ProjectList({ projects }: { projects: ProjectListItem[] }) {
  if (!projects.length) {
    return <Card className="text-[#59707a]">Inga projekt matchar filtret.</Card>;
  }

  return (
    <div className="grid gap-3">
      {projects.map((project) => (
        <Link key={project.id} href={`/projects/${project.id}`}>
          <Card className="border-[rgba(20,51,58,0.08)] bg-[rgba(255,255,255,0.92)] p-4 transition hover:-translate-y-0.5" style={{ borderLeft: `6px solid ${project.color}` }}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[rgba(20,51,58,0.08)] px-2.5 py-1 text-xs font-bold text-[#1b2b31]">{project.projectNumber}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isActiveProjectStatus(project.status) ? "bg-[rgba(15,118,110,0.12)] text-[#115e59]" : "bg-[rgba(239,68,68,0.12)] text-[#b91c1c]"}`}>
                    {project.status}
                  </span>
                  <span className="rounded-full border border-[rgba(20,51,58,0.12)] px-2.5 py-1 text-xs font-bold text-[#59707a]">v.{weekNumber(project.startDate)}</span>
                </div>
                <h3 className="mt-2 text-base font-bold text-[#1b2b31]">{project.name}</h3>
                <p className="mt-1 text-sm text-[#59707a]">{project.customerName} · {project.city}</p>
              </div>
              <div className="text-sm text-[#59707a] md:text-right">
                <p>{formatDate(project.startDate)} - {formatDate(project.endDate)}</p>
                <p>{project.employees.map((entry) => entry.employee.name).join(", ") || "Ingen personal kopplad"}</p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
