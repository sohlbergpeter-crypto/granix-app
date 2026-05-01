"use client";

import { ProjectStatus } from "@prisma/client";
import { useActionState, useEffect, useState } from "react";
import { saveProjectAction } from "@/server/actions/projects";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

type Option = { id: string; name: string };
type NotificationTarget = "none" | "assigned" | "all";
type ProjectFormValues = {
  id?: string;
  name?: string;
  projectNumber?: string;
  customerName?: string;
  address?: string;
  city?: string;
  contactPerson?: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  status?: string;
  color?: string;
  internalNote?: string;
  externalDescription?: string;
  teamId?: string;
  employeeIds?: string[];
  machineIds?: string[];
  vehicleIds?: string[];
  notificationTarget?: string;
};
type ProjectActionState =
  | {
      error?: string;
      values?: ProjectFormValues;
    }
  | null;

type ProjectFormProps = {
  project?: {
    id: string;
    name: string;
    projectNumber: string;
    customerName: string;
    address: string;
    city: string;
    contactPerson: string | null;
    phone: string | null;
    startDate: Date;
    endDate: Date;
    startTime: string | null;
    endTime: string | null;
    allDay: boolean;
    status: ProjectStatus;
    color: string;
    internalNote: string | null;
    externalDescription: string | null;
    teamId: string | null;
    employees: { employeeId: string }[];
    machines: { machineId: string }[];
    vehicles: { vehicleId: string }[];
  };
  teams: Option[];
  employees: Option[];
  machines: Option[];
  vehicles: Option[];
};

type ProjectDraft = {
  id: string;
  name: string;
  projectNumber: string;
  customerName: string;
  address: string;
  city: string;
  contactPerson: string;
  phone: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  status: ProjectStatus;
  color: string;
  internalNote: string;
  externalDescription: string;
  teamId: string;
  employeeIds: string[];
  machineIds: string[];
  vehicleIds: string[];
  notificationTarget: NotificationTarget;
};

function dateValue(date?: Date) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function getInitialDraft(project?: ProjectFormProps["project"]): ProjectDraft {
  return {
    id: project?.id || "",
    name: project?.name || "",
    projectNumber: project?.projectNumber || "",
    customerName: project?.customerName || "",
    address: project?.address || "",
    city: project?.city || "",
    contactPerson: project?.contactPerson || "",
    phone: project?.phone || "",
    startDate: dateValue(project?.startDate),
    endDate: dateValue(project?.endDate),
    startTime: project?.startTime || "",
    endTime: project?.endTime || "",
    allDay: project?.allDay ?? true,
    status: project?.status || "planerat",
    color: project?.color || "#0f766e",
    internalNote: project?.internalNote || "",
    externalDescription: project?.externalDescription || "",
    teamId: project?.teamId || "",
    employeeIds: project?.employees.map((employee) => employee.employeeId) || [],
    machineIds: project?.machines.map((machine) => machine.machineId) || [],
    vehicleIds: project?.vehicles.map((vehicle) => vehicle.vehicleId) || [],
    notificationTarget: "none",
  };
}

function valuesFromSelect(event: React.ChangeEvent<HTMLSelectElement>) {
  return Array.from(event.target.selectedOptions, (option) => option.value);
}

