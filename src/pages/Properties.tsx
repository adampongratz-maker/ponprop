import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const KEY = "pp_properties_v1";
const UNIT_KEY = "pp_units_v1";

type Property = { id: string; name: string; address: string; units: number; occupied: number };
type Unit = { id: string; property: string; unit: string; rent: number; status: string; tenant: string };

function load<T>(key: string, fallback: T[]): T[] {
  try { const r = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(r) ? r : fallback; } catch { return fallback; }
}
function save<T>(key: string, data: T[]) { localStorage.setItem(key, JSON.stringify(data)); }

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [search, setSearch] = useState("");
  const [propOpen, setPropOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);
  const [pForm, setPForm] = useState({ name: "", address: "", units: "" });
  const [uForm, setUForm] = useState({ property: "", unit: "", rent: "", status: "Occupied", tenant: "" });

  useEffect(() => { setProperties(load(KEY, [])); setUnits(load(UNIT_KEY, [])); }, []);
  const saveProps = (p: Property[]) => { setProperties(p); save(KEY, p); };
  const saveUnits = (u: Unit[]) => { setUnits(u); save(UNIT_KEY, u); };

  const addProperty = () => {
    if (!pForm.name.trim()) return toast.error("Name required");
    const p: Property = { id: crypto.randomUUID(), name: pForm.name, address: pForm.address, units: parseInt(pForm.units) || 0, occupied: 0 };
    saveProps([...properties, p]);
    setPForm({ name: "", address: "", units: "" }); setPropOpen(false);
    toast.success("Property added");
  };

  const addUnit = () => {
    if (!uForm.property.trim() || !uForm.unit.trim()) return toast.error("Property and unit required");
    const u: Unit = { id: crypto.randomUUID(), property: uForm.property, unit: uForm.unit, rent: parseFloat(uForm.rent) || 0, status: uForm.status, tenant: uForm.tenant };
    saveUnits([...units, u]);
    setUForm({ property: "", unit: "", rent: "", status: "Occupied", tenant: "" }); setUnitOpen(false);
    toast.success("Unit added");
  };

  const filtered = properties.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.address.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Properties</h1><p className="text-muted-foreground text-sm">Portfolio overview and unit roster.</p></div>
        <div className="flex gap-2">
          <Dialog open={unitOpen} onOpenChange={setUnitOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" />Add Unit</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Unit</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Property" value={uForm.property} onChange={(e) => setUForm({ ...uForm, property: e.target.value })} />
                <Input placeholder="Unit #" value={uForm.unit} onChange={(e) => setUForm({ ...uForm, unit: e.target.value })} />
                <Input type="number" placeholder="Rent" value={uForm.rent} onChange={(e) => setUForm({ ...uForm, rent: e.target.value })} />
                <select value={uForm.status} onChange={(e) => setUForm({ ...uForm, status: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option>Occupied</option><option>Vacant</option><option>Maintenance</option>
                </select>
                <Input placeholder="Tenant" value={uForm.tenant} onChange={(e) => setUForm({ ...uForm, tenant: e.target.value })} />
                <Button onClick={addUnit} className="w-full">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={propOpen} onOpenChange={setPropOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Property</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Property</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Property name" value={pForm.name} onChange={(e) => setPForm({ ...pForm, name: e.target.value })} />
                <Input placeholder="Address" value={pForm.address} onChange={(e) => setPForm({ ...pForm, address: e.target.value })} />
                <Input type="number" placeholder="# Units" value={pForm.units} onChange={(e) => setPForm({ ...pForm, units: e.target.value })} />
                <Button onClick={addProperty} className="w-full">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex items-center gap-2 max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground" /><Input placeholder="Search properties..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 bg-muted/50" />
      </div>
      <Card className="glass"><CardContent className="p-4">
        {filtered.length === 0 ? <p className="text-muted-foreground text-sm text-center py-12">No properties yet.</p> : (
          <Table><TableHeader><TableRow><TableHead>Property</TableHead><TableHead>Address</TableHead><TableHead>Units</TableHead><TableHead>Occupied</TableHead><TableHead>Vacant</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>{filtered.map(p => {
              const occ = units.filter(u => u.property === p.name && u.status === "Occupied").length;
              return (
                <TableRow key={p.id}><TableCell className="font-medium">{p.name}</TableCell><TableCell>{p.address}</TableCell><TableCell>{p.units}</TableCell><TableCell>{occ}</TableCell><TableCell>{Math.max(0, p.units - occ)}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => saveProps(properties.filter(x => x.id !== p.id))}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
              );
            })}</TableBody></Table>
        )}
      </CardContent></Card>
      {units.length > 0 && (
        <Card className="glass"><CardContent className="p-4">
          <h3 className="font-semibold mb-3">Units Roster</h3>
          <Table><TableHeader><TableRow><TableHead>Property</TableHead><TableHead>Unit</TableHead><TableHead>Rent</TableHead><TableHead>Status</TableHead><TableHead>Tenant</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>{units.map(u => (
              <TableRow key={u.id}><TableCell>{u.property}</TableCell><TableCell>{u.unit}</TableCell><TableCell>${u.rent.toLocaleString()}</TableCell>
                <TableCell><Badge variant={u.status === "Occupied" ? "default" : u.status === "Vacant" ? "secondary" : "destructive"}>{u.status}</Badge></TableCell>
                <TableCell>{u.tenant || "—"}</TableCell><TableCell><Button variant="ghost" size="icon" onClick={() => saveUnits(units.filter(x => x.id !== u.id))}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
            ))}</TableBody></Table>
        </CardContent></Card>
      )}
    </div>
  );
}
