import React from "react";

type AppItem = {
  name: string;
  icon: string;
  color: string;
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

const appItems: AppItem[] = [
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

function App() {
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
        {/* Sidebar */}
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
                flexShrink: 0,
              }}
            >
              ▤
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Pongratz Properties
            </div>
          </div>

          <div
            style={{
              overflowY: "auto",
              padding: "14px 10px 20px 10px",
              flex: 1,
            }}
          >
            {sidebarItems.map((item, index) => {
              const active = index === 0;
              return (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px 14px",
                    borderRadius: "16px",
                    marginBottom: "4px",
                    background: active ? "#dfe7f5" : "transparent",
                    color: active ? "#2563eb" : "#0f172a",
                    fontWeight: active ? 700 : 500,
                    fontSize: "16px",
                    cursor: "default",
                  }}
                >
                  <span
                    style={{
                      width: "18px",
                      textAlign: "center",
                      fontSize: "18px",
                      opacity: 0.95,
                    }}
                  >
                    {getSidebarIcon(item)}
                  </span>
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main */}
        <main
          style={{
            background: "#f3f4f6",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {/* Top bar */}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "22px",
                  color: "#475569",
                }}
              >
                ◫
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                Pongratz Properties
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
              }}
            >
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

              <div
                style={{
                  position: "relative",
                  fontSize: "22px",
                  color: "#475569",
                }}
              >
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

          {/* Content */}
          <div
            style={{
              padding: "28px 28px 32px 28px",
              overflowY: "auto",
              flex: 1,
            }}
          >
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