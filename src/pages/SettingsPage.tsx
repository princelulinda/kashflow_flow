import { useState } from "react"
import { 
  User, 
  Key, 
  Mail, 
  Camera,
  Check,
  AlertCircle,
  Loader2,
  LogOut,
  Shield,
  Moon,
  Sun,
  Globe,
  Smartphone,
  Lock,
  Bell,
  ChevronRight,
  ShieldCheck,
  Zap
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/authStore"
import { authService } from "@/services/authService"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  // Settings states
  const [fullName, setFullName] = useState(user?.fullName || "")
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [language, setLanguage] = useState('fr')
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [notifications, setNotifications] = useState(true)

  const handleSave = async () => {
    setIsSaving(true)
    setSuccess(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setSuccess("Paramètres enregistrés")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Personnalisez votre expérience et sécurisez vos accès.</p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        
        {/* SECTION: PROFIL */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50 ml-1">
             <User className="w-3 h-3" /> Identité du compte
          </div>
          
          <Card className="border-border shadow-none rounded-2xl overflow-hidden bg-card">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-muted border border-border flex items-center justify-center text-2xl font-black text-foreground/30">
                    {user?.fullName?.substring(0, 2).toUpperCase()}
                  </div>
                </div>

                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Nom Complet</Label>
                    <Input 
                      className="h-11 rounded-xl bg-muted/20 border-border focus-visible:ring-sidebar-primary" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</Label>
                    <Input 
                      className="h-11 rounded-xl bg-muted/10 border-border text-muted-foreground" 
                      value={user?.email || ""}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SECTION: PRÉFÉRENCES INTERFACE */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50 ml-1">
             <Zap className="w-3 h-3" /> Préférences d'interface
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theme Selector */}
            <Card className="border-border shadow-none rounded-2xl bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Moon className="w-4 h-4 text-sidebar-primary" /> Apparence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex p-1 bg-muted/30 rounded-xl border border-border">
                  {[
                    { id: 'light', label: 'Clair', icon: Sun },
                    { id: 'dark', label: 'Sombre', icon: Moon },
                    { id: 'system', label: 'Système', icon: Smartphone },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all",
                        theme === t.id ? "bg-white text-sidebar-primary shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <t.icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Language Selector */}
            <Card className="border-border shadow-none rounded-2xl bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sidebar-primary" /> Langue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <select 
                  className="w-full h-11 bg-muted/30 border border-border rounded-xl px-4 text-sm font-bold outline-none focus:ring-1 focus:ring-sidebar-primary appearance-none cursor-pointer"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="fr">Français (France)</option>
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                </select>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SECTION: SÉCURITÉ */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50 ml-1">
             <ShieldCheck className="w-3 h-3" /> Sécurité & Accès
          </div>
          
          <Card className="border-border shadow-none rounded-2xl bg-card divide-y divide-border">
            {/* 2FA Toggle */}
            <div className="p-6 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Double Authentification (2FA)</p>
                  <p className="text-xs text-muted-foreground">Ajoutez une couche de sécurité via application mobile.</p>
                </div>
              </div>
              <button 
                onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative border border-transparent",
                  is2FAEnabled ? "bg-sidebar-primary shadow-inner" : "bg-muted border-border"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full transition-all bg-white shadow-sm",
                  is2FAEnabled ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            {/* Password Change Button */}
            <div className="p-6 flex items-center justify-between group cursor-pointer hover:bg-muted/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Mot de passe</p>
                  <p className="text-xs text-muted-foreground">Dernière modification il y a 3 mois.</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="font-bold text-[10px] uppercase tracking-wider">
                Modifier <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            {/* Notifications Toggle */}
            <div className="p-6 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center border border-border">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold">Alertes de connexion</p>
                  <p className="text-xs text-muted-foreground">Recevoir un email à chaque nouvelle connexion.</p>
                </div>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative border border-transparent",
                  notifications ? "bg-sidebar-primary shadow-inner" : "bg-muted border-border"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full transition-all bg-white shadow-sm",
                  notifications ? "left-7" : "left-1"
                )} />
              </button>
            </div>
          </Card>
        </section>

        {/* SECTION: DANGER ZONE */}
        <section className="space-y-6 pt-4">
          <div className="p-8 border border-rose-100 bg-rose-50/20 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm font-bold text-rose-900">Suppression définitive du compte</p>
              <p className="text-xs text-rose-600 font-medium">Une fois supprimé, vous ne pourrez plus récupérer vos données.</p>
            </div>
            <Button variant="outline" className="h-11 px-8 rounded-xl border-rose-200 text-rose-600 font-bold hover:bg-rose-600 hover:text-white transition-all">
              SUPPRIMER
            </Button>
          </div>
        </section>

        {/* Sticky Actions Footer */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-fit px-6 py-3 bg-white/80 backdrop-blur-md border border-border rounded-2xl shadow-2xl z-50 flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center gap-2 pr-6 border-r border-border">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-rose-600 font-bold text-xs uppercase tracking-widest px-4"
                onClick={() => authService.logout()}
              >
                <LogOut className="w-4 h-4 mr-2" /> Déconnexion
              </Button>
           </div>
           
           <div className="flex items-center gap-4">
              {success && (
                <span className="text-xs font-bold text-emerald-600 animate-in fade-in zoom-in-95">{success}</span>
              )}
              <Button 
                className="h-10 px-8 rounded-xl bg-sidebar-primary shadow-none font-bold text-xs" 
                disabled={isSaving}
                onClick={handleSave}
              >
                {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : "ENREGISTRER LES RÉGLAGES"}
              </Button>
           </div>
        </div>
      </div>
    </div>
  )
}
