import { SidebarProvider } from "@/components/ui/sidebar";

import { DashbaordNavbar } from "@/modules/dashboard/ui/components/dashboard-navbar";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";

interface Props {
  children: React.ReactNode;
}
const Layout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <main className="flex flex-col h-screen w-screen bg-muted">
        <DashbaordNavbar />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default Layout;
