import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { validateTodo, sanitizeString, ALLOWED_VALUES } from "@/lib/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Plus, Search, X, AlertCircle, CheckCircle2, Clock,
  Circle, ListTodo, Pencil, Trash2, ChevronDown,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type Priority = "low" | "medium" | "high";
type Status   = "pending" | "in_progress" | "completed";
type Category = "maintenance" | "tenant" | "financial" | "legal" | "general";
type SortKey  = "due_date" | "priority" | "created_at";

interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  due_date: string | null;
  property_id: string | null;
  category: Category | null;
  created_at: string;
  updated_at: string;
}

type TodoInsert = Omit<Todo, "id" | "user_id" | "created_at" | "updated_at">;

// ── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_LABEL: Record<Priority, string> = { low: "Low", medium: "Medium", high: "High" };
const STATUS_LABEL:   Record<Status,   string> = { pending: "Pending", in_progress: "In Progress", completed: "Completed" };
const CATEGORY_LABEL: Record<Category, string> = {
  maintenance: "Maintenance", tenant: "Tenant",
  financial: "Financial", legal: "Legal", general: "General",
};

const PRIORITY_BADGE: Record<Priority, string> = {
  low:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50   text-amber-700   border-amber-200",
  high:   "bg-rose-50    text-rose-700    border-rose-200",
};

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

