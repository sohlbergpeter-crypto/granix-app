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
    return <Card className="glass-card text-[#59707a]">Inga projekt matchar filtret.</Card>;
  }

  return (
    <div className="agenda-list">
      {projects.map((project) => (
        <Link key={project.id} href={`/projects/${project.id}`} className="agenda-item" style={{ borderLeft: `6px solid ${project.color}` }}>
          <div className="agenda-top">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="type-badge">{project.projectNumber}</span>
                <span className={`status-badge ${isActiveProjectStatus(project.status) ? "status-pagaende" : "status-avslutad"}`}>{project.status}</span>
                <span className="type-badge">v.{weekNumber(project.startDate)}</span>
              </div>
              <p className="item-title mt-2">{project.name}</p>
              <p className="item-meta">{project.customerName} · {project.city}</p>
            </div>
            <div className="text-right text-sm text-[#59707a]">
              <p>{formatDate(project.startDate)} till {formatDate(project.endDate)}</p>
              <p>{project.employees.map((entry) => entry.employee.name).join(", ") || "Ingen personal kopplad"}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
