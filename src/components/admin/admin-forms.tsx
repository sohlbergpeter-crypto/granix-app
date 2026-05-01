"use client";

import Link from "next/link";
import { ResourceStatus, Role } from "@prisma/client";
import { useActionState, useEffect, useState } from "react";
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
  firstName: string;
  lastName: string;
  personalNumber: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  title: string;
  teamId: string;
  hasApv: boolean;
  apvDate: string;
  apvExpiryDate: string;
  hasId06: boolean;
  id06Date: string;
  id06Number: string;
  id06ExpiryDate: string;
  otherCompetence: string;
};

type EmployeeFormValues = EditingEmployee;

type EmployeeActionState =
  | {
      error?: string;
      ok?: boolean;
      values?: EmployeeFormValues;
    }
  | null;

function Message({ state }: { state: { error?: string; ok?: boolean } | null }) {
  if (!state) return null;
  if (state.error) return <p className="rounded-[20px] border border-[rgba(185,28,28,0.18)] bg-[rgba(239,68,68,0.08)] p-3 text-sm text-[#b91c1c]">{state.error}</p>;
  if (state.ok) return <p className="rounded-[20px] border border-[rgba(15,118,110,0.18)] bg-[rgba(15,118,110,0.08)] p-3 text-sm text-[#115e59]">Sparat.</p>;
  return null;
}

function getInitialEmployeeDraft(editingEmployee?: EditingEmployee | null): EmployeeFormValues {
  return editingEmployee || {
    id: "",
    firstName: "",
    lastName: "",
    personalNumber: "",
    address: "",
    postalCode: "",
    city: "",
    phone: "",
    email: "",
    title: "",
    teamId: "",
    hasApv: false,
    apvDate: "",
    apvExpiryDate: "",
    hasId06: false,
    id06Date: "",
    id06Number: "",
    id06ExpiryDate: "",
    otherCompetence: "",
  };
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
  const [employeeState, employeeAction] = useActionState<EmployeeActionState, FormData>(editingEmployee ? updateEmployeeAction : createEmployeeAction, null);
  const [teamState, teamAction] = useActionState(createTeamAction, null);
  const [machineState, machineAction] = useActionState(createMachineAction, null);
  const [vehicleState, vehicleAction] = useActionState(createVehicleAction, null);
  const [employeeDraft, setEmployeeDraft] = useState<EmployeeFormValues>(() => getInitialEmployeeDraft(editingEmployee));

  useEffect(() => {
    if (!employeeState?.values) return;
    setEmployeeDraft(employeeState.values);
  }, [employeeState]);

  useEffect(() => {
    setEmployeeDraft(getInitialEmployeeDraft(editingEmployee));
  }, [editingEmployee]);

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
          {employeeDraft.id ? <input type="hidden" name="id" value={employeeDraft.id} /> : null}
          <div className="field-row">
            <Field label="Förnamn"><Input name="firstName" value={employeeDraft.firstName} onChange={(event) => setEmployeeDraft((current) => ({ ...current, firstName: event.target.value }))} required /></Field>
            <Field label="Efternamn"><Input name="lastName" value={employeeDraft.lastName} onChange={(event) => setEmployeeDraft((current) => ({ ...current, lastName: event.target.value }))} required /></Field>
          </div>
          <div className="field-row">
            <Field label="Personnummer"><Input name="personalNumber" placeholder="19840324-6280" value={employeeDraft.personalNumber} onChange={(event) => setEmployeeDraft((current) => ({ ...current, personalNumber: event.target.value }))} required /></Field>
            <Field label="Adress"><Input name="address" value={employeeDraft.address} onChange={(event) => setEmployeeDraft((current) => ({ ...current, address: event.target.value }))} required /></Field>
          </div>
          <div className="field-row">
            <Field label="Postnummer"><Input name="postalCode" placeholder="12345" value={employeeDraft.postalCode} onChange={(event) => setEmployeeDraft((current) => ({ ...current, postalCode: event.target.value }))} required /></Field>
            <Field label="Ort"><Input name="city" value={employeeDraft.city} onChange={(event) => setEmployeeDraft((current) => ({ ...current, city: event.target.value }))} required /></Field>
          </div>
          <div className="field-row">
            <Field label="Telefon"><Input name="phone" value={employeeDraft.phone} onChange={(event) => setEmployeeDraft((current) => ({ ...current, phone: event.target.value }))} required /></Field>
            <Field label="E-post"><Input name="email" type="email" value={employeeDraft.email} onChange={(event) => setEmployeeDraft((current) => ({ ...current, email: event.target.value }))} required /></Field>
          </div>
          <div className="field-row">
            <Field label="Roll eller titel"><Input name="title" placeholder="Stensättare" value={employeeDraft.title} onChange={(event) => setEmployeeDraft((current) => ({ ...current, title: event.target.value }))} required /></Field>
            <Field label="Arbetslag">
              <Select name="teamId" value={employeeDraft.teamId} onChange={(event) => setEmployeeDraft((current) => ({ ...current, teamId: event.target.value }))}>
                <option value="">Inget arbetslag</option>
                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid gap-3 rounded-[20px] border border-[rgba(27,43,49,0.1)] bg-[rgba(255,255,255,0.72)] p-4">
            <p className="text-[0.85rem] font-bold text-[#59707a]">Kompetenser</p>
            <div className="field-row">
              <label className="flex items-center gap-2 text-[#1b2b31]">
                <input name="hasApv" type="checkbox" checked={employeeDraft.hasApv} onChange={(event) => setEmployeeDraft((current) => ({ ...current, hasApv: event.target.checked }))} />
                <span>APV</span>
              </label>
              <Field label="Utbildningsdatum APV"><Input name="apvDate" type="date" value={employeeDraft.apvDate} onChange={(event) => setEmployeeDraft((current) => ({ ...current, apvDate: event.target.value }))} /></Field>
              <Field label="Förfaller APV"><Input name="apvExpiryDate" type="date" value={employeeDraft.apvExpiryDate} onChange={(event) => setEmployeeDraft((current) => ({ ...current, apvExpiryDate: event.target.value }))} /></Field>
            </div>
            <div className="field-row">
              <label className="flex items-center gap-2 text-[#1b2b31]">
                <input name="hasId06" type="checkbox" checked={employeeDraft.hasId06} onChange={(event) => setEmployeeDraft((current) => ({ ...current, hasId06: event.target.checked }))} />
                <span>ID06</span>
              </label>
              <Field label="ID06 giltig från"><Input name="id06Date" type="date" value={employeeDraft.id06Date} onChange={(event) => setEmployeeDraft((current) => ({ ...current, id06Date: event.target.value }))} /></Field>
              <Field label="ID06-nummer"><Input name="id06Number" value={employeeDraft.id06Number} onChange={(event) => setEmployeeDraft((current) => ({ ...current, id06Number: event.target.value }))} /></Field>
            </div>
            <div className="field-row">
              <Field label="Förfaller ID06"><Input name="id06ExpiryDate" type="date" value={employeeDraft.id06ExpiryDate} onChange={(event) => setEmployeeDraft((current) => ({ ...current, id06ExpiryDate: event.target.value }))} /></Field>
            </div>
            <Field label="Övrigt"><Input name="otherCompetence" placeholder="Övrig kompetens eller certifiering" value={employeeDraft.otherCompetence} onChange={(event) => setEmployeeDraft((current) => ({ ...current, otherCompetence: event.target.value }))} /></Field>
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
