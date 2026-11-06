const STORAGE_KEY = "iskolar-link-demo-v1";

const scholarships = [
  { id: "tdp", name: "Tulong Dunong Program (TDP)", provider: "Commission on Higher Education", acronym: "TDP", category: "Government", amount: "₱7,500 / semester", deadline: "2026-12-15", description: "Financial assistance for qualified Filipino students pursuing an undergraduate degree.", eligibility: "Filipino citizen, enrolled in an eligible undergraduate program, and with a household income within CHED guidelines.", requirements: ["Certificate of registration or enrollment", "Latest income tax return or certificate of indigency", "Valid school ID", "Latest grades or transcript"] },
  { id: "tes", name: "Tertiary Education Subsidy (TES)", provider: "UniFAST · CHED", acronym: "TES", category: "Government", amount: "Up to ₱20,000 / year", deadline: "2026-12-20", description: "Education support for students enrolled in eligible public or private higher education institutions.", eligibility: "Enrolled in an eligible institution and qualified under current UniFAST prioritization guidelines.", requirements: ["Certificate of registration", "Proof of household income", "Valid government-issued ID", "Student information sheet"] },
  { id: "smart", name: "Smart Wireless Engineering Education Program", provider: "Smart Communications", acronym: "S", category: "Private", amount: "Full tuition + stipend", deadline: "2027-01-10", description: "A merit-based scholarship supporting future engineers and technology innovators.", eligibility: "Filipino incoming third-year engineering student with a strong academic record and no failing grades.", requirements: ["Latest grades or transcript", "Certificate of enrollment", "Personal essay", "Two recommendation letters"] },
  { id: "ched", name: "CHED Merit Scholarship Program", provider: "Commission on Higher Education", acronym: "C", category: "Government", amount: "Up to ₱120,000 / year", deadline: "2027-01-31", description: "Merit-based support for academically talented Filipino students entering college.", eligibility: "Graduating senior high school student with a strong academic record and household income within program limits.", requirements: ["Senior high school report card", "Certificate of good moral character", "Proof of income", "Birth certificate"] },
  { id: "dost", name: "DOST-SEI Undergraduate Scholarship", provider: "Department of Science and Technology", acronym: "DOST", category: "Government", amount: "Tuition + monthly stipend", deadline: "2027-02-14", description: "Support for talented students pursuing priority science, technology, engineering, and mathematics courses.", eligibility: "Filipino graduating senior high school student enrolling in a DOST priority STEM program.", requirements: ["Academic records", "Proof of Filipino citizenship", "Medical certificate", "Parent or guardian income documents"] },
  { id: "lgu", name: "City Scholars Assistance Grant", provider: "Office of the City Mayor", acronym: "LGU", category: "Local", amount: "₱5,000 / semester", deadline: "2027-02-28", description: "Local education assistance for eligible residents enrolled in an accredited college or university.", eligibility: "Resident of the city for at least one year, currently enrolled, and meeting the minimum grade requirement.", requirements: ["Proof of residency", "Certificate of enrollment", "Latest grades", "Two 2×2 ID photos"] }
];

const announcements = [
  { date: "NOV 06", title: "TDP applications are now open", text: "Submit your requirements for the Tulong Dunong Program before December 15, 2026. Make sure your enrollment certificate is up to date.", tag: "Application window" },
  { date: "NOV 03", title: "TES payout schedule updated", text: "The next TES release is expected on November 28. Approved students will receive a confirmation when their school records are verified.", tag: "Payout update" },
  { date: "OCT 29", title: "Scholarship orientation: November 12", text: "Join the online orientation to learn about application requirements, deadlines, and how to keep your scholarship in good standing.", tag: "Event" }
];

const seedData = {
  profiles: {},
  applications: [
    { id: "IL-2026-0142", scholarshipId: "tes", student: "Juan Dela Cruz", email: "juan.delacruz@school.edu.ph", course: "BS Information Technology", year: "2nd year", submitted: "2026-10-28", status: "Pending", note: "", files: ["Certificate of enrollment.pdf", "School ID.jpg"] },
    { id: "IL-2026-0108", scholarshipId: "smart", student: "Juan Dela Cruz", email: "juan.delacruz@school.edu.ph", course: "BS Information Technology", year: "2nd year", submitted: "2026-10-12", status: "Approved", note: "", files: ["Transcript.pdf", "Personal essay.pdf"] }
  ],
  payouts: [
    { scholarship: "Tertiary Education Subsidy (TES)", period: "1st semester · AY 2026–2027", date: "2026-11-28", status: "Scheduled" },
    { scholarship: "Smart Wireless Engineering Education Program", period: "1st semester · AY 2026–2027", date: "2026-12-10", status: "Processing" },
    { scholarship: "Tulong Dunong Program (TDP)", period: "2nd semester · AY 2026–2027", date: "2027-02-15", status: "Upcoming" }
  ]
};

let state = loadState();
let activeView = "overview";
let selectedScholarship = null;
let lastFocusedElement = null;
let toastTimer;
let reviewSearchValue = "";
let reviewStatusValue = "all";

const loginView = document.querySelector("#login-view");
const dashboardView = document.querySelector("#dashboard-view");
const pageContainer = document.querySelector("#page-container");
const modalRoot = document.querySelector("#modal-root");
const toastRegion = document.querySelector("#toast-region");

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ...structuredClone(seedData), user: null };
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.applications) || !Array.isArray(parsed.payouts)) throw new Error("Saved demo data has an invalid shape.");
    const profiles = parsed.profiles && typeof parsed.profiles === "object" && !Array.isArray(parsed.profiles) ? parsed.profiles : {};
    return { ...parsed, profiles, user: parsed.user || null };
  } catch (error) {
    console.error("Could not load saved ISKOLAR LINK demo data.", error);
    return { ...structuredClone(seedData), user: null };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Could not save ISKOLAR LINK demo data.", error);
    showToast("Your browser could not save this update. Check your storage settings.");
  }
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function formatDate(value, options = { month: "short", day: "numeric", year: "numeric" }) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-PH", options);
}

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
}

