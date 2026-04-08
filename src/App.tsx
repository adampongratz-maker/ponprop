import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import { validateProperty, validateTenant, validateLedgerEntry } from "./lib/validation";
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import Privacy, { isPrivacyAccepted, markPrivacyAccepted } from "./pages/Privacy";

// Module page components
import ToDoPage from "./pages/ToDo";
import RentalHistoryPage from "./pages/RentalHistory";
import MaintenancePage from "./pages/Maintenance";
import InventoryPage from "./pages/Inventory";
import TimeCardsPage from "./pages/TimeCards";
import ProjectsPage from "./pages/Projects";
import MarketingPage from "./pages/Marketing";
import LegalPage from "./pages/Legal";
import FinancePage from "./pages/Finance";
import CalendarPage from "./pages/Calendar";
import ComplaintsPage from "./pages/Complaints";
import AnalyticsPage from "./pages/Analytics";
import ITPage from "./pages/IT";

type ModuleKey =
  | "Home"
  | "To Do"
  | "History"
  | "Tenants"
  | "Maintenance"
  | "Inventory"
  | "Time Cards"
  | "Reports"
  | "Accounting"
  | "Properties"
  | "Projects"
  | "Marketing"
  | "Legal"
  | "Finance"
  | "Calendar"
  | "Complaints"
  | "Analytics"
  | "IT";

type PropertyRow = {
  id: string;
  name: string;
  address: string;
  units: number;
  status: string;
};

type TenantRow = {
  id: string;
  name: string;
  unit: string;
  balance: number;
  status: string;
};

type LedgerRow = {
  id: string;
  date: string;
  type: string;
  amount: number;
  tenant: string | null;
  property: string | null;
  unit: string | null;
  method: string | null;
  user_id: string;
};

// All modules are now implemented — no coming soon placeholders
const IMPLEMENTED_MODULES: ModuleKey[] = [
  "Home", "To Do", "History", "Tenants", "Maintenance", "Inventory",
  "Time Cards", "Reports", "Accounting", "Properties", "Projects",
  "Marketing", "Legal", "Finance", "Calendar", "Complaints", "Analytics", "IT",
];

// Top-level sidebar items in the requested order.
// "Time Cards", "To Do", and "Calendar" are nested under the Employee group.
const sidebarItems = [
  "Home",
  "Accounting",
  "Maintenance",
  "Marketing",
  // Employee group items rendered separately below
  "Properties",
  "Tenants",
  "History",
  "Inventory",
  "Reports",
  "Projects",
  "Legal",
  "Finance",
  "Complaints",
  "Analytics",
  "IT",
];

const employeeItems = ["Time Cards", "To Do", "Calendar"] as const;

const appItems = [
  { name: "Home", icon: "⌂", color: "linear-gradient(135deg, #ff8a5b, #f05a4f)" },
  { name: "To Do", icon: "☑", color: "linear-gradient(135deg, #38d2a5, #19b5d1)" },
  { name: "History", icon: "◷", color: "linear-gradient(135deg, #72a8ff, #5e6df5)" },
  { name: "Tenants", icon: "◌◌", color: "linear-gradient(135deg, #b57cff, #ee4fa5)" },
  { name: "Maintenance", icon: "⚒", color: "linear-gradient(135deg, #ff8c66, #ff7a1a)" },
  { name: "Inventory", icon: "▣", color: "linear-gradient(135deg, #ffc928, #f0ac00)" },
  { name: "Time Cards", icon: "◔", color: "linear-gradient(135deg, #f59f3a, #e67c00)" },
  { name: "Reports", icon: "△", color: "linear-gradient(135deg, #3cc8e8, #3378f4)" },
  { name: "Accounting", icon: "$", color: "linear-gradient(135deg, #37d47d, #14b85b)" },
  { name: "Properties", icon: "▤", color: "linear-gradient(135deg, #4bb7f0, #2b6ef3)" },
  { name: "Projects", icon: "▥", color: "linear-gradient(135deg, #b47cff, #7e42ea)" },
  { name: "Marketing", icon: "⟡", color: "linear-gradient(135deg, #ff6db0, #ef3f73)" },
  { name: "Legal", icon: "⚖", color: "linear-gradient(135deg, #8c9ab2, #5f6f89)" },
  { name: "Finance", icon: "▥", color: "linear-gradient(135deg, #37d3b5, #14b27e)" },
  { name: "Calendar", icon: "☷", color: "linear-gradient(135deg, #ff7583, #fb4f5f)" },
  { name: "Complaints", icon: "◫", color: "linear-gradient(135deg, #708099, #3f4d62)" },
  { name: "Analytics", icon: "◔", color: "linear-gradient(135deg, #8b68ff, #5d48eb)" },
  { name: "IT", icon: "▭", color: "linear-gradient(135deg, #5b8cff, #4b5df0)" },
];

