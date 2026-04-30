import { ProjectStatus, ResourceStatus, Role } from "@prisma/client";
import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Ange användarnamn eller e-post."),
  password: z.string().min(1, "Ange lösenord."),
});

export const projectSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(2, "Ange projektnamn."),
    projectNumber: z.string().trim().min(2, "Ange projektnummer."),
    customerName: z.string().trim().min(2, "Ange kundnamn."),
    address: z.string().trim().min(2, "Ange adress."),
    city: z.string().trim().min(2, "Ange ort."),
    contactPerson: optionalText,
    phone: optionalText,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    startTime: optionalText,
    endTime: optionalText,
    allDay: z.coerce.boolean().default(true),
    status: z.nativeEnum(ProjectStatus),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    internalNote: optionalText,
    externalDescription: optionalText,
    teamId: optionalText,
    employeeIds: z.array(z.string()).default([]),
    machineIds: z.array(z.string()).default([]),
    vehicleIds: z.array(z.string()).default([]),
    notificationTarget: z.enum(["none", "assigned", "all"]).default("none"),
  })
  .refine((data) => data.endDate >= data.startDate, {
    path: ["endDate"],
    message: "Slutdatum måste vara samma dag eller efter startdatum.",
  });

export const userSchema = z.object({
  username: z.string().trim().min(2),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6),
  role: z.nativeEnum(Role),
  employeeId: z.string().optional().or(z.literal("")),
});

export const employeeSchema = z.object({
  name: z.string().trim().min(2),
  phone: optionalText,
  email: z.string().email().optional().or(z.literal("")),
  title: z.string().trim().min(2),
  teamId: optionalText,
  skills: z.string().optional().default(""),
});

export const teamSchema = z.object({
  name: z.string().trim().min(2),
  description: optionalText,
});

export const machineSchema = z.object({
  name: z.string().trim().min(2),
  type: z.string().trim().min(2),
  status: z.nativeEnum(ResourceStatus),
});

export const vehicleSchema = z.object({
  name: z.string().trim().min(2),
  registrationNumber: z.string().trim().min(2),
  status: z.nativeEnum(ResourceStatus),
});
