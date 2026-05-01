"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { employeeSchema, machineSchema, teamSchema, userSchema, vehicleSchema } from "@/lib/validators";

export async function createUserAction(_: unknown, formData: FormData) {
  await requireAdmin();
  const parsed = userSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    employeeId: formData.get("employeeId"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Användaren kunde inte sparas." };

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

export async function createEmployeeAction(_: unknown, formData: FormData) {
  await requireAdmin();
  const parsed = employeeSchema.safeParse({
    name: formData.get("name"),
    personalNumber: formData.get("personalNumber"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    title: formData.get("title"),
    teamId: formData.get("teamId"),
    hasApv: formData.get("hasApv") === "on",
    apvDate: formData.get("apvDate"),
    hasId06: formData.get("hasId06") === "on",
    id06Date: formData.get("id06Date"),
    otherCompetence: formData.get("otherCompetence"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Anställd kunde inte sparas." };

  await db.employee.create({
    data: {
      ...parsed.data,
      personalNumber: parsed.data.personalNumber,
      address: parsed.data.address,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      teamId: parsed.data.teamId || null,
      apvDate: parsed.data.hasApv && parsed.data.apvDate ? new Date(`${parsed.data.apvDate}T00:00:00.000`) : null,
      id06Date: parsed.data.hasId06 && parsed.data.id06Date ? new Date(`${parsed.data.id06Date}T00:00:00.000`) : null,
      otherCompetence: parsed.data.otherCompetence || null,
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

  const parsed = employeeSchema.safeParse({
    name: formData.get("name"),
    personalNumber: formData.get("personalNumber"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    title: formData.get("title"),
    teamId: formData.get("teamId"),
    hasApv: formData.get("hasApv") === "on",
    apvDate: formData.get("apvDate"),
    hasId06: formData.get("hasId06") === "on",
    id06Date: formData.get("id06Date"),
    otherCompetence: formData.get("otherCompetence"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Anställd kunde inte uppdateras." };

  await db.employee.update({
    where: { id },
    data: {
      name: parsed.data.name,
      personalNumber: parsed.data.personalNumber,
      address: parsed.data.address,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      title: parsed.data.title,
      teamId: parsed.data.teamId || null,
      apvDate: parsed.data.hasApv && parsed.data.apvDate ? new Date(`${parsed.data.apvDate}T00:00:00.000`) : null,
      id06Date: parsed.data.hasId06 && parsed.data.id06Date ? new Date(`${parsed.data.id06Date}T00:00:00.000`) : null,
      otherCompetence: parsed.data.otherCompetence || null,
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
