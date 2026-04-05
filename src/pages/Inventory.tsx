import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Search, Minus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const INV_KEY = "pp_inventory_v1";
const SHOP_KEY = "pp_shopping_v1";

type Item = { id: string; name: string; category: string; qty: number; location: string; reorder: number };
type ShopItem = { id: string; name: string; qty: number; store: string; done: boolean };

export default function Inventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [shop, setShop] = useState<ShopItem[]>([]);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("all");
  const [invOpen, setInvOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [iForm, setIForm] = useState({ name: "", category: "", qty: "", location: "", reorder: "" });
  const [sForm, setSForm] = useState({ name: "", qty: "", store: "" });

  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem(INV_KEY) || "[]")); } catch { setItems([]); } try { setShop(JSON.parse(localStorage.getItem(SHOP_KEY) || "[]")); } catch { setShop([]); } }, []);
  const saveInv = (d: Item[]) => { setItems(d); localStorage.setItem(INV_KEY, JSON.stringify(d)); };
  const saveShop = (d: ShopItem[]) => { setShop(d); localStorage.setItem(SHOP_KEY, JSON.stringify(d)); };

  const addInv = () => {
    if (!iForm.name.trim()) return toast.error("Item name required");
    saveInv([...items, { id: crypto.randomUUID(), name: iForm.name, category: iForm.category, qty: parseInt(iForm.qty) || 0, location: iForm.location, reorder: parseInt(iForm.reorder) || 0 }]);
    setIForm({ name: "", category: "", qty: "", location: "", reorder: "" }); setInvOpen(false); toast.success("Item added");
  };

  const addShop = () => {
    if (!sForm.name.trim()) return toast.error("Item name required");
    saveShop([...shop, { id: crypto.randomUUID(), name: sForm.name, qty: parseInt(sForm.qty) || 1, store: sForm.store, done: false }]);
    setSForm({ name: "", qty: "", store: "" }); setShopOpen(false); toast.success("Added to list");
  };

  const sections = ["all", "Plumbing", "Painting", "Electrical", "HVAC", "Tools", "Supplies"];
  const filtered = items.filter(i => {
    if (section !== "all" && i.category.toLowerCase() !== section.toLowerCase()) return false;
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
            <Search className="w-4 h-4 text-muted-foreground" /><Input placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 bg-muted/50" />
            <Dialog open={invOpen} onOpenChange={setInvOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Add</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Item name" value={iForm.name} onChange={(e) => setIForm({ ...iForm, name: e.target.value })} />
                  <Input placeholder="Category (HVAC, Plumbing, Tools)" value={iForm.category} onChange={(e) => setIForm({ ...iForm, category: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" placeholder="Qty" value={iForm.qty} onChange={(e) => setIForm({ ...iForm, qty: e.target.value })} />
                    <Input type="number" placeholder="Reorder at" value={iForm.reorder} onChange={(e) => setIForm({ ...iForm, reorder: e.target.value })} />
                  </div>
                  <Input placeholder="Location" value={iForm.location} onChange={(e) => setIForm({ ...iForm, location: e.target.value })} />
                  <Button onClick={addInv} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="glass"><CardContent className="p-4">
            {filtered.length === 0 ? <p className="text-muted-foreground text-sm text-center py-12">No inventory items.</p> : (
              <Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Category</TableHead><TableHead>Qty</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>{filtered.map(i => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.name}</TableCell><TableCell>{i.category}</TableCell><TableCell>{i.qty}</TableCell><TableCell>{i.location}</TableCell>
                    <TableCell>{i.reorder > 0 && i.qty <= i.reorder ? <Badge variant="destructive">Reorder</Badge> : <Badge variant="outline">OK</Badge>}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => saveInv(items.map(x => x.id === i.id ? { ...x, qty: x.qty + 1 } : x))}><Plus className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => saveInv(items.map(x => x.id === i.id ? { ...x, qty: Math.max(0, x.qty - 1) } : x))}><Minus className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => saveInv(items.filter(x => x.id !== i.id))}><Trash2 className="w-3 h-3" /></Button>
                    </TableCell>
                  </TableRow>
                ))}</TableBody></Table>
            )}
          </CardContent></Card>
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
                  <Button onClick={addShop} className="w-full">Add</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="glass"><CardContent className="p-4">
            {shop.length === 0 ? <p className="text-muted-foreground text-sm text-center py-8">No items.</p> : (
              <div className="space-y-2">
                {shop.map(s => (
                  <div key={s.id} className={`flex items-center gap-3 p-2 rounded-lg border ${s.done ? "opacity-50 line-through" : ""}`}>
                    <input type="checkbox" checked={s.done} onChange={() => saveShop(shop.map(x => x.id === s.id ? { ...x, done: !x.done } : x))} className="w-4 h-4" />
                    <div className="flex-1"><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.store} • Qty: {s.qty}</p></div>
                    <Button variant="ghost" size="icon" onClick={() => saveShop(shop.filter(x => x.id !== s.id))}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </div>
      </div>
    </div>
  );
}
