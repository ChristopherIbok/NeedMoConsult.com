/**
 * src/lib/api.js
 * NEEDMO Consult — Backend API client.
 * Drop this in your React/Vite project.
 */

const BASE_URL = import.meta.env.VITE_API_URL; // https://api.needmoconsult.com

// ── Token storage ─────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("needmo_token");
export const setToken = (t) => localStorage.setItem("needmo_token", t);
export const clearToken = () => localStorage.removeItem("needmo_token");

// ── Core fetch helper ─────────────────────────────────────────────────────────
export async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}


// ── Auth ──────────────────────────────────────────────────────────────────────
export async function adminLogin(email, password) {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error("Invalid credentials");
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export const adminLogout = () => clearToken();


// ── Public ────────────────────────────────────────────────────────────────────
export const submitContact = (payload) =>
  request("/public/contact", { method: "POST", body: JSON.stringify(payload) });
//  payload: { name, email, phone?, message, service_interest? }

export const joinWaitlist = (email, name = "") =>
  request("/public/waitlist", { method: "POST", body: JSON.stringify({ email, name }) });

export const unsubscribe = (email) =>
  request(`/public/unsubscribe?email=${encodeURIComponent(email)}`);


// ── Admin (all require login) ──────────────────────────────────────────────────
export const getDashboardStats  = () => request("/admin/stats");
export const getContacts        = (skip = 0, limit = 50) =>
  request(`/admin/contacts?skip=${skip}&limit=${limit}`);
export const markContactRead    = (id) =>
  request(`/admin/contacts/${id}/read`, { method: "PATCH" });
export const getWaitlist        = () => request("/admin/waitlist");
export const getNewsletters     = () => request("/admin/newsletters");

export const sendNewsletter = (payload) =>
  request("/admin/newsletter/send", { method: "POST", body: JSON.stringify(payload) });
//  payload: { subject, headline, body_html, cta_text?, cta_url? }

export const sendWelcomeEmail = (payload) =>
  request("/admin/welcome-email", { method: "POST", body: JSON.stringify(payload) });
//  payload: { email, name?, headline?, intro?, cta_text?, cta_url? }

export const createMeetingRoom = () =>
  request("/admin/room/create", { method: "POST" });
//  Returns: { url, name }


// ── Usage Examples ─────────────────────────────────────────────────────────────
/*
  // Contact form submit:
  await submitContact({
    name: "Ada Obi",
    email: "ada@example.com",
    message: "I need brand consulting.",
    service_interest: "Brand Strategy",
  });

  // Waitlist signup:
  await joinWaitlist("ada@example.com", "Ada");

  // Admin login:
  await adminLogin("hello@needmoconsult.com", "yourpassword");

  // Send newsletter (admin only):
  await sendNewsletter({
    subject: "NEEDMO April Update",
    headline: "Growing your brand in Q2",
    body_html: "<p>Here's what we've been working on...</p>",
    cta_text: "Read More",
    cta_url: "https://needmoconsult.com/blog",
  });
*/

export const getBlogPosts = () => request("/public/blog");
export const getBlogPost = (id) => request(`/public/blog/${id}`);
export const createBooking = (payload) =>
  request("/public/booking", { method: "POST", body: JSON.stringify(payload) });
// Returns: { message, id, call_url? }

// ── Projects ──────────────────────────────────────────────────────────────────
export const getProjects = () => request("/admin/projects");
export const createProject = (payload) =>
  request("/admin/projects", { method: "POST", body: JSON.stringify(payload) });
export const updateProject = (id, payload) =>
  request(`/admin/projects/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
export const deleteProject = (id) =>
  request(`/admin/projects/${id}`, { method: "DELETE" });

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const getTasks = () => request("/admin/tasks");
export const getProjectTasks = (projectId) => request(`/admin/projects/${projectId}/tasks`);
export const createTask = (payload) =>
  request("/admin/tasks", { method: "POST", body: JSON.stringify(payload) });
export const updateTask = (id, payload) =>
  request(`/admin/tasks/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
export const deleteTask = (id) =>
  request(`/admin/tasks/${id}`, { method: "DELETE" });