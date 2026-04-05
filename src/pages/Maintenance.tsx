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
import { Plus, Search, Wrench } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { property: "", unit: "", issue: "", priority: "Medium", assigned_to: "", due_date: "", status: "Open" };

export default function Maintenance() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["work_orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("work_orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addOrder = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("work_orders").insert({
        ...form,
        due_date: form.due_date || null,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work_orders"] });
      setForm(emptyForm);
      setOpen(false);
      toast.success("Work order created");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = orders.filter((o) =>
    [o.property, o.unit, o.issue, o.assigned_to].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const priorityColor = (p: string) => {
    if (p === "High") return "destructive";
    if (p === "Low") return "secondary";
    return "default";
  };

  const statusColor = (s: string) => {
    if (s === "Done") return "secondary";
    if (s === "In Progress") return "outline";
    return "default";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />New Work Order</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Work Order</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addOrder.mutate(); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Property" value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} required />
                <Input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
              <Input placeholder="Issue description" value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} required />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>
              <Input placeholder="Assigned to" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} />
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              <Button type="submit" className="w-full">Create Work Order</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search work orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 bg-muted/50" />
          </div>

          {isLoading ? (
            <p className="text-muted-foreground text-sm text-center py-8">Loading...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No work orders yet.</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.property}</TableCell>
                      <TableCell>{o.unit}</TableCell>
                      <TableCell>{o.issue}</TableCell>
                      <TableCell><Badge variant={priorityColor(o.priority)}>{o.priority}</Badge></TableCell>
                      <TableCell>{o.assigned_to}</TableCell>
                      <TableCell>{o.due_date}</TableCell>
                      <TableCell><Badge variant={statusColor(o.status)}>{o.status}</Badge></TableCell>
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
