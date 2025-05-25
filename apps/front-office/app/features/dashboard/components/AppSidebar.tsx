import * as React from "react";
import logo from "~/assets/logo.avif";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import {
  Home,
  Inbox,
  Calendar,
  Search,
  Settings,
  Users,
  Tally4,
  CalendarDays,
} from "lucide-react";
import { Link } from "react-router";
import { NavUser } from "~/components/ui/sidebar/nav-user";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Events",
    url: "/dashboard/events",
    icon: CalendarDays,
  },
  {
    title: "Courts",
    url: "/dashboard/courts",
    icon: Tally4,
  },
  {
    title: "Roster",
    url: "#",
    icon: Users,
  },
];

interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string | null;
}

interface AppSidebarProps {
  user: User;
}

export function AppSidebar({ user }: AppSidebarProps) {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/dashboard">
                <img src={logo} className="h-10 w-10" />
                <span className="text-base font-semibold">Front Office</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup></SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
