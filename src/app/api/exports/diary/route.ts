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

export async function GET(request: NextRequest) {
  await requireAdmin();

  const fromRaw = request.nextUrl.searchParams.get("from");
  const toRaw = request.nextUrl.searchParams.get("to");
  const employeeId = request.nextUrl.searchParams.get("employeeId");
  const projectId = request.nextUrl.searchParams.get("projectId");
  const from = parseDate(fromRaw);
  const to = parseDate(toRaw, true);

  const entries = await db.diaryEntry.findMany({
    where: {
      ...(employeeId ? { employeeId } : {}),
      ...(projectId ? { projectId } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    include: { employee: true, project: true },
    orderBy: [{ employee: { name: "asc" } }, { date: "asc" }],
  });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  page.drawText("Granix - Dagbok", { x: 40, y, size: 20, font: boldFont, color: rgb(0.1, 0.17, 0.19) });
  y -= 22;
  page.drawText(`Period: ${formatPeriod(fromRaw, toRaw)}`, { x: 40, y, size: 11, font, color: rgb(0.35, 0.44, 0.48) });
  y -= 16;
  page.drawText(`Vald person: ${entries[0]?.employee.name && employeeId ? entries[0].employee.name : employeeId ? "Ingen träff" : "Alla anställda"}`, {
    x: 40,
    y,
    size: 11,
    font,
    color: rgb(0.35, 0.44, 0.48),
  });
  y -= 16;
  page.drawText(`Valt projekt: ${entries[0]?.project.name && projectId ? entries[0].project.name : projectId ? "Ingen träff" : "Alla projekt"}`, {
    x: 40,
    y,
    size: 11,
    font,
    color: rgb(0.35, 0.44, 0.48),
  });
  y -= 28;

  const grouped = entries.reduce<Record<string, typeof entries>>((accumulator, entry) => {
    if (!accumulator[entry.employee.name]) accumulator[entry.employee.name] = [];
    accumulator[entry.employee.name].push(entry);
    return accumulator;
  }, {});

  let currentPage = page;
  for (const [employeeName, employeeEntries] of Object.entries(grouped)) {
    if (y < 160) {
      currentPage = pdf.addPage([595.28, 841.89]);
      y = 800;
    }

    currentPage.drawText(employeeName, { x: 40, y, size: 14, font: boldFont, color: rgb(0.07, 0.37, 0.35) });
    y -= 16;
    currentPage.drawText(`Totalt antal inlägg: ${employeeEntries.length}`, { x: 40, y, size: 11, font: boldFont, color: rgb(0.1, 0.17, 0.19) });
    y -= 18;

    for (const entry of employeeEntries) {
      if (y < 110) {
        currentPage = pdf.addPage([595.28, 841.89]);
        y = 800;
      }

      currentPage.drawText(`${entry.date.toISOString().slice(0, 10)}  ${entry.project.name}`, {
        x: 40,
        y,
        size: 11,
        font: boldFont,
        color: rgb(0.1, 0.17, 0.19),
      });
      y -= 14;
      currentPage.drawText(`Vad händer idag: ${entry.happenedToday}`.slice(0, 130), { x: 40, y, size: 10, font, color: rgb(0.35, 0.44, 0.48) });
      y -= 14;
      currentPage.drawText(`Vad är utfört: ${entry.completedToday}`.slice(0, 130), { x: 40, y, size: 10, font, color: rgb(0.35, 0.44, 0.48) });
      y -= 14;
      if (entry.extraWork) {
        currentPage.drawText(`Extra arbete: ${entry.extraWork}`.slice(0, 130), { x: 40, y, size: 10, font, color: rgb(0.35, 0.44, 0.48) });
        y -= 14;
      }
      y -= 6;
    }

    y -= 8;
  }

  const bytes = await pdf.save();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="dagbok-${fromRaw || "start"}-${toRaw || "slut"}.pdf"`,
    },
  });
}
