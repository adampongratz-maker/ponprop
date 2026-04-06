import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, TrendingUp, TrendingDown, DollarSign, Search, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

const CHART_COLORS = ["hsl(221, 83%, 53%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

const emptyEntry = { date: "", type: "Income", amount: "", tenant: "", property: "", unit: "", method: "" };

export default function Accounting() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyEntry);
  const [open, setOpen] = useState(false);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["ledger_entries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ledger_entries").select("*").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addEntry = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("ledger_entries").insert({
        ...form,
        amount: parseFloat(form.amount) || 0,
        date: form.date || new Date().toISOString().split("T")[0],
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger_entries"] });
      setForm(emptyEntry);
      setOpen(false);
      toast.success("Entry added");
    },
    onError: (e) => toast.error(e.message),
  });

  const totalIncome = entries.filter((e) => e.type === "Income").reduce((s, e) => s + Number(e.amount), 0);
  const totalExpenses = entries.filter((e) => e.type === "Expense").reduce((s, e) => s + Number(e.amount), 0);
  const profit = totalIncome - totalExpenses;

  const monthlyData = entries.reduce((acc, e) => {
    const month = e.date?.slice(0, 7) || "Unknown";
    const existing = acc.find((a) => a.month === month);
    if (existing) {
      if (e.type === "Income") existing.income += Number(e.amount);
      else existing.expenses += Number(e.amount);
    } else {
      acc.push({
        month,
        income: e.type === "Income" ? Number(e.amount) : 0,
        expenses: e.type === "Expense" ? Number(e.amount) : 0,
      });
    }
    return acc;
  }, [] as { month: string; income: number; expenses: number }[]).sort((a, b) => a.month.localeCompare(b.month));

  const pieData = [
    { name: "Income", value: totalIncome },
    { name: "Expenses", value: totalExpenses },
  ];

  const filtered = entries.filter((e) =>
    [e.type, e.tenant, e.property, e.unit, e.method].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const exportCSV = () => {
    const header = "Date,Type,Amount,Tenant,Property,Unit,Method\n";
    const rows = entries.map((e) => `${e.date},${e.type},${e.amount},${e.tenant || ""},${e.property || ""},${e.unit || ""},${e.method || ""}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ledger.csv";
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Accounting</h1>

      <Tabs defaultValue="dashboard">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">P/L Dashboard</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="glass">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">${totalIncome.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expenses</p>
                  <p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net Profit</p>
                  <p className={`text-2xl font-bold ${profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    ${profit.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="glass lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Monthly Income vs Expenses</CardTitle></CardHeader>
              <CardContent>
                {monthlyData.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-12">Add ledger entries to see charts</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="income" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" fill="hsl(0,84%,60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card className="glass">
              <CardHeader><CardTitle className="text-base">Income vs Expenses</CardTitle></CardHeader>
              <CardContent>
                {totalIncome === 0 && totalExpenses === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-12">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                        {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ledger">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search ledger..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 bg-muted/50" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="w-4 h-4 mr-1" />CSV
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Entry</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Ledger Entry</DialogTitle></DialogHeader>
                  <form onSubmit={(e) => { e.preventDefault(); addEntry.mutate(); }} className="space-y-3">
                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                      <option>Income</option>
                      <option>Expense</option>
                    </select>
                    <Input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                    <Input placeholder="Tenant" value={form.tenant} onChange={(e) => setForm({ ...form, tenant: e.target.value })} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Property" value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} />
                      <Input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                    </div>
                    <Input placeholder="Payment method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} />
                    <Button type="submit" className="w-full">Save Entry</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="glass">
            <CardContent className="p-4">
              {isLoading ? (
                <p className="text-muted-foreground text-sm text-center py-8">Loading...</p>
              ) : filtered.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-12">No ledger entries. Add one to get started.</p>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Method</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>{e.date}</TableCell>
                          <TableCell>
                            <Badge variant={e.type === "Income" ? "default" : "destructive"}>{e.type}</Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${e.type === "Income" ? "text-emerald-600" : "text-red-500"}`}>
                            ${Number(e.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>{e.tenant}</TableCell>
                          <TableCell>{e.property}</TableCell>
                          <TableCell>{e.unit}</TableCell>
                          <TableCell>{e.method}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card className="glass">
            <CardHeader><CardTitle>Balance Sheet Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4 text-emerald-600">Assets / Income</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-sm">Total Income</span>
                      <span className="font-medium">${totalIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-emerald-600">
                      <span>Total Assets</span>
                      <span>${totalIncome.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4 text-red-500">Liabilities / Expenses</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-sm">Total Expenses</span>
                      <span className="font-medium">${totalExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-red-500">
                      <span>Total Liabilities</span>
                      <span>${totalExpenses.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-lg font-bold">Net Equity</span>
                <span className={`text-2xl font-bold ${profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  ${profit.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
