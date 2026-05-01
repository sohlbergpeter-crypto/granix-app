"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { saveDiaryEntryAction } from "@/server/actions/worklogs";
import { withBasePath } from "@/lib/base-path";

type Option = { id: string; name: string };
type DiaryItem = {
  id: string;
  date: string;
  happenedToday: string;
  completedToday: string;
  extraWork: string | null;
  projectName: string;
  employeeName: string;
  projectId: string;
};

type EditableDiary = {
  id: string;
  date: string;
  projectId: string;
  happenedToday: string;
  completedToday: string;
  extraWork: string;
};

const emptyForm: EditableDiary = {
  id: "",
  date: "",
  projectId: "",
  happenedToday: "",
  completedToday: "",
  extraWork: "",
};

function mapEntryToForm(entry: DiaryItem): EditableDiary {
  return {
    id: entry.id,
    date: entry.date,
    projectId: entry.projectId,
    happenedToday: entry.happenedToday,
    completedToday: entry.completedToday,
    extraWork: entry.extraWork || "",
  };
}

function DiaryCard({
  entry,
  showEmployee,
  onEdit,
}: {
  entry: DiaryItem;
  showEmployee?: boolean;
  onEdit: (entry: DiaryItem) => void;
}) {
  return (
    <div className="detail-item">
      <div className="detail-top">
        <div>
          <h3 className="item-title">{showEmployee ? entry.employeeName : entry.projectName}</h3>
          <div className="item-meta">
            {entry.date}<br />
            {showEmployee ? entry.projectName : entry.employeeName}
          </div>
        </div>
        <span className="type-badge">Dagbok</span>
      </div>
      <div className="item-meta">
        <strong>Vad händer idag:</strong> {entry.happenedToday}<br />
        <strong>Vad är utfört:</strong> {entry.completedToday}<br />
        {entry.extraWork ? <><strong>Extra arbete:</strong> {entry.extraWork}</> : null}
      </div>
      <div className="mt-3">
        <button className="ghost-button" type="button" onClick={() => onEdit(entry)}>Redigera inlägg</button>
      </div>
    </div>
  );
}

