import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const KEY = "pp_projects_v1";
type Project = { id: string; property: string; name: string; budget: number; status: string; start: string; due: string };

export default function Projects() {
  const [items, setItems] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ property: "", name: "", budget: "", status: "Planned", start: "", due: "" });

  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { setItems([]); } }, []);
  const save = (d: Project[]) => { setItems(d); localStorage.setItem(KEY, JSON.stringify(d)); };

  const add = () => {
    if (!form.property.trim() || !form.name.trim()) return toast.error("Property and name required");
    save([...items, { id: crypto.randomUUID(), property: form.property, name: form.name, budget: parseFloat(form.budget) || 0, status: form.status, start: form.start, due: form.due }]);
    setForm({ property: "", name: "", budget: "", status: "Planned", start: "", due: "" }); setOpen(false); toast.success("Project added");
  };

  const filtered = items.filter(p => {
    if (filter === "planned" && p.status !== "Planned") return false;
    if (filter === "progress" && p.status !== "In Progress") return false;
    if (filter === "complete" && p.status !== "Complete") return false;
    return [p.property, p.name, p.status].some(v => v.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Projects</h1><p className="text-muted-foreground text-sm">Track renovations, cap-ex, budgets, and status.</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Project</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Project</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Property" value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} />
              <Input placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input type="number" placeholder="Budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option>Planned</option><option>In Progress</option><option>Complete</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
                <Input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
              </div>
              <Button onClick={add} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 bg-muted/50 max-w-sm" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All</option><option value="planned">Planned</option><option value="progress">In Progress</option><option value="complete">Complete</option>
        </select>
      </div>
      <Card className="glass"><CardContent className="p-4">
        {filtered.length === 0 ? <p className="text-muted-foreground text-sm text-center py-12">No projects yet.</p> : (
          <Table><TableHeader><TableRow><TableHead>Property</TableHead><TableHead>Project</TableHead><TableHead>Status</TableHead><TableHead>Start</TableHead><TableHead>Due</TableHead><TableHead>Budget</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>{filtered.map(p => (
              <TableRow key={p.id}><TableCell>{p.property}</TableCell><TableCell className="font-medium">{p.name}</TableCell>
                <TableCell><Badge variant={p.status === "Complete" ? "default" : p.status === "In Progress" ? "secondary" : "outline"}>{p.status}</Badge></TableCell>
                <TableCell>{p.start || "—"}</TableCell><TableCell>{p.due || "—"}</TableCell><TableCell>${p.budget.toLocaleString()}</TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => save(items.filter(x => x.id !== p.id))}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
            ))}</TableBody></Table>
        )}
      </CardContent></Card>
    </div>
  );
}
