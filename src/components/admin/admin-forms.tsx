"use client";

import { ResourceStatus, Role } from "@prisma/client";
import { useActionState } from "react";
import {
  createEmployeeAction,
  createMachineAction,
  createTeamAction,
  createUserAction,
  createVehicleAction,
} from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

type Option = { id: string; name: string };

function Message({ state }: { state: { error?: string; ok?: boolean } | null }) {
  if (!state) return null;
  if (state.error) return <p className="rounded-[20px] border border-[rgba(185,28,28,0.18)] bg-[rgba(239,68,68,0.08)] p-3 text-sm text-[#b91c1c]">{state.error}</p>;
  if (state.ok) return <p className="rounded-[20px] border border-[rgba(15,118,110,0.18)] bg-[rgba(15,118,110,0.08)] p-3 text-sm text-[#115e59]">Sparat.</p>;
  return null;
}

export function AdminForms({ teams, employees }: { teams: Option[]; employees: Option[] }) {
  const [userState, userAction] = useActionState(createUserAction, null);
  const [employeeState, employeeAction] = useActionState(createEmployeeAction, null);
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
        <div className="mb-4">
          <p className="eyebrow">Administration</p>
          <CardTitle>Ny anställd</CardTitle>
        </div>
        <form action={employeeAction} className="planning-form">
          <Field label="Namn"><Input name="name" required /></Field>
          <div className="field-row">
            <Field label="Personnummer"><Input name="personalNumber" required /></Field>
            <Field label="Adress"><Input name="address" required /></Field>
          </div>
          <div className="field-row">
            <Field label="Telefon"><Input name="phone" required /></Field>
            <Field label="E-post"><Input name="email" type="email" required /></Field>
          </div>
          <div className="field-row">
            <Field label="Roll eller titel"><Input name="title" placeholder="Stensättare" required /></Field>
            <Field label="Arbetslag">
              <Select name="teamId" defaultValue="">
                <option value="">Inget arbetslag</option>
                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Kompetenser, kommaseparerade"><Input name="skills" placeholder="Marksten, kantsten, grävare" /></Field>
          <Message state={employeeState} />
          <Button variant="secondary" type="submit">Lägg till anställd</Button>
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
