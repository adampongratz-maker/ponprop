import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/accounting" element={<div>Accounting Page</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;