/**
 * src/lib/api.js
 * NEEDMO Consult — Backend API client
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.needmoconsult.com';

export const getToken = () => localStorage.getItem('needmo_token');
export const setToken = (t) => localStorage.setItem('needmo_token', t);
export const clearToken = () => localStorage.removeItem('needmo_token');

export async function request(path, options = {}) {
  const token = getToken();
  const url = `${BASE_URL}${path}`;
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error ${res.status}`);
  }
  return res.json();
}

// ============================================
// AUTH
// ============================================

export const register = async (email, password, name) => {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
};

export const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.access_token) {
    setToken(data.access_token);
  }
  return data;
};

export const logout = async () => {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } finally {
    clearToken();
  }
};

export const verifyEmail = async (token) => {
  return request('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
};

export const requestPasswordReset = async (email) => {
  return request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const changePassword = async (currentPassword, newPassword) => {
  return request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};

// ============================================
// USER
// ============================================

export const getMe = () => request('/api/user/me');

export const updateMe = (data) => {
  return request('/api/user/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// ============================================
// MEETINGS
// ============================================

export const getMeetings = (filter = 'all') => {
  return request(`/api/meetings?filter=${filter}`);
};

export const getMeeting = (id) => {
  return request(`/api/meetings/${id}`);
};

export const createMeeting = async (data) => {
  const res = await request('/api/meetings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.meeting;
};

export const deleteMeeting = (id) => {
  return request(`/api/meetings/${id}`, { method: 'DELETE' });
};

export const joinMeeting = async (meetingId, name) => {
  return request('/api/realtimekit/join', {
    method: 'POST',
    body: JSON.stringify({ meetingId, name }),
  });
};

// ============================================
// RECORDINGS
// ============================================

export const getRecordings = () => request('/api/recordings');

// ============================================
// SUBSCRIPTION
// ============================================

export const createCheckout = async (tier, interval = 'monthly') => {
  const res = await request('/api/subscription/create-checkout', {
    method: 'POST',
    body: JSON.stringify({ tier, interval }),
  });
  return res.url;
};

export const getSubscriptionPortal = async () => {
  const res = await request('/api/subscription/portal');
  return res.url;
};

// ============================================
// LEGACY / DEPRECATED
// ============================================

export const adminLogin = async (email, password) => {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (data.access_token) {
    setToken(data.access_token);
  }
  return data;
};

export const adminLogout = () => clearToken();

export const submitContact = (payload) => request('/public/contact', { method: 'POST', body: JSON.stringify(payload) });
export const joinWaitlist = (email, name = '') => request('/public/waitlist', { method: 'POST', body: JSON.stringify({ email, name }) });
export const unsubscribe = (email) => request('/public/unsubscribe', { method: 'POST', body: JSON.stringify({ email }) });

export const getDashboardStats = () => request('/admin/stats');
export const getContacts = (skip = 0, limit = 50) => request(`/admin/contacts?skip=${skip}&limit=${limit}`);
export const markContactRead = (id) => request(`/admin/contacts/${id}/read`, { method: 'PUT' });
export const getWaitlist = () => request('/admin/waitlist');
export const getNewsletters = () => request('/admin/newsletters');
export const sendNewsletter = (payload) => request('/admin/newsletter/send', { method: 'POST', body: JSON.stringify(payload) });
export const sendWelcomeEmail = (payload) => request('/admin/welcome-email', { method: 'POST', body: JSON.stringify(payload) });
export const getBlogPosts = () => request('/public/blog');
export const getBlogPost = (id) => request(`/public/blog/${id}`);
export const createBooking = (payload) => request('/public/booking', { method: 'POST', body: JSON.stringify(payload) });
export const getProjects = () => request('/admin/projects');
export const createProject = (payload) => request('/admin/projects', { method: 'POST', body: JSON.stringify(payload) });
export const updateProject = (id, payload) => request(`/admin/projects/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteProject = (id) => request(`/admin/projects/${id}`, { method: 'DELETE' });
export const getTasks = () => request('/admin/tasks');
export const getProjectTasks = (projectId) => request(`/admin/projects/${projectId}/tasks`);
export const createTask = (payload) => request('/admin/tasks', { method: 'POST', body: JSON.stringify(payload) });
export const updateTask = (id, payload) => request(`/admin/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteTask = (id) => request(`/admin/tasks/${id}`, { method: 'DELETE' });
export const getBookings = () => request('/admin/bookings');
export const deleteBooking = (id) => request(`/admin/bookings/${id}`, { method: 'DELETE' });
export const getSettings = () => request('/admin/settings');
export const updateSettings = (payload) => request('/admin/settings', { method: 'PUT', body: JSON.stringify(payload) });
