import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminForms } from "@/components/admin/admin-forms";
import { Card, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  await requireAdmin();
  const [users, employees, teams, machines, vehicles] = await Promise.all([
    db.user.findMany({ include: { employee: true }, orderBy: { username: "asc" } }),
    db.employee.findMany({ include: { team: true }, orderBy: { name: "asc" } }),
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
