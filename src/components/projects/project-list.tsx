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
    return <Card className="text-white/60">Inga projekt matchar filtret.</Card>;
  }

  return (
    <div className="grid gap-3">
      {projects.map((project) => (
        <Link key={project.id} href={`/projects/${project.id}`}>
          <Card className="transition hover:-translate-y-0.5 hover:border-granix-green/60" style={{ borderLeft: `8px solid ${project.color}` }}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-black">{project.projectNumber}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-black ${isActiveProjectStatus(project.status) ? "bg-granix-green text-black" : "bg-white/10 text-white/70"}`}>
                    {project.status}
                  </span>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-xs font-bold">v.{weekNumber(project.startDate)}</span>
                </div>
                <h3 className="mt-2 text-lg font-black">{project.name}</h3>
                <p className="text-sm text-white/60">{project.customerName} · {project.city}</p>
              </div>
              <div className="text-sm text-white/70 md:text-right">
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
