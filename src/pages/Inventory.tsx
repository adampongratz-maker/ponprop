import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Search, Minus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

type Item = { id: string; name: string; category: string | null; qty: number; location: string | null; reorder_at: number };
type ShopItem = { id: string; name: string; qty: number; store: string | null; done: boolean };

async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export default function Inventory() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("all");
  const [invOpen, setInvOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [iForm, setIForm] = useState({ name: "", category: "", qty: "", location: "", reorder: "" });
  const [sForm, setSForm] = useState({ name: "", qty: "", store: "" });

  const { data: items = [], isLoading: loadingInv } = useQuery({
    queryKey: ["inventory_items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory_items").select("*").order("name");
      if (error) throw error;
      return data as Item[];
    },
  });

  const { data: shop = [], isLoading: loadingShop } = useQuery({
    queryKey: ["shopping_items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shopping_items").select("*").order("created_at");
      if (error) throw error;
      return data as ShopItem[];
    },
  });

  const addItem = useMutation({
    mutationFn: async () => {
      if (!iForm.name.trim()) throw new Error("Item name is required");
      const user_id = await getUserId();
      const { error } = await supabase.from("inventory_items").insert({
        user_id,
        name: iForm.name.trim(),
        category: iForm.category.trim() || null,
        qty: parseInt(iForm.qty) || 0,
        location: iForm.location.trim() || null,
        reorder_at: parseInt(iForm.reorder) || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory_items"] });
      setIForm({ name: "", category: "", qty: "", location: "", reorder: "" });
      setInvOpen(false);
      toast.success("Item added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateQty = useMutation({
    mutationFn: async ({ id, qty }: { id: string; qty: number }) => {
      const { error } = await supabase.from("inventory_items").update({ qty }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory_items"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inventory_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inventory_items"] }); toast.success("Item removed"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const addShopItem = useMutation({
    mutationFn: async () => {
      if (!sForm.name.trim()) throw new Error("Item name is required");
      const user_id = await getUserId();
      const { error } = await supabase.from("shopping_items").insert({
        user_id,
        name: sForm.name.trim(),
        qty: parseInt(sForm.qty) || 1,
        store: sForm.store.trim() || null,
        done: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shopping_items"] });
      setSForm({ name: "", qty: "", store: "" });
      setShopOpen(false);
      toast.success("Added to list");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleShopDone = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await supabase.from("shopping_items").update({ done }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping_items"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteShopItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shopping_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping_items"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const sections = ["all", "Plumbing", "Painting", "Electrical", "HVAC", "Tools", "Supplies"];
  const filtered = items.filter(i => {
    if (section !== "all" && (i.category || "").toLowerCase() !== section.toLowerCase()) return false;
    return i.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
      <p className="text-muted-foreground text-sm -mt-4">Track tools, parts, and maintenance supplies.</p>

      <div className="flex flex-wrap gap-2">
        {sections.map(s => (
          <Button key={s} variant={section === s ? "default" : "outline"} size="sm" onClick={() => setSection(s)} className="rounded-full">
            {s === "all" ? "All" : s}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 bg-muted/50" />
            <Dialog open={invOpen} onOpenChange={setInvOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Add</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Item name" value={iForm.name} onChange={(e) => setIForm({ ...iForm, name: e.target.value })} />
                  <Input placeholder="Category (HVAC, Plumbing, Tools…)" value={iForm.category} onChange={(e) => setIForm({ ...iForm, category: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" placeholder="Qty" value={iForm.qty} onChange={(e) => setIForm({ ...iForm, qty: e.target.value })} />
                    <Input type="number" placeholder="Reorder at" value={iForm.reorder} onChange={(e) => setIForm({ ...iForm, reorder: e.target.value })} />
                  </div>
                  <Input placeholder="Location" value={iForm.location} onChange={(e) => setIForm({ ...iForm, location: e.target.value })} />
                  <Button onClick={() => addItem.mutate()} disabled={addItem.isPending} className="w-full">
                    {addItem.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="glass">
            <CardContent className="p-4">
              {loadingInv ? (
                <p className="text-muted-foreground text-sm text-center py-12">Loading...</p>
              ) : filtered.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-12">No inventory items.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead><TableHead>Category</TableHead><TableHead>Qty</TableHead>
                      <TableHead>Location</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(i => (
                      <TableRow key={i.id}>
                        <TableCell className="font-medium">{i.name}</TableCell>
                        <TableCell>{i.category || "—"}</TableCell>
                        <TableCell>{i.qty}</TableCell>
                        <TableCell>{i.location || "—"}</TableCell>
                        <TableCell>
                          {i.reorder_at > 0 && i.qty <= i.reorder_at
                            ? <Badge variant="destructive">Reorder</Badge>
                            : <Badge variant="outline">OK</Badge>}
                        </TableCell>
                        <TableCell className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => updateQty.mutate({ id: i.id, qty: i.qty + 1 })}><Plus className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => updateQty.mutate({ id: i.id, qty: Math.max(0, i.qty - 1) })}><Minus className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteItem.mutate(i.id)}><Trash2 className="w-3 h-3" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><ShoppingCart className="w-4 h-4" />Shopping List</h3>
            <Dialog open={shopOpen} onOpenChange={setShopOpen}>
              <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />Add</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add to Shopping List</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Item to buy" value={sForm.name} onChange={(e) => setSForm({ ...sForm, name: e.target.value })} />
                  <Input type="number" placeholder="Qty" value={sForm.qty} onChange={(e) => setSForm({ ...sForm, qty: e.target.value })} />
                  <Input placeholder="Store / Notes" value={sForm.store} onChange={(e) => setSForm({ ...sForm, store: e.target.value })} />
                  <Button onClick={() => addShopItem.mutate()} disabled={addShopItem.isPending} className="w-full">
                    {addShopItem.isPending ? "Adding..." : "Add"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="glass">
            <CardContent className="p-4">
              {loadingShop ? (
                <p className="text-muted-foreground text-sm text-center py-8">Loading...</p>
              ) : shop.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No items.</p>
              ) : (
                <div className="space-y-2">
                  {shop.map(s => (
                    <div key={s.id} className={`flex items-center gap-3 p-2 rounded-lg border ${s.done ? "opacity-50 line-through" : ""}`}>
                      <input
                        type="checkbox"
                        checked={s.done}
                        onChange={() => toggleShopDone.mutate({ id: s.id, done: !s.done })}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.store || "—"} • Qty: {s.qty}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteShopItem.mutate(s.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