function scholarshipById(id) {
  return scholarships.find((item) => item.id === id);
}

function statusClass(status) {
  return `status-${status.toLowerCase().replace(/\s+/g, "-")}`;
}

function statusBadge(status) {
  return `<span class="status ${statusClass(status)}">${escapeHTML(status)}</span>`;
}

function showToast(message) {
  toastRegion.innerHTML = `<div class="toast"><strong>ISKOLAR LINK</strong> · ${escapeHTML(message)}</div>`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastRegion.innerHTML = ""; }, 4200);
}

function getMyApplications() {
  if (!state.user) return [];
  return state.applications.filter((app) => app.accountKey
    ? app.accountKey === state.user.accountKey
    : app.student === state.user.name);
}

function login(name, role, identity = name) {
  const accountKey = String(identity).trim().toLowerCase();
  if (role === "student") {
    const nameFromIdentity = identity.includes("@") ? identity.split("@")[0].replace(/[._-]+/g, " ") : name;
    const fallbackName = nameFromIdentity.split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
    const existingApplication = state.applications.find((app) => app.accountKey === accountKey
      || app.email?.toLowerCase() === accountKey
      || app.student.toLowerCase() === name.toLowerCase());
    const profile = {
      fullName: existingApplication?.student || fallbackName,
      email: identity.includes("@") ? identity : existingApplication?.email || `${accountKey.replace(/\s+/g, ".")}@school.edu.ph`,
      studentId: "",
      course: existingApplication?.course || "",
      year: existingApplication?.year || "",
      phone: "",
      campus: "Marinduque State University",
      ...state.profiles[accountKey]
    };
    state.user = { ...profile, name: profile.fullName, role, accountKey };
    state.profiles[accountKey] = profile;
  } else {
    state.user = { name, role, accountKey };
  }
  saveState();
  loginView.hidden = true;
  dashboardView.hidden = false;
  updateUserChip();
  document.querySelectorAll(".faculty-only").forEach((item) => { item.hidden = role !== "faculty"; });
  document.querySelectorAll(".student-only").forEach((item) => { item.hidden = role !== "student"; });
  document.querySelector("#review-count").textContent = state.applications.filter((app) => app.status === "Pending" || app.status === "For review").length;
  renderPage("overview");
  document.querySelector("#main-content").focus();
}

function logout() {
  if (state.user?.role === "student") {
    const { fullName, email, studentId, course, year, phone, campus } = state.user;
    state.profiles[state.user.accountKey] = { fullName, email, studentId, course, year, phone, campus };
  }
  state.user = null;
  saveState();
  dashboardView.hidden = true;
  loginView.hidden = false;
  document.querySelector("#login-password").value = "";
  document.querySelector("#login-email").focus();
}

function pageHeading(eyebrow, title, description, actions = "") {
  return `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${description}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ""}</div>`;
}

function renderPage(view = activeView) {
  if (view === "account" && state.user?.role !== "student") view = "overview";
  activeView = view;
  const labels = { overview: "Overview", scholarships: "Scholarships", applications: "My applications", account: "My student account", payouts: "Payout schedule", announcements: "Announcements", reviews: "Review applications" };
  document.querySelector("#breadcrumb-current").textContent = labels[view] || "Overview";
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.nav === view));
  const renderers = { overview: renderOverview, scholarships: renderScholarships, applications: renderApplications, account: renderStudentAccount, payouts: renderPayouts, announcements: renderAnnouncements, reviews: renderReviews };
  pageContainer.innerHTML = (renderers[view] || renderOverview)();
  if (view === "scholarships") attachScholarshipFilters();
  if (view === "reviews") attachReviewFilters();
  if (view === "account") attachProfileForm();
}

