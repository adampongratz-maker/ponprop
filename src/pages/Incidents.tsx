import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Search, Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const KEY = "pp_incidents_v1";
type Incident = { id: string; date: string; type: string; severity: string; property: string; unit: string; location: string; narrative: string; status: string };

export default function Incidents() {
  const [items, setItems] = useState<Incident[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 16), type: "Suspicious Person", severity: "med", property: "", unit: "", location: "", narrative: "", status: "Open" });

  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { setItems([]); } }, []);
  const save = (d: Incident[]) => { setItems(d); localStorage.setItem(KEY, JSON.stringify(d)); };

  const add = () => {
    if (!form.narrative.trim()) return toast.error("Narrative required");
    save([...items, { id: crypto.randomUUID(), date: form.date, type: form.type, severity: form.severity, property: form.property, unit: form.unit, location: form.location, narrative: form.narrative, status: form.status }]);
    setForm({ ...form, property: "", unit: "", location: "", narrative: "" }); setOpen(false); toast.success("Report saved");
  };

  const exportCSV = () => {
    const header = "Date,Type,Severity,Property,Unit,Location,Status,Narrative\n";
    const rows = items.map(i => `${i.date},${i.type},${i.severity},${i.property},${i.unit},${i.location},${i.status},"${i.narrative.replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "incident-reports.csv"; a.click();
  };

  const filtered = items.filter(i => {
    if (filter === "open" && i.status !== "Open") return false;
    if (filter === "closed" && i.status !== "Closed") return false;
    return [i.type, i.property, i.location, i.narrative].some(v => v.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Reports</h1><p className="text-muted-foreground text-sm">Incident logs — safety, security, damage, suspicious activity.</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />CSV</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Create Report</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Incident Report</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option>Suspicious Person</option><option>Trespass / Homelessness</option><option>Property Damage</option><option>Safety Hazard</option><option>Noise / Disturbance</option><option>Other</option>
                </select>
                <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="low">Low</option><option value="med">Medium</option><option value="high">High</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Property" value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} />
                  <Input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                </div>
                <Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                <Input placeholder="Exact location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                <textarea value={form.narrative} onChange={(e) => setForm({ ...form, narrative: e.target.value })} placeholder="Narrative: what happened..." className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
                <Button onClick={add} className="w-full">Save Report</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 bg-muted/50 max-w-sm" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All</option><option value="open">Open</option><option value="closed">Closed</option>
        </select>
      </div>
      <Card className="glass"><CardContent className="p-4">
        {filtered.length === 0 ? <p className="text-muted-foreground text-sm text-center py-12">No reports yet.</p> : (
          <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Severity</TableHead><TableHead>Property</TableHead><TableHead>Unit</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>{filtered.map(i => (
              <TableRow key={i.id}><TableCell>{i.date.replace("T", " ")}</TableCell><TableCell>{i.type}</TableCell>
                <TableCell><Badge variant={i.severity === "high" ? "destructive" : i.severity === "med" ? "secondary" : "outline"}>{i.severity}</Badge></TableCell>
                <TableCell>{i.property}</TableCell><TableCell>{i.unit}</TableCell><TableCell>{i.location}</TableCell>
                <TableCell>
                  <Badge variant={i.status === "Open" ? "default" : "secondary"} className="cursor-pointer" onClick={() => save(items.map(x => x.id === i.id ? { ...x, status: x.status === "Open" ? "Closed" : "Open" } : x))}>{i.status}</Badge>
                </TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => save(items.filter(x => x.id !== i.id))}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
            ))}</TableBody></Table>
        )}
      </CardContent></Card>
    </div>
  );
}