export function DiaryModule({
  projects,
  employees,
  myEntries,
  allEntries,
  isAdmin,
  filterFrom,
  filterTo,
  filterEmployeeId,
  filterProjectId,
}: {
  projects: Option[];
  employees: Option[];
  myEntries: DiaryItem[];
  allEntries: DiaryItem[];
  isAdmin: boolean;
  filterFrom: string;
  filterTo: string;
  filterEmployeeId: string;
  filterProjectId: string;
}) {
  const [state, action, pending] = useActionState(saveDiaryEntryAction, null);
  const [form, setForm] = useState<EditableDiary>(emptyForm);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      setForm(emptyForm);
    }
  }, [state]);

  const projectCounts = useMemo(
    () =>
      allEntries.reduce<Record<string, number>>((accumulator, entry) => {
        accumulator[entry.projectName] = (accumulator[entry.projectName] || 0) + 1;
        return accumulator;
      }, {}),
    [allEntries]
  );

  return (
    <div className="grid gap-4">
      <section className="dashboard-grid">
        <article className="glass-card metrics-card">
          <div className="card-header">
            <div>
              <p className="section-label">Dagbok</p>
              <h2 className="text-[1.35rem] font-black text-[#1b2b31]">Översikt</h2>
            </div>
          </div>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Mina inlägg</span>
              <span className="metric-value text-[#1b2b31]">{myEntries.length}</span>
              <span className="metric-subtext">Rapporterade dagar</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Projekt i bruk</span>
              <span className="metric-value text-[#0f766e]">{new Set(myEntries.map((entry) => entry.projectName)).size}</span>
              <span className="metric-subtext">Unika projekt i dagboken</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Extra arbeten</span>
              <span className="metric-value text-[#1b2b31]">{myEntries.filter((entry) => entry.extraWork).length}</span>
              <span className="metric-subtext">Rader med avvikelse eller extra jobb</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Adminunderlag</span>
              <span className="metric-value text-[#1b2b31]">{isAdmin ? allEntries.length : myEntries.length}</span>
              <span className="metric-subtext">{isAdmin ? "Alla inlägg" : "Mina inlägg"}</span>
            </div>
          </div>
        </article>

        <article className="glass-card filters-card">
          <div className="card-header">
            <div>
              <p className="section-label">Flöde</p>
              <h2 className="text-[1.35rem] font-black text-[#1b2b31]">Daglig uppföljning</h2>
            </div>
          </div>
          <div className="stack-block">
            <p className="dashboard-note">
              Välj projekt och dokumentera vad som hände, vad som blev klart och om något extra utfördes. Tidigare inlägg går att öppna för rättning.
            </p>
            <div className="summary-grid">
              <div className="summary-chip">
                <strong>{projects.length}</strong>
                <span>Valbara projekt</span>
              </div>
              <div className="summary-chip">
                <strong>{myEntries.filter((entry) => entry.extraWork).length}</strong>
                <span>Inlägg med extra arbete</span>
              </div>
              <div className="summary-chip">
                <strong>{form.id ? "Pågår" : "Redo"}</strong>
                <span>{form.id ? "Redigering av valt inlägg" : "Nytt dagboksinlägg"}</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="workspace-grid">
        <article className="glass-card form-card">
          <div className="card-header">
            <div>
              <p className="section-label">Dagbok</p>
              <h2 className="text-[1.35rem] font-black text-[#1b2b31]">{form.id ? "Redigera dagboksinlägg" : "Nytt dagboksinlägg"}</h2>
            </div>
          </div>

          <form action={action} className="planning-form">
            <input type="hidden" name="id" value={form.id} />
            <div className="field-row">
              <label className="field">
                <span>Datum</span>
                <input name="date" type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} required />
              </label>
              <label className="field">
                <span>Projekt</span>
                <select name="projectId" value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))} required>
                  <option value="">Välj projekt</option>
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
              </label>
            </div>

            <label className="field">
              <span>Vad händer idag</span>
              <textarea name="happenedToday" rows={3} value={form.happenedToday} onChange={(event) => setForm((current) => ({ ...current, happenedToday: event.target.value }))} required placeholder="Beskriv vad som händer under dagen" />
            </label>

            <label className="field">
              <span>Vad är utfört</span>
              <textarea name="completedToday" rows={3} value={form.completedToday} onChange={(event) => setForm((current) => ({ ...current, completedToday: event.target.value }))} required placeholder="Beskriv vad som blivit klart" />
            </label>

            <label className="field">
              <span>Extra arbete eller avvikelser</span>
              <textarea name="extraWork" rows={3} value={form.extraWork} onChange={(event) => setForm((current) => ({ ...current, extraWork: event.target.value }))} placeholder="Skriv om något extra utförts eller om något avvikit" />
            </label>

            {state?.error ? <p className="text-sm text-[#b91c1c]">{state.error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <button className="primary-button" type="submit" disabled={pending}>{pending ? "Sparar..." : form.id ? "Spara ändringar" : "Spara dagbok"}</button>
              {form.id ? (
                <button className="ghost-button" type="button" onClick={() => setForm(emptyForm)}>Avbryt redigering</button>
              ) : null}
            </div>
          </form>
        </article>

        <aside className="sidebar-stack">
          <article className="glass-card detail-card">
            <div className="card-header">
              <div>
                <p className="section-label">Mina inlägg</p>
                <h2 className="text-[1.35rem] font-black text-[#1b2b31]">Dagliga rapporter</h2>
              </div>
            </div>
            <div className="selected-day-list">
              {myEntries.length ? myEntries.map((entry) => (
                <DiaryCard key={entry.id} entry={entry} onEdit={(selected) => setForm(mapEntryToForm(selected))} />
              )) : <div className="empty-state">Inga dagboksinlägg än.</div>}
            </div>
          </article>
        </aside>
      </section>

      {isAdmin ? (
        <section className="bottom-grid">
          <article className="glass-card team-card">
            <div className="card-header">
              <div>
                <p className="section-label">Adminvy</p>
                <h2 className="text-[1.35rem] font-black text-[#1b2b31]">Alla dagboksinlägg</h2>
              </div>
            </div>
            <form className="planning-form mb-4">
              <div className="directory-grid">
                <label className="field">
                  <span>Från datum</span>
                  <input name="from" type="date" defaultValue={filterFrom} />
                </label>
                <label className="field">
                  <span>Till datum</span>
                  <input name="to" type="date" defaultValue={filterTo} />
                </label>
                <label className="field">
                  <span>Anställd</span>
                  <select name="employeeId" defaultValue={filterEmployeeId}>
                    <option value="">Alla anställda</option>
                    {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Projekt</span>
                  <select name="projectId" defaultValue={filterProjectId}>
                    <option value="">Alla projekt</option>
                    {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="secondary-button" type="submit">Visa period</button>
                <Link
                  className="ghost-button"
                  href={withBasePath(`/api/exports/diary?from=${encodeURIComponent(filterFrom)}&to=${encodeURIComponent(filterTo)}&employeeId=${encodeURIComponent(filterEmployeeId)}&projectId=${encodeURIComponent(filterProjectId)}`)}
                >
                  Ladda ned sammanställning
                </Link>
              </div>
            </form>
            <div className="selected-day-list">
              {allEntries.length ? allEntries.map((entry) => (
                <DiaryCard key={entry.id} entry={entry} showEmployee onEdit={(selected) => setForm(mapEntryToForm(selected))} />
              )) : <div className="empty-state">Inga dagboksinlägg att visa.</div>}
            </div>
          </article>
          <article className="glass-card agenda-card">
            <div className="card-header">
              <div>
                <p className="section-label">Summering</p>
                <h2 className="text-[1.35rem] font-black text-[#1b2b31]">Projektaktivitet i vald period</h2>
              </div>
            </div>
            <div className="team-summary">
              {Object.entries(projectCounts).map(([projectName, total]) => (
                <div key={projectName} className="team-item">
                  <div className="team-top">
                    <div>
                      <h3 className="item-title">{projectName}</h3>
                      <div className="team-meta">{total} dagboksinlägg</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}
    </div>
  );
}