function renderOverview() {
  const mine = getMyApplications();
  const approved = mine.filter((app) => app.status === "Approved").length;
  const pending = mine.filter((app) => ["Pending", "For review", "Under review"].includes(app.status)).length;
  const nearest = scholarships.filter((item) => item.deadline >= "2026-11-06").sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 3);
  const intro = state.user.role === "faculty"
    ? `<div class="welcome-copy"><p class="eyebrow">FACULTY WORKSPACE</p><h1>Good day, ${escapeHTML(state.user.name.split(" ")[0])}.</h1><p>Review applications, verify student requirements, and keep every scholarship moving forward.</p></div><div class="banner-badge" aria-hidden="true">✦</div>`
    : `<div class="welcome-copy"><p class="eyebrow">YOUR SCHOLARSHIP JOURNEY</p><h1>Good day, ${escapeHTML(state.user.name.split(" ")[0])} <span aria-hidden="true">✦</span></h1><p>Your next opportunity is closer than you think. Explore scholarships and keep your applications on track.</p></div><div class="banner-badge" aria-hidden="true">✦</div>`;
  const visibleApplications = state.user.role === "faculty" ? state.applications.slice(0, 3) : mine.slice(0, 3);
  const applicationsPanel = visibleApplications.length
    ? visibleApplications.map((app) => {
      const scholarship = scholarshipById(app.scholarshipId);
      return `<div class="application-row"><div class="org-mark">${escapeHTML(scholarship?.acronym || "IL")}</div><div class="row-main"><strong>${escapeHTML(scholarship?.name || "Scholarship")}</strong><span>${state.user.role === "faculty" ? `${escapeHTML(app.student)} · ` : ""}Submitted ${formatDate(app.submitted, { month: "short", day: "numeric" })}</span></div>${statusBadge(app.status)}</div>`;
    }).join("")
    : `<div class="empty-state"><strong>No applications yet</strong>Explore available scholarships and submit your first application.</div>`;
  return `<div class="welcome-banner">${intro}</div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-top"><span>Available scholarships</span><span class="stat-icon">▤</span></div><div class="stat-value">${scholarships.length}<span class="stat-note">open opportunities</span></div></div>
      <div class="stat-card"><div class="stat-top"><span>${state.user.role === "faculty" ? "To review" : "Applications sent"}</span><span class="stat-icon yellow">▣</span></div><div class="stat-value">${state.user.role === "faculty" ? state.applications.filter((app) => app.status === "Pending" || app.status === "For review").length : mine.length}<span class="stat-note">${state.user.role === "faculty" ? "need your attention" : "in your dashboard"}</span></div></div>
      <div class="stat-card"><div class="stat-top"><span>${state.user.role === "faculty" ? "Approved" : "Approved applications"}</span><span class="stat-icon green">✓</span></div><div class="stat-value">${state.user.role === "faculty" ? state.applications.filter((app) => app.status === "Approved").length : approved}<span class="stat-note">this school year</span></div></div>
      <div class="stat-card"><div class="stat-top"><span>${state.user.role === "faculty" ? "Pending review" : "Awaiting review"}</span><span class="stat-icon yellow">◷</span></div><div class="stat-value">${state.user.role === "faculty" ? state.applications.filter((app) => ["Pending", "For review", "Under review"].includes(app.status)).length : pending}<span class="stat-note">we'll keep you posted</span></div></div>
    </div>
    <div class="content-grid">
      <div class="stack">
        <section class="panel" aria-labelledby="recent-apps-title"><div class="panel-header"><div><h2 class="panel-title" id="recent-apps-title">${state.user.role === "faculty" ? "Recent applications" : "Your applications"}</h2><p class="panel-subtitle">${state.user.role === "faculty" ? "Latest student submissions" : "Keep an eye on your application status"}</p></div><button class="text-link" type="button" data-nav="applications">${state.user.role === "faculty" ? "View all" : "View all"} →</button></div><div class="panel-body">${applicationsPanel}</div></section>
        <section class="panel" aria-labelledby="deadlines-title"><div class="panel-header"><div><h2 class="panel-title" id="deadlines-title">Upcoming deadlines</h2><p class="panel-subtitle">A few opportunities to keep on your radar</p></div><button class="text-link" type="button" data-nav="scholarships">Browse all →</button></div><div class="panel-body deadline-list">${nearest.map((item) => `<div class="deadline-item"><div><strong>${escapeHTML(item.name)}</strong><br><span>${escapeHTML(item.category)} scholarship</span></div><span class="deadline-date">${formatDate(item.deadline, { month: "short", day: "numeric" })}</span></div>`).join("")}</div></section>
      </div>
      <div class="stack">
        <section class="panel" aria-labelledby="announcement-preview-title"><div class="panel-header"><div><h2 class="panel-title" id="announcement-preview-title">Latest announcements</h2><p class="panel-subtitle">News from your scholarship office</p></div><button class="text-link" type="button" data-nav="announcements">See all →</button></div><div class="panel-body">${announcements.slice(0, 2).map((item) => `<div class="announcement-item"><div class="announcement-date">${escapeHTML(item.date)}</div><div class="announcement-copy"><strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.text)}</p></div></div>`).join("")}</div></section>
        <section class="panel" aria-labelledby="payout-preview-title"><div class="panel-header"><div><h2 class="panel-title" id="payout-preview-title">Next payout</h2><p class="panel-subtitle">Your upcoming release schedule</p></div><button class="text-link" type="button" data-nav="payouts">View →</button></div><div class="panel-body">${renderPayoutRows(state.payouts.slice(0, 2))}</div></section>
      </div>
    </div>`;
}

function scholarshipCard(item) {
  const alreadyApplied = state.applications.some((app) => app.scholarshipId === item.id && (app.accountKey === state.user.accountKey || (!app.accountKey && app.student === state.user.name)));
  const days = Math.ceil((new Date(`${item.deadline}T23:59:59`) - new Date()) / 86400000);
  return `<article class="scholarship-card"><div class="scholarship-card-top"><div class="org-mark ${item.category === "Private" ? "yellow" : ""}">${escapeHTML(item.acronym)}</div><span class="status ${days <= 30 ? "status-pending" : "status-approved"}">${days >= 0 ? `${days} days left` : "Deadline passed"}</span></div><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.description)}</p><div class="card-meta"><span><strong>Grant</strong> ${escapeHTML(item.amount)}</span><span><strong>Type</strong> ${escapeHTML(item.category)}</span></div><div class="card-footer"><span class="muted">Deadline ${formatDate(item.deadline, { month: "short", day: "numeric", year: "numeric" })}</span><button class="button ${alreadyApplied ? "button-secondary" : "button-primary"}" type="button" data-scholarship="${item.id}" data-action="${alreadyApplied ? "details" : "apply"}">${alreadyApplied ? "View status" : "View & apply"}</button></div></article>`;
}

function renderScholarships() {
  const heading = pageHeading("FIND YOUR NEXT OPPORTUNITY", "Scholarship programs", "Explore financial support that can help you reach your academic goals.", `<button class="button button-secondary" type="button" data-nav="applications">My applications</button>`);
  return `${heading}<div class="search-filter-bar"><div class="search-wrap"><label class="skip-link" for="scholarship-search">Search scholarships</label><input id="scholarship-search" class="text-input" type="search" placeholder="Search scholarships or providers…" aria-label="Search scholarships or providers"></div><label class="skip-link" for="scholarship-category">Filter by category</label><select id="scholarship-category" class="select-input" aria-label="Filter by scholarship category"><option value="all">All categories</option><option value="Government">Government</option><option value="Private">Private</option><option value="Local">Local</option></select><label class="skip-link" for="scholarship-sort">Sort scholarships</label><select id="scholarship-sort" class="select-input" aria-label="Sort scholarships"><option value="deadline">Closing soon</option><option value="name">Name A–Z</option></select></div><div id="scholarship-results" class="scholarship-grid" aria-live="polite">${scholarships.slice().sort((a, b) => a.deadline.localeCompare(b.deadline)).map(scholarshipCard).join("")}</div>`;
}

