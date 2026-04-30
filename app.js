const STORAGE_KEY = "nordplan-data-v2";
const SESSION_KEY = "nordplan-session-v1";
const EMPLOYEE_TITLES = ["Ledning", "Stensattare", "Hantlangare", "Stenhuggare"];

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function uid(prefix) {
  const randomPart = Math.random().toString(36).slice(2, 10);
  const timePart = Date.now().toString(36);
  return `${prefix}-${timePart}-${randomPart}`;
}

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    return;
  }
}

const seedData = {
  teams: [
    { id: "ledning", name: "Ledning" },
    { id: "salj", name: "Salj" },
    { id: "support", name: "Support" },
    { id: "utveckling", name: "Utveckling" },
  ],
  employees: [
    { id: "anna", name: "Anna Berg", teamId: "ledning", title: "Ledning", email: "anna@bolag.se" },
    { id: "markus", name: "Markus Lind", teamId: "salj", title: "Stensattare", email: "markus@bolag.se" },
    { id: "elin", name: "Elin Sjostrom", teamId: "support", title: "Hantlangare", email: "elin@bolag.se" },
    { id: "jonas", name: "Jonas Nyberg", teamId: "utveckling", title: "Stenhuggare", email: "jonas@bolag.se" },
    { id: "sara", name: "Sara Holm", teamId: "utveckling", title: "Stensattare", email: "sara@bolag.se" },
  ],
  users: [
    { id: "user-admin", username: "admin", password: "admin123", role: "admin", employeeId: "anna", active: true },
    { id: "user-plan", username: "planner", password: "planner123", role: "planner", employeeId: "jonas", active: true },
  ],
  projects: [
    {
      id: "project-crm",
      name: "CRM migrering",
      startDate: "2026-04-15",
      endDate: "2026-06-30",
      teamId: "salj",
      ownerId: "markus",
      status: "pagaende",
      budgetStatus: "gul",
      color: "#f59e0b",
      notes: "Migrering av pipeline, kundkort och rapportering till ny plattform.",
    },
    {
      id: "project-portal",
      name: "Intern portal",
      startDate: "2026-04-01",
      endDate: "2026-05-20",
      teamId: "utveckling",
      ownerId: "jonas",
      status: "planerad",
      budgetStatus: "gron",
      color: "#2563eb",
      notes: "Lansera intern portal for support, onboarding och processer.",
    },
  ],
  items: [
    {
      id: uid("item"),
      title: "Veckomote ledning",
      type: "mote",
      date: "2026-04-20",
      startTime: "08:30",
      endTime: "09:30",
      teamId: "ledning",
      ownerId: "anna",
      projectId: "",
      status: "planerad",
      priority: "hog",
      notes: "Fokus pa bemanning, budget och risker vecka 17.",
      createdByUserId: "user-admin",
    },
    {
      id: uid("item"),
      title: "Kunduppfoljning kvartal",
      type: "uppgift",
      date: "2026-04-21",
      startTime: "10:00",
      endTime: "11:30",
      teamId: "salj",
      ownerId: "markus",
      projectId: "project-crm",
      status: "pagaende",
      priority: "hog",
      notes: "Ring topp 10 kunder och uppdatera prognos i eftermiddag.",
      createdByUserId: "user-plan",
    },
    {
      id: uid("item"),
      title: "Lansering intern portal",
      type: "leverans",
      date: "2026-04-22",
      startTime: "13:00",
      endTime: "15:00",
      teamId: "utveckling",
      ownerId: "jonas",
      projectId: "project-portal",
      status: "planerad",
      priority: "medel",
      notes: "Deploy, smoke test och intern demo for supportteamet.",
      createdByUserId: "user-plan",
    },
    {
      id: uid("item"),
      title: "Schema utbildning support",
      type: "mote",
      date: "2026-04-23",
      startTime: "09:00",
      endTime: "10:00",
      teamId: "support",
      ownerId: "elin",
      projectId: "",
      status: "planerad",
      priority: "medel",
      notes: "Planering av onboarding for nya medarbetare.",
      createdByUserId: "user-admin",
    },
    {
      id: uid("item"),
      title: "Semester Sara Holm",
      type: "franvaro",
      date: "2026-04-24",
      startTime: "",
      endTime: "",
      teamId: "utveckling",
      ownerId: "sara",
      projectId: "",
      status: "klar",
      priority: "lag",
      notes: "Heldag franvaro.",
      createdByUserId: "user-admin",
    },
  ],
  timeReports: [
    {
      id: uid("time"),
      employeeId: "jonas",
      projectId: "project-portal",
      date: "2026-04-19",
      hours: 8,
      travelWithinHours: 0,
      travelOutsideHours: 0,
      allowance: "nej",
      notes: "Montering och förberedelser på plats.",
      createdByUserId: "user-plan",
      images: [],
    },
  ],
};

const today = new Date();
today.setHours(0, 0, 0, 0);

const state = {
  currentMonth: new Date(today.getFullYear(), today.getMonth(), 1),
  selectedDate: toDateKey(today),
  currentView: "planning",
  filters: {
    teamId: "alla",
    status: "alla",
    projectId: "alla",
    search: "",
  },
  data: loadData(),
  session: loadSession(),
  editingId: null,
  editingProjectId: null,
  editingTimeId: null,
};

const monthFormatter = new Intl.DateTimeFormat("sv-SE", {
  month: "long",
  year: "numeric",
});

const longDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortMonthFormatter = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "short",
});

const loginScreen = document.getElementById("loginScreen");
const appShell = document.getElementById("appShell");
const loginForm = document.getElementById("loginForm");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const loginMessage = document.getElementById("loginMessage");
const sessionUserName = document.getElementById("sessionUserName");
const sessionUserRole = document.getElementById("sessionUserRole");
const logoutButton = document.getElementById("logoutButton");
const planningViewButton = document.getElementById("planningViewButton");
const timeViewButton = document.getElementById("timeViewButton");
const diaryViewButton = document.getElementById("diaryViewButton");
const planningView = document.getElementById("planningView");
const timeView = document.getElementById("timeView");
const diaryView = document.getElementById("diaryView");
const planningDashboard = planningView.querySelector(".dashboard-grid");
const planningWorkspace = planningView.querySelector(".workspace-grid");
const planningSidebar = planningView.querySelector(".sidebar-stack");
const planningBottomGrid = planningView.querySelector(".bottom-grid");
const planningAdminGrid = planningView.querySelector(".admin-grid");
const planningFormCard = planningView.querySelector(".form-card");
const projectAdminCard = planningAdminGrid ? planningAdminGrid.querySelector(".admin-card") : null;

