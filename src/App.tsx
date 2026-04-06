import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import Index from "./pages/Index";
import ToDo from "./pages/ToDo";
import Tenants from "./pages/Tenants";
import Maintenance from "./pages/Maintenance";
import Accounting from "./pages/Accounting";
import RentalHistory from "./pages/RentalHistory";
import Properties from "./pages/Properties";
import Projects from "./pages/Projects";
import Marketing from "./pages/Marketing";
import Finance from "./pages/Finance";
import Legal from "./pages/Legal";
import Inventory from "./pages/Inventory";
import TimeCards from "./pages/TimeCards";
import Incidents from "./pages/Incidents";
import CalendarPage from "./pages/Calendar";
import Complaints from "./pages/Complaints";
import Analytics from "./pages/Analytics";
import IT from "./pages/IT";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/todo" element={<ToDo />} />
            <Route path="/history" element={<RentalHistory />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/timecards" element={<TimeCards />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/it" element={<IT />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
