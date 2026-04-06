import { useNavigate } from "react-router-dom";
import {
  CheckSquare, Users, Wrench, DollarSign, Clock, Building2,
  FolderKanban, Megaphone, Scale, BarChart3, Package, Timer,
  AlertTriangle, CalendarDays, MessageSquare, PieChart, Monitor, Home,
} from "lucide-react";

const apps = [
  { title: "Home", icon: Home, gradient: "from-orange-400 to-red-500", path: "/" },
  { title: "To Do", icon: CheckSquare, gradient: "from-emerald-400 to-cyan-500", path: "/todo" },
  { title: "History", icon: Clock, gradient: "from-blue-400 to-indigo-500", path: "/history" },
  { title: "Tenants", icon: Users, gradient: "from-purple-400 to-pink-500", path: "/tenants" },
  { title: "Maintenance", icon: Wrench, gradient: "from-red-400 to-orange-500", path: "/maintenance" },
  { title: "Inventory", icon: Package, gradient: "from-yellow-400 to-amber-500", path: "/inventory" },
  { title: "Time Cards", icon: Timer, gradient: "from-orange-400 to-amber-600", path: "/timecards" },
  { title: "Reports", icon: AlertTriangle, gradient: "from-cyan-400 to-blue-500", path: "/incidents" },
  { title: "Accounting", icon: DollarSign, gradient: "from-emerald-400 to-green-600", path: "/accounting" },
  { title: "Properties", icon: Building2, gradient: "from-sky-400 to-blue-600", path: "/properties" },
  { title: "Projects", icon: FolderKanban, gradient: "from-violet-400 to-purple-600", path: "/projects" },
  { title: "Marketing", icon: Megaphone, gradient: "from-pink-400 to-rose-500", path: "/marketing" },
  { title: "Legal", icon: Scale, gradient: "from-slate-400 to-slate-600", path: "/legal" },
  { title: "Finance", icon: BarChart3, gradient: "from-teal-400 to-emerald-600", path: "/finance" },
  { title: "Calendar", icon: CalendarDays, gradient: "from-rose-400 to-red-500", path: "/calendar" },
  { title: "Complaints", icon: MessageSquare, gradient: "from-slate-500 to-gray-600", path: "/complaints" },
  { title: "Analytics", icon: PieChart, gradient: "from-violet-500 to-indigo-600", path: "/analytics" },
  { title: "IT", icon: Monitor, gradient: "from-blue-500 to-indigo-600", path: "/it" },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back 👋</h1>
        <p className="text-muted-foreground mt-1">Manage your properties from one place.</p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {apps.map((app) => (
          <button
            key={app.title}
            onClick={() => navigate(app.path)}
            className="group flex flex-col items-center gap-3 p-4 rounded-2xl glass hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
              <app.icon className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs font-semibold text-foreground truncate max-w-[80px]">{app.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