const CATEGORY_COLORS: Record<Category, string> = {
  maintenance: "bg-blue-50  text-blue-700  border-blue-200",
  tenant:      "bg-violet-50 text-violet-700 border-violet-200",
  financial:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  legal:       "bg-slate-100 text-slate-700  border-slate-200",
  general:     "bg-orange-50 text-orange-700 border-orange-200",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function isOverdue(todo: Todo): boolean {
  if (!todo.due_date || todo.status === "completed") return false;
  return new Date(todo.due_date + "T00:00:00") < new Date(new Date().toDateString());
}

function emptyForm(): TodoInsert {
  return {
    title: "",
    description: null,
    priority: "medium",
    status: "pending",
    due_date: null,
    property_id: null,
    category: null,
  };
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ToDo() {
  const queryClient = useQueryClient();

  // ── Local UI state
  const [showForm, setShowForm]     = useState(false);
  const [editId,   setEditId]       = useState<string | null>(null);
  const [form,     setForm]         = useState<TodoInsert>(emptyForm());
  const [formErr,  setFormErr]      = useState("");
  const [deleteId, setDeleteId]     = useState<string | null>(null);

  // ── Filters / sort
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterPrio,   setFilterPrio]   = useState<Priority | "all">("all");
  const [filterCat,    setFilterCat]    = useState<Category | "all">("all");
  const [sortBy,       setSortBy]       = useState<SortKey>("created_at");

  // ── Query ────────────────────────────────────────────────────────────────

  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Todo[];
    },
  });

  // ── Derived stats ─────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total:     todos.length,
    completed: todos.filter(t => t.status === "completed").length,
    pending:   todos.filter(t => t.status === "pending").length,
    overdue:   todos.filter(isOverdue).length,
  }), [todos]);

  // ── Filtered + sorted list ────────────────────────────────────────────────

  const displayed = useMemo(() => {
    let list = todos.filter(t => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterPrio   !== "all" && t.priority !== filterPrio)  return false;
      if (filterCat    !== "all" && t.category !== filterCat)   return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "priority") {
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      }
      if (sortBy === "due_date") {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [todos, filterStatus, filterPrio, filterCat, search, sortBy]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async () => {
      const validated = validateTodo(form);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (editId) {
        const { error } = await supabase
          .from("todos")
          .update({ ...validated, updated_at: new Date().toISOString() })
          .eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("todos")
          .insert({ ...validated, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      closeForm();
      toast.success(editId ? "Todo updated" : "Todo added");
    },
    onError: (e: any) => {
      setFormErr(e.message || "Failed to save todo");
    },
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const next: Status = status === "completed" ? "pending" : "completed";
      const { error } = await supabase
        .from("todos")
        .update({ status: next, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("todos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setDeleteId(null);
      toast.success("Todo deleted");
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete"),
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  function openAdd() {
    setEditId(null);
    setForm(emptyForm());
    setFormErr("");
    setShowForm(true);
  }

  function openEdit(todo: Todo) {
    setEditId(todo.id);
    setForm({
      title:       todo.title,
      description: todo.description,
      priority:    todo.priority,
      status:      todo.status,
      due_date:    todo.due_date,
      property_id: todo.property_id,
      category:    todo.category,
    });
    setFormErr("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm());
    setFormErr("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setFormErr("Title is required."); return; }
    saveMutation.mutate();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">To Do</h1>
          <p className="text-sm text-slate-500 mt-1">Track tasks and action items across all your properties.</p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 border-0"
        >
          <Plus className="w-4 h-4" /> Add Todo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",     value: stats.total,     icon: ListTodo,    color: "text-slate-700" },
          { label: "Pending",   value: stats.pending,   icon: Circle,      color: "text-amber-600" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2,color: "text-emerald-600" },
          { label: "Overdue",   value: stats.overdue,   icon: AlertCircle, color: "text-rose-600" },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl bg-white border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <Icon className={`w-5 h-5 ${card.color} shrink-0`} />
              <div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-500">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search todos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            aria-label="Search todos"
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as Status | "all")}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          {(ALLOWED_VALUES.TODO_STATUS as Status[]).map(s => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>

        {/* Priority filter */}
        <select
          value={filterPrio}
          onChange={e => setFilterPrio(e.target.value as Priority | "all")}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          aria-label="Filter by priority"
        >
          <option value="all">All Priorities</option>
          {(ALLOWED_VALUES.TODO_PRIORITY as Priority[]).map(p => (
            <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
          ))}
        </select>

        {/* Category filter */}
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value as Category | "all")}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          {(ALLOWED_VALUES.TODO_CATEGORY as Category[]).map(c => (
            <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortKey)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          aria-label="Sort todos"
        >
          <option value="created_at">Sort: Date Added</option>
          <option value="due_date">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
        </select>
      </div>

      {/* Todo list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <ListTodo className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-500">
            {todos.length === 0 ? "No todos yet" : "No todos match your filters"}
          </p>
          {todos.length === 0 && (
            <p className="text-sm text-slate-400 mt-1">Click "Add Todo" to get started.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map(todo => {
            const overdue = isOverdue(todo);
            const done    = todo.status === "completed";
            return (
              <div
                key={todo.id}
                className={`flex items-start gap-3 p-4 rounded-xl border bg-white transition-colors ${
                  overdue
                    ? "border-rose-200 bg-rose-50/40"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Checkbox */}
                <Checkbox
                  checked={done}
                  onCheckedChange={() => toggleStatus.mutate({ id: todo.id, status: todo.status })}
                  aria-label={`Mark "${todo.title}" as ${done ? "pending" : "completed"}`}
                  className="mt-0.5 shrink-0"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className={`font-medium text-sm leading-snug ${done ? "line-through text-slate-400" : "text-slate-800"}`}>
                      {todo.title}
                    </span>
                    {overdue && (
                      <span className="text-xs font-semibold text-rose-600 flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3" /> Overdue
                      </span>
                    )}
                  </div>

                  {todo.description && (
                    <p className={`text-xs mt-0.5 line-clamp-2 ${done ? "text-slate-400" : "text-slate-500"}`}>
                      {todo.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {/* Priority badge */}
                    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${PRIORITY_BADGE[todo.priority]}`}>
                      {PRIORITY_LABEL[todo.priority]}
                    </span>

                    {/* Status badge */}
                    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${
                      todo.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : todo.status === "in_progress" ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {STATUS_LABEL[todo.status]}
                    </span>

                    {/* Category */}
                    {todo.category && (
                      <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[todo.category]}`}>
                        {CATEGORY_LABEL[todo.category]}
                      </span>
                    )}

                    {/* Due date */}
                    {todo.due_date && (
                      <span className={`inline-flex items-center gap-1 text-xs ${overdue ? "text-rose-600 font-semibold" : "text-slate-400"}`}>
                        <Clock className="w-3 h-3" />
                        {new Date(todo.due_date + "T00:00:00").toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(todo)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition"
                    aria-label={`Edit "${todo.title}"`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(todo.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    aria-label={`Delete "${todo.title}"`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editId ? "Edit Todo" : "Add Todo"}</h2>
              <button
                onClick={closeForm}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

              {formErr && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{formErr}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="todo-title">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="todo-title"
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="What needs to be done?"
                  maxLength={255}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="todo-desc">
                  Description
                </label>
                <textarea
                  id="todo-desc"
                  value={form.description ?? ""}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value || null }))}
                  rows={3}
                  maxLength={2000}
                  placeholder="Optional details..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
                />
              </div>

              {/* Priority + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="todo-priority">
                    Priority
                  </label>
                  <select
                    id="todo-priority"
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="todo-status">
                    Status
                  </label>
                  <select
                    id="todo-status"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Category + Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="todo-category">
                    Category
                  </label>
                  <select
                    id="todo-category"
                    value={form.category ?? ""}
                    onChange={e => setForm(f => ({ ...f, category: (e.target.value || null) as Category | null }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="">No category</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="tenant">Tenant</option>
                    <option value="financial">Financial</option>
                    <option value="legal">Legal</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="todo-due">
                    Due Date
                  </label>
                  <input
                    id="todo-due"
                    type="date"
                    value={form.due_date ?? ""}
                    onChange={e => setForm(f => ({ ...f, due_date: e.target.value || null }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 border-0"
                >
                  {saveMutation.isPending ? "Saving…" : editId ? "Update Todo" : "Add Todo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <Trash2 className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Todo?</h3>
            <p className="text-sm text-slate-500 mb-5">
              "{todos.find(t => t.id === deleteId)?.title}" will be permanently removed.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white border-0"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
