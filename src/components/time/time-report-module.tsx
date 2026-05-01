"use client";

import { AllowanceType } from "@prisma/client";
import { useActionState, useEffect, useMemo, useState } from "react";
import { saveTimeReportAction } from "@/server/actions/worklogs";

type Option = { id: string; name: string };
type TimeReportItem = {
  id: string;
  date: string;
  hours: number;
  travelWithinHours: number;
  travelOutsideHours: number;
  allowance: AllowanceType;
  notes: string;
  projectName: string;
  employeeName: string;
  projectId: string;
};

type EditableReport = {
  id: string;
  date: string;
  projectId: string;
  hours: string;
  travelWithinHours: string;
  travelOutsideHours: string;
  allowance: AllowanceType;
  notes: string;
};

const emptyForm: EditableReport = {
  id: "",
  date: "",
  projectId: "",
  hours: "8",
  travelWithinHours: "0",
  travelOutsideHours: "0",
  allowance: "nej",
  notes: "",
};

function allowanceLabel(value: AllowanceType) {
  if (value === "halv") return "Halvt traktamente";
  if (value === "hel") return "Helt traktamente";
  return "Inget traktamente";
}

function mapReportToForm(report: TimeReportItem): EditableReport {
  return {
    id: report.id,
    date: report.date,
    projectId: report.projectId,
    hours: String(report.hours),
    travelWithinHours: String(report.travelWithinHours),
    travelOutsideHours: String(report.travelOutsideHours),
    allowance: report.allowance,
    notes: report.notes,
  };
}

function ReportCard({
  report,
  showEmployee,
  onEdit,
}: {
  report: TimeReportItem;
  showEmployee?: boolean;
  onEdit: (report: TimeReportItem) => void;
}) {
  return (
    <div className="detail-item">
      <div className="detail-top">
        <div>
          <h3 className="item-title">{showEmployee ? report.employeeName : report.projectName}</h3>
          <div className="item-meta">
            {report.date}<br />
            {showEmployee ? report.projectName : report.employeeName}<br />
            Arbetstid: {report.hours} h<br />
            Restid inom arbetstid: {report.travelWithinHours} h<br />
            Restid utanför arbetstid: {report.travelOutsideHours} h<br />
            {allowanceLabel(report.allowance)}
          </div>
        </div>
        <span className="status-badge status-planerad">{report.hours} h</span>
      </div>
      <div className="item-meta">{report.notes}</div>
      <div className="mt-3">
        <button className="ghost-button" type="button" onClick={() => onEdit(report)}>Redigera tidrapport</button>
      </div>
    </div>
  );
}

