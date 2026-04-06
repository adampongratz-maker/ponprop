function App() {
  return (
    <div style={{ padding: "40px", fontFamily: "Arial", background: "#f5f7fb", minHeight: "100vh" }}>
      
      {/* Header */}
      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>
        PonProp Dashboard
      </h1>
      <p style={{ marginBottom: "30px", color: "#555" }}>
        Property Management System
      </p>

      {/* Stats Row */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
        
        <div style={{ flex: 1, background: "#fff", padding: "20px", borderRadius: "12px" }}>
          <h3>Revenue</h3>
          <p style={{ fontSize: "24px" }}>$12,500</p>
        </div>

        <div style={{ flex: 1, background: "#fff", padding: "20px", borderRadius: "12px" }}>
          <h3>Expenses</h3>
          <p style={{ fontSize: "24px" }}>$4,200</p>
        </div>

        <div style={{ flex: 1, background: "#fff", padding: "20px", borderRadius: "12px" }}>
          <h3>Profit</h3>
          <p style={{ fontSize: "24px", color: "green" }}>$8,300</p>
        </div>

      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "15px" }}>
        <button style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#007bff", color: "#fff" }}>
          Add Property
        </button>

        <button style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#28a745", color: "#fff" }}>
          View Reports
        </button>
      </div>

    </div>
  );
}

export default App;