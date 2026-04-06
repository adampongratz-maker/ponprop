import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { property: "", unit: "", tenant: "", move_in: "", move_out: "", status: "Active" };

export default function RentalHistory() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["rental_history"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rental_history").select("*").order("move_in", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addRecord = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("rental_history").insert({ ...form, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rental_history"] }); setForm(emptyForm); setOpen(false); toast.success("Record added"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rental_history").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rental_history"] }); toast.success("Deleted"); },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rental History</h1>
          <p className="text-muted-foreground text-sm">Track lease periods per unit and tenant.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" />Add Record</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Rental History</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addRecord.mutate(); }} className="space-y-3">
              <Input placeholder="Property (required)" value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} required />
              <Input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              <Input placeholder="Tenant (required)" value={form.tenant} onChange={(e) => setForm({ ...form, tenant: e.target.value })} required />
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={form.move_in} onChange={(e) => setForm({ ...form, move_in: e.target.value })} />
                <Input type="date" value={form.move_out} onChange={(e) => setForm({ ...form, move_out: e.target.value })} />
              </div>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option>Active</option><option>Ended</option>
              </select>
              <Button type="submit" className="w-full">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="glass">
        <CardContent className="p-4">
          {isLoading ? <p className="text-muted-foreground text-sm text-center py-8">Loading...</p> :
          records.length === 0 ? <p className="text-muted-foreground text-sm text-center py-12">No rental history yet.</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead><TableHead>Unit</TableHead><TableHead>Tenant</TableHead>
                  <TableHead>Move-In</TableHead><TableHead>Move-Out</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.property}</TableCell>
                    <TableCell>{r.unit}</TableCell>
                    <TableCell className="font-medium">{r.tenant}</TableCell>
                    <TableCell>{r.move_in || "—"}</TableCell>
                    <TableCell>{r.move_out || "—"}</TableCell>
                    <TableCell><Badge variant={r.status === "Active" ? "default" : "secondary"}>{r.status}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => deleteRecord.mutate(r.id)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
