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

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <div className="mb-4">
            <p className="eyebrow">Katalog</p>
            <CardTitle>Användarkonton</CardTitle>
          </div>
          <div className="grid gap-3">
            {users.map((user) => (
              <div key={user.id} className="rounded-[20px] border border-[rgba(20,51,58,0.08)] bg-[rgba(255,255,255,0.92)] p-4">
                <p className="font-bold text-[#1b2b31]">{user.username} <span className="text-xs text-[#115e59]">{user.role}</span></p>
                <p className="mt-1 text-sm text-[#59707a]">{user.email || "Ingen e-post"} · {user.employee?.name || "Ingen anställd kopplad"}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <p className="eyebrow">Katalog</p>
            <CardTitle>Anställda</CardTitle>
          </div>
          <div className="grid gap-3">
            {employees.map((employee) => (
              <div key={employee.id} className="rounded-[20px] border border-[rgba(20,51,58,0.08)] bg-[rgba(255,255,255,0.92)] p-4">
                <p className="font-bold text-[#1b2b31]">{employee.name} <span className="text-xs text-[#59707a]">{employee.title}</span></p>
                <p className="mt-1 text-sm text-[#59707a]">{employee.team?.name || "Inget team"} · {employee.phone || "Ingen telefon"}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <p className="eyebrow">Katalog</p>
            <CardTitle>Maskiner</CardTitle>
          </div>
          <div className="grid gap-3">
            {machines.map((machine) => (
              <div key={machine.id} className="rounded-[20px] border border-[rgba(20,51,58,0.08)] bg-[rgba(255,255,255,0.92)] p-4">
                <p className="font-bold text-[#1b2b31]">{machine.name}</p>
                <p className="mt-1 text-sm text-[#59707a]">{machine.type} · {machine.status}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <p className="eyebrow">Katalog</p>
            <CardTitle>Fordon</CardTitle>
          </div>
          <div className="grid gap-3">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="rounded-[20px] border border-[rgba(20,51,58,0.08)] bg-[rgba(255,255,255,0.92)] p-4">
                <p className="font-bold text-[#1b2b31]">{vehicle.name}</p>
                <p className="mt-1 text-sm text-[#59707a]">{vehicle.registrationNumber} · {vehicle.status}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
