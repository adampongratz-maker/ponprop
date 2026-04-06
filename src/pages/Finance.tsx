import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Building2, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(142,71%,45%)", "hsl(0,84%,60%)", "hsl(221,83%,53%)", "hsl(38,92%,50%)"];

export default function Finance() {
  const { data: entries = [] } = useQuery({
    queryKey: ["ledger_entries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ledger_entries").select("*").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenants").select("*");
      if (error) throw error;
      return data;
    },
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const yearStart = `${now.getFullYear()}-01-01`;

  const totalIncome = entries.filter(e => e.type === "Income").reduce((s, e) => s + Number(e.amount), 0);
  const totalExpenses = entries.filter(e => e.type === "Expense").reduce((s, e) => s + Number(e.amount), 0);
  const mtdIncome = entries.filter(e => e.type === "Income" && e.date >= monthStart).reduce((s, e) => s + Number(e.amount), 0);
  const mtdExpenses = entries.filter(e => e.type === "Expense" && e.date >= monthStart).reduce((s, e) => s + Number(e.amount), 0);
  const ytdIncome = entries.filter(e => e.type === "Income" && e.date >= yearStart).reduce((s, e) => s + Number(e.amount), 0);
  const ytdExpenses = entries.filter(e => e.type === "Expense" && e.date >= yearStart).reduce((s, e) => s + Number(e.amount), 0);
  const activeTenants = tenants.filter(t => t.status === "Active").length;

  const monthlyData = entries.reduce((acc, e) => {
    const month = e.date?.slice(0, 7) || "Unknown";
    const existing = acc.find(a => a.month === month);
    const amt = Number(e.amount);
    if (existing) { if (e.type === "Income") existing.income += amt; else existing.expenses += amt; }
    else acc.push({ month, income: e.type === "Income" ? amt : 0, expenses: e.type === "Expense" ? amt : 0 });
    return acc;
  }, [] as { month: string; income: number; expenses: number }[]).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);

  const pieData = [{ name: "Income", value: totalIncome }, { name: "Expenses", value: totalExpenses }];

  const kpis = [
    { label: "Total Revenue", value: `$${totalIncome.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Expenses", value: `$${totalExpenses.toLocaleString()}`, icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Net Profit", value: `$${(totalIncome - totalExpenses).toLocaleString()}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active Tenants", value: String(activeTenants), icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "MTD Income", value: `$${mtdIncome.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "MTD Expenses", value: `$${mtdExpenses.toLocaleString()}`, icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "MTD Net", value: `$${(mtdIncome - mtdExpenses).toLocaleString()}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
    { label: "YTD Net", value: `$${(ytdIncome - ytdExpenses).toLocaleString()}`, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
      <p className="text-muted-foreground text-sm -mt-4">Quick portfolio KPIs from your Accounting + Properties data.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => (
          <Card key={k.label} className="glass">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center`}><k.icon className={`w-5 h-5 ${k.color}`} /></div>
              <div><p className="text-xs text-muted-foreground">{k.label}</p><p className="text-lg font-bold">{k.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass"><CardHeader><CardTitle className="text-base">Monthly Cashflow (Last 6 Months)</CardTitle></CardHeader>
          <CardContent>{monthlyData.length === 0 ? <p className="text-muted-foreground text-sm text-center py-12">Add ledger entries to see charts</p> : (
            <ResponsiveContainer width="100%" height={240}><BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip />
              <Bar dataKey="income" fill="hsl(142,71%,45%)" radius={[4,4,0,0]} /><Bar dataKey="expenses" fill="hsl(0,84%,60%)" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
          )}</CardContent>
        </Card>
        <Card className="glass"><CardHeader><CardTitle className="text-base">Income vs Expenses</CardTitle></CardHeader>
          <CardContent>{totalIncome === 0 && totalExpenses === 0 ? <p className="text-muted-foreground text-sm text-center py-12">No data</p> : (
            <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
              {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
          )}</CardContent>
        </Card>
      </div>
    </div>
  );
}
