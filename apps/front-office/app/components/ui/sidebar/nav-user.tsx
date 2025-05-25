import * as React from "react";
import { Link, useNavigate } from "react-router";
import { ChevronUp, User, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { authClient } from "~/features/auth/api/auth-client";

interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string | null;
}

interface NavUserProps {
  user: User;
}

export function NavUser({ user }: NavUserProps) {
  const navigate = useNavigate();

  // Get user initials for avatar fallback
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      // Redirect to root page after successful logout
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still redirect to root page even if logout fails
      navigate("/");
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.image || ""} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronUp className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem asChild>
              <Link to="/dashboard/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Edit Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
