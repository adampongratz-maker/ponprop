import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Search, Download } from "lucide-react";
import { toast } from "sonner";

const KEY = "pp_complaints_v1";
type Complaint = { id: string; date: string; property: string; unit: string; from: string; category: string; priority: string; details: string; status: string; assigned: string };

export default function Complaints() {
  const [items, setItems] = useState<Complaint[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("open");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], property: "", unit: "", from: "", category: "Maintenance", priority: "med", details: "", status: "Open", assigned: "" });

  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { setItems([]); } }, []);
  const save = (d: Complaint[]) => { setItems(d); localStorage.setItem(KEY, JSON.stringify(d)); };

  const add = () => {
    if (!form.details.trim()) return toast.error("Details required");
    save([...items, { id: crypto.randomUUID(), ...form }]);
    setForm({ ...form, property: "", unit: "", from: "", details: "" }); setOpen(false); toast.success("Complaint created");
  };

  const filtered = items.filter(c => {
    if (filter === "open" && c.status !== "Open" && c.status !== "In Progress") return false;
    if (filter === "resolved" && c.status !== "Resolved" && c.status !== "Closed") return false;
    return [c.property, c.unit, c.from, c.details].some(v => v.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Complaints</h1><p className="text-muted-foreground text-sm">Track tenant complaints and resident issues.</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Create</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Complaint</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                <Input placeholder="From (name)" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Property" value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} />
                <Input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option>Noise</option><option>Maintenance</option><option>Neighbors</option><option>Safety</option><option>Payments</option><option>Other</option>
                </select>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="low">Low</option><option value="med">Medium</option><option value="high">High</option>
                </select>
              </div>
              <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Complaint details..." className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <Button onClick={add} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 bg-muted/50 max-w-sm" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="open">Open</option><option value="all">All</option><option value="resolved">Resolved/Closed</option>
        </select>
      </div>
      <Card className="glass"><CardContent className="p-4">
        {filtered.length === 0 ? <p className="text-muted-foreground text-sm text-center py-12">No complaints.</p> : (
          <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Property</TableHead><TableHead>Unit</TableHead><TableHead>From</TableHead><TableHead>Category</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>{filtered.map(c => (
              <TableRow key={c.id}><TableCell>{c.date}</TableCell><TableCell>{c.property}</TableCell><TableCell>{c.unit}</TableCell><TableCell>{c.from}</TableCell>
                <TableCell><Badge variant="outline">{c.category}</Badge></TableCell>
                <TableCell><Badge variant={c.priority === "high" ? "destructive" : c.priority === "med" ? "secondary" : "outline"}>{c.priority}</Badge></TableCell>
                <TableCell>
                  <select value={c.status} onChange={(e) => save(items.map(x => x.id === c.id ? { ...x, status: e.target.value } : x))} className="h-8 rounded border border-input bg-background px-2 text-xs">
                    <option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
                  </select>
                </TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => save(items.filter(x => x.id !== c.id))}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
            ))}</TableBody></Table>
        )}
      </CardContent></Card>
    </div>
  );
}