const calendarHeading = document.getElementById("calendarHeading");
const calendarGrid = document.querySelector(".calendar-grid");
const metricsGrid = document.getElementById("metricsGrid");
const selectedDateTitle = document.getElementById("selectedDateTitle");
const selectedDateMeta = document.getElementById("selectedDateMeta");
const selectedDayList = document.getElementById("selectedDayList");
const agendaList = document.getElementById("agendaList");
const projectSummary = document.getElementById("projectSummary");
const timeProjectInput = document.getElementById("timeProjectInput");

const planningForm = document.getElementById("planningForm");
const formTitle = document.getElementById("formTitle");
const itemIdInput = document.getElementById("itemId");
const titleInput = document.getElementById("titleInput");
const dateInput = document.getElementById("dateInput");
const projectInput = document.getElementById("projectInput");
const typeInput = document.getElementById("typeInput");
const startTimeInput = document.getElementById("startTimeInput");
const endTimeInput = document.getElementById("endTimeInput");
const teamInput = document.getElementById("teamInput");
const ownerInput = document.getElementById("ownerInput");
const statusInput = document.getElementById("statusInput");
const priorityInput = document.getElementById("priorityInput");
const notesInput = document.getElementById("notesInput");
const createdByDisplay = document.getElementById("createdByDisplay");
const cancelEditButton = document.getElementById("cancelEditButton");

const teamFilter = document.getElementById("teamFilter");
const statusFilter = document.getElementById("statusFilter");
const projectFilter = document.getElementById("projectFilter");
const searchInput = document.getElementById("searchInput");
const clearFiltersButton = document.getElementById("clearFiltersButton");
const todayButton = document.getElementById("todayButton");
const seedButton = document.getElementById("seedButton");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

const projectForm = document.getElementById("projectForm");
const projectIdInput = document.getElementById("projectIdInput");
const projectNameInput = document.getElementById("projectNameInput");
const projectStartInput = document.getElementById("projectStartInput");
const projectEndInput = document.getElementById("projectEndInput");
const projectTeamInput = document.getElementById("projectTeamInput");
const projectOwnerInput = document.getElementById("projectOwnerInput");
const projectStatusInput = document.getElementById("projectStatusInput");
const projectBudgetInput = document.getElementById("projectBudgetInput");
const projectColorInput = document.getElementById("projectColorInput");
const projectNotesInput = document.getElementById("projectNotesInput");
const cancelProjectEditButton = document.getElementById("cancelProjectEditButton");

const adminSection = document.getElementById("adminSection");
const employeeForm = document.getElementById("employeeForm");
const employeeNameInput = document.getElementById("employeeNameInput");
const employeeTeamInput = document.getElementById("employeeTeamInput");
const employeeTitleInput = document.getElementById("employeeTitleInput");
const employeeEmailInput = document.getElementById("employeeEmailInput");
const adminMessage = document.getElementById("adminMessage");
const userForm = document.getElementById("userForm");
const userUsernameInput = document.getElementById("userUsernameInput");
const userPasswordInput = document.getElementById("userPasswordInput");
const userRoleInput = document.getElementById("userRoleInput");
const userEmployeeInput = document.getElementById("userEmployeeInput");
const employeeDirectory = document.getElementById("employeeDirectory");
const userDirectory = document.getElementById("userDirectory");
const timeAdminSection = document.getElementById("timeAdminSection");
const diaryAdminSection = document.getElementById("diaryAdminSection");
const timeReportForm = document.getElementById("timeReportForm");
const timeEntryId = document.getElementById("timeEntryId");
const timeDateInput = document.getElementById("timeDateInput");
const timeHoursInput = document.getElementById("timeHoursInput");
const timeTravelWithinInput = document.getElementById("timeTravelWithinInput");
const timeTravelOutsideInput = document.getElementById("timeTravelOutsideInput");
const timeAllowanceInput = document.getElementById("timeAllowanceInput");
const timeNotesInput = document.getElementById("timeNotesInput");
const cancelTimeEditButton = document.getElementById("cancelTimeEditButton");
const myTimeReportList = document.getElementById("myTimeReportList");
const timeSummary = document.getElementById("timeSummary");
const allTimeReportList = document.getElementById("allTimeReportList");

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function ensureUsersHaveEmployees(data) {
  const nextData = {
    teams: data.teams || [],
    employees: [...(data.employees || [])],
    users: [...(data.users || [])],
    projects: data.projects || [],
    items: data.items || [],
    timeReports: data.timeReports || [],
  };

  nextData.users = nextData.users.map((user) => {
    if (user.employeeId && nextData.employees.some((employee) => employee.id === user.employeeId)) {
      return user;
    }

    const fallbackName = String(user.username || "Anstalld").trim();
    let employeeId = slugify(fallbackName) || uid("employee");
    while (nextData.employees.some((employee) => employee.id === employeeId)) {
      employeeId = uid("employee");
    }

    nextData.employees.push({
      id: employeeId,
      name: fallbackName,
      teamId: nextData.teams[0] ? nextData.teams[0].id : "",
      title: EMPLOYEE_TITLES[1],
      email: "",
    });

    return Object.assign({}, user, { employeeId });
  });

  return nextData;
}

function loadData() {
  const saved = readStorage(STORAGE_KEY);
  if (!saved) {
    return ensureUsersHaveEmployees(cloneData(seedData));
  }

  try {
    const parsed = JSON.parse(saved);
    return ensureUsersHaveEmployees({
      teams: parsed.teams || cloneData(seedData.teams),
      employees: parsed.employees || cloneData(seedData.employees),
      users: parsed.users || cloneData(seedData.users),
      projects: parsed.projects || cloneData(seedData.projects),
      items: parsed.items || cloneData(seedData.items),
      timeReports: parsed.timeReports || cloneData(seedData.timeReports),
    });
  } catch (error) {
    return ensureUsersHaveEmployees(cloneData(seedData));
  }
}

function loadSession() {
  const saved = readStorage(SESSION_KEY);
  if (!saved) {
    return { userId: null };
  }
  try {
    return JSON.parse(saved);
  } catch (error) {
    return { userId: null };
  }
}

function saveData() {
  writeStorage(STORAGE_KEY, JSON.stringify(state.data));
}

function saveSession() {
  writeStorage(SESSION_KEY, JSON.stringify(state.session));
}

function getCurrentUser() {
  return state.data.users.find((user) => user.id === state.session.userId) || null;
}

function getCurrentEmployee() {
  const user = getCurrentUser();
  return user ? getEmployee(user.employeeId) : null;
}

function isAdmin() {
  var user = getCurrentUser();
  return user && user.role === "admin";
}

function getIsoWeek(date) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const day = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - day + 3);

  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstThursdayDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstThursdayDay + 3);

  return 1 + Math.round((target.getTime() - firstThursday.getTime()) / 604800000);
}

function getCalendarStart(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day);
  return start;
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getTeam(teamId) {
  return state.data.teams.find((team) => team.id === teamId);
}

