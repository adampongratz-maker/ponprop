import {
  Home, CheckSquare, Users, Wrench, DollarSign, Building2, Clock,
  FolderKanban, Megaphone, Scale, BarChart3, Package, Timer,
  AlertTriangle, CalendarDays, MessageSquare, PieChart, Monitor,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Home", url: "/", icon: Home, color: "text-orange-500" },
  { title: "To Do", url: "/todo", icon: CheckSquare, color: "text-emerald-500" },
  { title: "History", url: "/history", icon: Clock, color: "text-blue-500" },
  { title: "Tenants", url: "/tenants", icon: Users, color: "text-purple-500" },
  { title: "Maintenance", url: "/maintenance", icon: Wrench, color: "text-red-500" },
  { title: "Inventory", url: "/inventory", icon: Package, color: "text-yellow-500" },
  { title: "Time Cards", url: "/timecards", icon: Timer, color: "text-orange-500" },
  { title: "Reports", url: "/incidents", icon: AlertTriangle, color: "text-cyan-500" },
  { title: "Accounting", url: "/accounting", icon: DollarSign, color: "text-blue-600" },
  { title: "Properties", url: "/properties", icon: Building2, color: "text-indigo-500" },
  { title: "Projects", url: "/projects", icon: FolderKanban, color: "text-violet-500" },
  { title: "Marketing", url: "/marketing", icon: Megaphone, color: "text-pink-500" },
  { title: "Legal", url: "/legal", icon: Scale, color: "text-slate-500" },
  { title: "Finance", url: "/finance", icon: BarChart3, color: "text-teal-500" },
  { title: "Calendar", url: "/calendar", icon: CalendarDays, color: "text-rose-500" },
  { title: "Complaints", url: "/complaints", icon: MessageSquare, color: "text-slate-600" },
  { title: "Analytics", url: "/analytics", icon: PieChart, color: "text-violet-600" },
  { title: "IT", url: "/it", icon: Monitor, color: "text-blue-600" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="glass-sidebar">
      <SidebarContent className="pt-4">
        <div className="px-3 pb-4 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm tracking-tight truncate">Pongratz Properties</span>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <NavLink to={item.url} end={item.url === "/"} className="hover:bg-accent/60 rounded-lg transition-colors" activeClassName="bg-primary/10 text-primary font-semibold">
                        <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : item.color}`} />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
