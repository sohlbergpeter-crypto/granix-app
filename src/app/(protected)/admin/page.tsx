import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteEmployeeAction, deleteUserAction } from "@/server/actions/admin";
import { AdminForms } from "@/components/admin/admin-forms";
import { AdminDeleteForm } from "@/components/admin/admin-delete-form";
import { Card, CardTitle } from "@/components/ui/card";
import { withBasePath } from "@/lib/base-path";

function formatDate(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function splitEmployeeName(name: string) {
  const normalized = name.replace(/\//g, " ").trim();
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return {
      firstName: parts[0] || "",
      lastName: parts[0] || "",
    };
  }
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.slice(-1).join(" "),
  };
}

function formatEmployeeCompetences(employee: {
  apvDate: Date | null;
  apvExpiryDate: Date | null;
  id06Date: Date | null;
  id06Number: string | null;
  id06ExpiryDate: Date | null;
  otherCompetence: string | null;
  skills: string[];
}) {
  return [
    employee.apvDate
      ? `APV: utbildningsdatum ${formatDate(employee.apvDate)}${employee.apvExpiryDate ? `, förfaller ${formatDate(employee.apvExpiryDate)}` : ""}`
      : employee.skills.includes("APV")
        ? "APV"
        : null,
    employee.id06Date
      ? `ID06: ${employee.id06Number ? `nummer ${employee.id06Number}, ` : ""}giltig från ${formatDate(employee.id06Date)}${employee.id06ExpiryDate ? `, förfaller ${formatDate(employee.id06ExpiryDate)}` : ""}`
      : employee.skills.includes("ID06")
        ? `ID06${employee.id06Number ? `: nummer ${employee.id06Number}` : ""}`
        : null,
    employee.otherCompetence ? `Övrigt: ${employee.otherCompetence}` : null,
  ].filter(Boolean) as string[];
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const currentUser = await requireAdmin();
  const params = await searchParams;
  const editEmployeeId = params.editEmployee || "";

  const [users, employees, teams, machines, vehicles] = await Promise.all([
    db.user.findMany({ include: { employee: true }, orderBy: { username: "asc" } }),
    db.employee.findMany({
      include: {
        team: true,
        _count: {
          select: {
            users: true,
            projects: true,
            timeReports: true,
            diaryEntries: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    db.team.findMany({ orderBy: { name: "asc" } }),
    db.machine.findMany({ orderBy: { name: "asc" } }),
    db.vehicle.findMany({ orderBy: { name: "asc" } }),
  ]);

  const editingEmployeeRaw = editEmployeeId ? employees.find((employee) => employee.id === editEmployeeId) : null;
  const splitName = editingEmployeeRaw ? splitEmployeeName(editingEmployeeRaw.name) : null;
  const editingEmployee = editingEmployeeRaw
    ? {
        id: editingEmployeeRaw.id,
        firstName: splitName?.firstName || "",
        lastName: splitName?.lastName || "",
        personalNumber: editingEmployeeRaw.personalNumber || "",
        address: editingEmployeeRaw.address || "",
        postalCode: editingEmployeeRaw.postalCode || "",
        city: editingEmployeeRaw.city || "",
        phone: editingEmployeeRaw.phone || "",
        email: editingEmployeeRaw.email || "",
        title: editingEmployeeRaw.title,
        teamId: editingEmployeeRaw.teamId || "",
        hasApv: editingEmployeeRaw.apvDate !== null || editingEmployeeRaw.skills.includes("APV"),
        apvDate: formatDate(editingEmployeeRaw.apvDate),
        apvExpiryDate: formatDate(editingEmployeeRaw.apvExpiryDate),
        hasId06: editingEmployeeRaw.id06Date !== null || editingEmployeeRaw.skills.includes("ID06"),
        id06Date: formatDate(editingEmployeeRaw.id06Date),
        id06Number: editingEmployeeRaw.id06Number || "",
        id06ExpiryDate: formatDate(editingEmployeeRaw.id06ExpiryDate),
        otherCompetence: editingEmployeeRaw.otherCompetence || "",
      }
    : null;

  return (
    <div className="grid gap-4">
      <section>
        <p className="eyebrow">Administration</p>
        <h1 className="text-[1.8rem] font-black text-[#1b2b31]">Användare och anställda</h1>
        <p className="mt-2 text-[#59707a]">Hantera användare, arbetslag, maskiner och fordon i samma vy.</p>
        <div className="mt-4">
          <a
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0f766e] px-4 py-2 text-sm font-bold text-white transition duration-150 hover:-translate-y-0.5 hover:bg-[#115e59]"
            href={withBasePath("/api/exports/employees")}
          >
            Ladda ned anställda som PDF
          </a>
        </div>
      </section>

      <AdminForms teams={teams} employees={employees} editingEmployee={editingEmployee} />

      <section className="admin-grid">
        <Card className="glass-card">
          <div className="mb-4">
            <p className="eyebrow">Katalog</p>
            <CardTitle>Användarkonton</CardTitle>
          </div>
          <div className="directory-list">
            {users.map((user) => (
              <div key={user.id} className="directory-item">
                <div className="directory-top">
                  <p className="item-title">{user.username}</p>
                  <span className="type-badge">{user.role}</span>
                </div>
                <p className="item-meta">{user.email || "Ingen e-post"} · {user.employee?.name || "Ingen anställd kopplad"}</p>
                <AdminDeleteForm
                  action={deleteUserAction}
                  id={user.id}
                  label="Ta bort användare"
                  disabled={user.id === currentUser.id}
                  disabledReason={user.id === currentUser.id ? "Du kan inte ta bort kontot du använder just nu." : undefined}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-card">
          <div className="mb-4">
            <p className="eyebrow">Katalog</p>
            <CardTitle>Anställda</CardTitle>
          </div>
          <div className="directory-list">
            {employees.map((employee) => (
              <div key={employee.id} className="directory-item">
                <div className="directory-top">
                  <p className="item-title">{employee.name}</p>
                  <span className="type-badge">{employee.title}</span>
                </div>
                <div className="employee-card-grid">
                  <div className="employee-card-section">
                    <p className="employee-card-label">Arbetslag</p>
                    <p className="item-meta">{employee.team?.name || "Inget team"}</p>
                  </div>
                  <div className="employee-card-section">
                    <p className="employee-card-label">Telefon</p>
                    <p className="item-meta">{employee.phone || "Ingen telefon"}</p>
                  </div>
                  <div className="employee-card-section">
                    <p className="employee-card-label">Personnummer</p>
                    <p className="item-meta">{employee.personalNumber || "Inget personnummer"}</p>
                  </div>
                  <div className="employee-card-section">
                    <p className="employee-card-label">E-post</p>
                    <p className="item-meta">{employee.email || "Ingen e-post"}</p>
                  </div>
                </div>
                <div className="employee-card-section">
                  <p className="employee-card-label">Adress</p>
                  <p className="item-meta">{[employee.address, employee.postalCode, employee.city].filter(Boolean).join(", ") || "Ingen adress"}</p>
                </div>
                <div className="employee-card-section">
                  <p className="employee-card-label">Kompetenser</p>
                  <div className="employee-tag-list">
                    {formatEmployeeCompetences(employee).length > 0 ? (
                      formatEmployeeCompetences(employee).map((competence) => (
                        <span key={competence} className="employee-tag">{competence}</span>
                      ))
                    ) : (
                      <span className="employee-tag employee-tag-muted">Inga kompetenser angivna</span>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(15,118,110,0.16)] bg-[rgba(15,118,110,0.1)] px-4 py-2 text-sm font-bold text-[#115e59] transition duration-150 hover:-translate-y-0.5 hover:bg-[rgba(15,118,110,0.16)]"
                    href={withBasePath(`/api/exports/employees/certificate?employeeId=${employee.id}`)}
                  >
                    Skriv ut utbildningsbevis
                  </a>
                  <Link href={`/admin?editEmployee=${employee.id}`}>
                    <button className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(27,43,49,0.14)] bg-transparent px-4 py-2 text-sm font-bold text-[#1b2b31] transition duration-150 hover:-translate-y-0.5 hover:bg-white/80" type="button">
                      Redigera
                    </button>
                  </Link>
                </div>
                <AdminDeleteForm
                  action={deleteEmployeeAction}
                  id={employee.id}
                  label="Ta bort anställd"
                  disabled={
                    currentUser.employeeId === employee.id ||
                    employee._count.users > 0 ||
                    employee._count.projects > 0 ||
                    employee._count.timeReports > 0 ||
                    employee._count.diaryEntries > 0
                  }
                  disabledReason={
                    currentUser.employeeId === employee.id
                      ? "Detta är den anställda som är kopplad till ditt konto."
                      : employee._count.users > 0
                        ? "Kopplad till användarkonto."
                        : employee._count.projects > 0
                          ? "Kopplad till projekt."
                          : employee._count.timeReports > 0
                            ? "Har tidrapporter."
                            : employee._count.diaryEntries > 0
                              ? "Har dagboksinlägg."
                              : undefined
                  }
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-card">
          <div className="mb-4">
            <p className="eyebrow">Katalog</p>
            <CardTitle>Maskiner</CardTitle>
          </div>
          <div className="directory-list">
            {machines.map((machine) => (
              <div key={machine.id} className="directory-item">
                <div className="directory-top">
                  <p className="item-title">{machine.name}</p>
                  <span className="type-badge">{machine.status}</span>
                </div>
                <p className="item-meta">{machine.type}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-card">
          <div className="mb-4">
            <p className="eyebrow">Katalog</p>
            <CardTitle>Fordon</CardTitle>
          </div>
          <div className="directory-list">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="directory-item">
                <div className="directory-top">
                  <p className="item-title">{vehicle.name}</p>
                  <span className="type-badge">{vehicle.status}</span>
                </div>
                <p className="item-meta">{vehicle.registrationNumber}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
