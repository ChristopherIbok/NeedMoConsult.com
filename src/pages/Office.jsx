import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { adminLogin, getWaitlist, sendNewsletter as apiSendNewsletter, sendWelcomeEmail as apiSendWelcomeEmail, getContacts, markContactRead } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Users, Mail, Plus, Trash2, Eye, CheckCircle, XCircle, Loader2, Lock, Video, MailOpen,
  Briefcase, CheckSquare, Square, Clock, AlertCircle, ChevronRight, FolderKanban, Calendar,
  User, MoreVertical, Edit3, ArrowLeft, Zap, Target, Filter, Link2, Image, MessageSquare, Paperclip, X, Menu
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

// ─── Auth Gate ────────────────────────────────────────────────────────────────
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
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#D4AF7A]/50 transition-colors mb-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#D4AF7A]/50 transition-colors mb-3"
        />
        {error && <p className="text-red-400 text-xs mb-3 text-center">Incorrect email or password</p>}
        
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-[#D4AF7A] to-[#C49A5E] hover:from-[#C49A5E] hover:to-[#D4AF7A] text-[#1A2332] font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-[#D4AF7A]/20"
        >
          Sign In
        </button>
        
        <button
          onClick={() => setShowHint(!showHint)}
          className="w-full mt-3 text-white/30 hover:text-white/50 text-xs transition-colors"
        >
          {showHint ? "Hide" : "Show"} team member emails
        </button>
      </motion.div>
      <style>{`.animate-shake { animation: shake 0.4s ease; } @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }`}</style>
    </div>
  );
}

