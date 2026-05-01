import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteEmployeeAction, deleteUserAction } from "@/server/actions/admin";
import { AdminForms } from "@/components/admin/admin-forms";
import { AdminDeleteForm } from "@/components/admin/admin-delete-form";
import { Card, CardTitle } from "@/components/ui/card";
import { withBasePath } from "@/lib/base-path";

export default async function AdminPage() {
  const currentUser = await requireAdmin();
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

      <AdminForms teams={teams} employees={employees} />

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
                <p className="item-meta">{employee.team?.name || "Inget team"} · {employee.phone || "Ingen telefon"}</p>
                <p className="item-meta">{employee.personalNumber || "Inget personnummer"} · {employee.email || "Ingen e-post"}</p>
                <p className="item-meta">{employee.address || "Ingen adress"}</p>
                <p className="item-meta">
                  {[
                    employee.apvDate ? `APV: ${employee.apvDate.toISOString().slice(0, 10)}` : null,
                    employee.id06Date ? `ID06: ${employee.id06Date.toISOString().slice(0, 10)}` : null,
                    employee.otherCompetence ? `Övrigt: ${employee.otherCompetence}` : null,
                  ].filter(Boolean).join(" · ") || "Inga kompetenser angivna"}
                </p>
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
