import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib/cjs";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function formatDate(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export async function GET() {
  await requireAdmin();

  const employees = await db.employee.findMany({
    include: { team: true },
    orderBy: { name: "asc" },
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

  page.drawText("Granix - Anställdaregister", {
    x: 40,
    y,
    size: 20,
    font: boldFont,
    color: rgb(0.1, 0.17, 0.19),
  });
  y -= 22;
  drawLine(`Antal anställda: ${employees.length}`, 11, true, rgb(0.1, 0.17, 0.19));
  y -= 8;

  for (const employee of employees) {
    drawLine(employee.name, 13, true, rgb(0.07, 0.37, 0.35));
    drawLine(`Titel: ${employee.title}`, 10);
    if (employee.personalNumber) drawLine(`Personnummer: ${employee.personalNumber}`, 10);
    if (employee.address || employee.postalCode || employee.city) {
      drawLine(`Adress: ${[employee.address, employee.postalCode, employee.city].filter(Boolean).join(", ")}`.slice(0, 130), 10);
    }
    if (employee.phone) drawLine(`Telefon: ${employee.phone}`, 10);
    if (employee.email) drawLine(`E-post: ${employee.email}`, 10);
    drawLine(`Arbetslag: ${employee.team?.name || "Inget arbetslag"}`, 10);
    if (employee.apvDate) {
      drawLine(
        `APV: utbildningsdatum ${formatDate(employee.apvDate)}${employee.apvExpiryDate ? `, förfaller ${formatDate(employee.apvExpiryDate)}` : ""}`,
        10,
      );
    } else if (employee.skills.includes("APV")) {
      drawLine("APV", 10);
    }
    if (employee.id06Date) {
      drawLine(
        `ID06: ${employee.id06Number ? `nummer ${employee.id06Number}, ` : ""}giltig från ${formatDate(employee.id06Date)}${employee.id06ExpiryDate ? `, förfaller ${formatDate(employee.id06ExpiryDate)}` : ""}`,
        10,
      );
    } else if (employee.skills.includes("ID06")) {
      drawLine(employee.id06Number ? `ID06: nummer ${employee.id06Number}` : "ID06", 10);
    }
    if (employee.otherCompetence) {
      drawLine(`Övrigt: ${employee.otherCompetence}`.slice(0, 130), 10);
    }
    y -= 8;
  }

  const bytes = await pdf.save();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="anstallda.pdf"',
    },
  });
}
