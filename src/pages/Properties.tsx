import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

type Property = { id: string; name: string; address: string | null; units: number; status: string };
type Unit = { id: string; property_name: string; unit_number: string; rent: number; status: string; tenant_name: string | null };

async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export default function Properties() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [propOpen, setPropOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);
  const [pForm, setPForm] = useState({ name: "", address: "", units: "" });
  const [uForm, setUForm] = useState({ property_name: "", unit_number: "", rent: "", status: "Occupied", tenant_name: "" });

  const { data: properties = [], isLoading: loadingProps } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Property[];
    },
  });

  const { data: units = [], isLoading: loadingUnits } = useQuery({
    queryKey: ["property_units"],
    queryFn: async () => {
      const { data, error } = await supabase.from("property_units").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Unit[];
    },
  });

  const addProperty = useMutation({
    mutationFn: async () => {
      if (!pForm.name.trim()) throw new Error("Property name is required");
      const user_id = await getUserId();
      const { error } = await supabase.from("properties").insert({
        user_id,
        name: pForm.name.trim(),
        address: pForm.address.trim() || null,
        units: parseInt(pForm.units) || 0,
        status: "Active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      setPForm({ name: "", address: "", units: "" });
      setPropOpen(false);
      toast.success("Property added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["properties"] }); toast.success("Property removed"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const addUnit = useMutation({
    mutationFn: async () => {
      if (!uForm.property_name.trim() || !uForm.unit_number.trim()) throw new Error("Property and unit number are required");
      const user_id = await getUserId();
      const { error } = await supabase.from("property_units").insert({
        user_id,
        property_name: uForm.property_name.trim(),
        unit_number: uForm.unit_number.trim(),
        rent: parseFloat(uForm.rent) || 0,
        status: uForm.status,
        tenant_name: uForm.tenant_name.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property_units"] });
      setUForm({ property_name: "", unit_number: "", rent: "", status: "Occupied", tenant_name: "" });
      setUnitOpen(false);
      toast.success("Unit added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteUnit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("property_units").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["property_units"] }); toast.success("Unit removed"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = properties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.address || "").toLowerCase().includes(search.toLowerCase())
  );

  const loading = loadingProps || loadingUnits;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground text-sm">Portfolio overview and unit roster.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={unitOpen} onOpenChange={setUnitOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" />Add Unit</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Unit</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Property name" value={uForm.property_name} onChange={(e) => setUForm({ ...uForm, property_name: e.target.value })} />
                <Input placeholder="Unit #" value={uForm.unit_number} onChange={(e) => setUForm({ ...uForm, unit_number: e.target.value })} />
                <Input type="number" placeholder="Rent" value={uForm.rent} onChange={(e) => setUForm({ ...uForm, rent: e.target.value })} />
                <select value={uForm.status} onChange={(e) => setUForm({ ...uForm, status: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option>Occupied</option><option>Vacant</option><option>Maintenance</option>
                </select>
                <Input placeholder="Tenant name" value={uForm.tenant_name} onChange={(e) => setUForm({ ...uForm, tenant_name: e.target.value })} />
                <Button onClick={() => addUnit.mutate()} disabled={addUnit.isPending} className="w-full">
                  {addUnit.isPending ? "Saving..." : "Save"}
                </Button>
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
                <Button onClick={() => addProperty.mutate()} disabled={addProperty.isPending} className="w-full">
                  {addProperty.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search properties..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 bg-muted/50" />
      </div>

      <Card className="glass">
        <CardContent className="p-4">
          {loading ? (
            <p className="text-muted-foreground text-sm text-center py-12">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-12">No properties yet. Add your first property above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Occupied</TableHead>
                  <TableHead>Vacant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => {
                  const occ = units.filter(u => u.property_name === p.name && u.status === "Occupied").length;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.address || "—"}</TableCell>
                      <TableCell>{p.units}</TableCell>
                      <TableCell>{occ}</TableCell>
                      <TableCell>{Math.max(0, p.units - occ)}</TableCell>
                      <TableCell><Badge variant={p.status === "Active" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => deleteProperty.mutate(p.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {units.length > 0 && (
        <Card className="glass">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Units Roster</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>{u.property_name}</TableCell>
                    <TableCell>{u.unit_number}</TableCell>
                    <TableCell>${u.rent.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={u.status === "Occupied" ? "default" : u.status === "Vacant" ? "secondary" : "destructive"}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{u.tenant_name || "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteUnit.mutate(u.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
