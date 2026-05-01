"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { diaryEntrySchema, timeReportSchema } from "@/lib/validators";

export async function saveTimeReportAction(_: unknown, formData: FormData) {
  const user = await requireUser();
  if (!user.employeeId) {
    return { error: "Ingen anställd är kopplad till kontot." };
  }

  const parsed = timeReportSchema.safeParse({
    id: formData.get("id") || undefined,
    date: formData.get("date"),
    projectId: formData.get("projectId"),
    hours: formData.get("hours"),
    travelWithinHours: formData.get("travelWithinHours"),
    travelOutsideHours: formData.get("travelOutsideHours"),
    allowance: formData.get("allowance"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Tidrapporten kunde inte sparas." };
  }

  const existing = parsed.data.id ? await db.timeReport.findUnique({ where: { id: parsed.data.id } }) : null;
  if (existing && user.role !== "admin" && existing.employeeId !== user.employeeId) {
    return { error: "Du kan bara redigera dina egna tidrapporter." };
  }

  await db.timeReport.upsert({
    where: { id: parsed.data.id || "__new__" },
    create: {
      date: parsed.data.date,
      projectId: parsed.data.projectId,
      hours: parsed.data.hours,
      travelWithinHours: parsed.data.travelWithinHours,
      travelOutsideHours: parsed.data.travelOutsideHours,
      allowance: parsed.data.allowance,
      notes: parsed.data.notes,
      employeeId: existing?.employeeId || user.employeeId,
      createdByUserId: existing?.createdByUserId || user.id,
    },
    update: {
      date: parsed.data.date,
      projectId: parsed.data.projectId,
      hours: parsed.data.hours,
      travelWithinHours: parsed.data.travelWithinHours,
      travelOutsideHours: parsed.data.travelOutsideHours,
      allowance: parsed.data.allowance,
      notes: parsed.data.notes,
    },
  });

  revalidatePath("/time-reports");
  return { ok: true };
}

export async function saveDiaryEntryAction(_: unknown, formData: FormData) {
  const user = await requireUser();
  if (!user.employeeId) {
    return { error: "Ingen anställd är kopplad till kontot." };
  }

  const parsed = diaryEntrySchema.safeParse({
    id: formData.get("id") || undefined,
    date: formData.get("date"),
    projectId: formData.get("projectId"),
    happenedToday: formData.get("happenedToday"),
    completedToday: formData.get("completedToday"),
    extraWork: formData.get("extraWork"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dagboksinlägget kunde inte sparas." };
  }

  const existing = parsed.data.id ? await db.diaryEntry.findUnique({ where: { id: parsed.data.id } }) : null;
  if (existing && user.role !== "admin" && existing.employeeId !== user.employeeId) {
    return { error: "Du kan bara redigera dina egna dagboksinlägg." };
  }

  await db.diaryEntry.upsert({
    where: { id: parsed.data.id || "__new__" },
    create: {
      date: parsed.data.date,
      projectId: parsed.data.projectId,
      happenedToday: parsed.data.happenedToday,
      completedToday: parsed.data.completedToday,
      extraWork: parsed.data.extraWork || null,
      employeeId: existing?.employeeId || user.employeeId,
      createdByUserId: existing?.createdByUserId || user.id,
    },
    update: {
      date: parsed.data.date,
      projectId: parsed.data.projectId,
      happenedToday: parsed.data.happenedToday,
      completedToday: parsed.data.completedToday,
      extraWork: parsed.data.extraWork || null,
    },
  });

  revalidatePath("/diary");
  return { ok: true };
}
