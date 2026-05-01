"use client";

import Link from "next/link";
import { ResourceStatus, Role } from "@prisma/client";
import { useActionState } from "react";
import {
  createEmployeeAction,
  createMachineAction,
  createTeamAction,
  createUserAction,
  createVehicleAction,
  updateEmployeeAction,
} from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

type Option = { id: string; name: string };

type EditingEmployee = {
  id: string;
  name: string;
  personalNumber: string;
  address: string;
  phone: string;
  email: string;
  title: string;
  teamId: string;
  apvDate: string;
  apvExpiryDate: string;
  id06Date: string;
  id06ExpiryDate: string;
  otherCompetence: string;
  otherCompetenceDate: string;
  otherCompetenceExpiryDate: string;
};

function Message({ state }: { state: { error?: string; ok?: boolean } | null }) {
  if (!state) return null;
  if (state.error) return <p className="rounded-[20px] border border-[rgba(185,28,28,0.18)] bg-[rgba(239,68,68,0.08)] p-3 text-sm text-[#b91c1c]">{state.error}</p>;
  if (state.ok) return <p className="rounded-[20px] border border-[rgba(15,118,110,0.18)] bg-[rgba(15,118,110,0.08)] p-3 text-sm text-[#115e59]">Sparat.</p>;
  return null;
}

