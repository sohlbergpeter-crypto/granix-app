import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib/cjs";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function formatDate(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function fileSafeName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function competenceRows(employee: {
  apvDate: Date | null;
  apvExpiryDate: Date | null;
  id06Date: Date | null;
  id06Number: string | null;
  id06ExpiryDate: Date | null;
  otherCompetence: string | null;
  skills: string[];
}) {
  const rows: string[] = [];

  if (employee.apvDate || employee.skills.includes("APV")) {
    rows.push(
      employee.apvDate
        ? `APV - utbildningsdatum ${formatDate(employee.apvDate)}${employee.apvExpiryDate ? `, förfaller ${formatDate(employee.apvExpiryDate)}` : ""}`
        : "APV",
    );
  }

  if (employee.id06Date || employee.id06Number || employee.skills.includes("ID06")) {
    const id06Bits = [
      employee.id06Number ? `nummer ${employee.id06Number}` : null,
      employee.id06Date ? `giltig från ${formatDate(employee.id06Date)}` : null,
      employee.id06ExpiryDate ? `förfaller ${formatDate(employee.id06ExpiryDate)}` : null,
    ].filter(Boolean);
    rows.push(id06Bits.length > 0 ? `ID06 - ${id06Bits.join(", ")}` : "ID06");
  }

  if (employee.otherCompetence) {
    rows.push(`Övrigt - ${employee.otherCompetence}`);
  }

  return rows;
}

export async function GET(request: NextRequest) {
  await requireAdmin();

  const employeeId = request.nextUrl.searchParams.get("employeeId");
  if (!employeeId) {
    return NextResponse.json({ error: "Ingen anställd angavs." }, { status: 400 });
  }

  const employee = await db.employee.findUnique({
    where: { id: employeeId },
    include: { team: true },
  });

  if (!employee) {
    return NextResponse.json({ error: "Den anställda finns inte." }, { status: 404 });
  }

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const page = pdf.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  page.drawRectangle({
    x: 36,
    y: 36,
    width: width - 72,
    height: height - 72,
    borderWidth: 2,
    borderColor: rgb(0.06, 0.2, 0.23),
    color: rgb(0.98, 0.99, 0.98),
  });

  page.drawText("Granix", {
    x: 56,
    y: 760,
    size: 20,
    font: bold,
    color: rgb(0.0, 0.69, 0.25),
  });

  page.drawText("Utbildningsbevis", {
    x: 56,
    y: 720,
    size: 24,
    font: bold,
    color: rgb(0.1, 0.17, 0.19),
  });

  page.drawText("Detta dokument visar registrerade utbildningar och behörigheter.", {
    x: 56,
    y: 692,
    size: 11,
    font: regular,
    color: rgb(0.35, 0.44, 0.48),
  });

  const infoLines = [
    `Namn: ${employee.name}`,
    `Personnummer: ${employee.personalNumber || "-"}`,
    `Titel: ${employee.title}`,
    `Arbetslag: ${employee.team?.name || "-"}`,
    `Telefon: ${employee.phone || "-"}`,
    `E-post: ${employee.email || "-"}`,
    `Adress: ${[employee.address, employee.postalCode, employee.city].filter(Boolean).join(", ") || "-"}`,
  ];

  let y = 640;
  for (const line of infoLines) {
    page.drawText(line, {
      x: 56,
      y,
      size: 11,
      font: regular,
      color: rgb(0.1, 0.17, 0.19),
    });
    y -= 20;
  }

  page.drawText("Registrerade utbildningar och behörigheter", {
    x: 56,
    y: y - 12,
    size: 14,
    font: bold,
    color: rgb(0.06, 0.2, 0.23),
  });

  y -= 42;
  const rows = competenceRows(employee);
  if (rows.length === 0) {
    page.drawText("Inga utbildningar eller behörigheter registrerade.", {
      x: 56,
      y,
      size: 11,
      font: regular,
      color: rgb(0.35, 0.44, 0.48),
    });
    y -= 24;
  } else {
    for (const row of rows) {
      page.drawCircle({
        x: 64,
        y: y + 4,
        size: 2.5,
        color: rgb(0.0, 0.69, 0.25),
      });
      page.drawText(row, {
        x: 76,
        y,
        size: 11,
        font: regular,
        color: rgb(0.1, 0.17, 0.19),
      });
      y -= 22;
    }
  }

  page.drawText(`Utskrivet: ${new Date().toISOString().slice(0, 10)}`, {
    x: 56,
    y: 100,
    size: 10,
    font: regular,
    color: rgb(0.35, 0.44, 0.48),
  });

  page.drawText("Granix intern dokumentation", {
    x: 56,
    y: 78,
    size: 10,
    font: regular,
    color: rgb(0.35, 0.44, 0.48),
  });

  const bytes = await pdf.save();
  const safeName = fileSafeName(employee.name) || "anstalld";

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="utbildningsbevis-${safeName}.pdf"`,
    },
  });
}