// ─── Project Management Components ───────────────────────────────────────────
function ProjectProgress({ projects, tasks, selectedProject }) {
  const getProjectProgress = (projectId) => {
    const projectTasks = tasks.filter(t => t.project_id === projectId);
    if (projectTasks.length === 0) return 0;
    const done = projectTasks.filter(t => t.status === "done").length;
    return Math.round((done / projectTasks.length) * 100);
  };

  const currentProgress = selectedProject 
    ? getProjectProgress(selectedProject)
    : Math.round((tasks.filter(t => t.status === "done").length / Math.max(tasks.length, 1)) * 100);

  return (
    <div className="mb-6 bg-white dark:bg-[#1A2332] rounded-xl p-4 border border-gray-100 dark:border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[#1A2332] dark:text-white">Task Progress</span>
        <span className="text-sm font-bold text-[#D4AF7A]">{currentProgress}%</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#D4AF7A] to-green-500 rounded-full transition-all duration-500"
          style={{ width: `${currentProgress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>{tasks.filter(t => t.status === "done").length} completed</span>
        <span>{tasks.filter(t => t.status !== "done").length} remaining</span>
      </div>
    </div>
  );
}

function KanbanBoard({ projects, tasks, onUpdateTask, onDeleteTask, currentUser, onViewDetail }) {
  const columns = ["todo", "in_progress", "review", "done"];
  
  const getProjectName = (projectId) => {
    const p = projects.find(p => p.id === projectId);
    return p ? p.name : "Unknown Project";
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(status => {
        const columnTasks = tasks.filter(t => t.status === status);
        return (
          <div key={status} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  status === "todo" ? "bg-gray-400" :
                  status === "in_progress" ? "bg-blue-500" :
                  status === "review" ? "bg-amber-500" : "bg-green-500"
                }`} />
                <h3 className="text-sm font-semibold text-[#1A2332] dark:text-white">{STATUS_LABELS[status]}</h3>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">{columnTasks.length}</span>
              </div>
            </div>
            <div className="space-y-3">
              {columnTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  projectName={getProjectName(task.project_id)}
                  onUpdate={onUpdateTask}
                  onDelete={onDeleteTask}
                  currentUser={currentUser}
                  onViewDetail={onViewDetail}
                />
              ))}
              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskCard({ task, projectName, onUpdate, onDelete, currentUser, onViewDetail }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const cycleStatus = () => {
    const order = ["todo", "in_progress", "review", "done"];
    const idx = order.indexOf(task.status);
    onUpdate(task.id, { status: order[(idx + 1) % 4] });
  };

  const toggleDone = () => {
    const newStatus = task.status === "done" ? "todo" : "done";
    onUpdate(task.id, { status: newStatus });
  };

  const saveTitle = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate(task.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  return (
    <div 
      className={`bg-white dark:bg-[#1A2332] rounded-xl p-4 border shadow-sm hover:shadow-md transition-all group ${task.status === "done" ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3 mb-2">
        <button
          onClick={(e) => { e.stopPropagation(); toggleDone(); }}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            task.status === "done"
              ? "bg-green-500 border-green-500"
              : "border-gray-300 dark:border-gray-600 hover:border-[#D4AF7A]"
          }`}
        >
          {task.status === "done" && <CheckCircle className="w-3 h-3 text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => e.key === "Enter" && saveTitle()}
              autoFocus
              className="w-full bg-transparent border-b border-[#D4AF7A] text-sm font-medium text-[#1A2332] dark:text-white outline-none"
            />
          ) : (
            <h4
              onClick={() => setIsEditing(true)}
              className={`text-sm font-medium text-[#1A2332] dark:text-white cursor-pointer hover:text-[#D4AF7A] ${task.status === "done" ? "line-through" : ""}`}
            >
              {task.title}
            </h4>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-[#0F1824] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 py-1 z-10 w-36">
              <button
                onClick={() => { toggleDone(); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                {task.status === "done" ? "Mark Incomplete" : "Mark Done"}
              </button>
              <button
                onClick={() => { cycleStatus(); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                Move Next →
              </button>
              <button
                onClick={() => { setIsEditing(true); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                Edit Title
              </button>
              <button
                onClick={() => { setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                View Details
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="w-full px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-xs text-[#D4AF7A] mb-3 truncate">{projectName}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status]}`}>
            {STATUS_LABELS[task.status]}
          </span>
          {task.priority === "high" || task.priority === "urgent" ? (
            <span className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
              <Zap className="w-3 h-3" />
            </span>
          ) : null}
        </div>
        {task.due_date && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {task.due_date}
          </span>
        )}
      </div>
      
      {task.assignee && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/5">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <User className="w-3 h-3" />
            {task.assignee}
          </span>
        </div>
      )}
      
      {/* Task Details Preview */}
      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/5 space-y-1">
        {task.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</p>
        )}
      </div>
      
      {/* Quick Actions - Current as text, next as button, others as clickable text */}
      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-white/5 flex items-center gap-2 flex-wrap">
        {/* Current status - shown as text */}
        <span className="text-xs text-[#D4AF7A] font-medium">
          {STATUS_LABELS[task.status]}
        </span>
        
        {/* Other statuses as clickable text */}
        {task.status !== "todo" && (
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(task.id, { status: "todo" }); }}
            className="text-xs text-gray-400 hover:text-[#D4AF7A] underline"
          >
            To Do
          </button>
        )}
        {task.status !== "in_progress" && (
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(task.id, { status: "in_progress" }); }}
            className="text-xs text-gray-400 hover:text-[#D4AF7A] underline"
          >
            In Progress
          </button>
        )}
        {task.status !== "review" && (
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(task.id, { status: "review" }); }}
            className="text-xs text-gray-400 hover:text-[#D4AF7A] underline"
          >
            Review
          </button>
        )}
        {task.status !== "done" && (
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(task.id, { status: "done" }); }}
            className="text-xs text-gray-400 hover:text-[#D4AF7A] underline"
          >
            Done
          </button>
        )}
        
        {/* Next status as button */}
        {task.status === "todo" && (
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(task.id, { status: "in_progress" }); }}
            className="ml-auto px-2 py-1 text-xs bg-[#D4AF7A] text-[#1A2332] rounded hover:bg-[#C49A5E]"
          >
            → In Progress
          </button>
        )}
        {task.status === "in_progress" && (
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(task.id, { status: "review" }); }}
            className="ml-auto px-2 py-1 text-xs border border-[#D4AF7A] text-[#D4AF7A] rounded hover:bg-[#D4AF7A]/10"
          >
            → Review
          </button>
        )}
        {task.status === "review" && (
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(task.id, { status: "done" }); }}
            className="ml-auto px-2 py-1 text-xs bg-[#1A2332] text-white rounded hover:bg-[#2A3342]"
          >
            → Done
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Office Dashboard ────────────────────────────────────────────────────
export default function Office() {
  const [authed, setAuthed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("projects");
  const [subscribers, setSubscribers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeContact, setActiveContact] = useState(null);

  // Project state
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({ name: "", client: "", priority: "medium", due_date: "", budget: "" });
  const [newTask, setNewTask] = useState({ title: "", status: "todo", priority: "medium", assignee: "", due_date: "" });
  const [taskError, setTaskError] = useState(null);
  
  // Sidebar toggle
  // Sidebar fixed width
  
  // Task detail modal
  const [taskDetail, setTaskDetail] = useState(null);
  const [taskComments, setTaskComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [taskLinks, setTaskLinks] = useState("");
  const [taskImages, setTaskImages] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  // Welcome email state
  const [welcomeForm, setWelcomeForm] = useState({
    headline: "Welcome to the Family!",
    intro: "Thanks for subscribing to the NEEDMO CONSULT newsletter. You've just made a great decision for your brand.",
    ctaText: "Visit Our Website",
    ctaUrl: "https://needmoconsult.com",
  });
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [sendingWelcome, setSendingWelcome] = useState(false);
  const [welcomeResult, setWelcomeResult] = useState(null);

  // Newsletter form
  const [form, setForm] = useState({
    subject: "",
    issue: "",
    heroTitle: "",
    heroIntro: "",
    articleTitle: "",
    articleBody: "",
    articleUrl: "",
    pullQuote: "",
    offerTitle: "",
    offerBody: "",
    offerUrl: "https://needmoconsult.com/Contact",
    offerLabel: "Book Free Strategy Call",
  });
  const [tips, setTips] = useState([
    { title: "", desc: "" },
    { title: "", desc: "" },
    { title: "", desc: "" },
  ]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Load data when authenticated
  useEffect(() => {
    if (authed) {
      fetchSubscribers();
      fetchContacts();
      fetchProjects();
      fetchTasks();
    }
  }, [authed]);

  // Fetch projects
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/projects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("needmo_token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0 && !selectedProject) {
          setSelectedProject(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
    setLoadingProjects(false);
  };

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("needmo_token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  // Create project
  const createProject = async () => {
    if (!newProject.name.trim()) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("needmo_token")}`,
        },
        body: JSON.stringify({ ...newProject, created_by: currentUser?.email }),
      });
      if (res.ok) {
        const project = await res.json();
        setProjects([project, ...projects]);
        setSelectedProject(project.id);
        setShowNewProject(false);
        setNewProject({ name: "", client: "", priority: "medium", due_date: "", budget: "" });
      }
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  // Create task
  const createTask = async () => {
    if (!newTask.title.trim() || !selectedProject) {
      setTaskError("Please select a project and enter a task title");
      return;
    }
    setTaskError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("needmo_token")}` },
        body: JSON.stringify({ ...newTask, project_id: selectedProject, created_by: currentUser?.email }),
      });
      if (res.ok) {
        const task = await res.json();
        setTasks([task, ...tasks]);
        setShowNewTask(false);
        setNewTask({ title: "", status: "todo", priority: "medium", assignee: "", due_date: "" });
      } else {
        const err = await res.text();
        setTaskError("Error: " + res.status + " - " + err);
      }
    } catch (err) {
      setTaskError("Network error: " + err.message);
    }
  };

  // Update task
  const updateTask = async (taskId, updates) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("needmo_token")}` },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(tasks.map(t => t.id === taskId ? updated : t));
      } else {
        setTaskError("Failed to update task: " + res.status);
      }
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("needmo_token")}` },
      });
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  // Delete project
  const deleteProject = async (projectId) => {
    if (!confirm("Delete this project and all its tasks?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("needmo_token")}` },
      });
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
        setTasks(tasks.filter(t => t.project_id !== projectId));
        if (selectedProject === projectId) {
          setSelectedProject(projects.length > 1 ? projects.find(p => p.id !== projectId)?.id : null);
        }
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  // Open task detail modal
  const openTaskDetail = async (task) => {
    setTaskDetail(task);
    setTaskDescription(task.description || "");
    setTaskLinks(task.links || "");
    setTaskImages(task.image_urls || "");
    setLoadingComments(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/tasks/${task.id}/comments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("needmo_token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTaskComments(data);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
    setLoadingComments(false);
  };

  // Add comment
  const addComment = async () => {
    if (!newComment.trim() || !taskDetail) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/tasks/${taskDetail.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("needmo_token")}` },
        body: JSON.stringify({ task_id: taskDetail.id, content: newComment }),
      });
      if (res.ok) {
        const comment = await res.json();
        setTaskComments([...taskComments, comment]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  // Save task details (description, links, images)
  const saveTaskDetails = async () => {
    if (!taskDetail) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/tasks/${taskDetail.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("needmo_token")}` },
        body: JSON.stringify({
          description: taskDescription,
          links: taskLinks,
          image_urls: taskImages,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(tasks.map(t => t.id === taskDetail.id ? updated : t));
        setTaskDetail(updated);
      }
    } catch (err) {
      console.error("Failed to save task details:", err);
    }
  };

  // Fetch subscribers
  const fetchSubscribers = async () => {
    setLoadingSubs(true);
    try {
      const data = await getWaitlist();
      setSubscribers(data.subscribers || []);
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
    }
    setLoadingSubs(false);
  };

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      const data = await getContacts();
      setContacts(data || []);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    }
  };

  const deleteSubscriber = async (id) => {
    setSubscribers(s => s.filter(x => x.id !== id));
  };

  const markContact = async (id) => {
    await markContactRead(id);
    setContacts(contacts.map(c => c.id === id ? { ...c, is_read: true } : c));
  };

  const addTip = () => setTips(t => [...t, { title: "", desc: "" }]);
  const removeTip = (i) => setTips(t => t.filter((_, j) => j !== i));
  const setTip = (i, k, v) => setTips(t => t.map((tip, j) => j === i ? { ...tip, [k]: v } : tip));

  const sendNewsletter = async () => {
    if (!form.subject || !form.heroTitle) {
      setSendResult({ error: "Subject and Hero Title are required." });
      return;
    }
    setSending(true);
    setSendResult(null);

    const emails = subscribers.filter(s => !s.status || s.status === "active").map(s => s.email);
    if (emails.length === 0) {
      setSendResult({ error: "No active subscribers to send to." });
      setSending(false);
      return;
    }

    try {
      await apiSendNewsletter({
        subject: form.subject,
        headline: form.heroTitle,
        body_html: `
          <p>${form.heroIntro}</p>
          ${form.articleTitle ? `<h3>${form.articleTitle}</h3><p>${form.articleBody}</p>` : ""}
          ${form.pullQuote ? `<blockquote>${form.pullQuote}</blockquote>` : ""}
          ${tips.filter(t => t.title).map((t, i) => `<p><strong>${i+1}. ${t.title}</strong><br/>${t.desc}</p>`).join("")}
        `,
        cta_text: form.offerLabel,
        cta_url: form.offerUrl,
      });
      setSendResult({ ok: true, count: emails.length });
    } catch (err) {
      setSendResult({ error: err.message });
    }
    setSending(false);
  };

  if (!authed) return <AuthGate onAuth={(user) => { setCurrentUser(user); setAuthed(true); }} />;

  const activeCount = subscribers.filter(s => !s.status || s.status === "active").length;
  const unreadContacts = contacts.filter(c => !c.is_read).length;

  return (
    <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#0F1419]">
      {/* Header Nav */}
      <header className="bg-[#1A2332] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF7A] to-[#C49A5E] flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-[#1A2332]" />
          </div>
          <span className="text-white font-bold text-lg">NEEDMO Office</span>
        </div>
        
        <nav className="flex items-center gap-2">
          {[
            { id: "projects", label: "Projects" },
            { id: "tasks", label: "Tasks" },
            { id: "compose", label: "Newsletter" },
            { id: "subscribers", label: "Subscribers", badge: activeCount },
            { id: "contacts", label: "Contacts", badge: unreadContacts },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === item.id
                  ? "bg-[#D4AF7A] text-[#1A2332]"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.label}
              {item.badge > 0 && <span className="ml-1 text-xs">({item.badge})</span>}
            </button>
          ))}
          <button onClick={() => { setAuthed(false); setCurrentUser(null); }} className="text-white/40 hover:text-white text-sm ml-4">
            Sign Out
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="p-8">

            {/* ── PROJECTS TAB ── */}
            {tab === "projects" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-[#1A2332] dark:text-white">Projects & Tasks</h1>
                    <p className="text-gray-500 text-sm mt-1">{projects.length} projects · {tasks.filter(t => t.status !== "done").length} active tasks</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (projects.length === 0) {
                          alert("No projects. Create a project first.");
                          return;
                        }
                        if (!selectedProject) {
                          setSelectedProject(projects[0].id);
                        }
                        setShowNewTask(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 border border-[#1A2332]/20 dark:border-white/20 rounded-xl text-sm font-medium text-[#1A2332] dark:text-white hover:bg-white dark:hover:bg-white/5 transition-colors"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Add Task
                    </button>
                    <button
                      onClick={() => setShowNewProject(true)}
                      className="flex items-center gap-2 px-6 py-2 bg-[#1A2332] hover:bg-[#2A3342] text-white rounded-xl text-sm font-bold transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      New Project
                    </button>
                  </div>
                </div>

                {/* Projects Filter */}
                {projects.length > 0 && (
                  <div className="mb-6 flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <button
                      onClick={() => setSelectedProject(null)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        !selectedProject ? "bg-[#D4AF7A] text-[#1A2332]" : "bg-white dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/20"
                      }`}
                    >
                      All Projects
                    </button>
                    {projects.map(p => (
                      <div key={p.id} className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedProject(p.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            selectedProject === p.id ? "bg-[#D4AF7A] text-[#1A2332]" : "bg-white dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/20"
                          }`}
                        >
                          {p.name}
                        </button>
                        <button
                          onClick={() => { setSelectedProject(p.id); setShowNewProject(true); }}
                          className="p-1 text-gray-400 hover:text-[#D4AF7A] transition-colors"
                          title="Edit project"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteProject(p.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Project Modal */}
                <AnimatePresence>
                  {showNewProject && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                      onClick={() => setShowNewProject(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-[#1A2332] rounded-2xl p-6 w-full max-w-md border border-gray-100 dark:border-white/10"
                      >
                        <h3 className="text-lg font-bold text-[#1A2332] dark:text-white mb-4">New Project</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Project Name *</label>
                            <input
                              value={newProject.name}
                              onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                              placeholder="Client Website Redesign"
                              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Client</label>
                            <input
                              value={newProject.client}
                              onChange={e => setNewProject({ ...newProject, client: e.target.value })}
                              placeholder="Client Name"
                              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-400 mb-1">Priority</label>
                              <select
                                value={newProject.priority}
                                onChange={e => setNewProject({ ...newProject, priority: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-400 mb-1">Due Date</label>
                              <input
                                type="date"
                                value={newProject.due_date}
                                onChange={e => setNewProject({ ...newProject, due_date: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Budget</label>
                            <input
                              value={newProject.budget}
                              onChange={e => setNewProject({ ...newProject, budget: e.target.value })}
                              placeholder="₦500,000"
                              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={() => setShowNewProject(false)}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={createProject}
                            disabled={!newProject.name.trim()}
                            className="flex-1 px-4 py-2 bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332] font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
                          >
                            Create Project
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* New Task Modal */}
                <AnimatePresence>
                  {showNewTask && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                      onClick={() => setShowNewTask(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-[#1A2332] rounded-2xl p-6 w-full max-w-md border border-gray-100 dark:border-white/10"
                      >
                        <h3 className="text-lg font-bold text-[#1A2332] dark:text-white mb-4">New Task</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Project *</label>
                            <select
                              value={selectedProject || ""}
                              onChange={e => setSelectedProject(Number(e.target.value))}
                              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                            >
                              <option value="">Select Project</option>
                              {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Task Title *</label>
                            <input
                              value={newTask.title}
                              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                              placeholder="Design homepage mockups"
                              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-400 mb-1">Status</label>
                              <select
                                value={newTask.status}
                                onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                              >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-400 mb-1">Priority</label>
                              <select
                                value={newTask.priority}
                                onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-400 mb-1">Assignee</label>
                              <input
                                value={newTask.assignee}
                                onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
                                placeholder="Team Member"
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-400 mb-1">Due Date</label>
                              <input
                                type="date"
                                value={newTask.due_date}
                                onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={() => setShowNewTask(false)}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={createTask}
                            disabled={!newTask.title.trim() || !selectedProject}
                            className="flex-1 px-4 py-2 bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332] font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
                          >
                            Create Task
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Task Detail Modal */}
                <AnimatePresence>
                  {taskDetail && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                      onClick={() => setTaskDetail(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-[#1A2332] rounded-2xl p-6 w-full max-w-2xl border border-gray-100 dark:border-white/10 max-h-[90vh] overflow-y-auto"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-[#1A2332] dark:text-white">Task Details</h3>
                          <button onClick={() => setTaskDetail(null)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* Title */}
                        <div className="mb-4">
                          <label className="block text-xs font-semibold text-gray-400 mb-1">Title</label>
                          <p className="text-[#1A2332] dark:text-white font-medium">{taskDetail.title}</p>
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                          <label className="block text-xs font-semibold text-gray-400 mb-1">Description</label>
                          <textarea
                            value={taskDescription}
                            onChange={e => setTaskDescription(e.target.value)}
                            placeholder="Add a description..."
                            rows={3}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                          />
                        </div>

                        {/* Links */}
                        <div className="mb-4">
                          <label className="block text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1">
                            <Link2 className="w-3 h-3" /> Links (one per line)
                          </label>
                          <textarea
                            value={taskLinks}
                            onChange={e => setTaskLinks(e.target.value)}
                            placeholder="https://example.com&#10;https://docs.com"
                            rows={2}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                          />
                        </div>

                        {/* Images */}
                        <div className="mb-4">
                          <label className="block text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1">
                            <Image className="w-3 h-3" /> Image URLs (one per line)
                          </label>
                          <textarea
                            value={taskImages}
                            onChange={e => setTaskImages(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            rows={2}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                          />
                          {taskImages && (
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {taskImages.split('\n').filter(url => url.trim()).map((url, i) => (
                                <img 
                                  key={i} 
                                  src={url.trim()} 
                                  alt="" 
                                  className="w-16 h-16 object-cover rounded-lg" 
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Save Button */}
                        <button
                          onClick={saveTaskDetails}
                          className="w-full px-4 py-2 bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332] font-bold rounded-xl text-sm transition-colors mb-6"
                        >
                          Save Details
                        </button>

                        {/* Comments Section */}
                        <div className="border-t border-gray-100 dark:border-white/10 pt-4">
                          <h4 className="text-sm font-semibold text-[#1A2332] dark:text-white mb-3 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Comments
                          </h4>
                          
                          {/* Comment List */}
                          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                            {loadingComments ? (
                              <p className="text-gray-400 text-sm">Loading...</p>
                            ) : taskComments.length === 0 ? (
                              <p className="text-gray-400 text-sm">No comments yet</p>
                            ) : (
                              taskComments.map(comment => (
                                <div key={comment.id} className="bg-gray-50 dark:bg-white/5 rounded-lg p-3">
                                  <p className="text-xs text-[#D4AF7A] font-medium">{comment.author}</p>
                                  <p className="text-sm text-[#1A2332] dark:text-white">{comment.content}</p>
                                  <p className="text-xs text-gray-400 mt-1">{new Date(comment.created_at).toLocaleString()}</p>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Add Comment */}
                          <div className="flex gap-2">
                            <input
                              value={newComment}
                              onChange={e => setNewComment(e.target.value)}
                              placeholder="Add a comment..."
                              className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                              onKeyDown={e => e.key === "Enter" && addComment()}
                            />
                            <button
                              onClick={addComment}
                              disabled={!newComment.trim()}
                              className="px-4 py-2 bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332] font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress Bar */}
                {tasks.length > 0 && (
                  <ProjectProgress 
                    projects={projects} 
                    tasks={selectedProject ? tasks.filter(t => t.project_id === selectedProject) : tasks}
                    selectedProject={selectedProject}
                  />
                )}

                {/* Error Display */}
                {taskError && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-700 text-sm">{taskError}</p>
                    <button onClick={() => setTaskError(null)} className="ml-auto text-red-400 hover:text-red-600">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Kanban Board */}
                {loadingProjects ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-[#D4AF7A]" />
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-20">
                    <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#1A2332] dark:text-white mb-2">No projects yet</h3>
                    <p className="text-gray-400 text-sm mb-6">Create your first project to start tracking tasks</p>
                    <button
                      onClick={() => setShowNewProject(true)}
                      className="px-6 py-3 bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332] font-bold rounded-xl text-sm transition-colors"
                    >
                      Create First Project
                    </button>
                  </div>
                ) : (
                  <KanbanBoard
                    projects={projects}
                    tasks={selectedProject ? tasks.filter(t => t.project_id === selectedProject) : tasks}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                    currentUser={currentUser}
                    onViewDetail={openTaskDetail}
                  />
                )}
              </motion.div>
            )}

            {/* ── COMPOSE TAB ── */}
            {tab === "compose" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-[#1A2332] dark:text-white">Compose Newsletter</h1>
                    <p className="text-gray-500 text-sm mt-1">Will send to {activeCount} active subscribers</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPreviewOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-[#1A2332]/20 dark:border-white/20 rounded-xl text-sm font-medium text-[#1A2332] dark:text-white hover:bg-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={sendNewsletter}
                      disabled={sending}
                      className="flex items-center gap-2 px-6 py-2 bg-[#1A2332] hover:bg-[#2A3342] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {sending ? "Sending..." : "Send Newsletter"}
                    </button>
                  </div>
                </div>

                {/* Send Result */}
                <AnimatePresence>
                  {sendResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mb-6 px-5 py-4 rounded-xl flex items-center gap-3 ${
                        sendResult.ok ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                      }`}
                    >
                      {sendResult.ok
                        ? <><CheckCircle className="w-5 h-5 text-green-500" /><p className="text-green-700 text-sm font-medium">Newsletter sent to {sendResult.count} subscribers!</p></>
                        : <><XCircle className="w-5 h-5 text-red-500" /><p className="text-red-700 text-sm font-medium">{sendResult.error}</p></>
                      }
                      <button onClick={() => setSendResult(null)} className="ml-auto text-gray-400 hover:text-gray-600"><XCircle className="w-4 h-4" /></button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid gap-6 grid-cols-1 max-w-2xl">
                  <Card title="Email Details">
                    <Field label="Subject Line *">
                      <input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="e.g. 5 Mistakes Killing Your Brand Growth 📬" />
                    </Field>
                    <Field label="Issue Number">
                      <input value={form.issue} onChange={e => set("issue", e.target.value)} placeholder="001" />
                    </Field>
                  </Card>

                  <Card title="Hero Section">
                    <Field label="Headline *">
                      <input value={form.heroTitle} onChange={e => set("heroTitle", e.target.value)} placeholder="e.g. 5 Social Media Mistakes Killing Your Brand Growth" />
                    </Field>
                    <Field label="Intro Paragraph">
                      <textarea rows={3} value={form.heroIntro} onChange={e => set("heroIntro", e.target.value)} placeholder="Brief intro for this week's newsletter..." />
                    </Field>
                  </Card>

                  <Card title="Featured Article">
                    <Field label="Article Title">
                      <input value={form.articleTitle} onChange={e => set("articleTitle", e.target.value)} placeholder="e.g. Why Posting Every Day Isn't the Answer" />
                    </Field>
                    <Field label="Article Body">
                      <textarea rows={4} value={form.articleBody} onChange={e => set("articleBody", e.target.value)} placeholder="Article content..." />
                    </Field>
                    <Field label="Article URL">
                      <input value={form.articleUrl} onChange={e => set("articleUrl", e.target.value)} placeholder="https://needmoconsult.com/blog/..." />
                    </Field>
                    <Field label="Pull Quote">
                      <input value={form.pullQuote} onChange={e => set("pullQuote", e.target.value)} placeholder="e.g. Your audience doesn't need more content..." />
                    </Field>
                  </Card>

                  <Card title="Quick Tips" action={<button onClick={addTip} className="flex items-center gap-1 text-[#D4AF7A] text-xs font-semibold hover:text-[#C49A5E]"><Plus className="w-3 h-3" />Add Tip</button>}>
                    {tips.map((tip, i) => (
                      <div key={i} className="flex gap-3 items-start mb-3">
                        <div className="w-7 h-7 rounded-lg bg-[#1A2332] text-[#D4AF7A] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            value={tip.title}
                            onChange={e => setTip(i, "title", e.target.value)}
                            placeholder="Tip title"
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                          />
                          <input
                            value={tip.desc}
                            onChange={e => setTip(i, "desc", e.target.value)}
                            placeholder="Tip description"
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                          />
                        </div>
                        {tips.length > 1 && (
                          <button onClick={() => removeTip(i)} className="text-gray-300 hover:text-red-400 mt-1 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </Card>

                  <Card title="CTA / Offer Block">
                    <Field label="Offer Headline">
                      <input value={form.offerTitle} onChange={e => set("offerTitle", e.target.value)} placeholder="e.g. Free Social Media Audit" />
                    </Field>
                    <Field label="Offer Description">
                      <textarea rows={2} value={form.offerBody} onChange={e => set("offerBody", e.target.value)} placeholder="Describe the offer..." />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Button Label">
                        <input value={form.offerLabel} onChange={e => set("offerLabel", e.target.value)} placeholder="Book Free Strategy Call" />
                      </Field>
                      <Field label="Button URL">
                        <input value={form.offerUrl} onChange={e => set("offerUrl", e.target.value)} placeholder="https://needmoconsult.com/Contact" />
                      </Field>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* ── WELCOME EMAIL TAB ── */}
            {tab === "welcome" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-[#1A2332] dark:text-white">Welcome Email</h1>
                    <p className="text-gray-500 text-sm mt-1">Send a customized welcome email to a subscriber</p>
                  </div>
                </div>

                <AnimatePresence>
                  {welcomeResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mb-6 px-5 py-4 rounded-xl flex items-center gap-3 ${
                        welcomeResult.ok ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                      }`}
                    >
                      {welcomeResult.ok
                        ? <><CheckCircle className="w-5 h-5 text-green-500" /><p className="text-green-700 text-sm font-medium">Welcome email sent to {welcomeResult.email}!</p></>
                        : <><XCircle className="w-5 h-5 text-red-500" /><p className="text-red-700 text-sm font-medium">{welcomeResult.error}</p></>
                      }
                      <button onClick={() => setWelcomeResult(null)} className="ml-auto text-gray-400 hover:text-gray-600"><XCircle className="w-4 h-4" /></button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Card title="Email Content">
                      <Field label="Headline">
                        <input 
                          value={welcomeForm.headline} 
                          onChange={e => setWelcomeForm(f => ({ ...f, headline: e.target.value }))} 
                          placeholder="Welcome to the Family!" 
                        />
                      </Field>
                      <Field label="Introduction">
                        <textarea 
                          rows={4} 
                          value={welcomeForm.intro} 
                          onChange={e => setWelcomeForm(f => ({ ...f, intro: e.target.value }))} 
                          placeholder="Thanks for subscribing..." 
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Button Text">
                          <input 
                            value={welcomeForm.ctaText} 
                            onChange={e => setWelcomeForm(f => ({ ...f, ctaText: e.target.value }))} 
                            placeholder="Visit Our Website" 
                          />
                        </Field>
                        <Field label="Button URL">
                          <input 
                            value={welcomeForm.ctaUrl} 
                            onChange={e => setWelcomeForm(f => ({ ...f, ctaUrl: e.target.value }))} 
                            placeholder="https://needmoconsult.com" 
                          />
                        </Field>
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card title="Select Recipient">
                      <p className="text-sm text-gray-500 mb-3">Choose a subscriber to send this email to:</p>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {subscribers.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedSubscriber(sub)}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                              selectedSubscriber?.id === sub.id 
                                ? "border-[#D4AF7A] bg-[#D4AF7A]/10" 
                                : "border-gray-200 dark:border-white/10 hover:border-[#D4AF7A]/50"
                            }`}
                          >
                            <p className="text-sm font-medium text-[#1A2332] dark:text-white">{sub.name || "No name"}</p>
                            <p className="text-xs text-gray-500">{sub.email}</p>
                          </button>
                        ))}
                      </div>
                    </Card>

                    <Card title="Preview">
                      <div className="bg-gray-50 dark:bg-[#0D1117] rounded-xl p-4 space-y-3">
                        <p className="text-xs text-[#D4AF7A] font-semibold uppercase tracking-wider">Subject</p>
                        <p className="text-sm text-[#1A2332] dark:text-white">Welcome to the NEEDMO CONSULT Newsletter!</p>
                        
                        <div className="border-t border-gray-200 dark:border-white/10 pt-3">
                          <p className="text-xs text-[#D4AF7A] font-semibold uppercase tracking-wider">Preview</p>
                          <div className="mt-2 p-4 bg-white dark:bg-[#1A2332] rounded-xl">
                            <h3 className="text-base font-bold text-[#1A2332] dark:text-white mb-2">{welcomeForm.headline}</h3>
                            <p className="text-sm text-gray-500 mb-3">
                              Hi <strong>{selectedSubscriber?.name || "{Name}"}</strong>, {welcomeForm.intro}
                            </p>
                            <span className="inline-block px-4 py-2 bg-[#D4AF7A] text-white text-xs font-semibold rounded-full">
                              {welcomeForm.ctaText} →
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          if (!selectedSubscriber) {
                            setWelcomeResult({ error: "Please select a subscriber first" });
                            return;
                          }
                          setSendingWelcome(true);
                          setWelcomeResult(null);
                          try {
                            await apiSendWelcomeEmail({
                              email: selectedSubscriber.email,
                              name: selectedSubscriber.name,
                              headline: welcomeForm.headline,
                              intro: welcomeForm.intro,
                              cta_text: welcomeForm.ctaText,
                              cta_url: welcomeForm.ctaUrl,
                            });
                            setWelcomeResult({ ok: true, email: selectedSubscriber.email });
                            setSelectedSubscriber(null);
                          } catch (err) {
                            setWelcomeResult({ error: err.message });
                          }
                          setSendingWelcome(false);
                        }}
                        disabled={!selectedSubscriber || sendingWelcome}
                        className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332] font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingWelcome ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {sendingWelcome ? "Sending..." : "Send Welcome Email"}
                      </button>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── SUBSCRIBERS TAB ── */}
            {tab === "subscribers" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-[#1A2332] dark:text-white">Subscribers</h1>
                    <p className="text-gray-500 text-sm mt-1">{subscribers.length} total · {activeCount} active</p>
                  </div>
                  <button onClick={fetchSubscribers} className="px-4 py-2 bg-[#1A2332] text-white rounded-xl text-sm font-medium hover:bg-[#2A3342] transition-colors">
                    Refresh
                  </button>
                </div>

                <div className="bg-white dark:bg-[#1A2332] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10">
                  {loadingSubs ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-6 h-6 animate-spin text-[#D4AF7A]" />
                    </div>
                  ) : subscribers.length === 0 ? (
                    <div className="text-center py-16">
                      <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No subscribers yet</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-white/10">
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                          <th className="px-6 py-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.map((sub, i) => (
                          <tr key={sub.id} className={`border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${i === subscribers.length - 1 ? "border-b-0" : ""}`}>
                            <td className="px-6 py-4 text-sm text-[#1A2332] dark:text-white font-medium">{sub.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{sub.name || "—"}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                sub.status === "active"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}>
                                {sub.status || "active"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">
                              {new Date(sub.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => deleteSubscriber(sub.id)}
                                className="text-gray-300 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── CONTACTS TAB ── */}
            {tab === "contacts" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-[#1A2332] dark:text-white">Contacts</h1>
                    <p className="text-gray-500 text-sm mt-1">{contacts.length} total · {unreadContacts} unread</p>
                  </div>
                  <button onClick={fetchContacts} className="px-4 py-2 bg-[#1A2332] text-white rounded-xl text-sm font-medium hover:bg-[#2A3342] transition-colors">
                    Refresh
                  </button>
                </div>

                <div className="space-y-4">
                  {contacts.length === 0 ? (
                    <div className="bg-white dark:bg-[#1A2332] rounded-2xl p-16 text-center border border-gray-100 dark:border-white/10">
                      <Mail className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No contact enquiries yet</p>
                    </div>
                  ) : contacts.map(contact => (
                    <div
                      key={contact.id}
                      onClick={() => !contact.is_read && markContact(contact.id)}
                      className={`bg-white dark:bg-[#1A2332] rounded-2xl p-6 border transition-all cursor-pointer ${
                        contact.is_read
                          ? "border-gray-100 dark:border-white/10"
                          : "border-[#D4AF7A]/30 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-[#1A2332] dark:text-white">{contact.name}</h3>
                            {!contact.is_read && (
                              <span className="px-2 py-0.5 bg-[#D4AF7A]/10 text-[#D4AF7A] text-xs font-semibold rounded-full">New</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{contact.email}</p>
                          {contact.phone && <p className="text-sm text-gray-400 mb-2">📞 {contact.phone}</p>}
                          {contact.service_interest && (
                            <span className="inline-block mb-3 px-3 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                              {contact.service_interest}
                            </span>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{contact.message}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">
                            {new Date(contact.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(contact.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
      </main>

      {/* ── PREVIEW MODAL ── */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8 px-4" onClick={() => setPreviewOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white text-sm font-semibold uppercase tracking-widest">Email Preview</p>
              <button onClick={() => setPreviewOpen(false)} className="text-white/60 hover:text-white text-sm flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Close
              </button>
            </div>
            <NewsletterPreview form={form} tips={tips} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────
function Card({ title, children, action = null }) {
  return (
    <div className="bg-white dark:bg-[#1A2332] rounded-2xl p-6 border border-gray-100 dark:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#1A2332] dark:text-white uppercase tracking-wider">{title}</h3>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  const child = React.Children.only(children);
  const enhanced = React.cloneElement(child, {
    className: "w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/60 transition-colors resize-none",
  });
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
      {enhanced}
    </div>
  );
}

// ─── Inline Newsletter Preview ────────────────────────────────────────────────
function NewsletterPreview({ form, tips }) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const year = new Date().getFullYear();
  const activeTips = tips.filter(t => t.title);
  const G = "Georgia,serif";

  return (
    <div style={{ fontFamily: G, backgroundColor: "#E8E6E1", padding: "32px 16px" }}>
      <div style={{ maxWidth: 580, margin: "0 auto", backgroundColor: "#fff" }}>
        <div style={{ height: 3, backgroundColor: "#D4AF7A" }} />
        <div style={{ backgroundColor: "#1A2332", padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <img src="https://assets.needmoconsult.com/Logo-Light.webp" alt="NEEDMO" height={28} style={{ height: 28 }} />
          <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: G, letterSpacing: 3, textTransform: "uppercase" }}>Weekly Insights</p>
        </div>
        <div style={{ padding: "18px 32px", borderBottom: "1px solid #EEEBE5", display: "flex", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: 10, color: "#B8A882", fontFamily: G, letterSpacing: 2, textTransform: "uppercase" }}>Issue No. {form.issue || "001"} — {date}</p>
          <p style={{ margin: 0, fontSize: 10, color: "#B8A882", fontFamily: G, letterSpacing: 2, textTransform: "uppercase" }}>Brand & Social Intelligence</p>
        </div>
        <div style={{ padding: "44px 32px 36px" }}>
          <p style={{ margin: "0 0 16px", fontSize: 9, color: "#D4AF7A", fontFamily: G, letterSpacing: 5, textTransform: "uppercase" }}>This Week's Edition</p>
          <h1 style={{ margin: "0 0 20px", fontSize: 32, fontWeight: "normal", color: "#1A2332", lineHeight: 1.15, fontFamily: G, letterSpacing: -0.5 }}>{form.heroTitle || "Your Newsletter Headline"}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 40, height: 1, backgroundColor: "#D4AF7A" }} />
            <div style={{ flex: 1, height: 1, backgroundColor: "#EEEBE5" }} />
          </div>
          <p style={{ margin: "0 0 24px", fontSize: 15, color: "#5A5A5A", lineHeight: 1.85, fontFamily: G }}>{form.heroIntro || "Intro text will appear here."}</p>
          <a href="#" style={{ display: "inline-block", backgroundColor: "#1A2332", color: "#D4AF7A", fontSize: 11, textDecoration: "none", padding: "12px 28px", fontFamily: G, letterSpacing: 3, textTransform: "uppercase" }}>Book a Free Strategy Call →</a>
        </div>
        {activeTips.length > 0 && (
          <div style={{ padding: "36px 32px 0" }}>
            <p style={{ margin: "0 0 6px", fontSize: 9, color: "#D4AF7A", fontFamily: G, letterSpacing: 5, textTransform: "uppercase" }}>Quick Tips</p>
            <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: "normal", color: "#1A2332", fontFamily: G }}>Actionable Insights For This Week</h2>
            {activeTips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 16, padding: "16px 0", borderTop: "1px solid #EEEBE5", borderBottom: i === activeTips.length - 1 ? "1px solid #EEEBE5" : "none" }}>
                <p style={{ margin: 0, fontSize: 11, color: "#D4AF7A", fontFamily: G, minWidth: 24, paddingTop: 2 }}>{String(i + 1).padStart(2, "0")}</p>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: "#1A2332", fontFamily: G, fontWeight: "bold" }}>{tip.title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#777", lineHeight: 1.7, fontFamily: G }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ backgroundColor: "#1A2332", padding: "40px 32px" }}>
          <p style={{ margin: "0 0 16px", fontSize: 9, color: "#D4AF7A", fontFamily: G, letterSpacing: 5, textTransform: "uppercase" }}>Exclusive Subscriber Offer</p>
          <h2 style={{ margin: "0 0 12px", fontSize: 24, fontWeight: "normal", color: "#fff", lineHeight: 1.3, fontFamily: G }}>{form.offerTitle || "Special Offer"}</h2>
          <p style={{ margin: "0 0 24px", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.85, fontFamily: G }}>{form.offerBody || ""}</p>
          <a href={form.offerUrl} style={{ display: "inline-block", backgroundColor: "#D4AF7A", color: "#1A2332", fontSize: 11, textDecoration: "none", padding: "13px 32px", fontFamily: G, letterSpacing: 3, textTransform: "uppercase" }}>{form.offerLabel} →</a>
        </div>
        <div style={{ borderTop: "1px solid #EEEBE5", backgroundColor: "#F9F7F4", padding: "28px 32px", textAlign: "center" }}>
          <img src="https://assets.needmoconsult.com/Logo-Dark.webp" alt="NEEDMO" height={22} style={{ display: "block", margin: "0 auto 6px", height: 22 }} />
          <p style={{ margin: "0 0 20px", fontSize: 9, color: "#B8A882", fontFamily: G, letterSpacing: 3, textTransform: "uppercase" }}>Your Brand Deserves More</p>
          <p style={{ margin: "0 0 6px", fontSize: 10, color: "#B8A882", fontFamily: G, lineHeight: 1.6 }}>© {year} NEEDMO CONSULT · Lagos, Nigeria · hello@needmoconsult.com</p>
          <p style={{ margin: 0, fontSize: 10, color: "#B8A882", fontFamily: G }}>needmoconsult.com · Privacy Policy · Unsubscribe</p>
        </div>
        <div style={{ height: 3, backgroundColor: "#D4AF7A" }} />
      </div>
    </div>
  );
}
