/**
 * src/lib/api.js
 * NEEDMO Consult — Backend API client.
 * Drop this in your React/Vite project.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "https://needmo-workers.ibokchris.workers.dev";

console.log("API Base URL:", BASE_URL);

// ── Token storage ─────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("needmo_token");
export const setToken = (t) => localStorage.setItem("needmo_token", t);
export const clearToken = () => localStorage.removeItem("needmo_token");

// ── Core fetch helper ─────────────────────────────────────────────────────────
export async function request(path, options = {}) {
  const token = getToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  const url = `${BASE_URL}${path}`;
  
  console.log("Making request to:", url);
  
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeoutId);
    console.log("Response status:", res.status);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `API error ${res.status}`);
    }
    return res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("Request error:", err);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your API is running.');
    }
    throw err;
  }
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

export const joinWaitlist = (email, name = "") =>
  request("/public/waitlist", { method: "POST", body: JSON.stringify({ email, name }) });

export const unsubscribe = (email) =>
  request(`/public/unsubscribe?email=${encodeURIComponent(email)}`);


// ── RealtimeKit Call API ─────────────────────────────────────────────────────
const CLOUDFLARE_MEETING_ID = import.meta.env.VITE_CLOUDFLARE_MEETING_ID;

export const joinCall = async ({ name, email, mode, role, roomName }) => {
  const payload = {
    name,
    role,
    mode,
    meetingId: CLOUDFLARE_MEETING_ID,
  };
  
  if (email) payload.email = email;
  if (roomName) payload.meetingName = roomName;
  
  return request("/public/realtimekit/join", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getCallAuthToken = async ({ mode, name, email, role, roomName }) => {
  const payload = {
    name,
    mode,
    role,
  };
  
  if (email) payload.email = email;
  if (roomName) payload.roomName = roomName;
  
  return request("/public/realtimekit/token", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const endCall = async (meetingId) => {
  return request(`/public/realtimekit/end`, {
    method: "POST",
    body: JSON.stringify({ meetingId }),
  });
};

export const getCallDetails = async (meetingId) => {
  return request(`/public/realtimekit/meeting/${meetingId}`);
};


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

export const sendWelcomeEmail = (payload) =>
  request("/admin/welcome-email", { method: "POST", body: JSON.stringify(payload) });

export const createMeetingRoom = () =>
  request("/admin/room/create", { method: "POST" });


export const getBlogPosts = () => request("/public/blog");
export const getBlogPost = (id) => request(`/public/blog/${id}`);
export const createBooking = (payload) =>
  request("/public/booking", { method: "POST", body: JSON.stringify(payload) });

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
