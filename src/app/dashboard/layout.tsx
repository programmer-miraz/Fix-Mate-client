import { SidebarProvider } from "@/components/ui/sidebar"
import { Deshboard_Sidebar } from "@/dashboard-components/sidebar"
import DashboardNavbar from "@/dashboard-components/dashboard-navbar"


export default function Deshboard_Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <Deshboard_Sidebar/>
            <main className="flex-1">
                <DashboardNavbar />
                {children}
            </main>
        </SidebarProvider>
    )
}
