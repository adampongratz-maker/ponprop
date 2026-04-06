import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Search, Clock, Play, Pause, Square, Download } from "lucide-react";
import { toast } from "sonner";

const KEY = "pp_timecards_v1";
type TimeEntry = { id: string; date: string; worker: string; property: string; unit: string; task: string; hours: number; status: string };

export default function TimeCards() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], worker: "", property: "", unit: "", task: "General", hours: "", status: "Completed" });

  useEffect(() => { try { setEntries(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { setEntries([]); } }, []);
  const save = (d: TimeEntry[]) => { setEntries(d); localStorage.setItem(KEY, JSON.stringify(d)); };

  const add = () => {
    if (!form.worker.trim()) return toast.error("Worker required");
    save([...entries, { id: crypto.randomUUID(), date: form.date, worker: form.worker, property: form.property, unit: form.unit, task: form.task, hours: parseFloat(form.hours) || 0, status: form.status }]);
    setForm({ ...form, worker: "", property: "", unit: "", hours: "" }); setOpen(false); toast.success("Entry added");
  };

  const totalHours = entries.reduce((s, e) => s + e.hours, 0);
  const todayEntries = entries.filter(e => e.date === new Date().toISOString().split("T")[0]);
  const todayHours = todayEntries.reduce((s, e) => s + e.hours, 0);

  const exportCSV = () => {
    const header = "Date,Worker,Property,Unit,Task,Hours,Status\n";
    const rows = entries.map(e => `${e.date},${e.worker},${e.property},${e.unit},${e.task},${e.hours},${e.status}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "timecards.csv"; a.click();
  };

  const filtered = entries.filter(e => [e.worker, e.property, e.task].some(v => v.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Time Cards</h1><p className="text-muted-foreground text-sm">Clock-in/out, job costing, and payroll summaries.</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />CSV</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Entry</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Time Entry</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                <Input placeholder="Worker name" value={form.worker} onChange={(e) => setForm({ ...form, worker: e.target.value })} />
                <Input placeholder="Property" value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} />
                <Input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                <select value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option>General</option><option>Turn / Make Ready</option><option>Plumbing</option><option>Electrical</option><option>HVAC</option><option>Painting</option><option>Landscaping</option><option>Cleaning</option>
                </select>
                <Input type="number" step="0.25" placeholder="Hours" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
                <Button onClick={add} className="w-full">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass"><CardContent className="p-5 text-center"><p className="text-xs text-muted-foreground">Today</p><p className="text-2xl font-bold">{todayHours.toFixed(2)}h</p></CardContent></Card>
        <Card className="glass"><CardContent className="p-5 text-center"><p className="text-xs text-muted-foreground">This Period (14d)</p><p className="text-2xl font-bold">{entries.filter(e => { const d = new Date(e.date); const ago = new Date(); ago.setDate(ago.getDate() - 14); return d >= ago; }).reduce((s, e) => s + e.hours, 0).toFixed(2)}h</p></CardContent></Card>
        <Card className="glass"><CardContent className="p-5 text-center"><p className="text-xs text-muted-foreground">Total All Time</p><p className="text-2xl font-bold">{totalHours.toFixed(2)}h</p></CardContent></Card>
      </div>
      <div className="flex items-center gap-2"><Search className="w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 bg-muted/50 max-w-sm" /></div>
      <Card className="glass"><CardContent className="p-4">
        {filtered.length === 0 ? <p className="text-muted-foreground text-sm text-center py-12">No time entries yet.</p> : (
          <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Worker</TableHead><TableHead>Property</TableHead><TableHead>Unit</TableHead><TableHead>Task</TableHead><TableHead>Hours</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>{filtered.map(e => (
              <TableRow key={e.id}><TableCell>{e.date}</TableCell><TableCell className="font-medium">{e.worker}</TableCell><TableCell>{e.property}</TableCell><TableCell>{e.unit}</TableCell><TableCell>{e.task}</TableCell><TableCell>{e.hours.toFixed(2)}</TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => save(entries.filter(x => x.id !== e.id))}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
            ))}</TableBody></Table>
        )}
      </CardContent></Card>
    </div>
  );
}
