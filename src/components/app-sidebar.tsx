import {
  FaTachometerAlt,
  FaUserFriends,
  FaFileInvoiceDollar,
  FaStore,
} from "react-icons/fa";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link, Outlet } from "react-router-dom";
import NavigationButtons from "./shared/NavigationButtons";

// Menu items with Tailwind for icon sizing.
const items = [
  {
    title: "DashBoard",
    url: "/",
    icon: FaTachometerAlt,
  },
  {
    title: "Stores",
    url: "/stores",
    icon: FaStore,
  },
  {
    title: "Clients",
    url: "/clients",
    icon: FaUserFriends,
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: FaFileInvoiceDollar,
  },
];

export function AppSidebar() {
  return (
    <>
      <Sidebar variant="floating" collapsible="icon">
        <SidebarContent>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Application </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="justify-center">
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link to={item.url} className="flex items-center">
                          <item.icon className="text-2xl mr-2" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenuItem>
            <NavigationButtons />
          </SidebarMenuItem>
        </SidebarFooter>
      </Sidebar>
      <SidebarTrigger />

      <Outlet />
    </>
  );
}