function attachScholarshipFilters() {
  const search = document.querySelector("#scholarship-search");
  const category = document.querySelector("#scholarship-category");
  const sort = document.querySelector("#scholarship-sort");
  const update = () => {
    const query = search.value.trim().toLowerCase();
    let results = scholarships.filter((item) => (category.value === "all" || item.category === category.value) && `${item.name} ${item.provider} ${item.description}`.toLowerCase().includes(query));
    if (sort.value === "deadline") results = results.sort((a, b) => a.deadline.localeCompare(b.deadline));
    if (sort.value === "name") results = results.sort((a, b) => a.name.localeCompare(b.name));
    document.querySelector("#scholarship-results").innerHTML = results.length ? results.map(scholarshipCard).join("") : `<div class="empty-state"><strong>No scholarships found</strong>Try changing your search or category filter.</div>`;
  };
  search.addEventListener("input", update);
  category.addEventListener("change", update);
  sort.addEventListener("change", update);
}

function renderApplications() {
  const apps = state.user.role === "faculty" ? state.applications : getMyApplications();
  const rows = apps.map((app) => {
    const item = scholarshipById(app.scholarshipId);
    return `<tr><td><div class="table-program"><span class="org-mark">${escapeHTML(item?.acronym || "IL")}</span><strong>${escapeHTML(item?.name || "Scholarship")}</strong></div></td>${state.user.role === "faculty" ? `<td>${escapeHTML(app.student)}</td>` : ""}<td>${formatDate(app.submitted)}</td><td>${statusBadge(app.status)}</td><td><button class="table-action" type="button" data-application="${escapeHTML(app.id)}" data-action="${state.user.role === "faculty" ? "review" : "details"}">${state.user.role === "faculty" ? "Review" : "Details"}</button></td></tr>`;
  }).join("");
  return `${pageHeading(state.user.role === "faculty" ? "STUDENT SUBMISSIONS" : "YOUR SCHOLARSHIP JOURNEY", state.user.role === "faculty" ? "All applications" : "My applications", state.user.role === "faculty" ? "Open a submission to verify documents and update its review status." : "Track each application and check for status updates.")}<section class="panel"><div class="panel-header"><div><h2 class="panel-title">Application records</h2><p class="panel-subtitle">${apps.length} ${apps.length === 1 ? "application" : "applications"} on file</p></div></div>${apps.length ? `<div class="application-table-wrap"><table class="application-table"><thead><tr><th scope="col">SCHOLARSHIP</th>${state.user.role === "faculty" ? `<th scope="col">STUDENT</th>` : ""}<th scope="col">SUBMITTED</th><th scope="col">STATUS</th><th scope="col"><span class="skip-link">Action</span></th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="empty-state"><strong>No applications yet</strong>Browse scholarships to get started.</div>`}</section>`;
}

function renderStudentAccount() {
  const applications = getMyApplications();
  const approved = applications.filter((app) => app.status === "Approved").length;
  const pending = applications.filter((app) => ["Pending", "Under review", "For review"].includes(app.status)).length;
  const profileFields = [state.user.fullName, state.user.email, state.user.studentId, state.user.course, state.user.year, state.user.phone];
  const completion = Math.round(profileFields.filter(Boolean).length / profileFields.length * 100);
  const yearOptions = ["1st year", "2nd year", "3rd year", "4th year", "5th year"];
  return `${pageHeading("YOUR PERSONAL SPACE", "My student account", "View your student profile and manage the details used in scholarship applications.", `<button class="button button-secondary" type="button" data-nav="applications">View applications</button>`)}
    <section class="account-hero">
      <img src="assets/msu-seal.png" alt="Marinduque State University seal" width="70" height="70">
      <div class="account-hero-copy"><p class="eyebrow">STUDENT PROFILE</p><h2>${escapeHTML(state.user.fullName || state.user.name)}</h2><p>${escapeHTML(state.user.course || "Add your course")} ${state.user.year ? `· ${escapeHTML(state.user.year)}` : ""}</p><span class="account-campus">${escapeHTML(state.user.campus || "Marinduque State University")}</span></div>
      <div class="profile-completion"><strong>${completion}%</strong><span>Profile complete</span><div class="completion-track" role="progressbar" aria-label="Profile completeness" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${completion}"><span style="width:${completion}%"></span></div></div>
    </section>
    <div class="content-grid account-content-grid">
      <section class="panel" aria-labelledby="student-details-title"><div class="panel-header"><div><h2 class="panel-title" id="student-details-title">Student information</h2><p class="panel-subtitle">Keep these details current for your applications.</p></div></div>
        <form id="student-profile-form"><div class="panel-body"><div class="form-grid">
          <div class="form-field"><label for="profile-full-name">Full name <span aria-hidden="true">*</span></label><input class="text-input" id="profile-full-name" name="fullName" autocomplete="name" required value="${escapeHTML(state.user.fullName || "")}"></div>
          <div class="form-field"><label for="profile-student-id">Student number</label><input class="text-input" id="profile-student-id" name="studentId" autocomplete="off" placeholder="Enter your student number" value="${escapeHTML(state.user.studentId || "")}"></div>
          <div class="form-field"><label for="profile-email">School email <span aria-hidden="true">*</span></label><input class="text-input" id="profile-email" name="email" type="email" autocomplete="email" required value="${escapeHTML(state.user.email || "")}"></div>
          <div class="form-field"><label for="profile-phone">Contact number</label><input class="text-input" id="profile-phone" name="phone" type="tel" autocomplete="tel" placeholder="e.g. 09XX XXX XXXX" value="${escapeHTML(state.user.phone || "")}"></div>
          <div class="form-field"><label for="profile-course">Course / program <span aria-hidden="true">*</span></label><input class="text-input" id="profile-course" name="course" required placeholder="e.g. BS Education" value="${escapeHTML(state.user.course || "")}"></div>
          <div class="form-field"><label for="profile-year">Year level <span aria-hidden="true">*</span></label><select class="select-input" id="profile-year" name="year" required><option value="">Select year</option>${yearOptions.map((year) => `<option ${state.user.year === year ? "selected" : ""}>${year}</option>`).join("")}</select></div>
          <div class="form-field full"><label for="profile-campus">Campus</label><input class="text-input" id="profile-campus" name="campus" value="${escapeHTML(state.user.campus || "Marinduque State University")}"></div>
        </div></div><div class="modal-footer"><button class="button button-primary" type="submit">Save student details</button></div></form>
      </section>
      <div class="stack">
        <section class="panel" aria-labelledby="student-summary-title"><div class="panel-header"><div><h2 class="panel-title" id="student-summary-title">Scholarship snapshot</h2><p class="panel-subtitle">Your application activity at a glance.</p></div></div><div class="panel-body"><div class="account-stat-grid"><div class="account-stat"><strong>${applications.length}</strong><span>Total applications</span></div><div class="account-stat"><strong>${approved}</strong><span>Approved</span></div><div class="account-stat"><strong>${pending}</strong><span>Awaiting review</span></div></div><button class="button button-secondary button-wide" type="button" data-nav="applications">Track my applications →</button></div></section>
        <section class="panel" aria-labelledby="account-help-title"><div class="panel-header"><h2 class="panel-title" id="account-help-title">Your account</h2></div><div class="panel-body"><p class="account-help"><strong>Student access</strong><span>Your profile is saved in this browser and used to prefill scholarship applications.</span></p><p class="account-help"><strong>Need to update official records?</strong><span>Contact the scholarship coordinator if your student information needs verification.</span></p><a class="text-link" href="mailto:scholarships@iskolarlink.edu.ph">Contact coordinator →</a></div></section>
      </div>
    </div>`;
}

