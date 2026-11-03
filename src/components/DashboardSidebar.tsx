import { useEffect, useRef, useState, type ElementType } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { ArrowLeftRight, ArrowUpRight, Boxes, Check, ChevronsUpDown, Home, LogOut, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { KashflowMark } from "@/components/auth/AuthShell"
import { useAuthStore } from "@/store/authStore"
import { authService } from "@/services/authService"

/*
 * Barre latérale du tableau de bord, dans l'esprit de Stripe :
 * compte en haut, liens compacts groupés, élément actif en violet, fond légèrement teinté.
 * Palette Kashflow : violet #6a1ed6 · encre #170b2e.
 */

interface NavItem {
  label: string
  to: string
  icon: ElementType
}

const SECTIONS: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { label: "Accueil", to: "/dashboard", icon: Home },
      { label: "Transactions", to: "/transactions", icon: ArrowLeftRight },
      { label: "Retraits", to: "/withdraw", icon: ArrowUpRight },
    ],
  },
  {
    title: "Développeurs",
    items: [{ label: "Applications", to: "/applications", icon: Boxes }],
  },
]

function initialsOf(name?: string) {
  if (!name) return "K"
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function SidebarLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group flex h-8 items-center gap-2.5 rounded-md px-2 text-[14px] transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a1ed6]/40",
          isActive
            ? "font-semibold text-[#6a1ed6]"
            : "font-medium text-[#170b2e]/75 hover:bg-[#170b2e]/[0.05] hover:text-[#170b2e]",
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={cn("h-4 w-4 shrink-0", isActive ? "text-[#6a1ed6]" : "text-[#170b2e]/45 group-hover:text-[#170b2e]/70")}
            strokeWidth={2.2}
          />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

function AccountMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const logout = async () => {
    setOpen(false)
    await authService.logout()
    navigate("/login")
  }

  const name = user?.fullName || "Mon compte"

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-[#170b2e]/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a1ed6]/40"
      >
        <KashflowMark className="h-8 w-8 shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold text-[#170b2e]">{name}</span>
          <span className="block truncate text-[12px] text-[#170b2e]/55">Kashflow</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-[#170b2e]/40" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-[#170b2e]/10 bg-white py-1.5 shadow-[0_12px_32px_-12px_rgba(23,11,46,0.25)] animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center gap-2.5 px-3 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3effb] text-[12px] font-bold text-[#6a1ed6]">
              {initialsOf(user?.fullName)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-[#170b2e]">{name}</span>
              <span className="block truncate text-[12px] text-[#170b2e]/55">{user?.email}</span>
            </span>
            <Check className="h-4 w-4 text-[#6a1ed6]" aria-label="Compte actuel" />
          </div>
          <div className="my-1.5 h-px bg-[#170b2e]/10" />
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex h-9 items-center gap-2.5 px-3 text-[14px] text-[#170b2e]/80 hover:bg-[#170b2e]/[0.05] hover:text-[#170b2e]"
          >
            <Settings className="h-4 w-4 text-[#170b2e]/50" />
            Paramètres du compte
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className="flex h-9 w-full items-center gap-2.5 px-3 text-left text-[14px] text-[#170b2e]/80 hover:bg-[#170b2e]/[0.05] hover:text-[#170b2e]"
          >
            <LogOut className="h-4 w-4 text-[#170b2e]/50" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  )
}

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-screen w-[240px] flex-col border-r border-[#170b2e]/[0.08] bg-[#faf9fc]" aria-label="Navigation principale">
      <div className="flex h-16 shrink-0 items-center px-3">
        <div className="w-full">
          <AccountMenu />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 pt-2">
        {SECTIONS.map((section, i) => (
          <div key={section.title ?? i} className={i > 0 ? "mt-6" : ""}>
            {section.title && (
              <h2 className="mb-1 px-2 text-[12px] font-semibold text-[#170b2e]/50">{section.title}</h2>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <SidebarLink item={item} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[#170b2e]/[0.08] px-3 py-3">
        <SidebarLink item={{ label: "Paramètres", to: "/settings", icon: Settings }} onNavigate={onNavigate} />
      </div>
    </aside>
  )
}
