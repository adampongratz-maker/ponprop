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
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        fontFamily: 'Inter, Arial, "Helvetica Neue", sans-serif',
        color: "#0f172a",
        padding: "4px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          height: "calc(100vh - 8px)",
          borderRadius: "18px",
          overflow: "hidden",
          border: "1px solid #d9dde5",
          background: "#ffffff",
        }}
      >
        <aside
          style={{
            background: "#f8fafc",
            borderRight: "1px solid #dde3eb",
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
          }}
        >
          <div
            style={{
              padding: "20px 16px 18px 16px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              borderBottom: "1px solid #e5e7eb",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "14px",
                background: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "22px",
                fontWeight: 700,
              }}
            >
              ▤
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700 }}>Pongratz Properties</div>
          </div>

          <div style={{ overflowY: "auto", padding: "14px 10px 20px 10px", flex: 1 }}>
            {sidebarItems.map((item) => {
              const isActive = item === activeModule;
              return (
                <div
                  key={item}
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px 14px",
                    borderRadius: "16px",
                    marginBottom: "4px",
                    background: isActive ? "#dfe7f5" : "transparent",
                    color: isActive ? "#2563eb" : "#0f172a",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ width: "18px", textAlign: "center", fontSize: "18px" }}>
                    {getSidebarIcon(item)}
                  </span>
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
        </aside>

        <main
          style={{
            background: "#f3f4f6",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <div
            style={{
              height: "68px",
              background: "#f8fafc",
              borderBottom: "1px solid #dde3eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 18px 0 20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ fontSize: "22px", color: "#475569" }}>◫</div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>
                Pongratz Properties
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div
                style={{
                  width: "320px",
                  maxWidth: "32vw",
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  borderRadius: "999px",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#6b7280",
                  fontSize: "16px",
                }}
              >
                <span style={{ fontSize: "18px" }}>⌕</span>
                <span>Search...</span>
              </div>

              <div style={{ position: "relative", fontSize: "22px", color: "#475569" }}>
                ⍾
                <span
                  style={{
                    position: "absolute",
                    top: "0px",
                    right: "-1px",
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: "#2563eb",
                    border: "2px solid #f8fafc",
                  }}
                />
              </div>

              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "999px",
                  background: "#dbe7ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2563eb",
                  fontWeight: 700,
                  fontSize: "18px",
                }}
              >
                PP
              </div>
            </div>
          </div>

          <div style={{ padding: "28px", overflowY: "auto", flex: 1 }}>
            {loading && <div style={{ marginBottom: "16px" }}>Loading...</div>}

            {activeModule === "Home" && (
              <>
                <div
                  style={{
                    fontSize: "54px",
                    fontWeight: 800,
                    color: "#0b1b4d",
                    lineHeight: 1.05,
                    marginBottom: "8px",
                  }}
                >
                  Welcome back <span style={{ fontSize: "42px" }}>👋</span>
                </div>

                <div
                  style={{
                    fontSize: "24px",
                    color: "#64748b",
                    marginBottom: "34px",
                  }}
                >
                  Manage your properties from one place.
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, minmax(150px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {appItems.map((item) => (
                    <div
                      key={item.name}
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
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e5e7eb",
                        borderRadius: "22px",
                        minHeight: "154px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 1px 0 rgba(15,23,42,0.02)",
                        cursor: "pointer",
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
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeModule === "Properties" && (
              <>
                <h1 style={{ marginTop: 0, marginBottom: "18px" }}>Properties</h1>

                <div style={panelStyle}>
                  <h3>Add Property</h3>
                  <div style={formGrid}>
                    <input
                      style={inputStyle}
                      placeholder="Property Name"
                      value={newProperty.name}
                      onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                    />
                    <input
                      style={inputStyle}
                      placeholder="Address"
                      value={newProperty.address}
                      onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                    />
                    <input
                      style={inputStyle}
                      type="number"
                      placeholder="Units"
                      value={newProperty.units}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, units: Number(e.target.value) })
                      }
                    />
                    <input
                      style={inputStyle}
                      placeholder="Status"
                      value={newProperty.status}
                      onChange={(e) => setNewProperty({ ...newProperty, status: e.target.value })}
                    />
                  </div>
                  <button style={buttonStyle} onClick={addProperty}>
                    Save Property
                  </button>
                </div>

                <div style={panelStyle}>
                  <h3>Property List</h3>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Address</th>
                        <th style={thStyle}>Units</th>
                        <th style={thStyle}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((property) => (
                        <tr key={property.id}>
                          <td style={tdStyle}>{property.name}</td>
                          <td style={tdStyle}>{property.address}</td>
                          <td style={tdStyle}>{property.units}</td>
                          <td style={tdStyle}>{property.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeModule === "Tenants" && (
              <>
                <h1 style={{ marginTop: 0, marginBottom: "18px" }}>Tenants</h1>

                <div style={panelStyle}>
                  <h3>Add Tenant</h3>
                  <div style={formGrid}>
                    <input
                      style={inputStyle}
                      placeholder="Tenant Name"
                      value={newTenant.name}
                      onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                    />
                    <input
                      style={inputStyle}
                      placeholder="Unit"
                      value={newTenant.unit}
                      onChange={(e) => setNewTenant({ ...newTenant, unit: e.target.value })}
                    />
                    <input
                      style={inputStyle}
                      type="number"
                      placeholder="Rent"
                      value={newTenant.rent}
                      onChange={(e) =>
                        setNewTenant({ ...newTenant, rent: Number(e.target.value) })
                      }
                    />
                    <input
                      style={inputStyle}
                      placeholder="Status"
                      value={newTenant.status}
                      onChange={(e) => setNewTenant({ ...newTenant, status: e.target.value })}
                    />
                  </div>
                  <button style={buttonStyle} onClick={addTenant}>
                    Save Tenant
                  </button>
                </div>

                <div style={panelStyle}>
                  <h3>Tenant List</h3>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Unit</th>
                        <th style={thStyle}>Rent</th>
                        <th style={thStyle}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((tenant) => (
                        <tr key={tenant.id}>
                          <td style={tdStyle}>{tenant.name}</td>
                          <td style={tdStyle}>{tenant.unit}</td>
                          <td style={tdStyle}>${tenant.rent}</td>
                          <td style={tdStyle}>{tenant.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeModule === "Accounting" && (
              <>
                <h1 style={{ marginTop: 0, marginBottom: "18px" }}>Accounting</h1>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(220px, 1fr))",
                    gap: "18px",
                    marginBottom: "22px",
                  }}
                >
                  <div style={metricCardStyle}>
                    <div style={metricLabel}>Income</div>
                    <div style={metricValue}>${totalIncome.toLocaleString()}</div>
                  </div>
                  <div style={metricCardStyle}>
                    <div style={metricLabel}>Expenses</div>
                    <div style={metricValue}>${totalExpenses.toLocaleString()}</div>
                  </div>
                  <div style={metricCardStyle}>
                    <div style={metricLabel}>Net Profit</div>
                    <div style={{ ...metricValue, color: netProfit >= 0 ? "#16a34a" : "#dc2626" }}>
                      ${netProfit.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={panelStyle}>
                  <h3>Add Transaction</h3>
                  <div style={formGrid}>
                    <input
                      style={inputStyle}
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) =>
                        setNewTransaction({ ...newTransaction, date: e.target.value })
                      }
                    />
                    <input
                      style={inputStyle}
                      placeholder="Description"
                      value={newTransaction.description}
                      onChange={(e) =>
                        setNewTransaction({ ...newTransaction, description: e.target.value })
                      }
                    />
                    <select
                      style={inputStyle}
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
                      style={inputStyle}
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
                      style={inputStyle}
                      placeholder="Category"
                      value={newTransaction.category}
                      onChange={(e) =>
                        setNewTransaction({ ...newTransaction, category: e.target.value })
                      }
                    />
                  </div>
                  <button style={buttonStyle} onClick={addTransaction}>
                    Save Transaction
                  </button>
                </div>

                <div style={panelStyle}>
                  <h3>Transactions</h3>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Date</th>
                        <th style={thStyle}>Description</th>
                        <th style={thStyle}>Type</th>
                        <th style={thStyle}>Category</th>
                        <th style={thStyle}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td style={tdStyle}>{transaction.date}</td>
                          <td style={tdStyle}>{transaction.description}</td>
                          <td style={tdStyle}>{transaction.type}</td>
                          <td style={tdStyle}>{transaction.category}</td>
                          <td style={tdStyle}>${transaction.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeModule === "Reports" && (
              <>
                <h1 style={{ marginTop: 0, marginBottom: "18px" }}>Reports</h1>
                <div style={panelStyle}>
                  <h3>Portfolio Summary</h3>
                  <div style={{ lineHeight: 1.9, color: "#334155" }}>
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

const panelStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "18px",
  border: "1px solid #e5e7eb",
  padding: "20px",
  marginBottom: "20px",
};

const formGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  marginBottom: "14px",
};

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  background: "#ffffff",
};

const buttonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px",
  color: "#475569",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
  borderBottom: "1px solid #f1f5f9",
  fontSize: "14px",
};

const metricCardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "18px",
  border: "1px solid #e5e7eb",
  padding: "20px",
};

const metricLabel: React.CSSProperties = {
  fontSize: "14px",
  color: "#64748b",
  marginBottom: "8px",
};

const metricValue: React.CSSProperties = {
  fontSize: "32px",
  fontWeight: 800,
  color: "#0f172a",
};