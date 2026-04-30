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
  if (state.error) return <p className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100">{state.error}</p>;
  if (state.ok) return <p className="rounded-xl border border-granix-green/40 bg-granix-green/10 p-3 text-sm text-green-100">Sparat.</p>;
  return null;
}

export function AdminForms({ teams, employees }: { teams: Option[]; employees: Option[] }) {
  const [userState, userAction] = useActionState(createUserAction, null);
  const [employeeState, employeeAction] = useActionState(createEmployeeAction, null);
  const [teamState, teamAction] = useActionState(createTeamAction, null);
  const [machineState, machineAction] = useActionState(createMachineAction, null);
  const [vehicleState, vehicleAction] = useActionState(createVehicleAction, null);

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardTitle>Skapa användare</CardTitle>
        <form action={userAction} className="mt-4 grid gap-3">
          <Field label="Användarnamn"><Input name="username" required /></Field>
          <Field label="E-post"><Input name="email" type="email" /></Field>
          <Field label="Lösenord"><Input name="password" type="password" minLength={6} required /></Field>
          <Field label="Roll">
            <Select name="role" defaultValue={Role.user}>
              <option value={Role.user}>User</option>
              <option value={Role.admin}>Admin</option>
            </Select>
          </Field>
          <Field label="Koppla anställd">
            <Select name="employeeId" defaultValue="">
              <option value="">Ingen koppling</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
            </Select>
          </Field>
          <Message state={userState} />
          <Button type="submit">Skapa användare</Button>
        </form>
      </Card>

      <Card>
        <CardTitle>Skapa anställd</CardTitle>
        <form action={employeeAction} className="mt-4 grid gap-3">
          <Field label="Namn"><Input name="name" required /></Field>
          <Field label="Telefon"><Input name="phone" /></Field>
          <Field label="E-post"><Input name="email" type="email" /></Field>
          <Field label="Roll/titel"><Input name="title" placeholder="Stensättare" required /></Field>
          <Field label="Arbetslag">
            <Select name="teamId" defaultValue="">
              <option value="">Inget arbetslag</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </Select>
          </Field>
          <Field label="Kompetenser, kommaseparerade"><Input name="skills" placeholder="Marksten, kantsten, grävare" /></Field>
          <Message state={employeeState} />
          <Button type="submit">Skapa anställd</Button>
        </form>
      </Card>

      <Card>
        <CardTitle>Skapa arbetslag</CardTitle>
        <form action={teamAction} className="mt-4 grid gap-3">
          <Field label="Namn"><Input name="name" required /></Field>
          <Field label="Beskrivning"><Textarea name="description" /></Field>
          <Message state={teamState} />
          <Button type="submit">Skapa team</Button>
        </form>
      </Card>

      <Card>
        <CardTitle>Skapa maskin</CardTitle>
        <form action={machineAction} className="mt-4 grid gap-3">
          <Field label="Namn"><Input name="name" required /></Field>
          <Field label="Typ"><Input name="type" required /></Field>
          <Field label="Status">
            <Select name="status" defaultValue={ResourceStatus.aktiv}>
              {Object.values(ResourceStatus).map((status) => <option key={status} value={status}>{status}</option>)}
            </Select>
          </Field>
          <Message state={machineState} />
          <Button type="submit">Skapa maskin</Button>
        </form>
      </Card>

      <Card>
        <CardTitle>Skapa fordon</CardTitle>
        <form action={vehicleAction} className="mt-4 grid gap-3">
          <Field label="Namn"><Input name="name" required /></Field>
          <Field label="Registreringsnummer"><Input name="registrationNumber" required /></Field>
          <Field label="Status">
            <Select name="status" defaultValue={ResourceStatus.aktiv}>
              {Object.values(ResourceStatus).map((status) => <option key={status} value={status}>{status}</option>)}
            </Select>
          </Field>
          <Message state={vehicleState} />
          <Button type="submit">Skapa fordon</Button>
        </form>
      </Card>
    </div>
  );
}