function statusBadgeClass(status: string): string {
  switch (status) {
    case "Active":
      return "bg-emerald-100 text-emerald-700";
    case "Inactive":
      return "bg-slate-100 text-slate-600";
    case "Maintenance":
      return "bg-amber-100 text-amber-700";
    case "Evicted":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    // getSession() reads from localStorage — safe to call here because ALL
    // OAuth flows now go through /auth/callback, which exchanges the code and
    // stores the session BEFORE navigating to /home. By the time this
    // component mounts, the session is guaranteed to be in storage.
    //
    // Without this call, onAuthStateChange fires INITIAL_SESSION before
    // Supabase's in-memory cache syncs from localStorage, delivering a null
    // session → setUser(null) → premature redirect to "/".
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[ProtectedRoute] getSession →", session?.user?.email ?? null);
      setUser(session?.user ?? null);
    });

    // Keep the listener for ongoing changes: sign-out, token refresh, etc.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[ProtectedRoute] onAuthStateChange →", event, session?.user?.email ?? null);
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center" role="status" aria-label="Loading">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" aria-hidden="true" />
          <p className="mt-3 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user === null) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Inline error/success message component
function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (error) {
    return (
      <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-start gap-2">
        <span aria-hidden="true">⚠</span>
        <span>{error}</span>
      </div>
    );
  }
  if (success) {
    return (
      <div role="status" className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-start gap-2">
        <span aria-hidden="true">✓</span>
        <span>{success}</span>
      </div>
    );
  }
  return null;
}


const CHART_RED = "#ef4444";
const CHART_EMERALD = "#22c55e";

function Dashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<ModuleKey>("Home");
  const [accountingTab, setAccountingTab] = useState<"charts" | "ledger">("charts");
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [transactions, setTransactions] = useState<LedgerRow[]>([]);

  // Per-form submitting state
  const [propSubmitting, setPropSubmitting] = useState(false);
  const [tenantSubmitting, setTenantSubmitting] = useState(false);
  const [txSubmitting, setTxSubmitting] = useState(false);

  // Per-form inline messages
  const [propMsg, setPropMsg] = useState<{ error?: string; success?: string }>({});
  const [tenantMsg, setTenantMsg] = useState<{ error?: string; success?: string }>({});
  const [txMsg, setTxMsg] = useState<{ error?: string; success?: string }>({});

  const [newProperty, setNewProperty] = useState({
    name: "",
    address: "",
    units: 1,
    status: "Active",
  });

  const [newTenant, setNewTenant] = useState({
    name: "",
    unit: "",
    balance: 0,
    status: "Active",
  });

  const [newTransaction, setNewTransaction] = useState({
    date: "",
    type: "Income",
    amount: 0,
    tenant: "",
    property: "",
    method: "",
  });

  async function loadAllData() {
    setDataLoading(true);
    try {
      const [propRes, tenantRes, transRes] = await Promise.all([
        supabase.from("properties").select("*").order("created_at", { ascending: false }),
        supabase.from("tenants").select("*").order("created_at", { ascending: false }),
        supabase.from("ledger_entries").select("*").order("date", { ascending: false }),
      ]);

      if (propRes.error) console.error("Error loading properties", propRes.error);
      if (tenantRes.error) console.error("Error loading tenants", tenantRes.error);
      if (transRes.error) console.error("Error loading ledger", transRes.error);

      setProperties((propRes.data as PropertyRow[]) || []);
      setTenants((tenantRes.data as TenantRow[]) || []);
      setTransactions((transRes.data as LedgerRow[]) || []);
    } catch (e) {
      console.error("Unexpected error loading data", e);
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => { loadAllData(); }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setAuthUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === "Income").reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  );
  const totalExpenses = useMemo(
    () => transactions.filter((t) => t.type === "Expense").reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  );
  const netProfit = totalIncome - totalExpenses;

  // Monthly income vs expenses for bar chart (last 12 months with data)
  const monthlyChartData = useMemo(() => {
    const map = new Map<string, { month: string; Income: number; Expenses: number }>();
    transactions.forEach((tx) => {
      const key = tx.date.substring(0, 7); // YYYY-MM
      if (!map.has(key)) map.set(key, { month: key, Income: 0, Expenses: 0 });
      const entry = map.get(key)!;
      if (tx.type === "Income") entry.Income += Number(tx.amount);
      else entry.Expenses += Number(tx.amount);
    });
    return Array.from(map.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12)
      .map((d) => ({ ...d, month: d.month.substring(2) })); // shorten to YY-MM for display
  }, [transactions]);

  const pieData = useMemo(() => [
    { name: "Income", value: totalIncome },
    { name: "Expenses", value: totalExpenses },
  ], [totalIncome, totalExpenses]);

  const totalUnits = useMemo(() => properties.reduce((s, p) => s + (p.units || 0), 0), [properties]);
  const activeTenants = useMemo(() => tenants.filter((t) => t.status === "Active").length, [tenants]);
  const occupancyRate = totalUnits > 0 ? Math.round((activeTenants / totalUnits) * 100) : 0;

  async function addProperty(e: React.FormEvent) {
    e.preventDefault();
    setPropMsg({});
    setPropSubmitting(true);
    try {
      const validated = validateProperty({
        name: newProperty.name,
        address: newProperty.address,
        units: newProperty.units,
        status: newProperty.status,
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setPropMsg({ error: "Not authenticated. Please sign in again." }); return; }

      const { error } = await supabase.from("properties").insert([{ ...validated, user_id: user.id }]);
      if (error) {
        console.error("Failed to add property", error);
        setPropMsg({ error: "Failed to add property. Please try again." });
        return;
      }
      setNewProperty({ name: "", address: "", units: 1, status: "Active" });
      setPropMsg({ success: "Property added successfully." });
      loadAllData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid property data.";
      console.error("Property validation error:", msg);
      setPropMsg({ error: msg });
    } finally {
      setPropSubmitting(false);
    }
  }

  async function addTenant(e: React.FormEvent) {
    e.preventDefault();
    setTenantMsg({});
    setTenantSubmitting(true);
    try {
      const validated = validateTenant({
        name: newTenant.name,
        unit: newTenant.unit,
        balance: newTenant.balance,
        status: newTenant.status,
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setTenantMsg({ error: "Not authenticated. Please sign in again." }); return; }

      const { error } = await supabase.from("tenants").insert([{ ...validated, user_id: user.id }]);
      if (error) {
        console.error("Failed to add tenant", error);
        setTenantMsg({ error: "Failed to add tenant. Please try again." });
        return;
      }
      setNewTenant({ name: "", unit: "", balance: 0, status: "Active" });
      setTenantMsg({ success: "Tenant added successfully." });
      loadAllData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid tenant data.";
      console.error("Tenant validation error:", msg);
      setTenantMsg({ error: msg });
    } finally {
      setTenantSubmitting(false);
    }
  }

  async function addTransaction(e: React.FormEvent) {
    e.preventDefault();
    setTxMsg({});
    setTxSubmitting(true);
    try {
      const validated = validateLedgerEntry({
        date: newTransaction.date,
        type: newTransaction.type,
        amount: newTransaction.amount,
        tenant: newTransaction.tenant,
        property: newTransaction.property,
        method: newTransaction.method,
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setTxMsg({ error: "Not authenticated. Please sign in again." }); return; }

      const { error } = await supabase.from("ledger_entries").insert([{ ...validated, user_id: user.id }]);
      if (error) {
        console.error("Failed to add ledger entry", error);
        setTxMsg({ error: "Failed to add entry. Please try again." });
        return;
      }
      setNewTransaction({ date: "", type: "Income", amount: 0, tenant: "", property: "", method: "" });
      setTxMsg({ success: "Transaction recorded." });
      loadAllData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid transaction data.";
      console.error("Ledger entry error:", msg);
      setTxMsg({ error: msg });
    } finally {
      setTxSubmitting(false);
    }
  }

  function handleSidebarClick(item: string) {
    setActiveModule(item as ModuleKey);
    // Auto-expand the Employee group when one of its items is activated
    // (e.g. clicked from the home grid or elsewhere outside the sidebar group)
    if ((employeeItems as readonly string[]).includes(item)) {
      setEmployeeOpen(true);
    }
  }

  const activeSidebarItem = activeModule;

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition disabled:opacity-50";
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-1 box-border">
      <div className="grid min-h-[calc(100vh-8px)] grid-cols-1 lg:grid-cols-[260px_1fr] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">

        {/* Sidebar */}
        <aside className="flex flex-col bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 lg:border-b-0 lg:border-r h-full" role="navigation" aria-label="Main navigation">
          <div
            className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-4 cursor-pointer hover:bg-slate-50 transition"
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate("/")}
            aria-label="PonProp home"
          >
            <img
              src="/logo.png"
              alt="PonProp logo"
              style={{ height: "32px", width: "auto", objectFit: "contain" }}
              onError={(event) => { (event.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">PonProp</span>
              <span className="text-xs text-slate-500">Property Mgmt</span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5" aria-label="Main navigation">
            {sidebarItems.slice(0, 4).map((item) => {
              // Render Home, Accounting, Maintenance, Marketing first
              const isActive = item === activeSidebarItem;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSidebarClick(item)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span style={{ width: "16px", textAlign: "center", fontSize: "16px" }} aria-hidden="true">
                    {getSidebarIcon(item)}
                  </span>
                  <span className="flex-1">{item}</span>
                  {isActive && <span className="text-orange-500" aria-hidden="true">●</span>}
                </button>
              );
            })}

            {/* ── Employee collapsible group ── */}
            <div>
              <button
                type="button"
                onClick={() => setEmployeeOpen(o => !o)}
                aria-expanded={employeeOpen}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition duration-200 ${
                  employeeItems.includes(activeSidebarItem as any)
                    ? "bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span style={{ width: "16px", textAlign: "center", fontSize: "16px" }} aria-hidden="true">👤</span>
                <span className="flex-1">Employee</span>
                <span className="text-slate-400 text-xs" aria-hidden="true">
                  {employeeOpen ? "▾" : "▸"}
                </span>
              </button>

              {employeeOpen && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-orange-100 pl-2">
                  {employeeItems.map((item) => {
                    const isActive = item === activeSidebarItem;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => { handleSidebarClick(item); }}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-medium transition duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span style={{ width: "16px", textAlign: "center", fontSize: "16px" }} aria-hidden="true">
                          {getSidebarIcon(item)}
                        </span>
                        <span className="flex-1">{item}</span>
                        {isActive && <span className="text-orange-500" aria-hidden="true">●</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Remaining items: Properties → IT ── */}
            {sidebarItems.slice(4).map((item) => {
              const isActive = item === activeSidebarItem;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSidebarClick(item)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span style={{ width: "16px", textAlign: "center", fontSize: "16px" }} aria-hidden="true">
                    {getSidebarIcon(item)}
                  </span>
                  <span className="flex-1">{item}</span>
                  {isActive && <span className="text-orange-500" aria-hidden="true">●</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex min-w-0 flex-col bg-gradient-to-br from-slate-50 to-slate-100 h-full">
          {/* Top bar */}
          <header className="flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 shadow-sm">
            <div className="text-xl font-bold text-slate-900">PonProp</div>
            <div className="flex items-center gap-3">
              {authUser && (
                <span className="hidden sm:block text-sm text-slate-600 font-medium truncate max-w-[160px]">
                  {authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email}
                </span>
              )}
              {authUser?.user_metadata?.avatar_url ? (
                <img
                  src={authUser.user_metadata.avatar_url}
                  alt={`${authUser.user_metadata?.full_name || authUser.email} profile`}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white font-semibold text-xs"
                  aria-hidden="true"
                >
                  {authUser?.user_metadata?.full_name?.[0]?.toUpperCase() || authUser?.email?.[0]?.toUpperCase() || "PP"}
                </div>
              )}
              <button
                onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                Sign Out
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
            {dataLoading && (
              <div className="flex items-center gap-2 mb-4 text-sm text-slate-500" role="status" aria-live="polite">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500" aria-hidden="true" />
                Loading data…
              </div>
            )}

            {/* HOME */}
            {activeModule === "Home" && (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold tracking-tight text-slate-900">Welcome back 👋</h1>
                  <p className="text-slate-600 mt-2">Manage all your properties in one place</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {appItems.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleSidebarClick(item.name)}
                      aria-label={`Open ${item.name} module`}
                      className="group rounded-2xl border border-slate-200 bg-white min-h-[140px] p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "14px",
                          background: item.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          fontSize: "28px",
                          fontWeight: 700,
                          marginBottom: "10px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                        aria-hidden="true"
                      >
                        {item.icon}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-slate-700">
                        {item.name}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* PROPERTIES */}
            {activeModule === "Properties" && (
              <>
                <h1 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span aria-hidden="true">▤</span> Properties
                </h1>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Add New Property</h2>
                  <form onSubmit={addProperty} noValidate>
                    <div className="grid gap-4 mb-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <label htmlFor="prop-name" className={labelClass}>Property Name *</label>
                        <input
                          id="prop-name"
                          className={inputClass}
                          placeholder="e.g. Maple Apartments"
                          value={newProperty.name}
                          onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                          maxLength={255}
                          required
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <label htmlFor="prop-address" className={labelClass}>Address *</label>
                        <input
                          id="prop-address"
                          className={inputClass}
                          placeholder="123 Main St, City, ST"
                          value={newProperty.address}
                          onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                          maxLength={500}
                          required
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <label htmlFor="prop-units" className={labelClass}>Number of Units *</label>
                        <input
                          id="prop-units"
                          className={inputClass}
                          type="number"
                          min={1}
                          max={10000}
                          placeholder="1"
                          value={newProperty.units}
                          onChange={(e) => setNewProperty({ ...newProperty, units: Number(e.target.value) })}
                          required
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <label htmlFor="prop-status" className={labelClass}>Status</label>
                        <select
                          id="prop-status"
                          className={inputClass}
                          value={newProperty.status}
                          onChange={(e) => setNewProperty({ ...newProperty, status: e.target.value })}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>
                    </div>
                    <FormMessage {...propMsg} />
                    <button
                      type="submit"
                      disabled={propSubmitting}
                      className="mt-3 px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold hover:shadow-md active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      {propSubmitting ? "Saving…" : "+ Add Property"}
                    </button>
                  </form>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Property List</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" aria-label="Properties">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th scope="col" className="text-left py-3 px-4 font-semibold text-slate-600">Name</th>
                          <th scope="col" className="text-left py-3 px-4 font-semibold text-slate-600">Address</th>
                          <th scope="col" className="text-left py-3 px-4 font-semibold text-slate-600">Units</th>
                          <th scope="col" className="text-left py-3 px-4 font-semibold text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {properties.map((property) => (
                          <tr key={property.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                            <td className="py-3 px-4 text-slate-900 font-medium">{property.name}</td>
                            <td className="py-3 px-4 text-slate-600">{property.address}</td>
                            <td className="py-3 px-4 text-slate-600">{property.units}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeClass(property.status)}`}>
                                {property.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!dataLoading && properties.length === 0 && (
                      <p className="text-center py-12 text-slate-400 text-sm">No properties yet. Add your first property above.</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* TENANTS */}
            {activeModule === "Tenants" && (
              <>
                <h1 className="text-3xl font-bold text-slate-900 mb-6">Tenants</h1>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Tenant</h2>
                  <form onSubmit={addTenant} noValidate>
                    <div className="grid gap-4 mb-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <label htmlFor="tenant-name" className={labelClass}>Full Name *</label>
                        <input
                          id="tenant-name"
                          className={inputClass}
                          placeholder="Jane Smith"
                          value={newTenant.name}
                          onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                          maxLength={255}
                          required
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <label htmlFor="tenant-unit" className={labelClass}>Unit</label>
                        <input
                          id="tenant-unit"
                          className={inputClass}
                          placeholder="e.g. 2B"
                          value={newTenant.unit}
                          onChange={(e) => setNewTenant({ ...newTenant, unit: e.target.value })}
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <label htmlFor="tenant-balance" className={labelClass}>Balance ($)</label>
                        <input
                          id="tenant-balance"
                          className={inputClass}
                          type="number"
                          min={0}
                          max={1000000}
                          placeholder="0"
                          value={newTenant.balance}
                          onChange={(e) => setNewTenant({ ...newTenant, balance: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label htmlFor="tenant-status" className={labelClass}>Status</label>
                        <select
                          id="tenant-status"
                          className={inputClass}
                          value={newTenant.status}
                          onChange={(e) => setNewTenant({ ...newTenant, status: e.target.value })}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Evicted">Evicted</option>
                        </select>
                      </div>
                    </div>
                    <FormMessage {...tenantMsg} />
                    <button
                      type="submit"
                      disabled={tenantSubmitting}
                      className="mt-3 px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold hover:shadow-md active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      {tenantSubmitting ? "Saving…" : "Save Tenant"}
                    </button>
                  </form>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Tenant List</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" aria-label="Tenants">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th scope="col" className="text-left py-3 px-4 font-semibold text-slate-600">Name</th>
                          <th scope="col" className="text-left py-3 px-4 font-semibold text-slate-600">Unit</th>
                          <th scope="col" className="text-left py-3 px-4 font-semibold text-slate-600">Balance</th>
                          <th scope="col" className="text-left py-3 px-4 font-semibold text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tenants.map((tenant) => (
                          <tr key={tenant.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                            <td className="py-3 px-4 text-slate-900 font-medium">{tenant.name}</td>
                            <td className="py-3 px-4 text-slate-600">{tenant.unit || "—"}</td>
                            <td className="py-3 px-4 text-slate-700">${(tenant.balance ?? 0).toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeClass(tenant.status)}`}>
                                {tenant.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!dataLoading && tenants.length === 0 && (
                      <p className="text-center py-12 text-slate-400 text-sm">No tenants yet. Add your first tenant above.</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ACCOUNTING */}
            {activeModule === "Accounting" && (
              <>
                <h1 className="text-3xl font-bold text-slate-900 mb-6">Accounting</h1>

                {/* Tab switcher */}
                <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit" role="tablist" aria-label="Accounting tabs">
                  {(["charts", "ledger"] as const).map((tab) => (
                    <button
                      key={tab}
                      role="tab"
                      aria-selected={accountingTab === tab}
                      onClick={() => setAccountingTab(tab)}
                      className={`px-5 py-2 rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-orange-300 capitalize ${
                        accountingTab === tab
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab === "charts" ? "Overview" : "Ledger"}
                    </button>
                  ))}
                </div>

                {/* TAB 1: Charts / Overview */}
                {accountingTab === "charts" && (
                  <>
                    {/* KPI cards */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
                      {[
                        { label: "Total Income", value: `$${totalIncome.toLocaleString()}`, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                        { label: "Total Expenses", value: `$${totalExpenses.toLocaleString()}`, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
                        { label: "Net Profit", value: `$${netProfit.toLocaleString()}`, color: netProfit >= 0 ? "text-emerald-600" : "text-rose-600", bg: "bg-white", border: "border-slate-200" },
                        { label: "Occupancy Rate", value: `${occupancyRate}%`, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
                      ].map(({ label, value, color, bg, border }) => (
                        <div key={label} className={`rounded-2xl border ${border} ${bg} p-5 shadow-sm`}>
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</div>
                          <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2 mb-6">
                      {/* Monthly income vs expenses bar chart */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Monthly Income vs Expenses</h2>
                        {monthlyChartData.length === 0 ? (
                          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No transaction data yet.</div>
                        ) : (
                          <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={monthlyChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                              <Tooltip
                                formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                                contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: 12 }}
                              />
                              <Legend wrapperStyle={{ fontSize: 12 }} />
                              <Bar dataKey="Income" fill={CHART_EMERALD} radius={[4, 4, 0, 0]} />
                              <Bar dataKey="Expenses" fill={CHART_RED} radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      {/* Income vs Expenses pie chart */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Income vs Expenses Split</h2>
                        {totalIncome === 0 && totalExpenses === 0 ? (
                          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No transaction data yet.</div>
                        ) : (
                          <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={3}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                              >
                                <Cell fill={CHART_EMERALD} />
                                <Cell fill={CHART_RED} />
                              </Pie>
                              <Tooltip
                                formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                                contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: 12 }}
                              />
                              <Legend wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {/* Occupancy summary */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h2 className="text-base font-semibold text-slate-900 mb-4">Occupancy Overview</h2>
                      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">Occupied units</span>
                            <span className="font-semibold text-slate-900">{activeTenants} / {totalUnits}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-3">
                            <div
                              className="h-3 rounded-full transition-all duration-500"
                              style={{
                                width: `${occupancyRate}%`,
                                background: "linear-gradient(90deg, #f97316, #ef4444)",
                              }}
                              role="progressbar"
                              aria-valuenow={occupancyRate}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`Occupancy rate ${occupancyRate}%`}
                            />
                          </div>
                          <div className="text-xs text-slate-400 mt-1">{occupancyRate}% occupancy rate</div>
                        </div>
                        <div className="text-4xl font-extrabold text-orange-500">{occupancyRate}%</div>
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 2: Ledger */}
                {accountingTab === "ledger" && (
                  <>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
                      <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Transaction</h2>
                      <form onSubmit={addTransaction} noValidate>
                        <div className="grid gap-4 mb-4 sm:grid-cols-2 xl:grid-cols-3">
                          <div>
                            <label htmlFor="tx-date" className={labelClass}>Date *</label>
                            <input
                              id="tx-date"
                              className={inputClass}
                              type="date"
                              value={newTransaction.date}
                              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                              required
                              aria-required="true"
                            />
                          </div>
                          <div>
                            <label htmlFor="tx-type" className={labelClass}>Type</label>
                            <select
                              id="tx-type"
                              className={inputClass}
                              value={newTransaction.type}
                              onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                            >
                              <option value="Income">Income</option>
                              <option value="Expense">Expense</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="tx-amount" className={labelClass}>Amount ($) *</label>
                            <input
                              id="tx-amount"
                              className={inputClass}
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="0.00"
                              value={newTransaction.amount}
                              onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                              required
                              aria-required="true"
                            />
                          </div>
                          <div>
                            <label htmlFor="tx-tenant" className={labelClass}>Tenant</label>
                            <input
                              id="tx-tenant"
                              className={inputClass}
                              placeholder="Optional"
                              value={newTransaction.tenant}
                              onChange={(e) => setNewTransaction({ ...newTransaction, tenant: e.target.value })}
                              maxLength={255}
                            />
                          </div>
                          <div>
                            <label htmlFor="tx-property" className={labelClass}>Property</label>
                            <input
                              id="tx-property"
                              className={inputClass}
                              placeholder="Optional"
                              value={newTransaction.property}
                              onChange={(e) => setNewTransaction({ ...newTransaction, property: e.target.value })}
                              maxLength={255}
                            />
                          </div>
                          <div>
                            <label htmlFor="tx-method" className={labelClass}>Payment Method</label>
                            <input
                              id="tx-method"
                              className={inputClass}
                              placeholder="e.g. Check, ACH"
                              value={newTransaction.method}
                              onChange={(e) => setNewTransaction({ ...newTransaction, method: e.target.value })}
                              maxLength={100}
                            />
                          </div>
                        </div>
                        <FormMessage {...txMsg} />
                        <button
                          type="submit"
                          disabled={txSubmitting}
                          className="mt-3 px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold hover:shadow-md active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-300"
                        >
                          {txSubmitting ? "Saving…" : "Save Entry"}
                        </button>
                      </form>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h2 className="text-lg font-semibold text-slate-900 mb-4">Transactions</h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm" aria-label="Transactions">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th scope="col" className="text-left py-3 px-4 font-semibold text-slate-600">Date</th>
                              <th scope="col" className="text-left py-3 px-4 font-semibold text-slate-600">Type</th>
                              <th scope="col" className="text-left py-3 px-4 font-semibold text-slate-600">Amount</th>
                              <th scope="col" className="text-left py-3 px-4 font-semibold text-slate-600">Tenant</th>
                              <th scope="col" className="text-left py-3 px-4 font-semibold text-slate-600">Property</th>
                              <th scope="col" className="text-left py-3 px-4 font-semibold text-slate-600">Method</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((tx) => (
                              <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-3 px-4 text-slate-700">{tx.date}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tx.type === "Income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                                    {tx.type}
                                  </span>
                                </td>
                                <td className={`py-3 px-4 text-sm font-semibold ${tx.type === "Income" ? "text-emerald-600" : "text-rose-600"}`}>
                                  ${Number(tx.amount).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-slate-600">{tx.tenant || "—"}</td>
                                <td className="py-3 px-4 text-slate-600">{tx.property || "—"}</td>
                                <td className="py-3 px-4 text-slate-600">{tx.method || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {!dataLoading && transactions.length === 0 && (
                          <p className="text-center py-12 text-slate-400 text-sm">No transactions yet. Add your first entry above.</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* REPORTS */}
            {activeModule === "Reports" && (
              <>
                <h1 className="text-3xl font-bold text-slate-900 mb-6">Reports</h1>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-w-lg">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Portfolio Summary</h2>
                  <dl className="space-y-3 text-sm text-slate-700">
                    {[
                      { label: "Total Properties", value: properties.length },
                      { label: "Total Tenants", value: tenants.length },
                      { label: "Total Income", value: `$${totalIncome.toLocaleString()}` },
                      { label: "Total Expenses", value: `$${totalExpenses.toLocaleString()}` },
                      { label: "Net Profit", value: `$${netProfit.toLocaleString()}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                        <dt className="text-slate-500">{label}</dt>
                        <dd className="font-semibold text-slate-900">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </>
            )}

            {/* ── Delegated module pages ─────────────────────────────────── */}
            {activeModule === "To Do" && <ToDoPage />}
            {activeModule === "History" && <RentalHistoryPage />}
            {activeModule === "Maintenance" && <MaintenancePage />}
            {activeModule === "Inventory" && <InventoryPage />}
            {activeModule === "Time Cards" && <TimeCardsPage />}
            {activeModule === "Projects" && <ProjectsPage />}
            {activeModule === "Marketing" && <MarketingPage />}
            {activeModule === "Legal" && <LegalPage />}
            {activeModule === "Finance" && <FinancePage />}
            {activeModule === "Calendar" && <CalendarPage />}
            {activeModule === "Complaints" && <ComplaintsPage />}
            {activeModule === "Analytics" && <AnalyticsPage />}
            {activeModule === "IT" && <ITPage />}
          </div>
        </main>
      </div>
    </div>
  );
}

function getSidebarIcon(item: string) {
  switch (item) {
    case "Home":       return "⌂";
    case "To Do":      return "☑";
    case "History":    return "◷";
    case "Tenants":    return "◌";
    case "Maintenance":return "⚒";
    case "Inventory":  return "▣";
    case "Time Cards": return "◔";
    case "Reports":    return "△";
    case "Accounting": return "$";
    case "Properties": return "▤";
    case "Projects":   return "▥";
    case "Marketing":  return "⟡";
    case "Legal":      return "⚖";
    case "Finance":    return "▥";
    case "Calendar":   return "☷";
    case "Complaints": return "◫";
    case "Analytics":  return "◔";
    case "IT":         return "▭";
    default:           return "•";
  }
}

function PrivacyGate({ children }: { children: React.ReactNode }) {
  const [accepted, setAccepted] = useState(() => isPrivacyAccepted());

  if (!accepted) {
    return (
      <Privacy
        asGate
        onAccept={() => {
          markPrivacyAccepted();
          setAccepted(true);
        }}
      />
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* /auth/callback must be OUTSIDE PrivacyGate — it handles the
            OAuth PKCE code exchange and must never be blocked by any gate */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* All other routes are wrapped in the privacy acceptance gate */}
        <Route path="/*" element={
          <PrivacyGate>
            <Routes>
              <Route path="/" element={<AuthPage />} />
              <Route path="/home" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/privacy" element={<Privacy />} />
            </Routes>
          </PrivacyGate>
        } />
      </Routes>
    </BrowserRouter>
  );
}