export function ProjectForm({ project, teams, employees, machines, vehicles }: ProjectFormProps) {
  const [state, action, pending] = useActionState<ProjectActionState, FormData>(saveProjectAction, null);
  const [draft, setDraft] = useState<ProjectDraft>(() => getInitialDraft(project));

  useEffect(() => {
    const values = state?.values;
    if (!values) return;
    setDraft((current) => ({
      ...current,
      ...values,
      allDay: values.allDay ?? current.allDay,
      employeeIds: values.employeeIds ?? current.employeeIds,
      machineIds: values.machineIds ?? current.machineIds,
      vehicleIds: values.vehicleIds ?? current.vehicleIds,
      notificationTarget: (values.notificationTarget as NotificationTarget | undefined) ?? current.notificationTarget,
      status: (values.status as ProjectStatus | undefined) ?? current.status,
    }));
  }, [state]);

  return (
    <Card className="glass-card p-5">
      <div className="card-header">
        <div>
          <p className="eyebrow">Projektregister</p>
          <CardTitle>{project ? "Redigera projekt" : "Lägg till projekt"}</CardTitle>
        </div>
      </div>
      <form action={action} className="planning-form">
        <input type="hidden" name="id" value={draft.id} />
        <Field label="Projektnamn">
          <Input name="name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} required />
        </Field>

        <div className="field-row">
          <Field label="Projektnummer">
            <Input name="projectNumber" value={draft.projectNumber} onChange={(event) => setDraft((current) => ({ ...current, projectNumber: event.target.value }))} required />
          </Field>
          <Field label="Kundnamn">
            <Input name="customerName" value={draft.customerName} onChange={(event) => setDraft((current) => ({ ...current, customerName: event.target.value }))} required />
          </Field>
        </div>

        <div className="field-row">
          <Field label="Adress">
            <Input name="address" value={draft.address} onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))} required />
          </Field>
          <Field label="Ort">
            <Input name="city" value={draft.city} onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))} required />
          </Field>
        </div>

        <div className="field-row">
          <Field label="Kontaktperson">
            <Input name="contactPerson" value={draft.contactPerson} onChange={(event) => setDraft((current) => ({ ...current, contactPerson: event.target.value }))} />
          </Field>
          <Field label="Telefon">
            <Input name="phone" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} />
          </Field>
        </div>

        <div className="field-row">
          <Field label="Startdatum">
            <Input name="startDate" type="date" value={draft.startDate} onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))} required />
          </Field>
          <Field label="Slutdatum">
            <Input name="endDate" type="date" value={draft.endDate} onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))} required />
          </Field>
        </div>

        <div className="field-row">
          <Field label="Starttid">
            <Input name="startTime" type="time" value={draft.startTime} onChange={(event) => setDraft((current) => ({ ...current, startTime: event.target.value }))} />
          </Field>
          <Field label="Sluttid">
            <Input name="endTime" type="time" value={draft.endTime} onChange={(event) => setDraft((current) => ({ ...current, endTime: event.target.value }))} />
          </Field>
        </div>

        <div className="field-row">
          <Field label="Status">
            <Select name="status" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as ProjectStatus }))}>
              {Object.values(ProjectStatus).map((status) => <option key={status} value={status}>{status}</option>)}
            </Select>
          </Field>
          <Field label="Projektfärg">
            <Input name="color" type="color" value={draft.color} onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value }))} />
          </Field>
        </div>

        <div className="field-row">
          <Field label="Arbetslag">
            <Select name="teamId" value={draft.teamId} onChange={(event) => setDraft((current) => ({ ...current, teamId: event.target.value }))}>
              <option value="">Inget arbetslag</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </Select>
          </Field>
          <label className="flex items-center gap-3 rounded-[20px] border border-[rgba(27,43,49,0.12)] bg-[rgba(255,255,255,0.96)] px-4 py-3 text-sm font-bold text-[#1b2b31]">
            <input name="allDay" type="checkbox" checked={draft.allDay} onChange={(event) => setDraft((current) => ({ ...current, allDay: event.target.checked }))} />
            Heldagsprojekt
          </label>
        </div>

        <div className="directory-grid">
          <Field label="Anställda">
            <Select
              name="employeeIds"
              multiple
              value={draft.employeeIds}
              onChange={(event) => setDraft((current) => ({ ...current, employeeIds: valuesFromSelect(event) }))}
              className="min-h-36"
            >
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
            </Select>
          </Field>
          <Field label="Maskiner">
            <Select
              name="machineIds"
              multiple
              value={draft.machineIds}
              onChange={(event) => setDraft((current) => ({ ...current, machineIds: valuesFromSelect(event) }))}
              className="min-h-36"
            >
              {machines.map((machine) => <option key={machine.id} value={machine.id}>{machine.name}</option>)}
            </Select>
          </Field>
        </div>

        <Field label="Fordon">
          <Select
            name="vehicleIds"
            multiple
            value={draft.vehicleIds}
            onChange={(event) => setDraft((current) => ({ ...current, vehicleIds: valuesFromSelect(event) }))}
            className="min-h-36"
          >
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}
          </Select>
        </Field>

        <Field label="Intern anteckning">
          <Textarea name="internalNote" value={draft.internalNote} onChange={(event) => setDraft((current) => ({ ...current, internalNote: event.target.value }))} />
        </Field>
        <Field label="Extern beskrivning">
          <Textarea name="externalDescription" value={draft.externalDescription} onChange={(event) => setDraft((current) => ({ ...current, externalDescription: event.target.value }))} />
        </Field>

        <Field label="Notis vid sparning">
          <Select
            name="notificationTarget"
            value={draft.notificationTarget}
            onChange={(event) => setDraft((current) => ({ ...current, notificationTarget: event.target.value as NotificationTarget }))}
          >
            <option value="none">Inget utskick</option>
            <option value="assigned">Tilldelade användare</option>
            <option value="all">Alla användare</option>
          </Select>
        </Field>

        {state?.error ? <p className="rounded-[20px] border border-[rgba(185,28,28,0.18)] bg-[rgba(239,68,68,0.08)] p-3 text-sm text-[#b91c1c]">{state.error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={pending}>{pending ? "Sparar..." : "Spara projekt"}</Button>
        </div>
      </form>
    </Card>
  );
}
