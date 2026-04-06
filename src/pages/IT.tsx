import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Search, Download, Monitor, Ticket } from "lucide-react";
import { toast } from "sonner";

const ASSET_KEY = "pp_it_assets_v1";
const TICKET_KEY = "pp_it_tickets_v1";

type Asset = { id: string; name: string; type: string; assigned: string; serial: string; status: string };
type ITTicket = { id: string; date: string; title: string; severity: string; assigned: string; notes: string; status: string };

export default function IT() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [tickets, setTickets] = useState<ITTicket[]>([]);
  const [assetOpen, setAssetOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [aForm, setAForm] = useState({ name: "", type: "Laptop", assigned: "", serial: "" });
  const [tForm, setTForm] = useState({ date: new Date().toISOString().split("T")[0], title: "", severity: "med", assigned: "", notes: "" });

  useEffect(() => {
    try { setAssets(JSON.parse(localStorage.getItem(ASSET_KEY) || "[]")); } catch { setAssets([]); }
    try { setTickets(JSON.parse(localStorage.getItem(TICKET_KEY) || "[]")); } catch { setTickets([]); }
  }, []);
  const saveAssets = (d: Asset[]) => { setAssets(d); localStorage.setItem(ASSET_KEY, JSON.stringify(d)); };
  const saveTickets = (d: ITTicket[]) => { setTickets(d); localStorage.setItem(TICKET_KEY, JSON.stringify(d)); };

  const addAsset = () => {
    if (!aForm.name.trim()) return toast.error("Device name required");
    saveAssets([...assets, { id: crypto.randomUUID(), name: aForm.name, type: aForm.type, assigned: aForm.assigned, serial: aForm.serial, status: "Active" }]);
    setAForm({ name: "", type: "Laptop", assigned: "", serial: "" }); setAssetOpen(false); toast.success("Asset added");
  };

  const addTicket = () => {
    if (!tForm.title.trim()) return toast.error("Title required");
    saveTickets([...tickets, { id: crypto.randomUUID(), date: tForm.date, title: tForm.title, severity: tForm.severity, assigned: tForm.assigned, notes: tForm.notes, status: "Open" }]);
    setTForm({ ...tForm, title: "", assigned: "", notes: "" }); setTicketOpen(false); toast.success("Ticket created");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">IT</h1>
      <p className="text-muted-foreground text-sm -mt-4">Devices, software, access, and internal IT tickets.</p>
      <Tabs defaultValue="assets">
        <TabsList><TabsTrigger value="assets"><Monitor className="w-4 h-4 mr-1" />Assets</TabsTrigger><TabsTrigger value="tickets"><Ticket className="w-4 h-4 mr-1" />Tickets</TabsTrigger></TabsList>
        <TabsContent value="assets" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={assetOpen} onOpenChange={setAssetOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Asset</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Device/Asset</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Device name" value={aForm.name} onChange={(e) => setAForm({ ...aForm, name: e.target.value })} />
                  <select value={aForm.type} onChange={(e) => setAForm({ ...aForm, type: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option>Laptop</option><option>Desktop</option><option>Phone</option><option>Tablet</option><option>Camera</option><option>Printer</option><option>Network</option><option>Other</option>
                  </select>
                  <Input placeholder="Assigned to" value={aForm.assigned} onChange={(e) => setAForm({ ...aForm, assigned: e.target.value })} />
                  <Input placeholder="Serial / Tag" value={aForm.serial} onChange={(e) => setAForm({ ...aForm, serial: e.target.value })} />
                  <Button onClick={addAsset} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="glass"><CardContent className="p-4">
            {assets.length === 0 ? <p className="text-muted-foreground text-sm text-center py-12">No assets yet.</p> : (
              <Table><TableHeader><TableRow><TableHead>Device</TableHead><TableHead>Type</TableHead><TableHead>Assigned</TableHead><TableHead>Serial</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>{assets.map(a => (
                  <TableRow key={a.id}><TableCell className="font-medium">{a.name}</TableCell><TableCell>{a.type}</TableCell><TableCell>{a.assigned || "—"}</TableCell><TableCell className="font-mono text-xs">{a.serial || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => saveAssets(assets.filter(x => x.id !== a.id))}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
                ))}</TableBody></Table>
            )}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Create Ticket</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create IT Ticket</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input type="date" value={tForm.date} onChange={(e) => setTForm({ ...tForm, date: e.target.value })} />
                  <Input placeholder="Issue title" value={tForm.title} onChange={(e) => setTForm({ ...tForm, title: e.target.value })} />
                  <select value={tForm.severity} onChange={(e) => setTForm({ ...tForm, severity: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="low">Low</option><option value="med">Medium</option><option value="high">High</option>
                  </select>
                  <Input placeholder="Assigned to" value={tForm.assigned} onChange={(e) => setTForm({ ...tForm, assigned: e.target.value })} />
                  <textarea value={tForm.notes} onChange={(e) => setTForm({ ...tForm, notes: e.target.value })} placeholder="Details..." className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <Button onClick={addTicket} className="w-full">Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="glass"><CardContent className="p-4">
            {tickets.length === 0 ? <p className="text-muted-foreground text-sm text-center py-12">No tickets yet.</p> : (
              <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Title</TableHead><TableHead>Severity</TableHead><TableHead>Assigned</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>{tickets.map(t => (
                  <TableRow key={t.id}><TableCell>{t.date}</TableCell><TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell><Badge variant={t.severity === "high" ? "destructive" : t.severity === "med" ? "secondary" : "outline"}>{t.severity}</Badge></TableCell>
                    <TableCell>{t.assigned || "—"}</TableCell>
                    <TableCell>
                      <select value={t.status} onChange={(e) => saveTickets(tickets.map(x => x.id === t.id ? { ...x, status: e.target.value } : x))} className="h-8 rounded border border-input bg-background px-2 text-xs">
                        <option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
                      </select>
                    </TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => saveTickets(tickets.filter(x => x.id !== t.id))}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
                ))}</TableBody></Table>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
