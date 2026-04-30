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
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Admin</h1>
        <p className="text-white/60">Hantera användare, anställda, arbetslag, maskiner och fordon.</p>
      </div>
      <AdminForms teams={teams} employees={employees} />
      <section className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardTitle>Användare</CardTitle>
          <div className="mt-4 grid gap-2">
            {users.map((user) => (
              <div key={user.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="font-bold">{user.username} <span className="text-xs text-granix-green">{user.role}</span></p>
                <p className="text-sm text-white/60">{user.email || "Ingen e-post"} · {user.employee?.name || "Ingen anställd kopplad"}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>Anställda</CardTitle>
          <div className="mt-4 grid gap-2">
            {employees.map((employee) => (
              <div key={employee.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="font-bold">{employee.name} <span className="text-xs text-white/45">{employee.title}</span></p>
                <p className="text-sm text-white/60">{employee.team?.name || "Inget team"} · {employee.phone || "Ingen telefon"}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>Maskiner</CardTitle>
          <div className="mt-4 grid gap-2">
            {machines.map((machine) => (
              <div key={machine.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="font-bold">{machine.name}</p>
                <p className="text-sm text-white/60">{machine.type} · {machine.status}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>Fordon</CardTitle>
          <div className="mt-4 grid gap-2">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="font-bold">{vehicle.name}</p>
                <p className="text-sm text-white/60">{vehicle.registrationNumber} · {vehicle.status}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