function getEmployee(employeeId) {
  return state.data.employees.find((employee) => employee.id === employeeId);
}

function getProject(projectId) {
  return state.data.projects.find((project) => project.id === projectId);
}

function getUser(userId) {
  return state.data.users.find((user) => user.id === userId);
}

function getStatusLabel(status) {
  const labels = {
    planerad: "Planerad",
    pagaende: "Pagaende",
    klar: "Klar",
    forsenad: "Forsenad",
  };
  return labels[status] || status;
}

function getTypeLabel(type) {
  const labels = {
    mote: "Mote",
    uppgift: "Uppgift",
    leverans: "Leverans",
    franvaro: "Franvaro",
  };
  return labels[type] || type;
}

function getPriorityLabel(priority) {
  const labels = {
    hog: "Hog",
    medel: "Medel",
    lag: "Lag",
  };
  return labels[priority] || priority;
}

function getRoleLabel(role) {
  const labels = {
    admin: "Admin",
    planner: "Planner",
    viewer: "Viewer",
  };
  return labels[role] || role;
}

function getBudgetLabel(status) {
  const labels = {
    gron: "Budget gron",
    gul: "Budget gul",
    rod: "Budget rod",
  };
  return labels[status] || status;
}

function formatTimeRange(item) {
  if (!item.startTime && !item.endTime) {
    return "Heldag";
  }
  if (item.startTime && item.endTime) {
    return `${item.startTime} - ${item.endTime}`;
  }
  return item.startTime || item.endTime || "Tid ej satt";
}

function sortItems(items) {
  return [...items].sort((a, b) => {
    const aTime = a.startTime || "23:59";
    const bTime = b.startTime || "23:59";
    return `${a.date}${aTime}`.localeCompare(`${b.date}${bTime}`);
  });
}