function attachProfileForm() {
  const form = document.querySelector("#student-profile-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const oldName = state.user.name;
    const profile = {
      fullName: formData.get("fullName").trim(),
      email: formData.get("email").trim(),
      studentId: formData.get("studentId").trim(),
      course: formData.get("course").trim(),
      year: formData.get("year"),
      phone: formData.get("phone").trim(),
      campus: formData.get("campus").trim()
    };
    state.user = { ...state.user, ...profile, name: profile.fullName };
    state.profiles[state.user.accountKey] = profile;
    state.applications.forEach((app) => {
      if (app.accountKey === state.user.accountKey || (!app.accountKey && app.student === oldName)) {
        app.accountKey = state.user.accountKey;
        app.student = profile.fullName;
        app.email = profile.email;
        app.course = profile.course;
        app.year = profile.year;
      }
    });
    saveState();
    updateUserChip();
    renderPage("account");
    document.querySelector("#main-content").focus();
    showToast("Your student account details have been saved.");
  });
}

function renderPayoutRows(items) {
  if (!items.length) return `<div class="empty-state">No payout schedules yet.</div>`;
  return items.map((item) => `<div class="payout-row"><div class="payout-date-box">${formatDate(item.date, { month: "short", day: "numeric" }).replace(" ", "<br>")}</div><div class="row-main"><strong>${escapeHTML(item.scholarship)}</strong><span>${escapeHTML(item.period)} · ${escapeHTML(item.status)}</span></div><span class="status ${item.status === "Scheduled" ? "status-approved" : "status-pending"}">${escapeHTML(item.status)}</span></div>`).join("");
}

function renderPayouts() {
  return `${pageHeading("RELEASE DATES & UPDATES", "Payout schedule", "Stay informed about your expected scholarship grant releases.")}<section class="panel"><div class="panel-header"><div><h2 class="panel-title">Upcoming releases</h2><p class="panel-subtitle">Dates are indicative and may change based on school verification.</p></div></div><div class="panel-body">${renderPayoutRows(state.payouts)}</div></section><div class="content-grid" style="margin-top:17px"><section class="panel"><div class="panel-header"><h2 class="panel-title">What happens next?</h2></div><div class="panel-body"><p class="muted">Payout dates are shared by the scholarship coordinator. Make sure your enrollment and bank or payment details are up to date with your school. You will receive a notification when your release is confirmed.</p></div></section><section class="panel"><div class="panel-header"><h2 class="panel-title">Need payout help?</h2></div><div class="panel-body"><p class="muted">If your scholarship is approved but no release is listed, contact your school scholarship coordinator for assistance.</p><a class="text-link" href="mailto:scholarships@iskolarlink.edu.ph">Contact coordinator →</a></div></section></div>`;
}

function renderAnnouncements() {
  return `${pageHeading("NEWS FROM YOUR SCHOLARSHIP OFFICE", "Announcements", "Important scholarship news, reminders, and events.")}<section class="panel"><div class="panel-header"><div><h2 class="panel-title">Latest updates</h2><p class="panel-subtitle">Stay in the loop with your scholarship community.</p></div></div><div class="panel-body">${announcements.map((item) => `<article class="announcement-full"><span class="announcement-date">${escapeHTML(item.date)} · ${escapeHTML(item.tag)}</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.text)}</p></article>`).join("")}</div></section>`;
}

function renderReviews() {
  if (state.user.role !== "faculty") return renderOverview();
  const filter = reviewStatusValue;
  return `${pageHeading("FACULTY WORKSPACE", "Review applications", "Verify submitted requirements and keep students informed of their application status.")}<div class="search-filter-bar"><div class="search-wrap"><input id="review-search" class="text-input" type="search" value="${escapeHTML(reviewSearchValue)}" placeholder="Search by student, program, or ID…" aria-label="Search applications"></div><select id="review-status" class="select-input" aria-label="Filter applications by status"><option value="all" ${filter === "all" ? "selected" : ""}>All statuses</option><option value="pending" ${filter === "pending" ? "selected" : ""}>Pending</option><option value="under review" ${filter === "under review" ? "selected" : ""}>Under review</option><option value="approved" ${filter === "approved" ? "selected" : ""}>Approved</option><option value="rejected" ${filter === "rejected" ? "selected" : ""}>Rejected</option></select></div><div id="review-results">${renderReviewResults()}</div>`;
}

