import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function parseDate(value: string | null, endOfDay = false) {
  if (!value) return null;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(request: NextRequest) {
  await requireAdmin();

  const from = parseDate(request.nextUrl.searchParams.get("from"));
  const to = parseDate(request.nextUrl.searchParams.get("to"), true);

  const entries = await db.diaryEntry.findMany({
    where: {
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

  const grouped = entries.reduce<Record<string, typeof entries>>((accumulator, entry) => {
    if (!accumulator[entry.employee.name]) accumulator[entry.employee.name] = [];
    accumulator[entry.employee.name].push(entry);
    return accumulator;
  }, {});

  const lines = [
    ["Anställd", "Datum", "Projekt", "Vad händer idag", "Vad är utfört", "Extra arbete"].join(";"),
  ];

  Object.entries(grouped).forEach(([employeeName, employeeEntries]) => {
    lines.push([employeeName, "", "SUMMA", `${employeeEntries.length} inlägg`, "", ""].join(";"));
    employeeEntries.forEach((entry) => {
      lines.push([
        employeeName,
        entry.date.toISOString().slice(0, 10),
        entry.project.name,
        `"${entry.happenedToday.replace(/"/g, '""')}"`,
        `"${entry.completedToday.replace(/"/g, '""')}"`,
        `"${(entry.extraWork || "").replace(/"/g, '""')}"`,
      ].join(";"));
    });
    lines.push("");
  });

  return new NextResponse(`\uFEFF${lines.join("\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="dagbok-${request.nextUrl.searchParams.get("from") || "start"}-${request.nextUrl.searchParams.get("to") || "slut"}.csv"`,
    },
  });
}
