import React from "react";

export default function App() {
  return (
    <div style={{ fontFamily: "Arial", background: "#f5f7fb", minHeight: "100vh" }}>
      
      {/* Top Bar */}
      <div style={{
        background: "#0f172a",
        color: "white",
        padding: "16px 24px",
        fontSize: "20px",
        fontWeight: "bold"
      }}>
        PonProp Dashboard
      </div>

      <div style={{ display: "flex" }}>
        
        {/* Sidebar */}
        <div style={{
          width: "220px",
          background: "#111827",
          color: "white",
          padding: "20px",
          minHeight: "100vh"
        }}>
          <div style={{ marginBottom: "20px", fontWeight: "bold" }}>Apps</div>
          <div>Home</div>
          <div>Accounting</div>
          <div>Finance</div>
          <div>Properties</div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "30px" }}>
          
          {/* Header */}
          <h1 style={{ marginBottom: "10px" }}>Overview</h1>
          <p style={{ color: "#6b7280", marginBottom: "20px" }}>
            Real estate management dashboard
          </p>

          {/* Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px"
          }}>
            
            <div style={card}>
              <div>Revenue</div>
              <h2>$12,500</h2>
            </div>

            <div style={card}>
              <div>Expenses</div>
              <h2>$4,200</h2>
            </div>

            <div style={card}>
              <div>Profit</div>
              <h2 style={{ color: "green" }}>$8,300</h2>
            </div>

          </div>

          {/* Buttons */}
          <div style={{ marginTop: "25px" }}>
            <button style={btnBlue}>Add Property</button>
            <button style={btnGreen}>View Reports</button>
          </div>

        </div>
      </div>
    </div>
  );
}

const card = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
};

const btnBlue = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  marginRight: "10px",
  cursor: "pointer"
};

const btnGreen = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer"
};