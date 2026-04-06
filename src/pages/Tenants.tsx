import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { name: "", phone: "", email: "", property: "", unit: "", balance: "0", status: "Active" };

export default function Tenants() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenants").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const addTenant = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("tenants").insert({
        ...form, balance: parseFloat(form.balance) || 0, user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setForm(emptyForm);
      setOpen(false);
      toast.success("Tenant added");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = tenants.filter((t) =>
    [t.name, t.email, t.property, t.unit].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Tenant</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Tenant</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addTenant.mutate(); }} className="space-y-3">
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Property" value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} />
                <Input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
              <Input placeholder="Balance" type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option>Active</option>
                <option>Former</option>
              </select>
              <Button type="submit" className="w-full">Save Tenant</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tenants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 bg-muted/50"
            />
          </div>

          {isLoading ? (
            <p className="text-muted-foreground text-sm text-center py-8">Loading...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No tenants yet. Click "Add Tenant" to get started.</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{t.property}</TableCell>
                      <TableCell>{t.unit}</TableCell>
                      <TableCell>{t.phone}</TableCell>
                      <TableCell>{t.email}</TableCell>
                      <TableCell className="text-right">${Number(t.balance).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === "Active" ? "default" : "secondary"}>{t.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
