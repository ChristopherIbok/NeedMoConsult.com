import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { adminLogin, getWaitlist, sendNewsletter as apiSendNewsletter, sendWelcomeEmail as apiSendWelcomeEmail, getContacts, markContactRead } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Users, Mail, Plus, Trash2, Eye, CheckCircle, XCircle, Loader2, Lock, Video, MailOpen,
  Briefcase, CheckSquare, Square, Clock, AlertCircle, ChevronRight, FolderKanban, Calendar,
  User, MoreVertical, Edit3, ArrowLeft, Zap, Target, Filter, Link2, Image, MessageSquare, Paperclip, X, Menu, Copy, Check
} from "lucide-react";

const TEAM_MEMBERS = [
  { email: "hello@needmoconsult.com", name: "Chris (Owner)", role: "owner" },
  { email: "team@needmoconsult.com", name: "Team Member 1", role: "member" },
  { email: "support@needmoconsult.com", name: "Team Member 2", role: "member" },
];

const STATUS_COLORS = {
  todo: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  review: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  done: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

const STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const PRIORITY_COLORS = {
  low: "text-gray-400",
  medium: "text-blue-500",
  high: "text-orange-500",
  urgent: "text-red-500",
};

function AuthGate({ onAuth }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = async () => {
    if (!email || !pw) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    try {
      await adminLogin(email, pw);
      const member = TEAM_MEMBERS.find(m => m.email.toLowerCase() === email.toLowerCase());
      onAuth(member || { name: email.split("@")[0], email, role: "member" });
    } catch (err) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A2332] via-[#0D1117] to-[#1A2332] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF7A]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#D4AF7A]/3 rounded-full blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative w-full max-w-sm bg-[#0F1824]/90 rounded-2xl p-8 border border-white/10 ${shake ? "animate-shake" : ""}`}
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
      >
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF7A] to-[#C49A5E] flex items-center justify-center shadow-lg shadow-[#D4AF7A]/20">
            <Briefcase className="w-6 h-6 text-[#1A2332]" />
          </div>
        </div>
        <h1 className="text-white text-xl font-bold text-center mb-1">NEEDMO Office</h1>
        <p className="text-white/40 text-sm text-center mb-6">Sign in to access your workspace</p>

        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 p-3 bg-[#D4AF7A]/10 border border-[#D4AF7A]/20 rounded-xl"
          >
            <p className="text-[#D4AF7A] text-xs mb-2">Team member accounts:</p>
            {TEAM_MEMBERS.map(m => (
              <p key={m.email} className="text-white/50 text-xs mb-1">• {m.email}</p>
            ))}
          </motion.div>
        )}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(false); }}
          className="w-full mb-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF7A]/50 transition-colors"
        />
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          className="w-full mb-4 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF7A]/50 transition-colors"
        />

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-gradient-to-r from-[#D4AF7A] to-[#C49A5E] text-[#1A2332] font-semibold rounded-xl hover:shadow-lg hover:shadow-[#D4AF7A]/20 transition-all"
        >
          Sign In
        </button>

        <button
          onClick={() => setShowHint(!showHint)}
          className="w-full mt-4 text-white/30 text-xs hover:text-white/50 transition-colors"
        >
          {showHint ? "Hide hints" : "Forgot credentials?"}
        </button>

        <Link to={createPageUrl("Home")} className="block text-center mt-4 text-white/30 text-xs hover:text-white/50 transition-colors">
          ← Back to home
        </Link>
      </motion.div>
    </div>
  );
}

