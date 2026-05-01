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

  const reports = await db.timeReport.findMany({
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

  const grouped = reports.reduce<Record<string, typeof reports>>((accumulator, report) => {
    if (!accumulator[report.employee.name]) accumulator[report.employee.name] = [];
    accumulator[report.employee.name].push(report);
    return accumulator;
  }, {});

  const lines = [
    ["Anställd", "Datum", "Projekt", "Timmar", "Restid inom", "Restid utanför", "Traktamente", "Kommentar"].join(";"),
  ];

  Object.entries(grouped).forEach(([employeeName, employeeReports]) => {
    const totalHours = employeeReports.reduce((sum, report) => sum + report.hours, 0);
    const totalTravelWithin = employeeReports.reduce((sum, report) => sum + report.travelWithinHours, 0);
    const totalTravelOutside = employeeReports.reduce((sum, report) => sum + report.travelOutsideHours, 0);

    lines.push([employeeName, "", "SUMMA", String(totalHours), String(totalTravelWithin), String(totalTravelOutside), "", ""].join(";"));
    employeeReports.forEach((report) => {
      lines.push([
        employeeName,
        report.date.toISOString().slice(0, 10),
        report.project.name,
        String(report.hours),
        String(report.travelWithinHours),
        String(report.travelOutsideHours),
        report.allowance,
        `"${report.notes.replace(/"/g, '""')}"`,
      ].join(";"));
    });
    lines.push("");
  });

  return new NextResponse(`\uFEFF${lines.join("\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tidrapport-${request.nextUrl.searchParams.get("from") || "start"}-${request.nextUrl.searchParams.get("to") || "slut"}.csv"`,
    },
  });
}
