import { PrismaClient, ProjectStatus, ResourceStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@granix.se";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ALLOW_SAMPLE_SEED = process.env.ALLOW_SAMPLE_SEED === "true";

async function ensureTeam(id: string, name: string) {
  return prisma.team.upsert({
    where: { id },
    update: { name },
    create: { id, name },
  });
}

async function ensureEmployee(data: {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  title: string;
  teamId?: string;
  skills?: string[];
}) {
  return prisma.employee.upsert({
    where: { id: data.id },
    update: data,
    create: data,
  });
}

async function ensureMachine(data: { id: string; name: string; type: string; status: ResourceStatus }) {
  return prisma.machine.upsert({
    where: { id: data.id },
    update: data,
    create: data,
  });
}

async function ensureVehicle(data: { id: string; name: string; registrationNumber: string; status: ResourceStatus }) {
  return prisma.vehicle.upsert({
    where: { id: data.id },
    update: data,
    create: data,
  });
}

async function ensureProject(data: {
  id: string;
  name: string;
  projectNumber: string;
  customerName: string;
  address: string;
  city: string;
  contactPerson?: string;
  phone?: string;
  startDate: Date;
  endDate: Date;
  startTime?: string | null;
  endTime?: string | null;
  allDay: boolean;
  status: ProjectStatus;
  color: string;
  internalNote?: string;
  externalDescription?: string;
  teamId?: string;
  employeeIds: string[];
  machineIds: string[];
  vehicleIds: string[];
}) {
  const { employeeIds, machineIds, vehicleIds, ...projectData } = data;

  await prisma.project.upsert({
    where: { id: data.id },
    update: {
      ...projectData,
      contactPerson: projectData.contactPerson || null,
      phone: projectData.phone || null,
      startTime: projectData.startTime || null,
      endTime: projectData.endTime || null,
      internalNote: projectData.internalNote || null,
      externalDescription: projectData.externalDescription || null,
      teamId: projectData.teamId || null,
    },
    create: {
      ...projectData,
      contactPerson: projectData.contactPerson || null,
      phone: projectData.phone || null,
      startTime: projectData.startTime || null,
      endTime: projectData.endTime || null,
      internalNote: projectData.internalNote || null,
      externalDescription: projectData.externalDescription || null,
      teamId: projectData.teamId || null,
    },
  });

  await prisma.projectEmployee.deleteMany({ where: { projectId: data.id } });
  await prisma.projectMachine.deleteMany({ where: { projectId: data.id } });
  await prisma.projectVehicle.deleteMany({ where: { projectId: data.id } });

  if (employeeIds.length) {
    await prisma.projectEmployee.createMany({
      data: employeeIds.map((employeeId) => ({ projectId: data.id, employeeId })),
      skipDuplicates: true,
    });
  }

  if (machineIds.length) {
    await prisma.projectMachine.createMany({
      data: machineIds.map((machineId) => ({ projectId: data.id, machineId })),
      skipDuplicates: true,
    });
  }

  if (vehicleIds.length) {
    await prisma.projectVehicle.createMany({
      data: vehicleIds.map((vehicleId) => ({ projectId: data.id, vehicleId })),
      skipDuplicates: true,
    });
  }

  await prisma.auditLog.upsert({
    where: { id: `seed-project-${data.id}` },
    update: { metadata: { projectNumber: data.projectNumber } },
    create: {
      id: `seed-project-${data.id}`,
      entity: "Project",
      entityId: data.id,
      action: "seed:create",
      metadata: { projectNumber: data.projectNumber },
    },
  });
}

async function ensureAdminUser() {
  const adminTeam = await ensureTeam("ledning", "Ledning");
  const adminEmployee = await ensureEmployee({
    id: "emp-admin",
    name: "Admin Granix",
    phone: "070-100 00 01",
    email: ADMIN_EMAIL,
    title: "Ledning",
    teamId: adminTeam.id,
    skills: ["Planering", "Projektledning"],
  });

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username: ADMIN_USERNAME.toLowerCase() }, { email: ADMIN_EMAIL.toLowerCase() }],
    },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        username: ADMIN_USERNAME.toLowerCase(),
        email: ADMIN_EMAIL.toLowerCase(),
        passwordHash,
        role: Role.admin,
        active: true,
        employeeId: adminEmployee.id,
      },
    });
    return;
  }

  await prisma.user.create({
    data: {
      username: ADMIN_USERNAME.toLowerCase(),
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: Role.admin,
      active: true,
      employeeId: adminEmployee.id,
    },
  });
}