function getVisibleItems() {
  const query = state.filters.search.trim().toLowerCase();

  return sortItems(state.data.items).filter((item) => {
    if (state.filters.teamId !== "alla" && item.teamId !== state.filters.teamId) {
      return false;
    }
    if (state.filters.status !== "alla" && item.status !== state.filters.status) {
      return false;
    }
    if (state.filters.projectId !== "alla" && item.projectId !== state.filters.projectId) {
      return false;
    }
    if (!query) {
      return true;
    }

    const ownerEmployee = getEmployee(item.ownerId);
    const projectEntry = getProject(item.projectId);
    const owner = ownerEmployee ? ownerEmployee.name : "";
    const project = projectEntry ? projectEntry.name : "";
    const haystack = [item.title, owner, project, item.notes].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

function getItemsForDate(dateKey, sourceItems = getVisibleItems()) {
  return sourceItems.filter((item) => item.date === dateKey);
}

function getProjectsForDate(dateKey) {
  return state.data.projects.filter((project) => project.startDate <= dateKey && project.endDate >= dateKey);
}

function renderSelectOptions() {
  const teamOptions = ['<option value="alla">Alla team</option>']
    .concat(state.data.teams.map((team) => `<option value="${team.id}">${team.name}</option>`))
    .join("");

  teamFilter.innerHTML = teamOptions;
  teamFilter.value = state.filters.teamId;

  teamInput.innerHTML = state.data.teams
    .map((team) => `<option value="${team.id}">${team.name}</option>`)
    .join("");

  employeeTeamInput.innerHTML = state.data.teams
    .map((team) => `<option value="${team.id}">${team.name}</option>`)
    .join("");

  employeeTitleInput.innerHTML = EMPLOYEE_TITLES
    .map((title) => `<option value="${title}">${title}</option>`)
    .join("");

  projectTeamInput.innerHTML = state.data.teams
    .map((team) => `<option value="${team.id}">${team.name}</option>`)
    .join("");

  projectFilter.innerHTML = ['<option value="alla">Alla projekt</option>']
    .concat(state.data.projects.map((project) => `<option value="${project.id}">${project.name}</option>`))
    .join("");
  projectFilter.value = state.filters.projectId;

  projectInput.innerHTML = ['<option value="">Inget projekt</option>']
    .concat(state.data.projects.map((project) => `<option value="${project.id}">${project.name}</option>`))
    .join("");

  if (timeProjectInput) {
    timeProjectInput.innerHTML = ['<option value="">Välj projekt</option>']
      .concat(state.data.projects.map((project) => `<option value="${project.id}">${project.name}</option>`))
      .join("");
  }

  renderOwnerOptions(teamInput.value || (state.data.teams[0] ? state.data.teams[0].id : "") || "");
  renderProjectOwnerOptions(projectTeamInput.value || (state.data.teams[0] ? state.data.teams[0].id : "") || "");
  renderUserEmployeeOptions();
}

function renderOwnerOptions(teamId) {
  const employees = state.data.employees.filter((employee) => employee.teamId === teamId);
  ownerInput.innerHTML = employees
    .map((employee) => `<option value="${employee.id}">${employee.name}</option>`)
    .join("");
}

function renderProjectOwnerOptions(teamId) {
  const employees = state.data.employees.filter((employee) => employee.teamId === teamId);
  projectOwnerInput.innerHTML = employees
    .map((employee) => `<option value="${employee.id}">${employee.name}</option>`)
    .join("");
}

function renderUserEmployeeOptions() {
  userEmployeeInput.innerHTML = ['<option value="">Ingen koppling</option>']
    .concat(
      state.data.employees.map((employee) => `<option value="${employee.id}">${employee.name}</option>`)
    )
    .join("");
}

function renderSessionHeader() {
  const user = getCurrentUser();
  const employee = getCurrentEmployee();
  sessionUserName.textContent = (employee ? employee.name : "") || (user ? user.username : "") || "Okand anvandare";
  sessionUserRole.textContent = getRoleLabel((user ? user.role : "") || "viewer");

  if (isAdmin()) {
    adminSection.classList.remove("app-hidden");
    timeAdminSection.classList.remove("app-hidden");
    diaryAdminSection.classList.remove("app-hidden");
    planningView.classList.remove("calendar-only");
    planningDashboard.classList.remove("app-hidden");
    planningSidebar.classList.remove("app-hidden");
    planningFormCard.classList.add("app-hidden");
    planningBottomGrid.classList.remove("app-hidden");
    planningAdminGrid.classList.remove("app-hidden");
    if (projectAdminCard) {
      projectAdminCard.classList.remove("app-hidden");
    }
  } else {
    adminSection.classList.add("app-hidden");
    timeAdminSection.classList.add("app-hidden");
    diaryAdminSection.classList.add("app-hidden");
    planningView.classList.add("calendar-only");
    planningDashboard.classList.add("app-hidden");
    planningSidebar.classList.add("app-hidden");
    planningFormCard.classList.add("app-hidden");
    planningBottomGrid.classList.add("app-hidden");
    planningAdminGrid.classList.add("app-hidden");
    if (projectAdminCard) {
      projectAdminCard.classList.add("app-hidden");
    }
  }
}

function renderActiveView() {
  const showPlanning = state.currentView === "planning";
  const showTime = state.currentView === "time";
  const showDiary = state.currentView === "diary";

  planningView.classList.toggle("app-hidden", !showPlanning);
  timeView.classList.toggle("app-hidden", !showTime);
  diaryView.classList.toggle("app-hidden", !showDiary);

  planningViewButton.className = showPlanning ? "secondary-button is-active" : "ghost-button";
  timeViewButton.className = showTime ? "secondary-button is-active" : "ghost-button";
  diaryViewButton.className = showDiary ? "secondary-button is-active" : "ghost-button";
}

function renderMetrics(visibleItems) {
  const selectedDateItems = getItemsForDate(state.selectedDate, visibleItems);
  const monthItems = visibleItems.filter((item) => {
    const date = fromDateKey(item.date);
    return (
      date.getFullYear() === state.currentMonth.getFullYear() &&
      date.getMonth() === state.currentMonth.getMonth()
    );
  });
  const openItems = visibleItems.filter((item) => item.status !== "klar").length;
  const delayedItems = visibleItems.filter((item) => item.status === "forsenad").length;
  const weekItems = visibleItems.filter((item) => {
    const date = fromDateKey(item.date);
    return getIsoWeek(date) === getIsoWeek(fromDateKey(state.selectedDate));
  }).length;
  const activeProjects = state.data.projects.filter((project) => project.status !== "klar").length;

  const metrics = [
    {
      label: "Aktiviteter i manaden",
      value: monthItems.length,
      subtext: `${weekItems} under vald vecka`,
    },
    {
      label: "Oppna aktiviteter",
      value: openItems,
      subtext: delayedItems > 0 ? `${delayedItems} forsenade` : "Ingen forsening registrerad",
    },
    {
      label: "Vald dag",
      value: selectedDateItems.length,
      subtext: longDateFormatter.format(fromDateKey(state.selectedDate)),
    },
    {
      label: "Aktiva projekt",
      value: activeProjects,
      subtext: `${state.data.projects.length} projekt totalt`,
    },
    {
      label: "Anstallda",
      value: state.data.employees.length,
      subtext: `${state.data.users.length} anvandarkonton`,
    },
  ];

  metricsGrid.innerHTML = metrics
    .map(
      (metric) => `
        <div class="metric">
          <span class="metric-label">${metric.label}</span>
          <span class="metric-value">${metric.value}</span>
          <span class="metric-subtext">${metric.subtext}</span>
        </div>
      `
    )
    .join("");
}

function createWeekNumberCell(date, visibleItems) {
  const weekNumber = getIsoWeek(date);
  const weekItems = visibleItems.filter((item) => getIsoWeek(fromDateKey(item.date)) === weekNumber);

  const cell = document.createElement("div");
  cell.className = "week-number";
  cell.innerHTML = `
    <span class="week-prefix">Vecka</span>
    <span class="week-value">${weekNumber}</span>
    <span class="week-load">${weekItems.length} aktiviteter</span>
  `;
  return cell;
}

function createDayCell(date, monthIndex, visibleItems) {
  const dateKey = toDateKey(date);
  const dayItems = getItemsForDate(dateKey, visibleItems);
  const dayProjects = getProjectsForDate(dateKey);
  const isToday = dateKey === toDateKey(today);
  const isOutsideMonth = date.getMonth() !== monthIndex;
  const isSelected = dateKey === state.selectedDate;

  const cell = document.createElement("button");
  cell.type = "button";
  cell.className = "day-cell";
  if (isToday) {
    cell.classList.add("today");
  }
  if (isOutsideMonth) {
    cell.classList.add("outside-month");
  }
  if (isSelected) {
    cell.classList.add("selected");
  }

  const projectPreview = dayProjects
    .map((project) => `<div class="preview-pill project-preview-pill" style="background:${project.color || "#0f766e"}; color:#fff;">${project.name}</div>`)
    .join("");
  const activityPreview = dayItems
    .slice(0, 2)
    .map((item) => `<div class="preview-pill activity-preview-pill">${item.title}</div>`)
    .join("");
  const overflow = dayItems.length > 2 ? `<div class="preview-overflow">+${dayItems.length - 2} fler</div>` : "";

  cell.innerHTML = `
    <div class="day-top">
      <span class="day-number">${date.getDate()}</span>
      <span class="day-count">${dayProjects.length || dayItems.length ? `${dayProjects.length + dayItems.length} st` : "Ledig"}</span>
    </div>
    <div class="day-items-preview">${projectPreview}${activityPreview || (!projectPreview ? '<div class="preview-overflow">Inget planerat</div>' : "")}${overflow}</div>
  `;

  cell.addEventListener("click", () => {
    state.selectedDate = dateKey;
    renderApp();
  });

  return cell;
}

function clearOldCells() {
  calendarGrid.querySelectorAll(".week-number, .day-cell").forEach((cell) => cell.remove());
}

function renderCalendar(visibleItems) {
  clearOldCells();
  calendarHeading.textContent = `Kalender ${monthFormatter.format(state.currentMonth)}`;

  const startDate = getCalendarStart(state.currentMonth);
  const monthIndex = state.currentMonth.getMonth();

  for (let week = 0; week < 6; week += 1) {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + week * 7);

    calendarGrid.appendChild(createWeekNumberCell(weekStart, visibleItems));

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + dayOffset);
      calendarGrid.appendChild(createDayCell(date, monthIndex, visibleItems));
    }
  }
}

function renderSelectedDay(visibleItems) {
  const selectedDate = fromDateKey(state.selectedDate);
  const items = getItemsForDate(state.selectedDate, visibleItems);
  const projects = getProjectsForDate(state.selectedDate);
  const weekNumber = getIsoWeek(selectedDate);

  selectedDateTitle.textContent = longDateFormatter.format(selectedDate);
  selectedDateMeta.textContent = `Vecka ${weekNumber}. ${projects.length} projekt och ${items.length} aktiviteter matchar aktuella filter.`;

  if (!items.length && !projects.length) {
    selectedDayList.innerHTML = `
      <div class="empty-state">
        Ingen aktivitet registrerad for den har dagen. Valj en annan dag eller skapa en ny aktivitet i formularet.
      </div>
    `;
    return;
  }

  selectedDayList.innerHTML = projects
    .map((project) => `
      <div class="detail-item">
        <div class="detail-top">
          <div>
            <h3 class="item-title">${project.name}</h3>
            <div class="item-meta">${project.startDate} till ${project.endDate}<br>${(getTeam(project.teamId) ? getTeam(project.teamId).name : "Okant team")} · ${(getEmployee(project.ownerId) ? getEmployee(project.ownerId).name : "Ej vald")}</div>
          </div>
          <span class="status-badge status-${project.status}">${getStatusLabel(project.status)}</span>
        </div>
        <div class="team-tags">
          <span class="budget-badge budget-${project.budgetStatus}">${getBudgetLabel(project.budgetStatus)}</span>
          <span class="type-badge">Projekt</span>
        </div>
        <div class="item-meta">${project.notes || "Ingen projektbeskrivning registrerad."}</div>
      </div>
    `)
    .concat(items.map((item) => renderItemCard(item, "detail")))
    .join("");

  bindItemActions(selectedDayList);
}

