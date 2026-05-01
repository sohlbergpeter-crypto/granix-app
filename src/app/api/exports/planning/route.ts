import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib/cjs";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function parseDate(value: string | null, endOfDay = false) {
  if (!value) return null;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatPeriod(from: string | null, to: string | null) {
  if (from && to) return `${from} till ${to}`;
  if (from) return `från ${from}`;
  if (to) return `till ${to}`;
  return "alla datum";
}

function overlapWhere(from: Date | null, to: Date | null) {
  if (!from && !to) return {};
  if (from && to) {
    return {
      startDate: { lte: to },
      endDate: { gte: from },
    };
  }
  if (from) {
    return {
      endDate: { gte: from },
    };
  }
  return {
    startDate: { lte: to! },
  };
}

export async function GET(request: NextRequest) {
  await requireAdmin();

  const fromRaw = request.nextUrl.searchParams.get("from");
  const toRaw = request.nextUrl.searchParams.get("to");
  const from = parseDate(fromRaw);
  const to = parseDate(toRaw, true);

  const projects = await db.project.findMany({
    where: overlapWhere(from, to),
    include: {
      employees: { include: { employee: true } },
      machines: { include: { machine: true } },
      vehicles: { include: { vehicle: true } },
    },
    orderBy: [{ startDate: "asc" }, { name: "asc" }],
  });

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([595.28, 841.89]);
  let y = 800;

  const drawLine = (text: string, size = 10, bold = false, color = rgb(0.35, 0.44, 0.48)) => {
    if (y < 70) {
      page = pdf.addPage([595.28, 841.89]);
      y = 800;
    }
    page.drawText(text, {
      x: 40,
      y,
      size,
      font: bold ? boldFont : font,
      color,
    });
    y -= size + 6;
  };

  page.drawText("Granix - Planering", { x: 40, y, size: 20, font: boldFont, color: rgb(0.1, 0.17, 0.19) });
  y -= 22;
  drawLine(`Period: ${formatPeriod(fromRaw, toRaw)}`, 11, false);
  drawLine(`Antal projekt: ${projects.length}`, 11, true, rgb(0.1, 0.17, 0.19));
  y -= 8;

  for (const project of projects) {
    drawLine(`${project.projectNumber} ${project.name}`, 13, true, rgb(0.07, 0.37, 0.35));
    drawLine(`Kund: ${project.customerName} | Status: ${project.status} | Ort: ${project.city}`, 10);
    drawLine(`Period: ${project.startDate.toISOString().slice(0, 10)} till ${project.endDate.toISOString().slice(0, 10)}`, 10);

    const employees = project.employees.map((entry) => entry.employee.name).join(", ") || "Inga anställda kopplade";
    const machines = project.machines.map((entry) => entry.machine.name).join(", ") || "Inga maskiner kopplade";
    const vehicles = project.vehicles.map((entry) => entry.vehicle.name).join(", ") || "Inga fordon kopplade";

    drawLine(`Anställda: ${employees}`.slice(0, 130), 10);
    drawLine(`Maskiner: ${machines}`.slice(0, 130), 10);
    drawLine(`Fordon: ${vehicles}`.slice(0, 130), 10);

    if (project.internalNote) {
      drawLine(`Intern anteckning: ${project.internalNote}`.slice(0, 130), 10);
    }

    y -= 8;
  }

  const bytes = await pdf.save();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="planering-${fromRaw || "start"}-${toRaw || "slut"}.pdf"`,
    },
  });
}