export function AdminForms({
  teams,
  employees,
  editingEmployee,
}: {
  teams: Option[];
  employees: Option[];
  editingEmployee?: EditingEmployee | null;
}) {
  const [userState, userAction] = useActionState(createUserAction, null);
  const [employeeState, employeeAction] = useActionState(editingEmployee ? updateEmployeeAction : createEmployeeAction, null);
  const [teamState, teamAction] = useActionState(createTeamAction, null);
  const [machineState, machineAction] = useActionState(createMachineAction, null);
  const [vehicleState, vehicleAction] = useActionState(createVehicleAction, null);

  return (
    <div className="admin-grid">
      <Card className="glass-card">
        <div className="mb-4">
          <p className="eyebrow">Administration</p>
          <CardTitle>Nytt användarkonto</CardTitle>
        </div>
        <form action={userAction} className="planning-form">
          <Field label="Användarnamn"><Input name="username" required /></Field>
          <Field label="E-post"><Input name="email" type="email" /></Field>
          <Field label="Lösenord"><Input name="password" type="password" minLength={6} required /></Field>
          <div className="field-row">
            <Field label="Roll">
              <Select name="role" defaultValue={Role.user}>
                <option value={Role.user}>User</option>
                <option value={Role.admin}>Admin</option>
              </Select>
            </Field>
            <Field label="Befintlig anställd">
              <Select name="employeeId" defaultValue="">
                <option value="">Ingen koppling</option>
                {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
              </Select>
            </Field>
          </div>
          <p className="dashboard-note">Om ingen anställd väljs skapas en ny anställd automatiskt för användaren.</p>
          <Message state={userState} />
          <Button variant="secondary" type="submit">Lägg till användare</Button>
        </form>
      </Card>

      <Card className="glass-card">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Administration</p>
            <CardTitle>{editingEmployee ? "Redigera anställd" : "Ny anställd"}</CardTitle>
          </div>
          {editingEmployee ? (
            <Link href="/admin">
              <Button variant="ghost" type="button">Avbryt</Button>
            </Link>
          ) : null}
        </div>
        <form action={employeeAction} className="planning-form">
          {editingEmployee ? <input type="hidden" name="id" value={editingEmployee.id} /> : null}
          <Field label="Namn"><Input name="name" defaultValue={editingEmployee?.name || ""} required /></Field>
          <div className="field-row">
            <Field label="Personnummer"><Input name="personalNumber" defaultValue={editingEmployee?.personalNumber || ""} required /></Field>
            <Field label="Adress"><Input name="address" defaultValue={editingEmployee?.address || ""} required /></Field>
          </div>
          <div className="field-row">
            <Field label="Telefon"><Input name="phone" defaultValue={editingEmployee?.phone || ""} required /></Field>
            <Field label="E-post"><Input name="email" type="email" defaultValue={editingEmployee?.email || ""} required /></Field>
          </div>
          <div className="field-row">
            <Field label="Roll eller titel"><Input name="title" placeholder="Stensättare" defaultValue={editingEmployee?.title || ""} required /></Field>
            <Field label="Arbetslag">
              <Select name="teamId" defaultValue={editingEmployee?.teamId || ""}>
                <option value="">Inget arbetslag</option>
                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid gap-3 rounded-[20px] border border-[rgba(27,43,49,0.1)] bg-[rgba(255,255,255,0.72)] p-4">
            <p className="text-[0.85rem] font-bold text-[#59707a]">Kompetenser</p>
            <div className="field-row">
              <label className="flex items-center gap-2 text-[#1b2b31]">
                <input name="hasApv" type="checkbox" defaultChecked={Boolean(editingEmployee?.apvDate)} />
                <span>APV</span>
              </label>
              <Field label="Utbildningsdatum APV"><Input name="apvDate" type="date" defaultValue={editingEmployee?.apvDate || ""} /></Field>
              <Field label="Förfaller APV"><Input name="apvExpiryDate" type="date" defaultValue={editingEmployee?.apvExpiryDate || ""} /></Field>
            </div>
            <div className="field-row">
              <label className="flex items-center gap-2 text-[#1b2b31]">
                <input name="hasId06" type="checkbox" defaultChecked={Boolean(editingEmployee?.id06Date)} />
                <span>ID06</span>
              </label>
              <Field label="Utbildningsdatum ID06"><Input name="id06Date" type="date" defaultValue={editingEmployee?.id06Date || ""} /></Field>
              <Field label="Förfaller ID06"><Input name="id06ExpiryDate" type="date" defaultValue={editingEmployee?.id06ExpiryDate || ""} /></Field>
            </div>
            <Field label="Övrigt"><Input name="otherCompetence" placeholder="Övrig kompetens eller certifiering" defaultValue={editingEmployee?.otherCompetence || ""} /></Field>
            <div className="field-row">
              <Field label="Utbildningsdatum övrigt"><Input name="otherCompetenceDate" type="date" defaultValue={editingEmployee?.otherCompetenceDate || ""} /></Field>
              <Field label="Förfaller övrigt"><Input name="otherCompetenceExpiryDate" type="date" defaultValue={editingEmployee?.otherCompetenceExpiryDate || ""} /></Field>
            </div>
          </div>
          <Message state={employeeState} />
          <Button variant="secondary" type="submit">{editingEmployee ? "Spara ändringar" : "Lägg till anställd"}</Button>
        </form>
      </Card>

      <Card className="glass-card">
        <div className="mb-4">
          <p className="eyebrow">Administration</p>
          <CardTitle>Nytt arbetslag</CardTitle>
        </div>
        <form action={teamAction} className="planning-form">
          <Field label="Namn"><Input name="name" required /></Field>
          <Field label="Beskrivning"><Textarea name="description" /></Field>
          <Message state={teamState} />
          <Button variant="ghost" type="submit">Spara team</Button>
        </form>
      </Card>

      <Card className="glass-card">
        <div className="mb-4">
          <p className="eyebrow">Administration</p>
          <CardTitle>Resurser</CardTitle>
        </div>
        <div className="planning-form">
          <form action={machineAction} className="planning-form">
            <h3 className="text-base font-bold text-[#1b2b31]">Ny maskin</h3>
            <div className="field-row">
              <Field label="Namn"><Input name="name" required /></Field>
              <Field label="Typ"><Input name="type" required /></Field>
            </div>
            <Field label="Status">
              <Select name="status" defaultValue={ResourceStatus.aktiv}>
                {Object.values(ResourceStatus).map((status) => <option key={status} value={status}>{status}</option>)}
              </Select>
            </Field>
            <Message state={machineState} />
            <Button variant="ghost" type="submit">Spara maskin</Button>
          </form>

          <form action={vehicleAction} className="planning-form">
            <h3 className="text-base font-bold text-[#1b2b31]">Nytt fordon</h3>
            <div className="field-row">
              <Field label="Namn"><Input name="name" required /></Field>
              <Field label="Registreringsnummer"><Input name="registrationNumber" required /></Field>
            </div>
            <Field label="Status">
              <Select name="status" defaultValue={ResourceStatus.aktiv}>
                {Object.values(ResourceStatus).map((status) => <option key={status} value={status}>{status}</option>)}
              </Select>
            </Field>
            <Message state={vehicleState} />
            <Button variant="ghost" type="submit">Spara fordon</Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
