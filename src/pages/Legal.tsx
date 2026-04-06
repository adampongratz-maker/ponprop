import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, ClipboardList, Bell } from "lucide-react";

const templates = [
  { title: "Late Rent Notice", type: "Template", icon: Bell, desc: "Standard 3-day pay or quit notice for overdue rent." },
  { title: "Maintenance Entry Notice", type: "Template", icon: FileText, desc: "24-hour notice of entry for scheduled maintenance." },
  { title: "Lease Renewal Offer", type: "Template", icon: FileText, desc: "Standard lease renewal terms and conditions." },
  { title: "Move-Out Checklist", type: "Checklist", icon: ClipboardList, desc: "Inspection checklist for unit turnover and deposit return." },
  { title: "Security Deposit Itemization", type: "Template", icon: Shield, desc: "Itemized statement of deductions from security deposit." },
  { title: "Pet Agreement Addendum", type: "Template", icon: FileText, desc: "Pet policy addendum for lease agreements." },
  { title: "Lease Termination Notice", type: "Template", icon: Bell, desc: "30/60-day notice of lease termination." },
  { title: "Property Rules & Regulations", type: "Document", icon: ClipboardList, desc: "Community rules, quiet hours, parking, and common area policies." },
];

export default function Legal() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Legal</h1>
      <p className="text-muted-foreground text-sm -mt-4">Leases, disclosures, notices, and compliance templates.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(t => (
          <Card key={t.title} className="glass hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0"><t.icon className="w-5 h-5 text-muted-foreground" /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm">{t.title}</h3>
                  <Badge variant="outline" className="text-xs">{t.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
