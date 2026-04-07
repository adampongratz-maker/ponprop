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

type Project = {
  id: string;
  property: string;
  name: string;
  budget: number;
  status: string;
  start_date: string | null;
  due_date: string | null;
};

export default function Projects() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ property: "", name: "", budget: "", status: "Planned", start_date: "", due_date: "" });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
  });

  const addProject = useMutation({
    mutationFn: async () => {
      if (!form.property.trim() || !form.name.trim()) throw new Error("Property and project name are required");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("projects").insert({
        user_id: user.id,
        property: form.property.trim(),
        name: form.name.trim(),
        budget: parseFloat(form.budget) || 0,
        status: form.status,
        start_date: form.start_date || null,
        due_date: form.due_date || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setForm({ property: "", name: "", budget: "", status: "Planned", start_date: "", due_date: "" });
      setOpen(false);
      toast.success("Project added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); toast.success("Project removed"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = items.filter(p => {
    if (filter === "planned" && p.status !== "Planned") return false;
    if (filter === "progress" && p.status !== "In Progress") return false;
    if (filter === "complete" && p.status !== "Complete") return false;
    return [p.property, p.name, p.status].some(v => v.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm">Track renovations, cap-ex, budgets, and status.</p>
        </div>
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
                <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <Button onClick={() => addProject.mutate()} disabled={addProject.isPending} className="w-full">
                {addProject.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 bg-muted/50 max-w-sm" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All</option>
          <option value="planned">Planned</option>
          <option value="progress">In Progress</option>
          <option value="complete">Complete</option>
        </select>
      </div>

      <Card className="glass">
        <CardContent className="p-4">
          {isLoading ? (
            <p className="text-muted-foreground text-sm text-center py-12">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-12">No projects yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.property}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "Complete" ? "default" : p.status === "In Progress" ? "secondary" : "outline"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.start_date || "—"}</TableCell>
                    <TableCell>{p.due_date || "—"}</TableCell>
                    <TableCell>${p.budget.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteProject.mutate(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
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