export function TimeReportModule({
  projects,
  myReports,
  allReports,
  isAdmin,
}: {
  projects: Option[];
  myReports: TimeReportItem[];
  allReports: TimeReportItem[];
  isAdmin: boolean;
}) {
  const [state, action, pending] = useActionState(saveTimeReportAction, null);
  const [form, setForm] = useState<EditableReport>(emptyForm);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      setForm(emptyForm);
    }
  }, [state]);

  const totalHours = useMemo(
    () =>
      allReports.reduce<Record<string, number>>((accumulator, report) => {
        accumulator[report.employeeName] = (accumulator[report.employeeName] || 0) + report.hours;
        return accumulator;
      }, {}),
    [allReports]
  );

  return (
    <div className="grid gap-4">
      <section className="dashboard-grid">
        <article className="glass-card metrics-card">
          <div className="card-header">
            <div>
              <p className="section-label">Tidrapportering</p>
              <h2 className="text-[1.35rem] font-black text-[#1b2b31]">Översikt</h2>
            </div>
          </div>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Mina rapporter</span>
              <span className="metric-value text-[#1b2b31]">{myReports.length}</span>
              <span className="metric-subtext">Rapporterade dagar</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Mina timmar</span>
              <span className="metric-value text-[#0f766e]">{myReports.reduce((sum, report) => sum + report.hours, 0)}</span>
              <span className="metric-subtext">Summerad arbetstid</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Projekt att välja</span>
              <span className="metric-value text-[#1b2b31]">{projects.length}</span>
              <span className="metric-subtext">Aktiva projekt</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Adminunderlag</span>
              <span className="metric-value text-[#1b2b31]">{isAdmin ? allReports.length : myReports.length}</span>
              <span className="metric-subtext">{isAdmin ? "Alla tidrader" : "Mina tidrader"}</span>
            </div>
          </div>
        </article>

        <article className="glass-card filters-card">
          <div className="card-header">
            <div>
              <p className="section-label">Flöde</p>
              <h2 className="text-[1.35rem] font-black text-[#1b2b31]">Så används modulen</h2>
            </div>
          </div>
          <div className="stack-block">
            <p className="dashboard-note">
              Välj projekt, ange arbetstid, restid och skriv vad som utförts. Om du behöver rätta något kan du öppna en tidigare rad och spara om den.
            </p>
            <div className="summary-grid">
              <div className="summary-chip">
                <strong>{myReports.filter((report) => report.allowance !== "nej").length}</strong>
                <span>Rader med traktamente</span>
              </div>
              <div className="summary-chip">
                <strong>{myReports.reduce((sum, report) => sum + report.travelWithinHours + report.travelOutsideHours, 0)}</strong>
                <span>Rapporterad restid</span>
              </div>
              <div className="summary-chip">
                <strong>{form.id ? "Pågår" : "Redo"}</strong>
                <span>{form.id ? "Redigering av vald rad" : "Ny tidrapport"}</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="workspace-grid">
        <article className="glass-card form-card">
          <div className="card-header">
            <div>
              <p className="section-label">Tidrapportering</p>
              <h2 className="text-[1.35rem] font-black text-[#1b2b31]">{form.id ? "Redigera tidrapport" : "Ny tidrapport"}</h2>
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

            <div className="field-row">
              <label className="field">
                <span>Timmar</span>
                <input name="hours" type="number" min="0.5" step="0.5" value={form.hours} onChange={(event) => setForm((current) => ({ ...current, hours: event.target.value }))} required />
              </label>
              <label className="field">
                <span>Traktamente</span>
                <select name="allowance" value={form.allowance} onChange={(event) => setForm((current) => ({ ...current, allowance: event.target.value as AllowanceType }))}>
                  <option value="nej">Nej</option>
                  <option value="halv">Halvt</option>
                  <option value="hel">Helt</option>
                </select>
              </label>
            </div>

            <div className="field-row">
              <label className="field">
                <span>Restid inom arbetstid</span>
                <input name="travelWithinHours" type="number" min="0" step="0.5" value={form.travelWithinHours} onChange={(event) => setForm((current) => ({ ...current, travelWithinHours: event.target.value }))} />
              </label>
              <label className="field">
                <span>Restid utanför arbetstid</span>
                <input name="travelOutsideHours" type="number" min="0" step="0.5" value={form.travelOutsideHours} onChange={(event) => setForm((current) => ({ ...current, travelOutsideHours: event.target.value }))} />
              </label>
            </div>

            <label className="field">
              <span>Kommentar</span>
              <textarea name="notes" rows={4} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} required placeholder="Beskriv vilket jobb som utförts under dagen" />
            </label>

            {state?.error ? <p className="text-sm text-[#b91c1c]">{state.error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <button className="primary-button" type="submit" disabled={pending}>{pending ? "Sparar..." : form.id ? "Spara ändringar" : "Spara tidrapport"}</button>
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
                <p className="section-label">Mina timmar</p>
                <h2 className="text-[1.35rem] font-black text-[#1b2b31]">Rapporterad tid</h2>
              </div>
            </div>
            <div className="selected-day-list">
              {myReports.length ? myReports.map((report) => (
                <ReportCard key={report.id} report={report} onEdit={(entry) => setForm(mapReportToForm(entry))} />
              )) : <div className="empty-state">Ingen tid rapporterad än.</div>}
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
                <h2 className="text-[1.35rem] font-black text-[#1b2b31]">Alla tidrapporter</h2>
              </div>
            </div>
            <div className="selected-day-list">
              {allReports.length ? allReports.map((report) => (
                <ReportCard key={report.id} report={report} showEmployee onEdit={(entry) => setForm(mapReportToForm(entry))} />
              )) : <div className="empty-state">Inga tidrapporter att visa.</div>}
            </div>
          </article>
          <article className="glass-card agenda-card">
            <div className="card-header">
              <div>
                <p className="section-label">Summering</p>
                <h2 className="text-[1.35rem] font-black text-[#1b2b31]">Rapporterade timmar</h2>
              </div>
            </div>
            <div className="team-summary">
              {Object.entries(totalHours).map(([employeeName, total]) => (
                <div key={employeeName} className="team-item">
                  <div className="team-top">
                    <div>
                      <h3 className="item-title">{employeeName}</h3>
                      <div className="team-meta">{total} rapporterade timmar</div>
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
