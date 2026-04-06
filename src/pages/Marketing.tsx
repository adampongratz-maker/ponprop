import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Search, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const KEY = "pp_marketing_v1";
type Campaign = { id: string; property: string; channel: string; url: string; leads: number; status: string };

export default function Marketing() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ property: "", channel: "Zillow", url: "", leads: "", status: "Live" });

  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { setItems([]); } }, []);
  const save = (d: Campaign[]) => { setItems(d); localStorage.setItem(KEY, JSON.stringify(d)); };

  const add = () => {
    if (!form.property.trim()) return toast.error("Property required");
    save([...items, { id: crypto.randomUUID(), property: form.property, channel: form.channel, url: form.url, leads: parseInt(form.leads) || 0, status: form.status }]);
    setForm({ property: "", channel: "Zillow", url: "", leads: "", status: "Live" }); setOpen(false); toast.success("Campaign added");
  };

  const filtered = items.filter(c => {
    if (filter === "live" && c.status !== "Live") return false;
    if (filter === "paused" && c.status !== "Paused") return false;
    if (filter === "filled" && c.status !== "Filled") return false;
    return [c.property, c.channel].some(v => v.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Marketing</h1><p className="text-muted-foreground text-sm">Track listings, channels, lead counts, and campaign status.</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Campaign</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Campaign</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Property" value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} />
              <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option>Zillow</option><option>Apartments.com</option><option>Facebook</option><option>Craigslist</option><option>Yard Sign</option><option>Other</option>
              </select>
              <Input placeholder="Listing URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
              <Input type="number" placeholder="Leads" value={form.leads} onChange={(e) => setForm({ ...form, leads: e.target.value })} />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option>Live</option><option>Paused</option><option>Filled</option>
              </select>
              <Button onClick={add} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 bg-muted/50 max-w-sm" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All</option><option value="live">Live</option><option value="paused">Paused</option><option value="filled">Filled</option>
        </select>
      </div>
      <Card className="glass"><CardContent className="p-4">
        {filtered.length === 0 ? <p className="text-muted-foreground text-sm text-center py-12">No campaigns yet.</p> : (
          <Table><TableHeader><TableRow><TableHead>Property</TableHead><TableHead>Channel</TableHead><TableHead>Listing</TableHead><TableHead>Leads</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>{filtered.map(c => (
              <TableRow key={c.id}><TableCell className="font-medium">{c.property}</TableCell><TableCell>{c.channel}</TableCell>
                <TableCell>{c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1"><ExternalLink className="w-3 h-3" />Link</a> : "—"}</TableCell>
                <TableCell>{c.leads}</TableCell>
                <TableCell><Badge variant={c.status === "Live" ? "default" : c.status === "Paused" ? "secondary" : "outline"}>{c.status}</Badge></TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => save(items.filter(x => x.id !== c.id))}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
            ))}</TableBody></Table>
        )}
      </CardContent></Card>
    </div>
  );
}
