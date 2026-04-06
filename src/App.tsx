import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

type ModuleKey =
  | "Home"
  | "Properties"
  | "Tenants"
  | "Accounting"
  | "Reports";

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
  rent: number;
  status: string;
};

type TransactionRow = {
  id: string;
  date: string;
  description: string;
  type: "income" | "expense";
  amount: number;
  category: string;
};

const sidebarItems = [
  "Home",
  "To Do",
  "History",
  "Tenants",
  "Maintenance",
  "Inventory",
  "Time Cards",
  "Reports",
  "Accounting",
  "Properties",
  "Projects",
  "Marketing",
  "Legal",
  "Finance",
  "Calendar",
  "Complaints",
  "Analytics",
  "IT",
];

const appItems = [
  { name: "Home", icon: "⌂", color: "linear-gradient(135deg, #ff8a5b, #f05a4f)" },
  { name: "To Do", icon: "☑", color: "linear-gradient(135deg, #38d2a5, #19b5d1)" },
  { name: "History", icon: "◷", color: "linear-gradient(135deg, #72a8ff, #5e6df5)" },
  { name: "Tenants", icon: "◌◌", color: "linear-gradient(135deg, #b57cff, #ee4fa5)" },
  { name: "Maintenance", icon: "⚒", color: "linear-gradient(135deg, #ff8c66, #ff7a1a)" },
  { name: "Inventory", icon: "▣", color: "linear-gradient(135deg, #ffc928, #f0ac00)" },
  { name: "Time Cards", icon: "◔", color: "linear-gradient(135deg, #f59f3a, #e67c00)" },
  { name: "Reports", icon: "⚠", color: "linear-gradient(135deg, #3cc8e8, #3378f4)" },
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

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("Home");
  const [loading, setLoading] = useState(false);

  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);

  const [newProperty, setNewProperty] = useState({
    name: "",
    address: "",
    units: 1,
    status: "Active",
  });

  const [newTenant, setNewTenant] = useState({
    name: "",
    unit: "",
    rent: 0,
    status: "Active",
  });

  const [newTransaction, setNewTransaction] = useState({
    date: "",
    description: "",
    type: "income" as "income" | "expense",
    amount: 0,
    category: "",
  });

  async function loadAllData() {
    setLoading(true);

    try {
      const [propRes, tenantRes, transRes] = await Promise.all([
        supabase.from("properties").select("*").order("created_at", { ascending: false }),
        supabase.from("tenants").select("*").order("created_at", { ascending: false }),
        supabase.from("transactions").select("*").order("date", { ascending: false }),
      ]);

      if (propRes.error || tenantRes.error || transRes.error) {
        console.error("Error loading data", propRes.error || tenantRes.error || transRes.error);
        setProperties([]);
        setTenants([]);
        setTransactions([]);
        setLoading(false);
        return;
      }

      setProperties((propRes.data as PropertyRow[]) || []);
      setTenants((tenantRes.data as TenantRow[]) || []);
      setTransactions((transRes.data as TransactionRow[]) || []);
    } catch (e) {
      console.error("Unexpected error loading data", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  );

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  );

  const netProfit = totalIncome - totalExpenses;

  async function addProperty() {
    if (!newProperty.name || !newProperty.address) return;

    try {
      const { data, error } = await supabase.from("properties").insert([newProperty]);
      if (error) {
        console.error("Failed to add property", error);
        return;
      }

      setNewProperty({ name: "", address: "", units: 1, status: "Active" });
      loadAllData();
    } catch (e) {
      console.error("Unexpected error adding property", e);
    }
  }

  async function addTenant() {
    if (!newTenant.name || !newTenant.unit) return;

    try {
      const { data, error } = await supabase.from("tenants").insert([newTenant]);
      if (error) {
        console.error("Failed to add tenant", error);
        return;
      }

      setNewTenant({ name: "", unit: "", rent: 0, status: "Active" });
      loadAllData();
    } catch (e) {
      console.error("Unexpected error adding tenant", e);
    }
  }

  async function addTransaction() {
    if (!newTransaction.date || !newTransaction.description || !newTransaction.category) return;

    try {
      const { data, error } = await supabase.from("transactions").insert([newTransaction]);
      if (error) {
        console.error("Failed to add transaction", error);
        return;
      }

      setNewTransaction({ date: "", description: "", type: "income", amount: 0, category: "" });
      loadAllData();
    } catch (e) {
      console.error("Unexpected error adding transaction", e);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-1 box-border">
      <div className="grid min-h-[calc(100vh-8px)] grid-cols-1 lg:grid-cols-[320px_1fr] rounded-[18px] overflow-hidden border border-slate-200 bg-white">

        <aside className="flex flex-col bg-slate-50 border-b border-slate-200 lg:border-b-0 lg:border-r lg:bg-slate-50 h-full">
          <div className="flex items-center gap-4 border-b border-slate-200 bg-white px-5 py-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-700 text-white text-xl font-bold">
              ▤
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900">Pongratz Properties</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            {sidebarItems.map((item) => {
              const isActive = item === activeModule;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    if (
                      item === "Home" ||
                      item === "Properties" ||
                      item === "Tenants" ||
                      item === "Accounting" ||
                      item === "Reports"
                    ) {
                      setActiveModule(item as ModuleKey);
                    }
                  }}
                  className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 mb-1 text-left text-sm font-medium transition duration-200 ${
                    isActive ? "bg-slate-200 text-sky-700" : "text-slate-700 hover:bg-slate-100"
                  }`}
                  style={{ cursor: "pointer", border: "none" }}
                >
                  <span style={{ width: "18px", textAlign: "center", fontSize: "18px" }}>
                    {getSidebarIcon(item)}
                  </span>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex min-w-0 flex-col bg-slate-100 h-full">
          <div className="flex h-16 items-center justify-between gap-5 border-b border-slate-200 bg-slate-50 px-5">
            <div className="flex items-center gap-4 text-slate-800">
              <div className="text-2xl">◫</div>
              <div className="text-xl font-semibold">Pongratz Properties</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex w-[320px] max-w-[32vw] items-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500">
                <span className="text-base">⌕</span>
                <span>Search...</span>
              </div>
              <div className="relative text-2xl text-slate-600">
                ⍾
                <span className="absolute -right-1 top-0 h-2.5 w-2.5 rounded-full bg-sky-700 ring-2 ring-slate-50" />
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-semibold">
                PP
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-7">
            {loading && <div style={{ marginBottom: "16px" }}>Loading...</div>}

            {activeModule === "Home" && (
              <>
                <div className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-3">
                  Welcome back <span className="text-4xl">👋</span>
                </div>
                <div className="text-lg text-slate-600 mb-9">Manage your properties from one place.</div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {appItems.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        if (
                          item.name === "Home" ||
                          item.name === "Properties" ||
                          item.name === "Tenants" ||
                          item.name === "Accounting" ||
                          item.name === "Reports"
                        ) {
                          setActiveModule(item.name as ModuleKey);
                        }
                      }}
                      className="group rounded-[22px] border border-slate-200 bg-slate-50 min-h-[154px] p-0 text-center transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "22px",
                          background: item.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          fontSize: "40px",
                          fontWeight: 700,
                          marginBottom: "14px",
                          boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
                        }}
                      >
                        {item.icon}
                      </div>

                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#1f2937",
                          textAlign: "center",
                        }}
                      >
                        {item.name}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {activeModule === "Properties" && (
              <>
                <h1 className="text-2xl font-semibold text-slate-900 mb-4">Properties</h1>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Property</h3>
                  <div className="grid gap-3 mb-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                    <input
                      className="px-3.5 py-3 rounded-3xl border border-slate-200 bg-white"
                      placeholder="Property Name"
                      value={newProperty.name}
                      onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                    />
                    <input
                      className="px-3.5 py-3 rounded-3xl border border-slate-200 bg-white"
                      placeholder="Address"
                      value={newProperty.address}
                      onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                    />
                    <input
                      className="px-3.5 py-3 rounded-3xl border border-slate-200 bg-white"
                      type="number"
                      placeholder="Units"
                      value={newProperty.units}
                      onChange={(e) => setNewProperty({ ...newProperty, units: Number(e.target.value) })}
                    />
                    <input
                      className="px-3.5 py-3 rounded-3xl border border-slate-200 bg-white"
                      placeholder="Status"
                      value={newProperty.status}
                      onChange={(e) => setNewProperty({ ...newProperty, status: e.target.value })}
                    />
                  </div>
                  <button className="px-4 py-3 rounded-3xl bg-sky-600 text-white font-semibold hover:bg-sky-700 transition" onClick={addProperty}>
                    Save Property
                  </button>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Property List</h3>
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="text-left text-sm text-slate-600">
                        <th className="pb-3 pr-6">Name</th>
                        <th className="pb-3 pr-6">Address</th>
                        <th className="pb-3 pr-6">Units</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((property) => (
                        <tr key={property.id} className="border-t border-slate-200">
                          <td className="py-4 pr-6 text-sm text-slate-700">{property.name}</td>
                          <td className="py-4 pr-6 text-sm text-slate-700">{property.address}</td>
                          <td className="py-4 pr-6 text-sm text-slate-700">{property.units}</td>
                          <td className="py-4 text-sm text-slate-700">{property.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeModule === "Tenants" && (
              <>
                <h1 className="text-2xl font-semibold text-slate-900 mb-4">Tenants</h1>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Tenant</h3>
                  <div className="grid gap-3 mb-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                    <input
                      className="px-3.5 py-3 rounded-3xl border border-slate-200 bg-white"
                      placeholder="Tenant Name"
                      value={newTenant.name}
                      onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                    />
                    <input
                      className="px-3.5 py-3 rounded-3xl border border-slate-200 bg-white"
                      placeholder="Unit"
                      value={newTenant.unit}
                      onChange={(e) => setNewTenant({ ...newTenant, unit: e.target.value })}
                    />
                    <input
                      className="px-3.5 py-3 rounded-3xl border border-slate-200 bg-white"
                      type="number"
                      placeholder="Rent"
                      value={newTenant.rent}
                      onChange={(e) =>
                        setNewTenant({ ...newTenant, rent: Number(e.target.value) })
                      }
                    />
                    <input
                      className="px-3.5 py-3 rounded-3xl border border-slate-200 bg-white"
                      placeholder="Status"
                      value={newTenant.status}
                      onChange={(e) => setNewTenant({ ...newTenant, status: e.target.value })}
                    />
                  </div>
                  <button className="px-4 py-3 rounded-3xl bg-sky-600 text-white font-semibold hover:bg-sky-700 transition" onClick={addTenant}>
                    Save Tenant
                  </button>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Tenant List</h3>
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="text-left text-sm text-slate-600">
                        <th className="pb-3 pr-6">Name</th>
                        <th className="pb-3 pr-6">Unit</th>
                        <th className="pb-3 pr-6">Rent</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((tenant) => (
                        <tr key={tenant.id} className="border-t border-slate-200">
                          <td className="py-4 pr-6 text-sm text-slate-700">{tenant.name}</td>
                          <td className="py-4 pr-6 text-sm text-slate-700">{tenant.unit}</td>
                          <td className="py-4 pr-6 text-sm text-slate-700">${tenant.rent}</td>
                          <td className="py-4 text-sm text-slate-700">{tenant.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeModule === "Accounting" && (
              <>
                <h1 className="text-2xl font-semibold text-slate-900 mb-4">Accounting</h1>

                <div className="grid gap-5 md:grid-cols-3 mb-8">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="text-sm text-slate-500 mb-2">Income</div>
                    <div className="text-3xl font-extrabold text-slate-900">${totalIncome.toLocaleString()}</div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="text-sm text-slate-500 mb-2">Expenses</div>
                    <div className="text-3xl font-extrabold text-slate-900">${totalExpenses.toLocaleString()}</div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="text-sm text-slate-500 mb-2">Net Profit</div>
                    <div className={`text-3xl font-extrabold ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      ${netProfit.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Transaction</h3>
                  <div className="grid gap-3 mb-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                    <input
                      className="px-3.5 py-3 rounded-3xl border border-slate-200 bg-white"
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    />
                    <input
                      className="px-3.5 py-3 rounded-3xl border border-slate-200 bg-white"
                      placeholder="Description"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    />
                    <select
                      className="px-3.5 py-3 rounded-3xl border border-slate-200 bg-white"
                      value={newTransaction.type}
                      onChange={(e) =>
                        setNewTransaction({
                          ...newTransaction,
                          type: e.target.value as "income" | "expense",
                        })
                      }
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                    <input
                      className="px-3.5 py-3 rounded-3xl border border-slate-200 bg-white"
                      type="number"
                      placeholder="Amount"
                      value={newTransaction.amount}
                      onChange={(e) =>
                        setNewTransaction({
                          ...newTransaction,
                          amount: Number(e.target.value),
                        })
                      }
                    />
                    <input
                      className="px-3.5 py-3 rounded-3xl border border-slate-200 bg-white"
                      placeholder="Category"
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    />
                  </div>
                  <button className="px-4 py-3 rounded-3xl bg-sky-600 text-white font-semibold hover:bg-sky-700 transition" onClick={addTransaction}>
                    Save Transaction
                  </button>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Transactions</h3>
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="text-left text-sm text-slate-600">
                        <th className="pb-3 pr-6">Date</th>
                        <th className="pb-3 pr-6">Description</th>
                        <th className="pb-3 pr-6">Type</th>
                        <th className="pb-3 pr-6">Category</th>
                        <th className="pb-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-t border-slate-200">
                          <td className="py-4 pr-6 text-sm text-slate-700">{transaction.date}</td>
                          <td className="py-4 pr-6 text-sm text-slate-700">{transaction.description}</td>
                          <td className="py-4 pr-6 text-sm text-slate-700">{transaction.type}</td>
                          <td className="py-4 pr-6 text-sm text-slate-700">{transaction.category}</td>
                          <td className="py-4 text-sm text-slate-700">${transaction.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeModule === "Reports" && (
              <>
                <h1 className="text-2xl font-semibold text-slate-900 mb-4">Reports</h1>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Portfolio Summary</h3>
                  <div className="space-y-3 leading-7 text-slate-700">
                    <div>Total Properties: {properties.length}</div>
                    <div>Total Tenants: {tenants.length}</div>
                    <div>Total Income: ${totalIncome.toLocaleString()}</div>
                    <div>Total Expenses: ${totalExpenses.toLocaleString()}</div>
                    <div>Net Profit: ${netProfit.toLocaleString()}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function getSidebarIcon(item: string) {
  switch (item) {
    case "Home":
      return "⌂";
    case "To Do":
      return "☑";
    case "History":
      return "◷";
    case "Tenants":
      return "◌";
    case "Maintenance":
      return "⚒";
    case "Inventory":
      return "▣";
    case "Time Cards":
      return "◔";
    case "Reports":
      return "△";
    case "Accounting":
      return "$";
    case "Properties":
      return "▤";
    case "Projects":
      return "▥";
    case "Marketing":
      return "⟡";
    case "Legal":
      return "⚖";
    case "Finance":
      return "▥";
    case "Calendar":
      return "☷";
    case "Complaints":
      return "◫";
    case "Analytics":
      return "◔";
    case "IT":
      return "▭";
    default:
      return "•";
  }
}