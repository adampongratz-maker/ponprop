import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

export default function ToDo() {
  const queryClient = useQueryClient();
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState("all");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addTask = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("tasks").insert({ text: newTask, priority, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setNewTask("");
      toast.success("Task added");
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === "Completed" ? "Open" : "Completed";
      const { error } = await supabase.from("tasks").update({
        status: newStatus,
        completed_at: newStatus === "Completed" ? new Date().toISOString() : null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted");
    },
  });

  const filtered = tasks.filter((t) => {
    if (filter === "open") return t.status === "Open";
    if (filter === "completed") return t.status === "Completed";
    return true;
  });

  const openCount = tasks.filter((t) => t.status === "Open").length;
  const doneCount = tasks.filter((t) => t.status === "Completed").length;

  const priorityColor = (p: string) => {
    if (p === "High") return "destructive";
    if (p === "Low") return "secondary";
    return "default";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">To Do</h1>

      <div className="grid grid-cols-2 gap-4">
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <Circle className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{openCount}</p>
              <p className="text-xs text-muted-foreground">Open tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{doneCount}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardContent className="p-4">
          <form
            onSubmit={(e) => { e.preventDefault(); if (newTask.trim()) addTask.mutate(); }}
            className="flex gap-2"
          >
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <Button type="submit" size="icon"><Plus className="w-4 h-4" /></Button>
          </form>
        </CardContent>
      </Card>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value={filter}>
          <div className="space-y-2 mt-4">
            {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}
            {filtered.length === 0 && !isLoading && (
              <p className="text-muted-foreground text-sm text-center py-8">No tasks yet. Add one above!</p>
            )}
            {filtered.map((task) => (
              <Card key={task.id} className="glass">
                <CardContent className="p-3 flex items-center gap-3">
                  <Checkbox
                    checked={task.status === "Completed"}
                    onCheckedChange={() => toggleTask.mutate({ id: task.id, status: task.status })}
                  />
                  <span className={`flex-1 text-sm ${task.status === "Completed" ? "line-through text-muted-foreground" : ""}`}>
                    {task.text}
                  </span>
                  <Badge variant={priorityColor(task.priority)}>{task.priority}</Badge>
                  {task.assignee && <Badge variant="outline">{task.assignee}</Badge>}
                  <Button variant="ghost" size="sm" onClick={() => deleteTask.mutate(task.id)} className="text-destructive text-xs">
                    ×
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
