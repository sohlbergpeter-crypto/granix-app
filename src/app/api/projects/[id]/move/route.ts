import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const { id } = await params;
  const body = await request.json();
  const startDate = new Date(body.startDate);
  const endDate = new Date(body.endDate);

  if (!id || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return NextResponse.json({ error: "Ogiltigt datum." }, { status: 400 });
  }

  const project = await db.project.update({
    where: { id },
    data: { startDate, endDate },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      entity: "Project",
      entityId: id,
      action: "calendar:move",
      metadata: { startDate, endDate },
    },
  });

  return NextResponse.json({ id: project.id });
}
