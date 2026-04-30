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
    <Card>
      <CardTitle>{project ? "Redigera projekt" : "Skapa projekt"}</CardTitle>
      <form action={action} className="mt-5 grid gap-5">
        <input type="hidden" name="id" value={project?.id || ""} />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Projektnamn"><Input name="name" defaultValue={project?.name} required /></Field>
          <Field label="Projektnummer"><Input name="projectNumber" defaultValue={project?.projectNumber} required /></Field>
          <Field label="Kundnamn"><Input name="customerName" defaultValue={project?.customerName} required /></Field>
          <Field label="Adress"><Input name="address" defaultValue={project?.address} required /></Field>
          <Field label="Ort"><Input name="city" defaultValue={project?.city} required /></Field>
          <Field label="Kontaktperson"><Input name="contactPerson" defaultValue={project?.contactPerson || ""} /></Field>
          <Field label="Telefon"><Input name="phone" defaultValue={project?.phone || ""} /></Field>
          <Field label="Färgkod"><Input name="color" type="color" defaultValue={project?.color || "#00af41"} /></Field>
          <Field label="Startdatum"><Input name="startDate" type="date" defaultValue={dateValue(project?.startDate)} required /></Field>
          <Field label="Slutdatum"><Input name="endDate" type="date" defaultValue={dateValue(project?.endDate)} required /></Field>
          <Field label="Starttid"><Input name="startTime" type="time" defaultValue={project?.startTime || ""} /></Field>
          <Field label="Sluttid"><Input name="endTime" type="time" defaultValue={project?.endTime || ""} /></Field>
          <Field label="Status">
            <Select name="status" defaultValue={project?.status || "planerat"}>
              {Object.values(ProjectStatus).map((status) => <option key={status} value={status}>{status}</option>)}
            </Select>
          </Field>
          <Field label="Arbetslag">
            <Select name="teamId" defaultValue={project?.teamId || ""}>
              <option value="">Inget arbetslag</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </Select>
          </Field>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm font-bold">
          <input name="allDay" type="checkbox" defaultChecked={project?.allDay ?? true} />
          Heldagsprojekt
        </label>

        <div className="grid gap-4 md:grid-cols-3">
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
          <Field label="Fordon">
            <Select name="vehicleIds" multiple defaultValue={[...selectedVehicles]} className="min-h-36">
              {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Intern anteckning"><Textarea name="internalNote" defaultValue={project?.internalNote || ""} /></Field>
          <Field label="Extern beskrivning"><Textarea name="externalDescription" defaultValue={project?.externalDescription || ""} /></Field>
        </div>

        <Field label="Notis vid sparning">
          <Select name="notificationTarget" defaultValue="none">
            <option value="none">Inget utskick</option>
            <option value="assigned">Tilldelade användare</option>
            <option value="all">Alla användare</option>
          </Select>
        </Field>

        {state?.error && <p className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100">{state.error}</p>}
        <Button type="submit" disabled={pending}>{pending ? "Sparar..." : "Spara projekt"}</Button>
      </form>
    </Card>
  );
}