export default function OfficeContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("contacts");
  const [contacts, setContacts] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("needmo_tasks");
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "Welcome to NEEDMO Office!", status: "done", priority: "high", dueDate: "" },
    ];
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("needmo_token");
    if (token) {
      setUser({ name: "User", role: "member" });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("needmo_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (user && activeTab === "contacts") {
      getContacts().then(setContacts).catch(console.error);
    }
    if (user && activeTab === "waitlist") {
      getWaitlist().then(setWaitlist).catch(console.error);
    }
  }, [user, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("needmo_token");
    setUser(null);
  };

  const markAsRead = async (id) => {
    try {
      await markContactRead(id);
      setContacts(contacts.map(c => c.id === id ? { ...c, read: true } : c));
    } catch (err) {
      console.error("Failed to mark contact as read:", err);
    }
  };

  const addTask = () => {
    const newTask = {
      id: Date.now(),
      title: "New task",
      status: "todo",
      priority: "medium",
      dueDate: "",
    };
    setTasks([...tasks, newTask]);
    setSelectedTask(newTask);
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
    if (selectedTask?.id === id) {
      setSelectedTask({ ...selectedTask, ...updates });
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (selectedTask?.id === id) {
      setSelectedTask(null);
    }
  };

  const filteredTasks = filterStatus === "all" ? tasks : tasks.filter(t => t.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#D4AF7A] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthGate onAuth={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <header className="h-14 bg-[#0F1824]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF7A] to-[#C49A5E] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-[#1A2332]" />
            </div>
            <span className="font-semibold">NEEDMO Office</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-sm">{user.name}</span>
          <button onClick={handleLogout} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden bg-[#0F1824]/50 border-r border-white/5`}>
          <nav className="p-3 space-y-1">
            {[
              { id: "contacts", icon: Mail, label: "Messages" },
              { id: "waitlist", icon: Users, label: "Waitlist" },
              { id: "tasks", icon: CheckSquare, label: "Tasks" },
              { id: "settings", icon: Zap, label: "Quick Add" },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === item.id ? "bg-[#D4AF7A]/10 text-[#D4AF7A]" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {activeTab === "contacts" && (
              <motion.div
                key="contacts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold mb-4">Messages</h2>
                {contacts.length === 0 ? (
                  <p className="text-white/40">No messages yet</p>
                ) : (
                  <div className="space-y-2">
                    {contacts.map(contact => (
                      <motion.div
                        key={contact.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 rounded-xl border transition-all ${contact.read ? "bg-white/5 border-white/5" : "bg-[#D4AF7A]/5 border-[#D4AF7A]/20"}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{contact.name}</h3>
                              {!contact.read && <span className="w-2 h-2 rounded-full bg-[#D4AF7A]" />}
                            </div>
                            <p className="text-white/40 text-sm">{contact.email}</p>
                            {contact.phone && <p className="text-white/40 text-sm">{contact.phone}</p>}
                            <p className="text-white/60 mt-2">{contact.message}</p>
                            <p className="text-white/30 text-xs mt-2">
                              {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : ""}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!contact.read && (
                              <button onClick={() => markAsRead(contact.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Mark as read">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "waitlist" && (
              <motion.div
                key="waitlist"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold mb-4">Waitlist ({waitlist.length})</h2>
                {waitlist.length === 0 ? (
                  <p className="text-white/40">No one on the waitlist yet</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {waitlist.map(person => (
                      <div key={person.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF7A] to-[#C49A5E] flex items-center justify-center text-[#1A2332] font-semibold">
                            {person.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{person.email}</p>
                            <p className="text-white/40 text-xs">
                              {person.created_at ? new Date(person.created_at).toLocaleDateString() : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "tasks" && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Tasks</h2>
                  <button onClick={addTask} className="flex items-center gap-2 px-3 py-2 bg-[#D4AF7A] text-[#1A2332] rounded-lg font-medium hover:bg-[#C49A5E] transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Task
                  </button>
                </div>

                <div className="flex gap-2 mb-4">
                  {["all", "todo", "in_progress", "review", "done"].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        filterStatus === status ? "bg-[#D4AF7A] text-[#1A2332]" : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {status === "all" ? "All" : STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTasks.map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      onClick={() => setSelectedTask(task)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-[#D4AF7A]/50 ${
                        selectedTask?.id === task.id ? "border-[#D4AF7A] bg-[#D4AF7A]/5" : "bg-white/5 border-white/5"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[task.status]}`}>
                          {STATUS_LABELS[task.status]}
                        </span>
                        <span className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                      <h3 className="font-medium mb-2">{task.title}</h3>
                      {task.dueDate && (
                        <p className="text-white/40 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {task.dueDate}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>

                <AnimatePresence>
                  {selectedTask && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                      onClick={() => setSelectedTask(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.95 }}
                        className="w-full max-w-md bg-[#0F1824] rounded-2xl p-6 border border-white/10"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Edit Task</h3>
                          <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-white/5 rounded-lg">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={selectedTask.title}
                          onChange={e => updateTask(selectedTask.id, { title: e.target.value })}
                          className="w-full mb-4 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#D4AF7A]/50"
                          placeholder="Task title"
                        />

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-white/40 text-xs mb-2 block">Status</label>
                            <select
                              value={selectedTask.status}
                              onChange={e => updateTask(selectedTask.id, { status: e.target.value })}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF7A]/50"
                            >
                              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-white/40 text-xs mb-2 block">Priority</label>
                            <select
                              value={selectedTask.priority}
                              onChange={e => updateTask(selectedTask.id, { priority: e.target.value })}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF7A]/50"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => deleteTask(selectedTask.id)}
                            className="flex-1 py-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                          <button
                            onClick={() => setSelectedTask(null)}
                            className="flex-1 py-3 bg-[#D4AF7A] text-[#1A2332] rounded-xl font-medium hover:bg-[#C49A5E] transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-md"
              >
                <h2 className="text-xl font-semibold mb-4">Quick Add</h2>
                
                <QuickAddForm type="waitlist" onSuccess={() => setActiveTab("waitlist")} />
                <QuickAddForm type="newsletter" onSuccess={() => {}} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function QuickAddForm({ type, onSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      if (type === "waitlist") {
        await apiSendNewsletter(email);
        setMessage("Added to waitlist!");
      }
      setEmail("");
      setTimeout(() => { setMessage(""); onSuccess?.(); }, 2000);
    } catch (err) {
      setMessage("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-white/5 border border-white/5">
      <h3 className="font-medium mb-3 flex items-center gap-2">
        {type === "waitlist" ? <Users className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
        Add to {type}
      </h3>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email@example.com"
          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF7A]/50"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-[#D4AF7A] text-[#1A2332] rounded-lg font-medium hover:bg-[#C49A5E] transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>
      {message && <p className="text-white/40 text-xs mt-2">{message}</p>}
    </form>
  );
}