function renderAgenda(visibleItems) {
  const upcoming = visibleItems.filter((item) => item.date >= state.selectedDate).slice(0, 8);

  if (!upcoming.length) {
    agendaList.innerHTML = `
      <div class="empty-state">
        Inga kommande aktiviteter matchar filtren. Testa att rensa filter eller skapa en ny aktivitet.
      </div>
    `;
    return;
  }

  agendaList.innerHTML = upcoming.map((item) => renderItemCard(item, "agenda")).join("");
  bindItemActions(agendaList);
}

function renderProjects() {
  if (!state.data.projects.length) {
    projectSummary.innerHTML = `
      <div class="empty-state">
        Inga projekt registrerade an. Skapa ett projekt med startdatum, slutdatum och projektagare.
      </div>
    `;
    return;
  }

  projectSummary.innerHTML = state.data.projects
    .slice()
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map((project) => {
      const ownerEmployee = getEmployee(project.ownerId);
      const teamEntry = getTeam(project.teamId);
      const owner = ownerEmployee ? ownerEmployee.name : "Ej vald";
      const team = teamEntry ? teamEntry.name : "Okant team";
      const activityCount = state.data.items.filter((item) => item.projectId === project.id).length;

      return `
        <div class="team-item" data-project-id="${project.id}">
          <div class="team-top">
            <div>
              <h3 class="item-title">${project.name}</h3>
              <div class="team-meta">${project.startDate} till ${project.endDate}<br>${team} · ${owner}</div>
            </div>
            <span class="status-badge status-${project.status}">${getStatusLabel(project.status)}</span>
          </div>
          <div class="team-tags">
            <span class="budget-badge budget-${project.budgetStatus}">${getBudgetLabel(project.budgetStatus)}</span>
            <span class="type-badge">${activityCount} aktiviteter</span>
          </div>
          <div class="item-meta">${project.notes || "Ingen projektbeskrivning registrerad."}</div>
          ${isAdmin() ? `<div class="item-actions">
            <button class="item-action" type="button" data-project-action="edit" data-project-id="${project.id}">Redigera</button>
            <button class="item-action warn" type="button" data-project-action="delete" data-project-id="${project.id}">Ta bort</button>
          </div>` : ""}
        </div>
      `;
    })
    .join("");

  bindProjectActions();
}

function renderDirectories() {
  employeeDirectory.innerHTML = state.data.employees
    .map((employee) => {
      const teamEntry = getTeam(employee.teamId);
      const team = teamEntry ? teamEntry.name : "Okant team";
      const linkedUserCount = state.data.users.filter((user) => user.employeeId === employee.id).length;
      const linkedProjectCount = state.data.projects.filter((project) => project.ownerId === employee.id).length;
      const linkedItemCount = state.data.items.filter((item) => item.ownerId === employee.id).length;
      const canDelete = linkedUserCount === 0 && linkedProjectCount === 0 && linkedItemCount === 0;
      return `
        <div class="directory-item">
          <div class="directory-top">
            <strong>${employee.name}</strong>
            <button class="item-action warn" type="button" data-employee-action="delete" data-employee-id="${employee.id}" ${canDelete ? "" : "disabled"}>
              ${canDelete ? "Ta bort" : "Kan ej tas bort"}
            </button>
          </div>
          <div class="item-meta">${employee.title || "Titel saknas"}<br>${team} · ${employee.email || "Ingen e-post"}</div>
        </div>
      `;
    })
    .join("");

  userDirectory.innerHTML = state.data.users
    .map((user) => {
      const employeeEntry = getEmployee(user.employeeId);
      const employee = employeeEntry ? employeeEntry.name : "Ingen kopplad anstalld";
      const disableDelete = user.id === state.session.userId ? "disabled" : "";
      const deleteLabel = user.id === state.session.userId ? "Aktiv session" : "Ta bort";
      return `
        <div class="directory-item">
          <div class="directory-top">
            <strong>${user.username}</strong>
            <button class="item-action warn" type="button" data-user-action="delete" data-user-id="${user.id}" ${disableDelete}>${deleteLabel}</button>
          </div>
          <div class="item-meta">${getRoleLabel(user.role)}<br>${employee}</div>
        </div>
      `;
    })
    .join("");

  bindUserActions();
  bindEmployeeActions();
}

function sortTimeReports(reports) {
  return [...reports].sort((a, b) => {
    if (a.date === b.date) {
      return String(b.id).localeCompare(String(a.id));
    }
    return String(b.date).localeCompare(String(a.date));
  });
}

function renderTimeReportCard(report, isAdminView) {
  const employee = getEmployee(report.employeeId);
  const project = getProject(report.projectId);
  const createdBy = getUser(report.createdByUserId);
  const canEdit = isAdminView || (getCurrentEmployee() && report.employeeId === getCurrentEmployee().id);
  return `
    <div class="detail-item" data-time-report-id="${report.id}">
      <div class="detail-top">
        <div>
          <h3 class="item-title">${employee ? employee.name : "Okand anstalld"}</h3>
          <div class="item-meta">
            ${report.date}<br>
            ${project ? project.name : "Projekt saknas"}<br>
            Arbetstid: ${formatHours(report.hours)}<br>
            Restid inom arbetstid: ${formatHours(report.travelWithinHours || 0)}<br>
            Restid utanfor arbetstid: ${formatHours(report.travelOutsideHours || 0)}<br>
            ${getAllowanceLabel(report.allowance)}<br>
            ${report.notes || "Ingen kommentar"}
          </div>
        </div>
        <span class="status-badge status-planerad">${formatHours(report.hours)}</span>
      </div>
      <div class="detail-tags">
        <span class="type-badge">${createdBy ? createdBy.username : "okand"}</span>
      </div>
      ${canEdit ? `<div class="item-actions"><button class="item-action" type="button" data-time-edit="${report.id}">Redigera tid</button></div>` : ""}
    </div>
  `;
}

function bindTimeActions(container) {
  container.querySelectorAll("[data-time-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      startTimeEdit(button.getAttribute("data-time-edit"));
    });
  });
}

