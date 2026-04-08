import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText, Shield, ClipboardList, Bell, Plus, Search,
  Download, Trash2, FileCheck, FilePlus, AlertCircle, X
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type DocStatus = "Draft" | "Sent" | "Signed" | "Expired" | "Archived";
type DocType =
  | "Lease Agreement"
  | "Lease Renewal"
  | "Lease Termination"
  | "Late Rent Notice"
  | "Maintenance Entry Notice"
  | "Move-Out Checklist"
  | "Security Deposit Itemization"
  | "Pet Agreement Addendum"
  | "Property Rules"
  | "Disclosure"
  | "Other";

interface LegalDoc {
  id: string;
  created_at: string;
  title: string;
  type: DocType;
  property: string;
  tenant: string;
  status: DocStatus;
  date: string;
  notes: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "pp_legal_docs_v1";

const DOC_TYPES: DocType[] = [
  "Lease Agreement",
  "Lease Renewal",
  "Lease Termination",
  "Late Rent Notice",
  "Maintenance Entry Notice",
  "Move-Out Checklist",
  "Security Deposit Itemization",
  "Pet Agreement Addendum",
  "Property Rules",
  "Disclosure",
  "Other",
];

const STATUS_OPTIONS: DocStatus[] = ["Draft", "Sent", "Signed", "Expired", "Archived"];

const TEMPLATES: {
  title: string;
  type: DocType;
  notes: string;
  icon: React.ElementType;
}[] = [
  { title: "Late Rent Notice", type: "Late Rent Notice", icon: Bell, notes: "Standard 3-day pay or quit notice for overdue rent." },
  { title: "Maintenance Entry Notice", type: "Maintenance Entry Notice", icon: FileText, notes: "24-hour notice of entry for scheduled maintenance." },
  { title: "Lease Renewal Offer", type: "Lease Renewal", icon: FileText, notes: "Standard lease renewal terms and conditions." },
  { title: "Move-Out Checklist", type: "Move-Out Checklist", icon: ClipboardList, notes: "Inspection checklist for unit turnover and deposit return." },
  { title: "Security Deposit Itemization", type: "Security Deposit Itemization", icon: Shield, notes: "Itemized statement of deductions from security deposit." },
  { title: "Pet Agreement Addendum", type: "Pet Agreement Addendum", icon: FileText, notes: "Pet policy addendum for lease agreements." },
  { title: "Lease Termination Notice", type: "Lease Termination", icon: Bell, notes: "30/60-day notice of lease termination." },
  { title: "Property Rules & Regulations", type: "Property Rules", icon: ClipboardList, notes: "Community rules, quiet hours, parking, and common area policies." },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadDocs(): LegalDoc[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDocs(docs: LegalDoc[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

function newId() {
  return `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function statusColor(status: DocStatus): string {
  switch (status) {
    case "Draft":    return "bg-slate-100 text-slate-700 border-slate-200";
    case "Sent":     return "bg-blue-50 text-blue-700 border-blue-200";
    case "Signed":   return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Expired":  return "bg-amber-50 text-amber-700 border-amber-200";
    case "Archived": return "bg-slate-100 text-slate-500 border-slate-200";
  }
}

function typeIcon(type: DocType): React.ElementType {
  switch (type) {
    case "Late Rent Notice":
    case "Lease Termination":  return Bell;
    case "Move-Out Checklist":
    case "Property Rules":     return ClipboardList;
    case "Security Deposit Itemization":
    case "Disclosure":         return Shield;
    case "Lease Agreement":
    case "Lease Renewal":      return FileCheck;
    default:                   return FileText;
  }
}

function exportCsv(docs: LegalDoc[]) {
  const header = ["Title", "Type", "Property", "Tenant", "Status", "Date", "Notes"];
  const rows = docs.map(d => [
    `"${d.title}"`, `"${d.type}"`, `"${d.property}"`, `"${d.tenant}"`,
    d.status, d.date, `"${d.notes.replace(/"/g, '""')}"`
  ]);
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `legal-docs-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Empty form ────────────────────────────────────────────────────────────────

function emptyForm(): Omit<LegalDoc, "id" | "created_at"> {
  return {
    title: "",
    type: "Lease Agreement",
    property: "",
    tenant: "",
    status: "Draft",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  };
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Legal() {
  const [docs, setDocs] = useState<LegalDoc[]>(loadDocs);
  const [activeTab, setActiveTab] = useState<"documents" | "templates">("documents");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<DocStatus | "All">("All");

  // ── Derived ──────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return docs.filter(d => {
      const matchSearch =
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.property.toLowerCase().includes(search.toLowerCase()) ||
        d.tenant.toLowerCase().includes(search.toLowerCase()) ||
        d.type.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "All" || d.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [docs, search, filterStatus]);

  const kpi = useMemo(() => ({
    total:    docs.length,
    drafts:   docs.filter(d => d.status === "Draft").length,
    signed:   docs.filter(d => d.status === "Signed").length,
    awaiting: docs.filter(d => d.status === "Sent").length,
  }), [docs]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function openBlank() {
    setForm(emptyForm());
    setFormError("");
    setShowForm(true);
  }

  function openFromTemplate(tpl: typeof TEMPLATES[number]) {
    setForm({ ...emptyForm(), title: tpl.title, type: tpl.type, notes: tpl.notes });
    setFormError("");
    setActiveTab("documents");
    setShowForm(true);
  }

  function handleSave() {
    if (!form.title.trim()) { setFormError("Title is required."); return; }
    if (!form.date)         { setFormError("Date is required."); return; }
    const doc: LegalDoc = { ...form, id: newId(), created_at: new Date().toISOString() };
    const updated = [doc, ...docs];
    setDocs(updated);
    saveDocs(updated);
    setShowForm(false);
    setForm(emptyForm());
    setFormError("");
  }

  function handleStatusChange(id: string, status: DocStatus) {
    const updated = docs.map(d => d.id === id ? { ...d, status } : d);
    setDocs(updated);
    saveDocs(updated);
  }

  function handleDelete(id: string) {
    const updated = docs.filter(d => d.id !== id);
    setDocs(updated);
    saveDocs(updated);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legal</h1>
          <p className="text-sm text-slate-500 mt-1">Leases, disclosures, notices, and compliance documents.</p>
        </div>
        <div className="flex gap-2">
          {docs.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => exportCsv(filtered)} className="gap-1.5">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          )}
          <Button size="sm" onClick={openBlank} className="gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 border-0">
            <Plus className="w-4 h-4" /> Add Document
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Documents", value: kpi.total,    icon: FileText,     color: "text-slate-700" },
          { label: "Drafts",          value: kpi.drafts,   icon: FilePlus,     color: "text-slate-500" },
          { label: "Signed",          value: kpi.signed,   icon: FileCheck,    color: "text-emerald-600" },
          { label: "Awaiting",        value: kpi.awaiting, icon: AlertCircle,  color: "text-blue-600" },
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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {(["documents", "templates"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition rounded-t-lg ${
              activeTab === tab
                ? "text-orange-600 border-b-2 border-orange-500 bg-orange-50"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Documents Tab ── */}
      {activeTab === "documents" && (
        <div className="space-y-4">

          {/* Search + Filter */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as DocStatus | "All")}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-slate-500">
                {docs.length === 0 ? "No documents yet" : "No documents match your search"}
              </p>
              {docs.length === 0 && (
                <p className="text-sm text-slate-400 mt-1">
                  Add a document or use a template to get started.
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-left">
                      <th className="px-4 py-3 font-semibold text-slate-600">Document</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Type</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Property / Tenant</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(doc => {
                      const Icon = typeIcon(doc.type);
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4 text-orange-500" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">{doc.title}</p>
                                {doc.notes && (
                                  <p className="text-xs text-slate-400 truncate max-w-[200px]">{doc.notes}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{doc.type}</td>
                          <td className="px-4 py-3">
                            <p className="text-slate-700">{doc.property || <span className="text-slate-400">—</span>}</p>
                            {doc.tenant && <p className="text-xs text-slate-400">{doc.tenant}</p>}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{doc.date}</td>
                          <td className="px-4 py-3">
                            <select
                              value={doc.status}
                              onChange={e => handleStatusChange(doc.id, e.target.value as DocStatus)}
                              className={`text-xs font-medium px-2 py-1 rounded-md border cursor-pointer focus:outline-none ${statusColor(doc.status)}`}
                            >
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete document"
                              aria-label={`Delete ${doc.title}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Templates Tab ── */}
      {activeTab === "templates" && (
        <div>
          <p className="text-sm text-slate-500 mb-4">Click a template to pre-fill an Add Document form.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TEMPLATES.map(tpl => {
              const Icon = tpl.icon;
              return (
                <button
                  key={tpl.title}
                  onClick={() => openFromTemplate(tpl)}
                  className="flex items-start gap-4 p-5 rounded-xl bg-white border border-slate-200 hover:border-orange-300 hover:shadow-md transition text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition">
                    <Icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm text-slate-800">{tpl.title}</h3>
                      <Badge variant="outline" className="text-xs">{tpl.type}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{tpl.notes}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Add Document Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Add Document</h2>
              <button
                onClick={() => { setShowForm(false); setFormError(""); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">

              {formError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="legal-title">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="legal-title"
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Lease Agreement – Unit 4B"
                  maxLength={200}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="legal-type">
                    Type
                  </label>
                  <select
                    id="legal-type"
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as DocType }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  >
                    {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="legal-status">
                    Status
                  </label>
                  <select
                    id="legal-status"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as DocStatus }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="legal-property">
                    Property
                  </label>
                  <input
                    id="legal-property"
                    type="text"
                    value={form.property}
                    onChange={e => setForm(f => ({ ...f, property: e.target.value }))}
                    placeholder="e.g. 123 Main St"
                    maxLength={200}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="legal-tenant">
                    Tenant
                  </label>
                  <input
                    id="legal-tenant"
                    type="text"
                    value={form.tenant}
                    onChange={e => setForm(f => ({ ...f, tenant: e.target.value }))}
                    placeholder="Tenant name"
                    maxLength={200}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="legal-date">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  id="legal-date"
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="legal-notes">
                  Notes
                </label>
                <textarea
                  id="legal-notes"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  maxLength={1000}
                  placeholder="Optional notes or description..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => { setShowForm(false); setFormError(""); }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 border-0"
              >
                Save Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
