import { useState } from "react";

const apps = [
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

function getPanelContent(app: string) {
  if (app === "Accounting") {
    return (
      <div>
        <h2 style={{ marginTop: 0, fontSize: "24px" }}>Accounting Overview</h2>
        <div style={{ display: "flex", gap: "30px", marginTop: "20px", flexWrap: "wrap" }}>
          <div>Revenue: $120,000</div>
          <div>Expenses: $80,000</div>
          <div>Profit: $40,000</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop: 0, fontSize: "24px" }}>{app}</h2>
      <div style={{ marginTop: "20px" }}>{app} panel coming next.</div>
    </div>
  );
}

export default function Index() {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
      
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ fontSize: "40px", fontWeight: "bold", margin: 0 }}>
          PonProp Dashboard
        </h1>

        {activeApp && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "2px solid #4f46e5",
              background: "#eef2ff",
              fontWeight: 600,
            }}
          >
            {activeApp}
            <button
              onClick={() => setActiveApp(null)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* APP GRID */}
      {!activeApp && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "16px",
          }}
        >
          {apps.map((app) => (
            <div
              key={app}
              onClick={() => setActiveApp(app)}
              style={{
                padding: "18px",
                borderRadius: "16px",
                border: "1px solid #ddd",
                background: "#f8f8f8",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              {app}
            </div>
          ))}
        </div>
      )}

      {/* PANEL */}
      {activeApp && (
        <div
          style={{
            marginTop: "20px",
            padding: "24px",
            border: "1px solid #ddd",
            borderRadius: "16px",
            background: "#fff",
          }}
        >
          {getPanelContent(activeApp)}
        </div>
      )}
    </div>
  );
}