function renderMyTimeReports() {
  const employee = getCurrentEmployee();
  if (!employee) {
    myTimeReportList.innerHTML = `<div class="empty-state">Ingen anstalld ar kopplad till kontot.</div>`;
    return;
  }

  const reports = sortTimeReports(state.data.timeReports.filter((report) => report.employeeId === employee.id));
  myTimeReportList.innerHTML = reports.length
    ? reports.map((report) => renderTimeReportCard(report, false)).join("")
    : `<div class="empty-state">Ingen tid ar rapporterad an.</div>`;
  bindTimeActions(myTimeReportList);
}

function renderTimeAdminView() {
  if (!isAdmin()) {
    return;
  }

  const reports = sortTimeReports(state.data.timeReports || []);
  const totals = {};
  reports.forEach((report) => {
    totals[report.employeeId] = (totals[report.employeeId] || 0) + Number(report.hours || 0);
  });

  const employeeIds = Object.keys(totals);
  timeSummary.innerHTML = employeeIds.length
    ? employeeIds.map((employeeId) => `
        <div class="team-item">
          <div class="team-top">
            <div>
              <h3 class="item-title">${getEmployee(employeeId) ? getEmployee(employeeId).name : "Okand anstalld"}</h3>
              <div class="team-meta">${formatHours(totals[employeeId])} rapporterad tid</div>
            </div>
          </div>
        </div>
      `).join("")
    : `<div class="empty-state">Inga tidrapporter att visa.</div>`;

  allTimeReportList.innerHTML = reports.length
    ? reports.map((report) => renderTimeReportCard(report, true)).join("")
    : `<div class="empty-state">Inga tidrapporter att visa.</div>`;
  bindTimeActions(allTimeReportList);
}

function resetTimeForm() {
  state.editingTimeId = null;
  timeReportForm.reset();
  timeEntryId.value = "";
  timeDateInput.value = state.selectedDate;
  if (state.data.projects[0]) {
    timeProjectInput.value = state.data.projects[0].id;
  }
  timeHoursInput.value = "8";
  timeTravelWithinInput.value = "0";
  timeTravelOutsideInput.value = "0";
  timeAllowanceInput.value = "nej";
}

function startTimeEdit(reportId) {
  const report = state.data.timeReports.find((entry) => entry.id === reportId);
  if (!report) {
    return;
  }

  state.editingTimeId = report.id;
  timeEntryId.value = report.id;
  timeDateInput.value = report.date;
  timeProjectInput.value = report.projectId;
  timeHoursInput.value = report.hours;
  timeTravelWithinInput.value = Number(report.travelWithinHours || 0);
  timeTravelOutsideInput.value = Number(report.travelOutsideHours || 0);
  timeAllowanceInput.value = report.allowance || "nej";
  timeNotesInput.value = report.notes || "";
  timeReportForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleTimeReportSubmit(event) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  const currentEmployee = getCurrentEmployee();
  const existing = state.editingTimeId
    ? state.data.timeReports.find((report) => report.id === state.editingTimeId)
    : null;
  const employeeId = existing ? existing.employeeId : currentEmployee ? currentEmployee.id : "";

  if (!currentUser || !employeeId) {
    return;
  }

  const payload = {
    id: state.editingTimeId || uid("time"),
    employeeId,
    projectId: timeProjectInput.value,
    date: timeDateInput.value,
    hours: Number(timeHoursInput.value || 0),
    travelWithinHours: Number(timeTravelWithinInput.value || 0),
    travelOutsideHours: Number(timeTravelOutsideInput.value || 0),
    allowance: timeAllowanceInput.value,
    notes: timeNotesInput.value.trim(),
    createdByUserId: existing ? existing.createdByUserId : currentUser.id,
    images: [],
  };

  if (!payload.projectId || !payload.date || !payload.hours || !payload.notes) {
    return;
  }

  if (state.editingTimeId) {
    const index = state.data.timeReports.findIndex((report) => report.id === state.editingTimeId);
    if (index >= 0) {
      state.data.timeReports[index] = payload;
    }
  } else {
    state.data.timeReports.push(payload);
  }

  saveData();
  resetTimeForm();
  renderApp();
}

function bindUserActions() {
  userDirectory.querySelectorAll("[data-user-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const userId = button.getAttribute("data-user-id");
      const action = button.getAttribute("data-user-action");
      if (action === "delete") {
        deleteUser(userId);
      }
    });
  });
}

function bindEmployeeActions() {
  employeeDirectory.querySelectorAll("[data-employee-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const employeeId = button.getAttribute("data-employee-id");
      const action = button.getAttribute("data-employee-action");
      if (action === "delete") {
        deleteEmployee(employeeId);
      }
    });
  });
}

function renderItemCard(item, variant) {
  const ownerEntry = getEmployee(item.ownerId);
  const teamEntry = getTeam(item.teamId);
  const projectEntry = getProject(item.projectId);
  const owner = ownerEntry ? ownerEntry.name : "Ej vald";
  const team = teamEntry ? teamEntry.name : "Okant team";
  const project = projectEntry ? projectEntry.name : "Ej kopplat till projekt";
  const wrapperClass = variant === "agenda" ? "agenda-item" : "detail-item";
  const createdByUser = getUser(item.createdByUserId);
  const createdBy = createdByUser ? createdByUser.username : "okand";

  return `
    <div class="${wrapperClass}" data-item-id="${item.id}">
      <div class="${variant}-top">
        <div>
          <h3 class="item-title">${item.title}</h3>
          <div class="item-meta">
            ${shortMonthFormatter.format(fromDateKey(item.date))}, ${formatTimeRange(item)}<br>
            ${team} · ${owner}<br>
            Projekt: ${project}
          </div>
        </div>
        <span class="status-badge status-${item.status}">${getStatusLabel(item.status)}</span>
      </div>
      <div class="${variant}-tags">
        <span class="type-badge">${getTypeLabel(item.type)}</span>
        <span class="priority-badge priority-${item.priority}">${getPriorityLabel(item.priority)}</span>
        <span class="type-badge">Skapad av ${createdBy}</span>
      </div>
      <div class="item-meta">${item.notes || "Ingen anteckning registrerad."}</div>
      <div class="item-actions">
        <button class="item-action" type="button" data-action="status" data-item-id="${item.id}">Byt status</button>
        <button class="item-action" type="button" data-action="edit" data-item-id="${item.id}">Redigera</button>
        <button class="item-action warn" type="button" data-action="delete" data-item-id="${item.id}">Ta bort</button>
      </div>
    </div>
  `;
}

function bindItemActions(container) {
  container.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const itemId = button.getAttribute("data-item-id");
      const action = button.getAttribute("data-action");

      if (action === "status") {
        cycleStatus(itemId);
        return;
      }
      if (action === "edit") {
        startEdit(itemId);
        return;
      }
      if (action === "delete") {
        deleteItem(itemId);
      }
    });
  });
}

