import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { toast } from "sonner";

const KEY = "pp_calendar_v1";
type CalEvent = { id: string; date: string; time: string; title: string; type: string; property: string; unit: string; notes: string; status: string };

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], time: "", title: "", type: "Reminder", property: "", unit: "", notes: "", status: "Scheduled" });

  useEffect(() => { try { setEvents(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { setEvents([]); } }, []);
  const save = (d: CalEvent[]) => { setEvents(d); localStorage.setItem(KEY, JSON.stringify(d)); };

  const add = () => {
    if (!form.title.trim()) return toast.error("Title required");
    save([...events, { id: crypto.randomUUID(), ...form }]);
    setForm({ ...form, title: "", property: "", unit: "", notes: "" }); setOpen(false); toast.success("Event added");
  };

  const prev = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };
  const today = () => { setMonth(new Date().getMonth()); setYear(new Date().getFullYear()); };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().split("T")[0];

  const calDays = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d);

  const getDateStr = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Calendar</h1><p className="text-muted-foreground text-sm">Property events, inspections, lease dates, vendor visits.</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />New Event</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Event</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option>Inspection</option><option>Maintenance</option><option>Lease</option><option>Vendor</option><option>Reminder</option><option>Other</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Property" value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} />
                <Input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes..." className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <Button onClick={add} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="glass">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={prev}><ChevronLeft className="w-4 h-4" /></Button>
            <h2 className="font-bold text-lg">{MONTHS[month]} {year}</h2>
            <div className="flex gap-2"><Button variant="outline" size="sm" onClick={today}>Today</Button><Button variant="ghost" size="icon" onClick={next}><ChevronRight className="w-4 h-4" /></Button></div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>)}
            {calDays.map((d, i) => {
              if (d === null) return <div key={`e${i}`} />;
              const dateStr = getDateStr(d);
              const dayEvents = events.filter(e => e.date === dateStr);
              const isToday = dateStr === todayStr;
              return (
                <div key={i} className={`min-h-[60px] p-1 rounded-lg border text-xs ${isToday ? "bg-primary/10 border-primary/30" : "border-border/50"}`}>
                  <div className={`font-semibold ${isToday ? "text-primary" : ""}`}>{d}</div>
                  {dayEvents.slice(0, 2).map(e => (
                    <div key={e.id} className="mt-0.5 px-1 py-0.5 bg-primary/10 rounded text-[10px] truncate">{e.title}</div>
                  ))}
                  {dayEvents.length > 2 && <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</div>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      {events.length > 0 && (
        <Card className="glass"><CardContent className="p-4">
          <h3 className="font-semibold mb-3">All Events</h3>
          <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Property</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>{events.sort((a, b) => a.date.localeCompare(b.date)).map(e => (
              <TableRow key={e.id}><TableCell>{e.date}</TableCell><TableCell>{e.time || "—"}</TableCell><TableCell className="font-medium">{e.title}</TableCell>
                <TableCell><Badge variant="outline">{e.type}</Badge></TableCell><TableCell>{e.property}</TableCell>
                <TableCell><Badge variant={e.status === "Scheduled" ? "default" : "secondary"}>{e.status}</Badge></TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => save(events.filter(x => x.id !== e.id))}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
            ))}</TableBody></Table>
        </CardContent></Card>
      )}
    </div>
  );
}
