"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { employeeSchema, machineSchema, teamSchema, userSchema, userUpdateSchema, vehicleSchema } from "@/lib/validators";

function buildEmployeeName(firstName: string, lastName: string) {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

function employeeFormValues(formData: FormData) {
  return {
    id: String(formData.get("id") || ""),
    firstName: String(formData.get("firstName") || ""),
    lastName: String(formData.get("lastName") || ""),
    personalNumber: String(formData.get("personalNumber") || ""),
    address: String(formData.get("address") || ""),
    postalCode: String(formData.get("postalCode") || ""),
    city: String(formData.get("city") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    title: String(formData.get("title") || ""),
    teamId: String(formData.get("teamId") || ""),
    hasApv: formData.get("hasApv") === "on",
    apvDate: String(formData.get("apvDate") || ""),
    apvExpiryDate: String(formData.get("apvExpiryDate") || ""),
    hasId06: formData.get("hasId06") === "on",
    id06Date: String(formData.get("id06Date") || ""),
    id06Number: String(formData.get("id06Number") || ""),
    id06ExpiryDate: String(formData.get("id06ExpiryDate") || ""),
    otherCompetence: String(formData.get("otherCompetence") || ""),
  };
}

function userFormValues(formData: FormData) {
  return {
    id: String(formData.get("id") || ""),
    username: String(formData.get("username") || ""),
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    role: String(formData.get("role") || "user") as "admin" | "user",
    employeeId: String(formData.get("employeeId") || ""),
  };
}

export async function createUserAction(_: unknown, formData: FormData) {
  await requireAdmin();
  const submittedValues = userFormValues(formData);
  const parsed = userSchema.safeParse(submittedValues);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Användaren kunde inte sparas.", values: submittedValues };

  await db.user.create({
    data: {
      username: parsed.data.username.toLowerCase(),
      email: parsed.data.email || null,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      role: parsed.data.role,
      employeeId: parsed.data.employeeId || null,
    },
  });
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateUserAction(_: unknown, formData: FormData) {
  const currentUser = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Ingen användare angavs." };

  const submittedValues = userFormValues(formData);
  const parsed = userUpdateSchema.safeParse(submittedValues);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Användaren kunde inte uppdateras.", values: submittedValues };

  const existingUser = await db.user.findUnique({ where: { id } });
  if (!existingUser) return { error: "Användaren finns inte längre.", values: submittedValues };

  await db.user.update({
    where: { id },
    data: {
      username: parsed.data.username.toLowerCase(),
      email: parsed.data.email || null,
      role: parsed.data.role,
      employeeId: parsed.data.employeeId || null,
      ...(parsed.data.password ? { passwordHash: await bcrypt.hash(parsed.data.password, 12) } : {}),
    },
  });
  await db.auditLog.create({
    data: { userId: currentUser.id, entity: "User", entityId: id, action: "update" },
  });
  revalidatePath("/admin");
  return { ok: true };
}

export async function createEmployeeAction(_: unknown, formData: FormData) {
  await requireAdmin();
  const submittedValues = employeeFormValues(formData);
  const parsed = employeeSchema.safeParse(submittedValues);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Anställd kunde inte sparas.", values: submittedValues };

  await db.employee.create({
    data: {
      name: buildEmployeeName(parsed.data.firstName, parsed.data.lastName),
      personalNumber: parsed.data.personalNumber,
      address: parsed.data.address,
      postalCode: parsed.data.postalCode,
      city: parsed.data.city,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      title: parsed.data.title,
      teamId: parsed.data.teamId || null,
      apvDate: parsed.data.hasApv && parsed.data.apvDate ? new Date(`${parsed.data.apvDate}T00:00:00.000`) : null,
      apvExpiryDate: parsed.data.hasApv && parsed.data.apvExpiryDate ? new Date(`${parsed.data.apvExpiryDate}T00:00:00.000`) : null,
      id06Date: parsed.data.hasId06 && parsed.data.id06Date ? new Date(`${parsed.data.id06Date}T00:00:00.000`) : null,
      id06Number: parsed.data.hasId06 ? parsed.data.id06Number || null : null,
      id06ExpiryDate: parsed.data.hasId06 && parsed.data.id06ExpiryDate ? new Date(`${parsed.data.id06ExpiryDate}T00:00:00.000`) : null,
      otherCompetence: parsed.data.otherCompetence || null,
      otherCompetenceDate: null,
      otherCompetenceExpiryDate: null,
      skills: [
        ...(parsed.data.hasApv ? ["APV"] : []),
        ...(parsed.data.hasId06 ? ["ID06"] : []),
        ...(parsed.data.otherCompetence ? [parsed.data.otherCompetence] : []),
      ],
    },
  });
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateEmployeeAction(_: unknown, formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Ingen anställd angavs." };

  const submittedValues = employeeFormValues(formData);
  const parsed = employeeSchema.safeParse(submittedValues);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Anställd kunde inte uppdateras.", values: submittedValues };

  await db.employee.update({
    where: { id },
    data: {
      name: buildEmployeeName(parsed.data.firstName, parsed.data.lastName),
      personalNumber: parsed.data.personalNumber,
      address: parsed.data.address,
      postalCode: parsed.data.postalCode,
      city: parsed.data.city,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      title: parsed.data.title,
      teamId: parsed.data.teamId || null,
      apvDate: parsed.data.hasApv && parsed.data.apvDate ? new Date(`${parsed.data.apvDate}T00:00:00.000`) : null,
      apvExpiryDate: parsed.data.hasApv && parsed.data.apvExpiryDate ? new Date(`${parsed.data.apvExpiryDate}T00:00:00.000`) : null,
      id06Date: parsed.data.hasId06 && parsed.data.id06Date ? new Date(`${parsed.data.id06Date}T00:00:00.000`) : null,
      id06Number: parsed.data.hasId06 ? parsed.data.id06Number || null : null,
      id06ExpiryDate: parsed.data.hasId06 && parsed.data.id06ExpiryDate ? new Date(`${parsed.data.id06ExpiryDate}T00:00:00.000`) : null,
      otherCompetence: parsed.data.otherCompetence || null,
      otherCompetenceDate: null,
      otherCompetenceExpiryDate: null,
      skills: [
        ...(parsed.data.hasApv ? ["APV"] : []),
        ...(parsed.data.hasId06 ? ["ID06"] : []),
        ...(parsed.data.otherCompetence ? [parsed.data.otherCompetence] : []),
      ],
    },
  });
  revalidatePath("/admin");
  return { ok: true };
}

export async function createTeamAction(_: unknown, formData: FormData) {
  await requireAdmin();
  const parsed = teamSchema.safeParse({ name: formData.get("name"), description: formData.get("description") });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Team kunde inte sparas." };
  await db.team.create({ data: { name: parsed.data.name, description: parsed.data.description || null } });
  revalidatePath("/admin");
  return { ok: true };
}

export async function createMachineAction(_: unknown, formData: FormData) {
  await requireAdmin();
  const parsed = machineSchema.safeParse({ name: formData.get("name"), type: formData.get("type"), status: formData.get("status") });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Maskin kunde inte sparas." };
  await db.machine.create({ data: parsed.data });
  revalidatePath("/admin");
  return { ok: true };
}

export async function createVehicleAction(_: unknown, formData: FormData) {
  await requireAdmin();
  const parsed = vehicleSchema.safeParse({
    name: formData.get("name"),
    registrationNumber: formData.get("registrationNumber"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Fordon kunde inte sparas." };
  await db.vehicle.create({ data: parsed.data });
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteUserAction(_: { error?: string; ok?: boolean } | null, formData: FormData) {
  const currentUser = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Ingen användare angavs." };
  if (id === currentUser.id) return { error: "Du kan inte ta bort kontot du är inloggad med." };

  const user = await db.user.findUnique({ where: { id } });
  if (!user) return { error: "Användaren finns inte längre." };

  await db.user.delete({ where: { id } });
  await db.auditLog.create({
    data: { userId: currentUser.id, entity: "User", entityId: id, action: "delete" },
  });
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteEmployeeAction(_: { error?: string; ok?: boolean } | null, formData: FormData) {
  const currentUser = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Ingen anställd angavs." };
  if (currentUser.employeeId === id) return { error: "Du kan inte ta bort den anställd som är kopplad till ditt konto." };

  const employee = await db.employee.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          projects: true,
          timeReports: true,
          diaryEntries: true,
        },
      },
    },
  });

  if (!employee) return { error: "Den anställda finns inte längre." };
  if (employee._count.users > 0) return { error: "Den anställda är kopplad till ett eller flera användarkonton." };
  if (employee._count.projects > 0) return { error: "Den anställda är fortfarande kopplad till projekt." };
  if (employee._count.timeReports > 0) return { error: "Den anställda har tidrapporter och kan inte tas bort." };
  if (employee._count.diaryEntries > 0) return { error: "Den anställda har dagboksinlägg och kan inte tas bort." };

  await db.employee.delete({ where: { id } });
  await db.auditLog.create({
    data: { userId: currentUser.id, entity: "Employee", entityId: id, action: "delete" },
  });
  revalidatePath("/admin");
  return { ok: true };
}