function bindProjectActions() {
  if (!isAdmin()) {
    return;
  }
  projectSummary.querySelectorAll("[data-project-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const projectId = button.getAttribute("data-project-id");
      const action = button.getAttribute("data-project-action");

      if (action === "edit") {
        startProjectEdit(projectId);
        return;
      }

      if (action === "delete") {
        deleteProject(projectId);
      }
    });
  });
}

function cycleStatus(itemId) {
  const order = ["planerad", "pagaende", "klar", "forsenad"];
  const item = state.data.items.find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }
  const currentIndex = order.indexOf(item.status);
  item.status = order[(currentIndex + 1) % order.length];
  saveData();
  renderApp();
}

function startEdit(itemId) {
  const item = state.data.items.find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }

  state.editingId = item.id;
  formTitle.textContent = "Redigera aktivitet";
  itemIdInput.value = item.id;
  titleInput.value = item.title;
  dateInput.value = item.date;
  projectInput.value = item.projectId || "";
  typeInput.value = item.type;
  startTimeInput.value = item.startTime;
  endTimeInput.value = item.endTime;
  teamInput.value = item.teamId;
  renderOwnerOptions(item.teamId);
  ownerInput.value = item.ownerId;
  statusInput.value = item.status;
  priorityInput.value = item.priority;
  notesInput.value = item.notes;
  createdByDisplay.value = getUser(item.createdByUserId) ? getUser(item.createdByUserId).username : "";
  planningForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function startProjectEdit(projectId) {
  if (!isAdmin()) {
    return;
  }
  const project = state.data.projects.find((entry) => entry.id === projectId);
  if (!project) {
    return;
  }

  state.editingProjectId = project.id;
  projectIdInput.value = project.id;
  projectNameInput.value = project.name;
  projectStartInput.value = project.startDate;
  projectEndInput.value = project.endDate;
  projectTeamInput.value = project.teamId;
  renderProjectOwnerOptions(project.teamId);
  projectOwnerInput.value = project.ownerId;
  projectStatusInput.value = project.status;
  projectBudgetInput.value = project.budgetStatus;
  projectColorInput.value = project.color || "#0f766e";
  projectNotesInput.value = project.notes;
  projectForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetForm() {
  state.editingId = null;
  formTitle.textContent = "Ny aktivitet";
  planningForm.reset();
  dateInput.value = state.selectedDate;
  teamInput.value = state.data.teams[0] ? state.data.teams[0].id : "";
  renderOwnerOptions(teamInput.value);
  statusInput.value = "planerad";
  priorityInput.value = "hog";
  projectInput.value = "";
  itemIdInput.value = "";
  createdByDisplay.value = getCurrentUser() ? getCurrentUser().username : "";
}

function resetProjectForm() {
  state.editingProjectId = null;
  projectForm.reset();
  projectIdInput.value = "";
  projectTeamInput.value = state.data.teams[0] ? state.data.teams[0].id : "";
  renderProjectOwnerOptions(projectTeamInput.value);
  projectStatusInput.value = "planerad";
  projectBudgetInput.value = "gron";
  projectColorInput.value = "#0f766e";
}

function deleteItem(itemId) {
  state.data.items = state.data.items.filter((item) => item.id !== itemId);
  if (state.editingId === itemId) {
    resetForm();
  }
  saveData();
  renderApp();
}

function deleteProject(projectId) {
  if (!isAdmin()) {
    return;
  }
  state.data.projects = state.data.projects.filter((project) => project.id !== projectId);
  state.data.items = state.data.items.map((item) => {
    if (item.projectId === projectId) {
      return { ...item, projectId: "" };
    }
    return item;
  });
  if (state.editingProjectId === projectId) {
    resetProjectForm();
  }
  if (state.filters.projectId === projectId) {
    state.filters.projectId = "alla";
  }
  saveData();
  renderApp();
}

function deleteUser(userId) {
  if (!isAdmin() || userId === state.session.userId) {
    return;
  }

  state.data.users = state.data.users.filter((user) => user.id !== userId);
  state.data.items = state.data.items.map((item) => {
    if (item.createdByUserId === userId) {
      return Object.assign({}, item, { createdByUserId: "" });
    }
    return item;
  });
  saveData();
  renderApp();
}

function setAdminMessage(message) {
  adminMessage.textContent = message || "";
}

function deleteEmployee(employeeId) {
  if (!isAdmin()) {
    return;
  }

  const hasUserLink = state.data.users.some((user) => user.employeeId === employeeId);
  const hasProjectLink = state.data.projects.some((project) => project.ownerId === employeeId);
  const hasItemLink = state.data.items.some((item) => item.ownerId === employeeId);

  if (hasUserLink || hasProjectLink || hasItemLink) {
    setAdminMessage("Anstallden kan inte tas bort forran kopplingar till anvandare, projekt och aktiviteter ar borttagna.");
    return;
  }

  state.data.employees = state.data.employees.filter((employee) => employee.id !== employeeId);
  saveData();
  setAdminMessage("Anstalld borttagen.");
  renderApp();
}

function handleLogin(event) {
  event.preventDefault();
  const username = loginUsername.value.trim().toLowerCase();
  const password = loginPassword.value;
  const user = state.data.users.find(
    (entry) => entry.active && entry.username.toLowerCase() === username && entry.password === password
  );

  if (!user) {
    loginMessage.textContent = "Fel anvandarnamn eller losenord.";
    return;
  }

  state.session = { userId: user.id };
  saveSession();
  loginMessage.textContent = "";
  loginForm.reset();
  renderRoot();
}

function handleLogout() {
  state.session = { userId: null };
  saveSession();
  renderRoot();
}

function handleSubmit(event) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return;
  }

  const payload = {
    id: state.editingId || uid("item"),
    title: titleInput.value.trim(),
    date: dateInput.value,
    projectId: projectInput.value,
    type: typeInput.value,
    startTime: startTimeInput.value,
    endTime: endTimeInput.value,
    teamId: teamInput.value,
    ownerId: ownerInput.value,
    status: statusInput.value,
    priority: priorityInput.value,
    notes: notesInput.value.trim(),
    createdByUserId: state.editingId
      ? ((state.data.items.find((item) => item.id === state.editingId) || {}).createdByUserId || currentUser.id)
      : currentUser.id,
  };

  if (!payload.title || !payload.date || !payload.teamId || !payload.ownerId) {
    return;
  }

  if (payload.projectId) {
    const project = getProject(payload.projectId);
    if (project) {
      payload.teamId = project.teamId;
      if (!state.data.employees.some((employee) => employee.id === payload.ownerId && employee.teamId === project.teamId)) {
        payload.ownerId = project.ownerId;
      }
    }
  }

  if (state.editingId) {
    const index = state.data.items.findIndex((item) => item.id === state.editingId);
    if (index >= 0) {
      state.data.items[index] = payload;
    }
  } else {
    state.data.items.push(payload);
  }

  const payloadDate = fromDateKey(payload.date);
  state.selectedDate = payload.date;
  state.currentMonth = new Date(payloadDate.getFullYear(), payloadDate.getMonth(), 1);
  saveData();
  resetForm();
  renderApp();
}

