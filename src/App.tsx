import { useMemo, useState } from "react";

type TabKey =
  | "overview"
  | "profitLoss"
  | "balanceSheet"
  | "cashFlow"
  | "journalEntries"
  | "arAp";

type MetricCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  valueColor?: string;
};

type LineItem = {
  label: string;
  amount: number;
};

type JournalEntry = {
  date: string;
  account: string;
  type: "Debit" | "Credit";
  amount: number;
  memo: string;
};

type ArApRow = {
  name: string;
  type: "Receivable" | "Payable";
  dueDate: string;
  amount: number;
  status: string;
};

const currency = (amount: number) =>
  amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

function MetricCard({
  title,
  value,
  subtitle,
  valueColor = "#111827",
}: MetricCardProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "22px",
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          color: "#6b7280",
          marginBottom: "8px",
          fontWeight: 600,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "32px",
          fontWeight: 700,
          color: valueColor,
          marginBottom: "6px",
        }}
      >
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: "13px", color: "#9ca3af" }}>{subtitle}</div>
      )}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        padding: "22px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "4px",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: "14px", color: "#6b7280" }}>{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function AmountRow({
  label,
  amount,
  bold = false,
  positiveColor = false,
}: {
  label: string;
  amount: number;
  bold?: boolean;
  positiveColor?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid #f3f4f6",
        fontSize: "15px",
      }}
    >
      <span
        style={{
          color: "#374151",
          fontWeight: bold ? 700 : 500,
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: positiveColor ? "#15803d" : "#111827",
          fontWeight: bold ? 700 : 600,
        }}
      >
        {currency(amount)}
      </span>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const revenueItems: LineItem[] = [
    { label: "Rental Income", amount: 28500 },
    { label: "Late Fees", amount: 1200 },
    { label: "Application Fees", amount: 450 },
    { label: "Other Income", amount: 850 },
  ];

  const expenseItems: LineItem[] = [
    { label: "Repairs & Maintenance", amount: 5400 },
    { label: "Utilities", amount: 2150 },
    { label: "Insurance", amount: 1350 },
    { label: "Property Taxes", amount: 2800 },
    { label: "Management", amount: 2400 },
    { label: "Software & Admin", amount: 900 },
  ];

  const assets: LineItem[] = [
    { label: "Cash", amount: 42500 },
    { label: "Accounts Receivable", amount: 3900 },
    { label: "Prepaid Insurance", amount: 2200 },
    { label: "Buildings", amount: 650000 },
    { label: "Equipment", amount: 18500 },
  ];

  const liabilities: LineItem[] = [
    { label: "Accounts Payable", amount: 6100 },
    { label: "Accrued Expenses", amount: 2800 },
    { label: "Mortgage Payable", amount: 412000 },
    { label: "Security Deposits Held", amount: 14800 },
  ];

  const equityItems: LineItem[] = [
    { label: "Owner Capital", amount: 250000 },
    { label: "Current Period Earnings", amount: 16450 },
    { label: "Owner Draws", amount: -6500 },
  ];

  const cashFlowOperating: LineItem[] = [
    { label: "Cash Received From Tenants", amount: 29200 },
    { label: "Cash Paid for Operating Expenses", amount: -12350 },
    { label: "Cash Paid for Admin & Software", amount: -900 },
  ];

  const cashFlowInvesting: LineItem[] = [
    { label: "Equipment Purchase", amount: -2500 },
  ];

  const cashFlowFinancing: LineItem[] = [
    { label: "Mortgage Principal Paid", amount: -3200 },
    { label: "Owner Contribution", amount: 5000 },
  ];

  const journalEntries: JournalEntry[] = [
    {
      date: "2026-04-01",
      account: "Cash",
      type: "Debit",
      amount: 28500,
      memo: "April rent collected",
    },
    {
      date: "2026-04-01",
      account: "Rental Income",
      type: "Credit",
      amount: 28500,
      memo: "April rent collected",
    },
    {
      date: "2026-04-03",
      account: "Repairs & Maintenance",
      type: "Debit",
      amount: 1600,
      memo: "HVAC service",
    },
    {
      date: "2026-04-03",
      account: "Cash",
      type: "Credit",
      amount: 1600,
      memo: "HVAC service",
    },
    {
      date: "2026-04-05",
      account: "Accounts Receivable",
      type: "Debit",
      amount: 900,
      memo: "Tenant balance due",
    },
    {
      date: "2026-04-05",
      account: "Rental Income",
      type: "Credit",
      amount: 900,
      memo: "Tenant balance due",
    },
  ];

  const arApRows: ArApRow[] = [
    {
      name: "Unit 3B - Tenant Balance",
      type: "Receivable",
      dueDate: "2026-04-12",
      amount: 900,
      status: "Outstanding",
    },
    {
      name: "Unit 7A - Late Fee",
      type: "Receivable",
      dueDate: "2026-04-10",
      amount: 300,
      status: "Outstanding",
    },
    {
      name: "HVAC Vendor",
      type: "Payable",
      dueDate: "2026-04-14",
      amount: 1600,
      status: "Open",
    },
    {
      name: "Landscaping Vendor",
      type: "Payable",
      dueDate: "2026-04-18",
      amount: 850,
      status: "Open",
    },
  ];

  const totalRevenue = useMemo(
    () => revenueItems.reduce((sum, item) => sum + item.amount, 0),
    []
  );
  const totalExpenses = useMemo(
    () => expenseItems.reduce((sum, item) => sum + item.amount, 0),
    []
  );
  const netOperatingIncome = totalRevenue - totalExpenses;

  const totalAssets = useMemo(
    () => assets.reduce((sum, item) => sum + item.amount, 0),
    []
  );
  const totalLiabilities = useMemo(
    () => liabilities.reduce((sum, item) => sum + item.amount, 0),
    []
  );
  const totalEquity = useMemo(
    () => equityItems.reduce((sum, item) => sum + item.amount, 0),
    []
  );

  const totalOperatingCash = useMemo(
    () => cashFlowOperating.reduce((sum, item) => sum + item.amount, 0),
    []
  );
  const totalInvestingCash = useMemo(
    () => cashFlowInvesting.reduce((sum, item) => sum + item.amount, 0),
    []
  );
  const totalFinancingCash = useMemo(
    () => cashFlowFinancing.reduce((sum, item) => sum + item.amount, 0),
    []
  );
  const netCashChange =
    totalOperatingCash + totalInvestingCash + totalFinancingCash;

  const totalReceivables = arApRows
    .filter((row) => row.type === "Receivable")
    .reduce((sum, row) => sum + row.amount, 0);

  const totalPayables = arApRows
    .filter((row) => row.type === "Payable")
    .reduce((sum, row) => sum + row.amount, 0);

  const tabButtonStyle = (key: TabKey): React.CSSProperties => ({
    padding: "12px 16px",
    borderRadius: "12px",
    border: activeTab === key ? "1px solid #2563eb" : "1px solid #d1d5db",
    background: activeTab === key ? "#2563eb" : "#ffffff",
    color: activeTab === key ? "#ffffff" : "#374151",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f6fb",
        fontFamily:
          'Inter, Arial, "Helvetica Neue", Helvetica, sans-serif',
        color: "#111827",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>
        <div
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #eef4ff 100%)",
            border: "1px solid #dbeafe",
            borderRadius: "24px",
            padding: "28px",
            boxShadow: "0 10px 24px rgba(37, 99, 235, 0.08)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#2563eb",
                  letterSpacing: "0.03em",
                  marginBottom: "8px",
                }}
              >
                PONPROP ACCOUNTING
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "40px",
                  lineHeight: 1.1,
                  marginBottom: "10px",
                }}
              >
                Financial Dashboard
              </h1>
              <p
                style={{
                  margin: 0,
                  color: "#4b5563",
                  fontSize: "16px",
                  maxWidth: "720px",
                }}
              >
                Track property income, expenses, cash flow, balance sheet
                positions, journal entries, and receivables/payables in one
                place.
              </p>
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                padding: "18px 20px",
                minWidth: "240px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  marginBottom: "6px",
                  fontWeight: 600,
                }}
              >
                Current Period
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#111827",
                  marginBottom: "4px",
                }}
              >
                April 2026
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                Sample live accounting view
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <MetricCard
            title="Total Revenue"
            value={currency(totalRevenue)}
            subtitle="Current month"
          />
          <MetricCard
            title="Total Expenses"
            value={currency(totalExpenses)}
            subtitle="Current month"
          />
          <MetricCard
            title="Net Operating Income"
            value={currency(netOperatingIncome)}
            subtitle="Revenue minus expenses"
            valueColor="#15803d"
          />
          <MetricCard
            title="Net Cash Change"
            value={currency(netCashChange)}
            subtitle="Operating + investing + financing"
            valueColor="#2563eb"
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <button style={tabButtonStyle("overview")} onClick={() => setActiveTab("overview")}>
            Overview
          </button>
          <button
            style={tabButtonStyle("profitLoss")}
            onClick={() => setActiveTab("profitLoss")}
          >
            Profit & Loss
          </button>
          <button
            style={tabButtonStyle("balanceSheet")}
            onClick={() => setActiveTab("balanceSheet")}
          >
            Balance Sheet
          </button>
          <button
            style={tabButtonStyle("cashFlow")}
            onClick={() => setActiveTab("cashFlow")}
          >
            Cash Flow
          </button>
          <button
            style={tabButtonStyle("journalEntries")}
            onClick={() => setActiveTab("journalEntries")}
          >
            Journal Entries
          </button>
          <button style={tabButtonStyle("arAp")} onClick={() => setActiveTab("arAp")}>
            A/R & A/P
          </button>
        </div>

        {activeTab === "overview" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.3fr 1fr",
              gap: "20px",
            }}
          >
            <SectionCard
              title="Accounting Snapshot"
              subtitle="High-level monthly view"
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "14px",
                    padding: "18px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
                    Occupancy Revenue
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 700 }}>
                    {currency(28500)}
                  </div>
                </div>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "14px",
                    padding: "18px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
                    Open Receivables
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 700 }}>
                    {currency(totalReceivables)}
                  </div>
                </div>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "14px",
                    padding: "18px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
                    Open Payables
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 700 }}>
                    {currency(totalPayables)}
                  </div>
                </div>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "14px",
                    padding: "18px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
                    Cash Balance
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 700 }}>
                    {currency(42500)}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Quick Actions"
              subtitle="Accounting workflow shortcuts"
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "12px",
                }}
              >
                {[
                  "Record rent payment",
                  "Create journal entry",
                  "Review unpaid balances",
                  "Export monthly statement",
                  "Reconcile bank activity",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "14px",
                      background: "#f8fafc",
                      border: "1px solid #e5e7eb",
                      fontWeight: 600,
                      color: "#1f2937",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Revenue vs Expense Breakdown"
              subtitle="Current month summary"
            >
              <div style={{ display: "grid", gap: "10px" }}>
                <AmountRow label="Total Revenue" amount={totalRevenue} bold />
                <AmountRow label="Total Expenses" amount={totalExpenses} bold />
                <AmountRow
                  label="Net Operating Income"
                  amount={netOperatingIncome}
                  bold
                  positiveColor
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Accounting Health"
              subtitle="Sample metrics"
            >
              <div style={{ display: "grid", gap: "14px" }}>
                <div
                  style={{
                    background: "#eff6ff",
                    borderRadius: "14px",
                    padding: "16px",
                    border: "1px solid #dbeafe",
                  }}
                >
                  <div style={{ fontSize: "13px", color: "#2563eb", marginBottom: "6px" }}>
                    Expense Ratio
                  </div>
                  <div style={{ fontSize: "26px", fontWeight: 700 }}>42.7%</div>
                </div>
                <div
                  style={{
                    background: "#f0fdf4",
                    borderRadius: "14px",
                    padding: "16px",
                    border: "1px solid #dcfce7",
                  }}
                >
                  <div style={{ fontSize: "13px", color: "#15803d", marginBottom: "6px" }}>
                    Operating Margin
                  </div>
                  <div style={{ fontSize: "26px", fontWeight: 700 }}>57.3%</div>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === "profitLoss" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <SectionCard title="Revenue" subtitle="Income accounts">
              {revenueItems.map((item) => (
                <AmountRow key={item.label} label={item.label} amount={item.amount} />
              ))}
              <AmountRow label="Total Revenue" amount={totalRevenue} bold />
            </SectionCard>

            <SectionCard title="Expenses" subtitle="Operating expense accounts">
              {expenseItems.map((item) => (
                <AmountRow key={item.label} label={item.label} amount={item.amount} />
              ))}
              <AmountRow label="Total Expenses" amount={totalExpenses} bold />
            </SectionCard>

            <SectionCard title="Net Income Summary" subtitle="Bottom-line view">
              <div style={{ display: "grid", gap: "10px" }}>
                <AmountRow label="Revenue" amount={totalRevenue} />
                <AmountRow label="Expenses" amount={totalExpenses} />
                <AmountRow
                  label="Net Income"
                  amount={netOperatingIncome}
                  bold
                  positiveColor
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Suggested P&L Features"
              subtitle="Good next accounting upgrades"
            >
              <div style={{ display: "grid", gap: "10px", color: "#374151" }}>
                <div>• Monthly comparison columns</div>
                <div>• Property-by-property P&L</div>
                <div>• Budget vs actual tracking</div>
                <div>• Expense category drilldowns</div>
                <div>• Export to PDF / CSV</div>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === "balanceSheet" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
            }}
          >
            <SectionCard title="Assets" subtitle="What the business owns">
              {assets.map((item) => (
                <AmountRow key={item.label} label={item.label} amount={item.amount} />
              ))}
              <AmountRow label="Total Assets" amount={totalAssets} bold />
            </SectionCard>

            <SectionCard title="Liabilities" subtitle="What the business owes">
              {liabilities.map((item) => (
                <AmountRow key={item.label} label={item.label} amount={item.amount} />
              ))}
              <AmountRow label="Total Liabilities" amount={totalLiabilities} bold />
            </SectionCard>

            <SectionCard title="Equity" subtitle="Ownership value">
              {equityItems.map((item) => (
                <AmountRow key={item.label} label={item.label} amount={item.amount} />
              ))}
              <AmountRow label="Total Equity" amount={totalEquity} bold />
            </SectionCard>
          </div>
        )}

        {activeTab === "cashFlow" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
            }}
          >
            <SectionCard title="Operating Activities" subtitle="Core property operations">
              {cashFlowOperating.map((item) => (
                <AmountRow key={item.label} label={item.label} amount={item.amount} />
              ))}
              <AmountRow label="Net Operating Cash" amount={totalOperatingCash} bold />
            </SectionCard>

            <SectionCard title="Investing Activities" subtitle="Asset purchases and sales">
              {cashFlowInvesting.map((item) => (
                <AmountRow key={item.label} label={item.label} amount={item.amount} />
              ))}
              <AmountRow label="Net Investing Cash" amount={totalInvestingCash} bold />
            </SectionCard>

            <SectionCard title="Financing Activities" subtitle="Debt and owner activity">
              {cashFlowFinancing.map((item) => (
                <AmountRow key={item.label} label={item.label} amount={item.amount} />
              ))}
              <AmountRow label="Net Financing Cash" amount={totalFinancingCash} bold />
            </SectionCard>
          </div>
        )}

        {activeTab === "journalEntries" && (
          <SectionCard
            title="Journal Entries"
            subtitle="Sample accounting activity"
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={tableHeadStyle}>Date</th>
                    <th style={tableHeadStyle}>Account</th>
                    <th style={tableHeadStyle}>Type</th>
                    <th style={tableHeadStyle}>Amount</th>
                    <th style={tableHeadStyle}>Memo</th>
                  </tr>
                </thead>
                <tbody>
                  {journalEntries.map((entry, index) => (
                    <tr key={`${entry.date}-${entry.account}-${index}`}>
                      <td style={tableCellStyle}>{entry.date}</td>
                      <td style={tableCellStyle}>{entry.account}</td>
                      <td style={tableCellStyle}>{entry.type}</td>
                      <td style={tableCellStyle}>{currency(entry.amount)}</td>
                      <td style={tableCellStyle}>{entry.memo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {activeTab === "arAp" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 320px",
              gap: "20px",
            }}
          >
            <SectionCard
              title="Receivables & Payables"
              subtitle="Open balances"
            >
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={tableHeadStyle}>Name</th>
                      <th style={tableHeadStyle}>Type</th>
                      <th style={tableHeadStyle}>Due Date</th>
                      <th style={tableHeadStyle}>Amount</th>
                      <th style={tableHeadStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arApRows.map((row) => (
                      <tr key={`${row.name}-${row.type}`}>
                        <td style={tableCellStyle}>{row.name}</td>
                        <td style={tableCellStyle}>{row.type}</td>
                        <td style={tableCellStyle}>{row.dueDate}</td>
                        <td style={tableCellStyle}>{currency(row.amount)}</td>
                        <td style={tableCellStyle}>{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="Summary" subtitle="Outstanding balances">
              <div style={{ display: "grid", gap: "12px" }}>
                <div
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #dbeafe",
                    borderRadius: "14px",
                    padding: "16px",
                  }}
                >
                  <div style={{ fontSize: "13px", color: "#2563eb", marginBottom: "8px" }}>
                    Total Receivables
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 700 }}>
                    {currency(totalReceivables)}
                  </div>
                </div>
                <div
                  style={{
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    borderRadius: "14px",
                    padding: "16px",
                  }}
                >
                  <div style={{ fontSize: "13px", color: "#c2410c", marginBottom: "8px" }}>
                    Total Payables
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 700 }}>
                    {currency(totalPayables)}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}

const tableHeadStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  borderBottom: "1px solid #e5e7eb",
  color: "#374151",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const tableCellStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid #f1f5f9",
  color: "#111827",
  whiteSpace: "nowrap",
};

export default App;