function renderReviewResults() {
  const query = reviewSearchValue.trim().toLowerCase();
  const filter = reviewStatusValue;
  const apps = state.applications.filter((app) => {
    const item = scholarshipById(app.scholarshipId);
    return (filter === "all" || app.status.toLowerCase() === filter) && `${app.student} ${item?.name || ""} ${app.id}`.toLowerCase().includes(query);
  });
  const rows = apps.map((app) => {
    const item = scholarshipById(app.scholarshipId);
    return `<tr><td><div class="table-program"><span class="org-mark">${escapeHTML(item?.acronym || "IL")}</span><strong>${escapeHTML(item?.name || "Scholarship")}</strong></div></td><td>${escapeHTML(app.student)}<br><span class="muted">${escapeHTML(app.course || "")}</span></td><td>${formatDate(app.submitted)}</td><td>${statusBadge(app.status)}</td><td><button class="table-action" type="button" data-application="${escapeHTML(app.id)}" data-action="review">Review</button></td></tr>`;
  }).join("");
  return `<section class="panel"><div class="panel-header"><div><h2 class="panel-title">Submitted applications</h2><p class="panel-subtitle">${apps.length} records match your filters</p></div></div>${apps.length ? `<div class="application-table-wrap"><table class="application-table"><thead><tr><th scope="col">SCHOLARSHIP</th><th scope="col">STUDENT</th><th scope="col">SUBMITTED</th><th scope="col">STATUS</th><th scope="col"><span class="skip-link">Action</span></th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="empty-state"><strong>No matching applications</strong>Try changing the search or status filter.</div>`}</section>`;
}

function attachReviewFilters() {
  const search = document.querySelector("#review-search");
  const status = document.querySelector("#review-status");
  const update = () => {
    reviewSearchValue = search.value;
    reviewStatusValue = status.value;
    document.querySelector("#review-results").innerHTML = renderReviewResults();
  };
  search.addEventListener("input", update);
  status.addEventListener("change", update);
}

