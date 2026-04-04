import { useState, useEffect } from "react"
import { Plus, Trash2, Globe, Percent, Loader2, AlertCircle, Copy, Check, Eye, EyeOff, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { appService, type Application } from "@/services/appService"
import { cn } from "@/lib/utils"

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // UI states
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<number, boolean>>({})

  // Form State
  const [name, setName] = useState("")
  const [commission, setCommission] = useState(0)
  const [webhook, setWebhook] = useState("")

  const fetchApps = async () => {
    setIsLoading(true)
    try {
      const data = await appService.list()
      setApps(data)
    } catch (err: any) {
      setError("Erreur de synchronisation avec l'API")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setError(null)
    try {
      await appService.create({ 
        name, 
        commissionPercentage: commission, 
        webhookUrl: webhook || null 
      })
      setName("")
      setWebhook("")
      setCommission(0)
      fetchApps()
    } catch (err: any) {
      const msg = err.response?.data?.errors?.[0]?.message || "Erreur de création"
      setError(msg)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette application ? Les clés API deviendront invalides.")) return
    try {
      await appService.delete(id)
      fetchApps()
    } catch (err) {
      setError("Action impossible")
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleSecret = (id: number) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Développeur</h1>
        <p className="text-muted-foreground">Créez et gérez vos applications pour intégrer KashFlow.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Creation Form */}
        <div className="lg:col-span-4 sticky top-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
               <Plus className="w-4 h-4" />
               Nouvelle App
            </div>
            
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="appName" className="text-[11px] font-bold uppercase ml-1 opacity-70">Nom commercial</Label>
                <Input 
                  id="appName" 
                  placeholder="Ex: MyMarket Store" 
                  className="h-11 rounded-lg border-border bg-background focus-visible:ring-sidebar-primary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission" className="text-[11px] font-bold uppercase ml-1 opacity-70">Commission %</Label>
                  <div className="relative">
                    <Input 
                      id="commission" 
                      type="number"
                      className="h-11 rounded-lg pr-8"
                      value={commission}
                      onChange={(e) => setCommission(Number(e.target.value))}
                      required
                    />
                    <Percent className="absolute right-3 top-3.5 h-4 w-4 opacity-30" />
                  </div>
                </div>
                <div className="flex items-end pb-1 text-[10px] text-muted-foreground italic">
                  Frais de service par transaction
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook" className="text-[11px] font-bold uppercase ml-1 opacity-70">Webhook URL (Optionnel)</Label>
                <Input 
                  id="webhook" 
                  placeholder="https://votre-app.com/api/kashflow" 
                  className="h-11 rounded-lg"
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                />
              </div>

              <Button className="w-full h-11 bg-sidebar-primary text-white font-bold tracking-wide rounded-lg shadow-none" disabled={isCreating}>
                {isCreating ? <Loader2 className="animate-spin h-5 w-5" /> : "GÉNÉRER LES CLÉS"}
              </Button>
            </form>

            {error && (
              <div className="flex items-center gap-2 p-3 text-[11px] bg-rose-50 text-rose-600 rounded-lg border border-rose-100 font-medium">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* List of existing apps */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
                 <Terminal className="w-4 h-4" />
                 Vos Intégrations
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {apps.length} Actives
              </span>
           </div>

           <div className="grid gap-6">
              {apps.length === 0 && !isLoading && (
                <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-muted/5">
                  <Globe className="w-12 h-12 mx-auto opacity-10 mb-4" />
                  <p className="text-sm text-muted-foreground font-medium">Lancez votre première intégration pour commencer.</p>
                </div>
              )}

              {apps.map((app) => (
                <div key={app.id} className="group border border-border rounded-2xl bg-card overflow-hidden transition-all hover:border-sidebar-primary/30">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center border border-border group-hover:bg-sidebar-primary/5 group-hover:border-sidebar-primary/20 transition-colors">
                           <Globe className="w-6 h-6 text-muted-foreground group-hover:text-sidebar-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg leading-tight">{app.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">Créé le {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => handleDelete(app.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* API Key */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">
                          Clé API (Public)
                          {copiedId === `key-${app.id}` && <span className="text-emerald-600 animate-in fade-in slide-in-from-right-2">Copié !</span>}
                        </div>
                        <div className="relative">
                          <code className="block w-full bg-muted/50 p-3 pr-24 rounded-lg text-xs font-mono border border-transparent group-hover:border-border transition-colors">
                            {app.apiKey}
                          </code>
                          <div className="absolute right-1 top-1 flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-[10px] font-bold px-2 hover:bg-white"
                              onClick={() => copyToClipboard(app.apiKey, `key-${app.id}`)}
                            >
                              {copiedId === `key-${app.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Secret Key */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">
                          Secret Client (Privé)
                          {copiedId === `sec-${app.id}` && <span className="text-emerald-600 animate-in fade-in slide-in-from-right-2">Copié !</span>}
                        </div>
                        <div className="relative">
                          <code className={cn(
                            "block w-full p-3 pr-24 rounded-lg text-xs font-mono border transition-all",
                            showSecrets[app.id] ? "bg-amber-50/30 border-amber-100 text-amber-900" : "bg-muted/50 border-transparent text-muted-foreground/40 blur-[2px] select-none"
                          )}>
                            {app.secret}
                          </code>
                          <div className="absolute right-1 top-1 flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-[10px] font-bold px-2 hover:bg-white"
                              onClick={() => toggleSecret(app.id)}
                            >
                              {showSecrets[app.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-[10px] font-bold px-2 hover:bg-white"
                              disabled={!showSecrets[app.id]}
                              onClick={() => copyToClipboard(app.secret, `sec-${app.id}`)}
                            >
                              {copiedId === `sec-${app.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Bar */}
                  <div className="bg-muted/30 px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 uppercase">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                         Opérationnelle
                       </span>
                       <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 uppercase">
                         <Percent className="w-3 h-3" />
                         {app.commissionPercentage}% Commission
                       </span>
                    </div>
                    {app.webhookUrl && (
                      <span className="text-[10px] font-bold text-sidebar-primary uppercase truncate max-w-[150px]">
                        Webhook: {app.webhookUrl}
                      </span>
                    )}
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}
