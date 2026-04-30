"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventDropArg } from "@fullcalendar/core";
import { withBasePath } from "@/lib/base-path";

export type CalendarProject = {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  status: string;
  city: string;
};

export function ProjectCalendar({ projects, canEdit }: { projects: CalendarProject[]; canEdit: boolean }) {
  async function handleDrop(info: EventDropArg) {
    if (!canEdit) {
      info.revert();
      return;
    }

    const start = info.event.start;
    const end = info.event.end || info.event.start;
    if (!start || !end) {
      info.revert();
      return;
    }

    const response = await fetch(withBasePath(`/api/projects/${info.event.id}/move`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: start.toISOString(), endDate: end.toISOString() }),
    });

    if (!response.ok) {
      info.revert();
    }
  }

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      locale="sv"
      firstDay={1}
      weekNumbers
      editable={canEdit}
      eventDrop={handleDrop}
      height="auto"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
      }}
      buttonText={{ today: "Idag", month: "Månad", week: "Vecka", day: "Dag", list: "Lista" }}
      events={projects.map((project) => ({
        id: project.id,
        title: `${project.title} · ${project.city}`,
        start: project.start,
        end: project.end,
        backgroundColor: project.color,
        borderColor: project.color,
        textColor: "#001807",
        extendedProps: { status: project.status },
      }))}
    />
  );
}