function handleProjectSubmit(event) {
  event.preventDefault();
  const payload = {
    id: state.editingProjectId || uid("project"),
    name: projectNameInput.value.trim(),
    startDate: projectStartInput.value,
    endDate: projectEndInput.value,
    teamId: projectTeamInput.value,
    ownerId: projectOwnerInput.value,
    status: projectStatusInput.value,
    budgetStatus: projectBudgetInput.value,
    color: projectColorInput.value,
    notes: projectNotesInput.value.trim(),
  };

  if (!payload.name || !payload.startDate || !payload.endDate || payload.endDate < payload.startDate) {
    return;
  }

  if (state.editingProjectId) {
    const index = state.data.projects.findIndex((project) => project.id === state.editingProjectId);
    if (index >= 0) {
      state.data.projects[index] = payload;
    }
  } else {
    state.data.projects.push(payload);
  }

  saveData();
  resetProjectForm();
  renderApp();
}

function handleEmployeeSubmit(event) {
  event.preventDefault();
  if (!isAdmin()) {
    return;
  }

  const name = employeeNameInput.value.trim();
  if (!name) {
    return;
  }

  const newEmployee = {
    id: slugify(name) || uid("employee"),
    name,
    teamId: employeeTeamInput.value,
    title: employeeTitleInput.value.trim(),
    email: employeeEmailInput.value.trim(),
  };

  if (state.data.employees.some((employee) => employee.id === newEmployee.id)) {
    newEmployee.id = uid("employee");
  }

  state.data.employees.push(newEmployee);
  saveData();
  employeeForm.reset();
  renderApp();
}

function handleUserSubmit(event) {
  event.preventDefault();
  if (!isAdmin()) {
    return;
  }

  const username = userUsernameInput.value.trim();
  const password = userPasswordInput.value;
  if (!username || !password) {
    return;
  }

  if (state.data.users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    return;
  }

  let employeeId = userEmployeeInput.value;
  if (!employeeId) {
    employeeId = slugify(username) || uid("employee");
    while (state.data.employees.some((employee) => employee.id === employeeId)) {
      employeeId = uid("employee");
    }

    state.data.employees.push({
      id: employeeId,
      name: username,
      teamId: state.data.teams[0] ? state.data.teams[0].id : "",
      title: EMPLOYEE_TITLES[1],
      email: "",
    });
  }

  state.data.users.push({
    id: uid("user"),
    username,
    password,
    role: userRoleInput.value,
    employeeId,
    active: true,
  });

  saveData();
  userForm.reset();
  renderApp();
}

function setSeedData() {
  state.data = cloneData(seedData);
  state.currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  state.selectedDate = toDateKey(today);
  state.editingId = null;
  state.editingProjectId = null;
  saveData();
  renderSelectOptions();
  resetForm();
  resetProjectForm();
  renderApp();
}

function renderRoot() {
  if (getCurrentUser()) {
    document.body.classList.add("logged-in");
    document.body.classList.remove("logged-out");
    loginScreen.classList.add("app-hidden");
    appShell.classList.remove("app-hidden");
    renderApp();
  } else {
    document.body.classList.add("logged-out");
    document.body.classList.remove("logged-in");
    appShell.classList.add("app-hidden");
    loginScreen.classList.remove("app-hidden");
  }
}

function renderApp() {
  renderActiveView();
  renderSessionHeader();
  renderSelectOptions();
  const visibleItems = getVisibleItems();
  renderMetrics(visibleItems);
  renderCalendar(visibleItems);
  renderSelectedDay(visibleItems);
  renderAgenda(visibleItems);
  renderProjects();
  renderDirectories();
  renderMyTimeReports();
  renderTimeAdminView();
}

loginForm.addEventListener("submit", handleLogin);
logoutButton.addEventListener("click", handleLogout);
planningViewButton.addEventListener("click", () => {
  state.currentView = "planning";
  renderApp();
});
timeViewButton.addEventListener("click", () => {
  state.currentView = "time";
  renderApp();
});
diaryViewButton.addEventListener("click", () => {
  state.currentView = "diary";
  renderApp();
});
planningForm.addEventListener("submit", handleSubmit);
projectForm.addEventListener("submit", handleProjectSubmit);
employeeForm.addEventListener("submit", handleEmployeeSubmit);
userForm.addEventListener("submit", handleUserSubmit);
timeReportForm.addEventListener("submit", handleTimeReportSubmit);

teamInput.addEventListener("change", () => {
  renderOwnerOptions(teamInput.value);
});

projectTeamInput.addEventListener("change", () => {
  renderProjectOwnerOptions(projectTeamInput.value);
});

projectInput.addEventListener("change", () => {
  const project = getProject(projectInput.value);
  if (project) {
    teamInput.value = project.teamId;
    renderOwnerOptions(project.teamId);
    ownerInput.value = project.ownerId;
  }
});

cancelEditButton.addEventListener("click", resetForm);
cancelProjectEditButton.addEventListener("click", resetProjectForm);
cancelTimeEditButton.addEventListener("click", resetTimeForm);

todayButton.addEventListener("click", () => {
  state.selectedDate = toDateKey(today);
  state.currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  renderApp();
});

seedButton.addEventListener("click", setSeedData);

prevButton.addEventListener("click", () => {
  state.currentMonth = new Date(
    state.currentMonth.getFullYear(),
    state.currentMonth.getMonth() - 1,
    1
  );
  renderApp();
});

nextButton.addEventListener("click", () => {
  state.currentMonth = new Date(
    state.currentMonth.getFullYear(),
    state.currentMonth.getMonth() + 1,
    1
  );
  renderApp();
});

teamFilter.addEventListener("change", () => {
  state.filters.teamId = teamFilter.value;
  renderApp();
});

statusFilter.addEventListener("change", () => {
  state.filters.status = statusFilter.value;
  renderApp();
});

projectFilter.addEventListener("change", () => {
  state.filters.projectId = projectFilter.value;
  renderApp();
});

searchInput.addEventListener("input", () => {
  state.filters.search = searchInput.value;
  renderApp();
});

clearFiltersButton.addEventListener("click", () => {
  state.filters = { teamId: "alla", status: "alla", projectId: "alla", search: "" };
  teamFilter.value = "alla";
  statusFilter.value = "alla";
  projectFilter.value = "alla";
  searchInput.value = "";
  renderApp();
});

renderSelectOptions();
resetForm();
resetProjectForm();
resetTimeForm();
renderRoot();
