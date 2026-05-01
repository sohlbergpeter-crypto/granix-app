"use client";

import { ProjectStatus } from "@prisma/client";
import { useActionState } from "react";
import { saveProjectAction } from "@/server/actions/projects";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

type Option = { id: string; name: string };

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

function dateValue(date?: Date) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function ProjectForm({ project, teams, employees, machines, vehicles }: ProjectFormProps) {
  const [state, action, pending] = useActionState(saveProjectAction, null);
  const selectedEmployees = new Set(project?.employees.map((employee) => employee.employeeId));
  const selectedMachines = new Set(project?.machines.map((machine) => machine.machineId));
  const selectedVehicles = new Set(project?.vehicles.map((vehicle) => vehicle.vehicleId));

  return (
    <Card className="glass-card p-5">
      <div className="card-header">
        <div>
          <p className="eyebrow">Projektregister</p>
          <CardTitle>{project ? "Redigera projekt" : "Lägg till projekt"}</CardTitle>
        </div>
      </div>
      <form action={action} className="planning-form">
        <input type="hidden" name="id" value={project?.id || ""} />
        <Field label="Projektnamn"><Input name="name" defaultValue={project?.name} required /></Field>

        <div className="field-row">
          <Field label="Projektnummer"><Input name="projectNumber" defaultValue={project?.projectNumber} required /></Field>
          <Field label="Kundnamn"><Input name="customerName" defaultValue={project?.customerName} required /></Field>
        </div>

        <div className="field-row">
          <Field label="Adress"><Input name="address" defaultValue={project?.address} required /></Field>
          <Field label="Ort"><Input name="city" defaultValue={project?.city} required /></Field>
        </div>

        <div className="field-row">
          <Field label="Kontaktperson"><Input name="contactPerson" defaultValue={project?.contactPerson || ""} /></Field>
          <Field label="Telefon"><Input name="phone" defaultValue={project?.phone || ""} /></Field>
        </div>

        <div className="field-row">
          <Field label="Startdatum"><Input name="startDate" type="date" defaultValue={dateValue(project?.startDate)} required /></Field>
          <Field label="Slutdatum"><Input name="endDate" type="date" defaultValue={dateValue(project?.endDate)} required /></Field>
        </div>

        <div className="field-row">
          <Field label="Starttid"><Input name="startTime" type="time" defaultValue={project?.startTime || ""} /></Field>
          <Field label="Sluttid"><Input name="endTime" type="time" defaultValue={project?.endTime || ""} /></Field>
        </div>

        <div className="field-row">
          <Field label="Status">
            <Select name="status" defaultValue={project?.status || "planerat"}>
              {Object.values(ProjectStatus).map((status) => <option key={status} value={status}>{status}</option>)}
            </Select>
          </Field>
          <Field label="Projektfärg"><Input name="color" type="color" defaultValue={project?.color || "#0f766e"} /></Field>
        </div>

        <div className="field-row">
          <Field label="Arbetslag">
            <Select name="teamId" defaultValue={project?.teamId || ""}>
              <option value="">Inget arbetslag</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </Select>
          </Field>
          <label className="flex items-center gap-3 rounded-[20px] border border-[rgba(27,43,49,0.12)] bg-[rgba(255,255,255,0.96)] px-4 py-3 text-sm font-bold text-[#1b2b31]">
            <input name="allDay" type="checkbox" defaultChecked={project?.allDay ?? true} />
            Heldagsprojekt
          </label>
        </div>

        <div className="directory-grid">
          <Field label="Anställda">
            <Select name="employeeIds" multiple defaultValue={[...selectedEmployees]} className="min-h-36">
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
            </Select>
          </Field>
          <Field label="Maskiner">
            <Select name="machineIds" multiple defaultValue={[...selectedMachines]} className="min-h-36">
              {machines.map((machine) => <option key={machine.id} value={machine.id}>{machine.name}</option>)}
            </Select>
          </Field>
        </div>

        <Field label="Fordon">
          <Select name="vehicleIds" multiple defaultValue={[...selectedVehicles]} className="min-h-36">
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}
          </Select>
        </Field>

        <Field label="Intern anteckning"><Textarea name="internalNote" defaultValue={project?.internalNote || ""} /></Field>
        <Field label="Extern beskrivning"><Textarea name="externalDescription" defaultValue={project?.externalDescription || ""} /></Field>

        <Field label="Notis vid sparning">
          <Select name="notificationTarget" defaultValue="none">
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
