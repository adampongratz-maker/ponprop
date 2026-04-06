import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function Analytics() {
  const [range, setRange] = useState("ytd");

  const { data: entries = [], refetch: refetchEntries } = useQuery({
    queryKey: ["ledger_entries"],
    queryFn: async () => { const { data, error } = await supabase.from("ledger_entries").select("*"); if (error) throw error; return data; },
  });
  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => { const { data, error } = await supabase.from("tenants").select("*"); if (error) throw error; return data; },
  });
  const { data: workOrders = [] } = useQuery({
    queryKey: ["work_orders"],
    queryFn: async () => { const { data, error } = await supabase.from("work_orders").select("*"); if (error) throw error; return data; },
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => { const { data, error } = await supabase.from("tasks").select("*"); if (error) throw error; return data; },
  });

  const now = new Date();
  const filterDate = range === "mtd" ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01` :
    range === "qtd" ? `${now.getFullYear()}-${String(Math.floor(now.getMonth() / 3) * 3 + 1).padStart(2, "0")}-01` :
    range === "ytd" ? `${now.getFullYear()}-01-01` : "1900-01-01";

  const filtered = entries.filter(e => e.date >= filterDate);
  const income = filtered.filter(e => e.type === "Income").reduce((s, e) => s + Number(e.amount), 0);
  const expenses = filtered.filter(e => e.type === "Expense").reduce((s, e) => s + Number(e.amount), 0);
  const activeTenants = tenants.filter(t => t.status === "Active").length;
  const openWO = workOrders.filter(w => w.status !== "Done").length;
  const openTasks = tasks.filter(t => t.status !== "Completed").length;
  const delinquent = tenants.filter(t => t.status === "Active" && (t.balance || 0) > 0).length;

  const kpis = [
    { kpi: "Rent Collected", value: `$${income.toLocaleString()}`, notes: `${range.toUpperCase()} from ledger` },
    { kpi: "Total Expenses", value: `$${expenses.toLocaleString()}`, notes: `${range.toUpperCase()} from ledger` },
    { kpi: "Net Operating Income", value: `$${(income - expenses).toLocaleString()}`, notes: "Revenue − Expenses" },
    { kpi: "Active Tenants", value: String(activeTenants), notes: "From tenant directory" },
    { kpi: "Delinquent Tenants", value: String(delinquent), notes: "Balance > 0" },
    { kpi: "Open Work Orders", value: String(openWO), notes: "Not Done" },
    { kpi: "Open Tasks", value: String(openTasks), notes: "Not Completed" },
    { kpi: "Expense Ratio", value: income > 0 ? `${((expenses / income) * 100).toFixed(1)}%` : "N/A", notes: "Expenses / Revenue" },
  ];

  const exportCSV = () => {
    const header = "KPI,Value,Notes\n";
    const rows = kpis.map(k => `${k.kpi},${k.value},"${k.notes}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "kpi-snapshot.csv"; a.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      <p className="text-muted-foreground text-sm -mt-4">Portfolio KPI dashboard.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.slice(0, 4).map(k => (
          <Card key={k.kpi} className="glass"><CardContent className="p-4"><p className="text-xs text-muted-foreground">{k.kpi}</p><p className="text-2xl font-bold mt-1">{k.value}</p></CardContent></Card>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <select value={range} onChange={(e) => setRange(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="mtd">MTD</option><option value="qtd">QTD</option><option value="ytd">YTD</option><option value="all">All time</option>
        </select>
        <Button variant="outline" size="sm" onClick={() => refetchEntries()}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />Export</Button>
      </div>
      <Card className="glass"><CardContent className="p-4">
        <Table><TableHeader><TableRow><TableHead>KPI</TableHead><TableHead>Value</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
          <TableBody>{kpis.map(k => (
            <TableRow key={k.kpi}><TableCell className="font-medium">{k.kpi}</TableCell><TableCell className="font-bold">{k.value}</TableCell><TableCell className="text-muted-foreground text-sm">{k.notes}</TableCell></TableRow>
          ))}</TableBody></Table>
      </CardContent></Card>
    </div>
  );
}
