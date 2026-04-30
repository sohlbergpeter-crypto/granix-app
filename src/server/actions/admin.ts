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
    phone: formData.get("phone"),
    email: formData.get("email"),
    title: formData.get("title"),
    teamId: formData.get("teamId"),
    skills: formData.get("skills"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Anställd kunde inte sparas." };

  await db.employee.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      teamId: parsed.data.teamId || null,
      skills: parsed.data.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
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
