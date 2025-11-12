import { LayoutDashboard, Calendar, Settings, Ban, LogOut, ChevronLeft } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const menuItems = [
  { title: "Dashboard", url: "#dashboard", icon: LayoutDashboard },
  { title: "Appointments", url: "#appointments", icon: Calendar },
  { title: "Availability", url: "#availability", icon: Settings },
  { title: "Blocked Dates", url: "#blocked", icon: Ban },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
      return;
    }
    navigate("/");
  };

  const scrollToSection = (url: string) => {
    const id = url.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border/50 p-4">
        {!isCollapsed && (
          <div className="space-y-1">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              OneStop Admin
            </h2>
            <p className="text-xs text-muted-foreground">Management Dashboard</p>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => scrollToSection(item.url)}
                    className="hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <item.icon className={isCollapsed ? "h-5 w-5" : "h-4 w-4"} />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className={isCollapsed ? "h-5 w-5" : "h-4 w-4 mr-2"} />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