async function seedSampleData() {
  const teams = await Promise.all([
    ensureTeam("stenlag-a", "Stenlag A"),
    ensureTeam("stenlag-b", "Stenlag B"),
    ensureTeam("service", "Service"),
  ]);

  const employees = await Promise.all([
    ensureEmployee({ id: "emp-ali", name: "Ali Sten", phone: "070-100 00 02", email: "ali@granix.se", title: "Stensättare", teamId: teams[0].id, skills: ["Marksten", "Kantsten"] }),
    ensureEmployee({ id: "emp-sara", name: "Sara Berg", phone: "070-100 00 03", email: "sara@granix.se", title: "Hantlangare", teamId: teams[0].id, skills: ["Förarbete", "Material"] }),
    ensureEmployee({ id: "emp-omar", name: "Omar Granit", phone: "070-100 00 04", email: "omar@granix.se", title: "Stenhuggare", teamId: teams[1].id, skills: ["Natursten", "Kapning"] }),
    ensureEmployee({ id: "emp-lina", name: "Lina Mark", phone: "070-100 00 05", email: "lina@granix.se", title: "Stensättare", teamId: teams[1].id, skills: ["Plattsättning", "Dränering"] }),
    ensureEmployee({ id: "emp-erik", name: "Erik Service", phone: "070-100 00 06", email: "erik@granix.se", title: "Maskinförare", teamId: teams[2].id, skills: ["Grävare", "Lastmaskin"] }),
  ]);

  const userHash = await bcrypt.hash("user123", 12);
  await Promise.all([
    prisma.user.upsert({
      where: { username: "ali" },
      update: { email: "ali@granix.se", passwordHash: userHash, role: Role.user, active: true, employeeId: employees[0].id },
      create: { username: "ali", email: "ali@granix.se", passwordHash: userHash, role: Role.user, active: true, employeeId: employees[0].id },
    }),
    prisma.user.upsert({
      where: { username: "sara" },
      update: { email: "sara@granix.se", passwordHash: userHash, role: Role.user, active: true, employeeId: employees[1].id },
      create: { username: "sara", email: "sara@granix.se", passwordHash: userHash, role: Role.user, active: true, employeeId: employees[1].id },
    }),
    prisma.user.upsert({
      where: { username: "omar" },
      update: { email: "omar@granix.se", passwordHash: userHash, role: Role.user, active: true, employeeId: employees[2].id },
      create: { username: "omar", email: "omar@granix.se", passwordHash: userHash, role: Role.user, active: true, employeeId: employees[2].id },
    }),
  ]);

  const machines = await Promise.all([
    ensureMachine({ id: "machine-1", name: "Minigrävare 2,8t", type: "Grävare", status: ResourceStatus.aktiv }),
    ensureMachine({ id: "machine-2", name: "Stenkap Husqvarna", type: "Kapmaskin", status: ResourceStatus.aktiv }),
    ensureMachine({ id: "machine-3", name: "Vibroplatta 500kg", type: "Packning", status: ResourceStatus.aktiv }),
    ensureMachine({ id: "machine-4", name: "Laserpaket", type: "Mätning", status: ResourceStatus.service }),
  ]);

  const vehicles = await Promise.all([
    ensureVehicle({ id: "vehicle-1", name: "Pickup 1", registrationNumber: "GRX001", status: ResourceStatus.aktiv }),
    ensureVehicle({ id: "vehicle-2", name: "Pickup 2", registrationNumber: "GRX002", status: ResourceStatus.aktiv }),
    ensureVehicle({ id: "vehicle-3", name: "Lastbil kran", registrationNumber: "GRX003", status: ResourceStatus.aktiv }),
    ensureVehicle({ id: "vehicle-4", name: "Släp maskin", registrationNumber: "GRX004", status: ResourceStatus.service }),
  ]);

  const colors = ["#00af41", "#22c55e", "#84cc16", "#06b6d4", "#f59e0b", "#ef4444", "#a3e635", "#14b8a6", "#38bdf8", "#f97316"];
  const statuses: ProjectStatus[] = ["planerat", "bokat", "pagaende", "pausat", "planerat", "bokat", "pagaende", "klart", "fakturerat", "installt"];

  for (let index = 0; index < 10; index += 1) {
    const start = new Date(2026, 3, 20 + index * 2);
    const end = new Date(start);
    end.setDate(start.getDate() + (index % 4) + 1);

    await ensureProject({
      id: `project-${index + 1}`,
      name: `Granix projekt ${index + 1}`,
      projectNumber: `GRX-2026-${String(index + 1).padStart(3, "0")}`,
      customerName: ["BRF Eken", "Nordfast", "Villa Holm", "Stad Park", "Industrigolv AB"][index % 5],
      address: ["Storgatan 12", "Parkvägen 5", "Hamngatan 8", "Skogsvägen 21", "Industrivägen 4"][index % 5],
      city: ["Stockholm", "Uppsala", "Västerås", "Täby", "Solna"][index % 5],
      contactPerson: ["Maria", "Johan", "Karin", "Peter", "Nadia"][index % 5],
      phone: `08-55 00 0${index}`,
      startDate: start,
      endDate: end,
      startTime: index % 2 === 0 ? "07:00" : null,
      endTime: index % 2 === 0 ? "16:00" : null,
      allDay: index % 2 !== 0,
      status: statuses[index],
      color: colors[index],
      internalNote: "Intern planering, material och resursbehov följs upp dagligen.",
      externalDescription: "Planerat arbete enligt överenskommen omfattning.",
      teamId: teams[index % teams.length].id,
      employeeIds: [employees[index % employees.length].id, employees[(index + 1) % employees.length].id],
      machineIds: [machines[index % machines.length].id],
      vehicleIds: [vehicles[index % vehicles.length].id],
    });
  }

  await prisma.recurringEvent.upsert({
    where: { id: "recurring-service-weekly" },
    update: {
      title: "Veckoservice maskiner",
      frequency: "weekly",
      interval: 1,
      startsOn: new Date(2026, 3, 24),
      active: true,
    },
    create: {
      id: "recurring-service-weekly",
      title: "Veckoservice maskiner",
      frequency: "weekly",
      interval: 1,
      startsOn: new Date(2026, 3, 24),
      active: true,
    },
  });
}

async function main() {
  await ensureAdminUser();

  if (ALLOW_SAMPLE_SEED) {
    await seedSampleData();
    console.log("Admin och demo-data skapade.");
    return;
  }

  console.log("Admin skapad eller uppdaterad. Demo-data hoppades över.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
