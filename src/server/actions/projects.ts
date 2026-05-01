"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/auth";
import { projectSchema } from "@/lib/validators";

function values(formData: FormData, key: string) {
  return formData.getAll(key).map(String).filter(Boolean);
}

function projectFormValues(formData: FormData) {
  return {
    id: String(formData.get("id") || ""),
    name: String(formData.get("name") || ""),
    projectNumber: String(formData.get("projectNumber") || ""),
    customerName: String(formData.get("customerName") || ""),
    address: String(formData.get("address") || ""),
    city: String(formData.get("city") || ""),
    contactPerson: String(formData.get("contactPerson") || ""),
    phone: String(formData.get("phone") || ""),
    startDate: String(formData.get("startDate") || ""),
    endDate: String(formData.get("endDate") || ""),
    startTime: String(formData.get("startTime") || ""),
    endTime: String(formData.get("endTime") || ""),
    allDay: formData.get("allDay") === "on",
    status: String(formData.get("status") || "planerat"),
    color: String(formData.get("color") || "#0f766e"),
    internalNote: String(formData.get("internalNote") || ""),
    externalDescription: String(formData.get("externalDescription") || ""),
    teamId: String(formData.get("teamId") || ""),
    employeeIds: values(formData, "employeeIds"),
    machineIds: values(formData, "machineIds"),
    vehicleIds: values(formData, "vehicleIds"),
    notificationTarget: String(formData.get("notificationTarget") || "none"),
  };
}

export async function saveProjectAction(_: unknown, formData: FormData) {
  const user = await requireAdmin();
  const submittedValues = projectFormValues(formData);

  const parsed = projectSchema.safeParse({
    ...submittedValues,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || "Projektet kunde inte sparas.",
      values: submittedValues,
    };
  }

  const { employeeIds, machineIds, vehicleIds, notificationTarget, id, ...data } = parsed.data;

  const saved = await db.project.upsert({
    where: { id: id || "__new__" },
    create: {
      ...data,
      teamId: data.teamId || null,
      contactPerson: data.contactPerson || null,
      phone: data.phone || null,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      internalNote: data.internalNote || null,
      externalDescription: data.externalDescription || null,
      employees: { create: employeeIds.map((employeeId) => ({ employeeId })) },
      machines: { create: machineIds.map((machineId) => ({ machineId })) },
      vehicles: { create: vehicleIds.map((vehicleId) => ({ vehicleId })) },
    },
    update: {
      ...data,
      teamId: data.teamId || null,
      contactPerson: data.contactPerson || null,
      phone: data.phone || null,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      internalNote: data.internalNote || null,
      externalDescription: data.externalDescription || null,
      employees: { deleteMany: {}, create: employeeIds.map((employeeId) => ({ employeeId })) },
      machines: { deleteMany: {}, create: machineIds.map((machineId) => ({ machineId })) },
      vehicles: { deleteMany: {}, create: vehicleIds.map((vehicleId) => ({ vehicleId })) },
    },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      entity: "Project",
      entityId: saved.id,
      action: id ? "update" : "create",
      metadata: { notificationTarget },
    },
  });

  if (notificationTarget !== "none") {
    const recipients =
      notificationTarget === "all"
        ? await db.user.findMany({ where: { active: true }, select: { id: true } })
        : await db.user.findMany({
            where: { active: true, employeeId: { in: employeeIds } },
            select: { id: true },
          });

    await db.notification.createMany({
      data: recipients.map((recipient) => ({
        userId: recipient.id,
        projectId: saved.id,
        title: id ? "Projekt uppdaterat" : "Nytt projekt",
        body: `${saved.projectNumber} - ${saved.name}`,
      })),
    });
  }

  revalidatePath("/dashboard");
  redirect(`/projects/${saved.id}`);
}

export async function deleteProjectAction(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;

  await db.project.delete({ where: { id } });
  await db.auditLog.create({
    data: { userId: user.id, entity: "Project", entityId: id, action: "delete" },
  });

  revalidatePath("/dashboard");
  redirect("/projects");
}

export async function moveProjectAction(projectId: string, startDate: string, endDate: string) {
  const user = await requireAdmin();
  const project = await db.project.update({
    where: { id: projectId },
    data: { startDate: new Date(startDate), endDate: new Date(endDate) },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      entity: "Project",
      entityId: project.id,
      action: "calendar:move",
      metadata: { startDate, endDate },
    },
  });
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function markNotificationReadAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await db.notification.updateMany({ where: { id, userId: user.id }, data: { read: true } });
  revalidatePath("/dashboard");
}