function openScholarship(id, apply = false) {
  selectedScholarship = scholarshipById(id);
  if (!selectedScholarship) return;
  const existing = state.applications.find((app) => app.scholarshipId === id && (app.accountKey === state.user.accountKey || (!app.accountKey && app.student === state.user.name)));
  if (apply && existing) {
    openApplicationDetails(existing.id);
    return;
  }
  lastFocusedElement = document.activeElement;
  const scholarship = selectedScholarship;
  modalRoot.innerHTML = `<div class="modal-backdrop" data-backdrop><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description"><div class="modal-header"><div><h2 id="modal-title">${apply ? "Apply for this scholarship" : escapeHTML(scholarship.name)}</h2><p id="modal-description">${apply ? `Submit your details for ${escapeHTML(scholarship.name)}.` : escapeHTML(scholarship.provider)}</p></div><button class="modal-close" type="button" aria-label="Close dialog" data-close>×</button></div>${apply ? `<form id="application-form"><div class="modal-body"><div class="detail-grid"><div><div class="detail-list"><div class="detail-item"><span>Scholarship grant</span><strong>${escapeHTML(scholarship.amount)}</strong></div><div class="detail-item"><span>Application deadline</span><strong>${formatDate(scholarship.deadline)}</strong></div></div><h3 class="panel-title">Eligibility</h3><p class="muted" style="font-size:10px;margin:8px 0 16px">${escapeHTML(scholarship.eligibility)}</p><h3 class="panel-title">Required documents</h3><ul class="requirement-list" style="margin-top:10px">${scholarship.requirements.map((requirement) => `<li><span class="requirement-check" aria-hidden="true">✓</span>${escapeHTML(requirement)}</li>`).join("")}</ul></div><div><div class="form-grid">  <div class="form-field full"><label for="app-full-name">Full name <span aria-hidden="true">*</span></label><input class="text-input" id="app-full-name" name="fullName" required value="${escapeHTML(state.user.fullName || state.user.name)}"></div><div class="form-field full"><label for="app-email">School email <span aria-hidden="true">*</span></label><input class="text-input" id="app-email" name="email" type="email" required value="${escapeHTML(state.user.email || "")}"></div><div class="form-field"><label for="app-course">Course / program <span aria-hidden="true">*</span></label><input class="text-input" id="app-course" name="course" required placeholder="e.g. BS Education" value="${escapeHTML(state.user.course || "")}"></div><div class="form-field"><label for="app-year">Year level <span aria-hidden="true">*</span></label><select class="select-input" id="app-year" name="year" required><option value="">Select year</option><option ${state.user.year === "1st year" ? "selected" : ""}>1st year</option><option ${state.user.year === "2nd year" ? "selected" : ""}>2nd year</option><option ${state.user.year === "3rd year" ? "selected" : ""}>3rd year</option><option ${state.user.year === "4th year" ? "selected" : ""}>4th year</option><option ${state.user.year === "5th year" ? "selected" : ""}>5th year</option></select></div><div class="form-field full"><label for="app-documents">Upload documents or images <span aria-hidden="true">*</span></label><div class="upload-drop"><input id="app-documents" name="documents" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple required aria-describedby="upload-help"><p id="upload-help">PDF, JPG, PNG, or DOC · up to 5 MB each. Files stay in this browser demo.</p></div><div id="selected-files" class="file-list" aria-live="polite"></div></div></div></div></div><div class="modal-footer"><button class="button button-secondary" type="button" data-close>Cancel</button><button class="button button-primary" type="submit">Submit application →</button></div></form>` : `<div class="modal-body"><div class="detail-list"><div class="detail-item"><span>Scholarship grant</span><strong>${escapeHTML(scholarship.amount)}</strong></div><div class="detail-item"><span>Application deadline</span><strong>${formatDate(scholarship.deadline)}</strong></div><div class="detail-item"><span>Scholarship type</span><strong>${escapeHTML(scholarship.category)}</strong></div><div class="detail-item"><span>Provider</span><strong>${escapeHTML(scholarship.provider)}</strong></div></div><h3 class="panel-title">About this scholarship</h3><p class="muted" style="font-size:11px;margin:8px 0 18px">${escapeHTML(scholarship.description)}</p><h3 class="panel-title">Eligibility</h3><p class="muted" style="font-size:11px;margin:8px 0 18px">${escapeHTML(scholarship.eligibility)}</p><h3 class="panel-title">Required documents</h3><ul class="requirement-list" style="margin-top:11px">${scholarship.requirements.map((requirement) => `<li><span class="requirement-check" aria-hidden="true">✓</span>${escapeHTML(requirement)}</li>`).join("")}</ul></div><div class="modal-footer"><button class="button button-secondary" type="button" data-close>Close</button><button class="button button-primary" type="button" data-modal-apply="${scholarship.id}">${existing ? "View application status" : "Apply now →"}</button></div>`}</section></div>`;
  setupModal();
  const fileInput = document.querySelector("#app-documents");
  if (fileInput) fileInput.addEventListener("change", () => {
    document.querySelector("#selected-files").innerHTML = Array.from(fileInput.files).map((file) => `<span class="file-item">${escapeHTML(file.name)} · ${(file.size / 1024 / 1024).toFixed(2)} MB</span>`).join("");
  });
  const form = document.querySelector("#application-form");
  if (form) form.addEventListener("submit", (event) => {
    event.preventDefault();
    const files = Array.from(fileInput.files);
    const maxSize = 5 * 1024 * 1024;
    if (files.some((file) => file.size > maxSize)) {
      showToast("Each uploaded file must be 5 MB or smaller.");
      fileInput.focus();
      return;
    }
    const formData = new FormData(form);
    const app = {
      id: `IL-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      scholarshipId: scholarship.id,
      accountKey: state.user.accountKey,
      student: formData.get("fullName").trim(),
      email: formData.get("email").trim(),
      course: formData.get("course").trim(),
      year: formData.get("year"),
      submitted: new Date().toISOString().slice(0, 10),
      status: "Pending",
      note: "",
      files: files.map((file) => file.name)
    };
    state.applications.unshift(app);
    saveState();
    updateUserChip();
    closeModal();
    renderPage("applications");
    showToast("Your application was submitted successfully.");
  });
}

function openApplicationDetails(id) {
  const app = state.applications.find((item) => item.id === id);
  if (!app) return;
  if (state.user.role === "faculty") {
    openReview(id);
    return;
  }
  const scholarship = scholarshipById(app.scholarshipId);
  lastFocusedElement = document.activeElement;
  modalRoot.innerHTML = `<div class="modal-backdrop" data-backdrop><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><div><h2 id="modal-title">${escapeHTML(scholarship?.name || "Application details")}</h2><p>Application ID ${escapeHTML(app.id)}</p></div><button class="modal-close" type="button" aria-label="Close dialog" data-close>×</button></div><div class="modal-body"><div class="detail-list"><div class="detail-item"><span>Current status</span><strong>${statusBadge(app.status)}</strong></div><div class="detail-item"><span>Submitted</span><strong>${formatDate(app.submitted)}</strong></div><div class="detail-item"><span>Course / year</span><strong>${escapeHTML(app.course || "—")} · ${escapeHTML(app.year || "—")}</strong></div></div><h3 class="panel-title">Uploaded documents</h3>${app.files?.length ? app.files.map((file) => `<div class="review-doc"><span>${escapeHTML(file)}</span><span>Submitted</span></div>`).join("") : `<p class="muted" style="font-size:10px">No document names recorded.</p>`}${app.note ? `<h3 class="panel-title" style="margin-top:18px">Coordinator note</h3><p class="muted" style="font-size:11px">${escapeHTML(app.note)}</p>` : ""}</div><div class="modal-footer"><button class="button button-primary" type="button" data-close>Done</button></div></section></div>`;
  setupModal();
}

function openReview(id) {
  const app = state.applications.find((item) => item.id === id);
  if (!app) return;
  const scholarship = scholarshipById(app.scholarshipId);
  lastFocusedElement = document.activeElement;
  modalRoot.innerHTML = `<div class="modal-backdrop" data-backdrop><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><div><h2 id="modal-title">Review application</h2><p>${escapeHTML(app.student)} · ${escapeHTML(scholarship?.name || "Scholarship")} · ${escapeHTML(app.id)}</p></div><button class="modal-close" type="button" aria-label="Close dialog" data-close>×</button></div><form id="review-form"><div class="modal-body"><div class="detail-list"><div class="detail-item"><span>Student</span><strong>${escapeHTML(app.student)}</strong></div><div class="detail-item"><span>Contact</span><strong>${escapeHTML(app.email || "—")}</strong></div><div class="detail-item"><span>Course / year</span><strong>${escapeHTML(app.course || "—")} · ${escapeHTML(app.year || "—")}</strong></div><div class="detail-item"><span>Submitted</span><strong>${formatDate(app.submitted)}</strong></div></div><h3 class="panel-title">Submitted documents</h3>${app.files?.length ? app.files.map((file) => `<div class="review-doc"><span>${escapeHTML(file)}</span><span>✓ Listed</span></div>`).join("") : `<p class="muted" style="font-size:10px">No document names were attached.</p>`}<div class="form-grid" style="margin-top:17px"><div class="form-field"><label for="review-status-field">Update status</label><select class="select-input" id="review-status-field" name="status"><option ${app.status === "Pending" ? "selected" : ""}>Pending</option><option ${app.status === "Under review" ? "selected" : ""}>Under review</option><option ${app.status === "Approved" ? "selected" : ""}>Approved</option><option ${app.status === "Rejected" ? "selected" : ""}>Rejected</option></select></div><div class="form-field full"><label for="review-note">Note to student</label><textarea class="text-area" id="review-note" name="note" placeholder="Add feedback or next steps…">${escapeHTML(app.note || "")}</textarea></div></div></div><div class="modal-footer"><button class="button button-secondary" type="button" data-close>Cancel</button><button class="button button-primary" type="submit">Save review</button></div></form></section></div>`;
  setupModal();
  document.querySelector("#review-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    app.status = data.get("status");
    app.note = data.get("note").trim();
    saveState();
    updateCounts();
    closeModal();
    renderPage(activeView);
    showToast(`Application status updated to ${app.status}.`);
  });
}

function setupModal() {
  const backdrop = modalRoot.querySelector("[data-backdrop]");
  backdrop.addEventListener("click", (event) => { if (event.target === backdrop) closeModal(); });
  modalRoot.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeModal));
  modalRoot.querySelector("[role=dialog]").addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
    if (event.key === "Tab") trapFocus(event, modalRoot.querySelector("[role=dialog]"));
  });
  const applyButton = modalRoot.querySelector("[data-modal-apply]");
  if (applyButton) applyButton.addEventListener("click", () => openScholarship(applyButton.dataset.modalApply, true));
  modalRoot.querySelector("[data-close]")?.focus();
}

function trapFocus(event, container) {
  const focusable = [...container.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')].filter((item) => item.offsetParent !== null);
  if (!focusable.length) return;
  if (event.shiftKey && document.activeElement === focusable[0]) {
    event.preventDefault();
    focusable[focusable.length - 1].focus();
  } else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
    event.preventDefault();
    focusable[0].focus();
  }
}

function closeModal() {
  modalRoot.innerHTML = "";
  lastFocusedElement?.focus();
}

function updateCounts() {
  document.querySelector("#application-count").textContent = getMyApplications().length;
  document.querySelector("#review-count").textContent = state.applications.filter((app) => app.status === "Pending" || app.status === "For review").length;
}

function updateUserChip() {
  if (state.user.role === "faculty") {
    document.querySelector("#user-name").textContent = state.user.name;
    document.querySelector("#user-avatar").textContent = initials(state.user.name);
  } else {
    document.querySelector("#student-user-name").textContent = state.user.fullName || state.user.name;
    document.querySelector("#student-user-avatar").textContent = initials(state.user.fullName || state.user.name);
  }
  updateCounts();
}

function toggleMenu(open) {
  const sidebar = document.querySelector("#sidebar");
  const toggle = document.querySelector("#menu-toggle");
  const scrim = document.querySelector("#mobile-scrim");
  sidebar.classList.toggle("is-open", open);
  scrim.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
}

document.querySelector("#login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const username = String(formData.get("username")).trim();
  const password = String(formData.get("password"));
  const error = document.querySelector("#login-error");
  if (!username || !password) {
    error.textContent = "Enter both your username and password to continue.";
    error.hidden = false;
    return;
  }
  const role = formData.get("role");
  const nameFromEmail = username.includes("@") ? username.split("@")[0].replace(/[._-]+/g, " ") : username;
  const name = nameFromEmail.split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  error.hidden = true;
  login(name || (role === "faculty" ? "Faculty Coordinator" : "Student"), role, username);
});

document.querySelector(".password-toggle").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const password = document.querySelector("#login-password");
  const reveal = password.type === "password";
  password.type = reveal ? "text" : "password";
  button.textContent = reveal ? "Hide" : "Show";
  button.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
  button.setAttribute("aria-pressed", String(reveal));
});

document.querySelector("#logout-button").addEventListener("click", logout);
document.querySelector("#menu-toggle").addEventListener("click", () => toggleMenu(!document.querySelector("#sidebar").classList.contains("is-open")));
document.querySelector("#mobile-scrim").addEventListener("click", () => toggleMenu(false));
document.querySelector("#notification-button").addEventListener("click", () => {
  const popover = document.querySelector("#notification-popover");
  popover.hidden = !popover.hidden;
  document.querySelector("#notification-button").setAttribute("aria-expanded", String(!popover.hidden));
});

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-nav]");
  if (nav && state.user) {
    event.preventDefault();
    renderPage(nav.dataset.nav);
    toggleMenu(false);
    document.querySelector("#notification-popover").hidden = true;
    document.querySelector("#main-content").focus();
    return;
  }
  const scholarshipButton = event.target.closest("[data-scholarship]");
  if (scholarshipButton) {
    openScholarship(scholarshipButton.dataset.scholarship, scholarshipButton.dataset.action === "apply");
    return;
  }
  const applicationButton = event.target.closest("[data-application]");
  if (applicationButton) {
    openApplicationDetails(applicationButton.dataset.application);
    return;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (modalRoot.firstElementChild) closeModal();
    if (!document.querySelector("#notification-popover").hidden) {
      document.querySelector("#notification-popover").hidden = true;
      document.querySelector("#notification-button").setAttribute("aria-expanded", "false");
    }
    toggleMenu(false);
  }
});

document.querySelector("#notification-list").innerHTML = `<div class="notification-item"><span class="notification-bullet" aria-hidden="true"></span><div><strong>TES payout schedule updated</strong><p>The next release is expected on November 28.</p></div></div><div class="notification-item"><span class="notification-bullet" aria-hidden="true"></span><div><strong>TDP applications are now open</strong><p>Submit your requirements before December 15.</p></div></div>`;

if (state.user) login(state.user.name, state.user.role, state.user.accountKey || state.user.name);
