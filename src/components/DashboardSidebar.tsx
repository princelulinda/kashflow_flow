import * as React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { 
  LayoutDashboard, 
  Wallet, 
  PieChart, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  ChevronDown,
  Banknote,
  Target,
  FileText,
  HelpCircle,
  ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import * as Collapsible from "@radix-ui/react-collapsible"
import logoImg from "@/assets/kashflow_logo.png"
import { useAuthStore } from "@/store/authStore"
import { authService } from "@/services/authService"

interface SidebarSubItem {
  title: string
  href: string
}

interface SidebarItem {
  title: string
  href?: string
  icon: React.ElementType
  subItems?: SidebarSubItem[]
}

const sidebarItems: SidebarItem[] = [
  { title: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { title: "Transactions", href: "/transactions", icon: Wallet },
  { title: "Mes Applications", href: "/applications", icon: ShieldCheck },
]

export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [openItems, setOpenItems] = React.useState<string[]>([])
  const location = useLocation()
  const navigate = useNavigate()
  
  const { user } = useAuthStore()

  const toggleItem = (title: string) => {
    if (isCollapsed) return
    setOpenItems(prev => 
      prev.includes(title) 
        ? prev.filter(i => i !== title) 
        : [...prev, title]
    )
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  // Generate initials from fullName
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "??"
  return (
    <TooltipProvider delayDuration={0}>
      <div 
        className={cn(
          "relative flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center h-20 px-4 mb-2">
          <div className={cn(
            "flex items-center overflow-hidden transition-all duration-300",
            isCollapsed ? "justify-center w-full" : "px-2"
          )}>
            <img 
              src={logoImg} 
              alt="KashFlow Logo" 
              className={cn(
                "transition-all duration-300 object-contain",
                isCollapsed ? "w-24 h-24 scale-150" : "w-20 h-20 scale-150"
              )} 
            />
            {!isCollapsed && (
              <span className="text-xl font-bold tracking-tight text-sidebar-foreground truncate -ml-3">
                KashFlow
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0
            const isActive = item.href ? location.pathname === item.href : false
            const isAnySubActive = item.subItems?.some(sub => location.pathname === sub.href)
            const isOpen = openItems.includes(item.title)

            if (hasSubItems) {
              return (
                <Collapsible.Root 
                  key={item.title} 
                  open={!isCollapsed && isOpen}
                  onOpenChange={() => toggleItem(item.title)}
                  className="space-y-1"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Collapsible.Trigger asChild>
                        <button
                          className={cn(
                            "flex items-center w-full gap-3 px-3 py-2.5 rounded-md transition-colors group",
                            isAnySubActive || isOpen
                              ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                              : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                          )}
                        >
                          <item.icon className={cn(
                            "w-5 h-5 shrink-0",
                            isAnySubActive ? "text-sidebar-primary" : "group-hover:text-sidebar-foreground"
                          )} />
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-sm font-medium text-left truncate">{item.title}</span>
                              <ChevronDown className={cn(
                                "w-4 h-4 transition-transform duration-200 opacity-50",
                                isOpen ? "rotate-180" : ""
                              )} />
                            </>
                          )}
                        </button>
                      </Collapsible.Trigger>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right" className="flex flex-col gap-1 p-2">
                        <span className="font-semibold border-b border-border/50 pb-1 mb-1">{item.title}</span>
                        {item.subItems?.map(sub => (
                          <span key={sub.href} className="text-xs py-1 opacity-80">{sub.title}</span>
                        ))}
                      </TooltipContent>
                    )}
                  </Tooltip>

                  <Collapsible.Content className="space-y-1 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    {!isCollapsed && item.subItems?.map((sub) => {
                      const isSubActive = location.pathname === sub.href
                      return (
                        <Link
                          key={sub.href}
                          to={sub.href}
                          className={cn(
                            "flex items-center h-9 pl-11 pr-3 rounded-md text-sm transition-colors",
                            isSubActive
                              ? "text-sidebar-primary font-medium"
                              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
                          )}
                        >
                          {sub.title}
                        </Link>
                      )
                    })}
                  </Collapsible.Content>
                </Collapsible.Root>
              )
            }

            return (
              <Tooltip key={item.title}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href!}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors group relative",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-primary font-semibold" 
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 shrink-0",
                      isActive ? "text-sidebar-primary" : "group-hover:text-sidebar-foreground"
                    )} />
                    {!isCollapsed && <span className="text-sm truncate">{item.title}</span>}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 mt-auto space-y-1">
           <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center w-full gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
                  <HelpCircle className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="text-sm font-medium">Centre d'aide</span>}
                </button>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">Centre d'aide</TooltipContent>}
           </Tooltip>
           
           <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/settings" className="flex items-center w-full gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
                  <Settings className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="text-sm font-medium">Paramètres</span>}
                </Link>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">Paramètres</TooltipContent>}
           </Tooltip>

           <Separator className="my-2 opacity-50" />

           {/* User Profile */}
           <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer hover:bg-sidebar-accent/50 group",
                isCollapsed ? "justify-center" : ""
              )}>
                <div className="w-8 h-8 rounded-md bg-sidebar-primary/10 text-sidebar-primary flex items-center justify-center shrink-0 font-bold text-xs border border-sidebar-primary/20">
                  {initials}
                </div>
                
                {!isCollapsed && (
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-semibold truncate text-sidebar-foreground">
                      {user?.fullName || "Utilisateur"}
                    </span>
                    <span className="text-[11px] truncate text-muted-foreground">
                      {user?.email || "Chargement..."}
                    </span>
                  </div>
                )}
                
                {!isCollapsed && (
                  <button 
                    onClick={handleLogout}
                    className="p-1 rounded-md text-muted-foreground hover:text-destructive transition-colors"
                    title="Déconnexion"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                <div className="flex flex-col">
                  <span className="font-semibold">{user?.fullName}</span>
                  <span className="text-xs opacity-70">Déconnexion</span>
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute flex items-center justify-center w-6 h-6 transition-all border rounded-full -right-3 top-10 bg-background border-sidebar-border hover:bg-sidebar-accent shadow-sm z-50 text-sidebar-foreground opacity-0 group-hover:opacity-100 lg:opacity-100"
          )}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </TooltipProvider>
  )
}