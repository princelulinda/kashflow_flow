import { useState, useEffect } from "react"
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Target,
  ChevronRight,
  Plus,
  Filter,
  Loader2,
  Building2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  ShieldAlert
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { accountService,type Wallet as WalletType } from "@/services/accountService"
import { transactionService,type Transaction } from "@/services/transactionService"
import { Link } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

export default function DashboardPage() {
  const [wallets, setWallets] = useState<WalletType[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuthStore()

  // Simulation du statut 2FA (à lier à l'API plus tard)
  const is2FAEnabled = false 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletData, txData] = await Promise.all([
          accountService.getWallets(),
          transactionService.list()
        ])
        setWallets(walletData)
        setTransactions(txData?.data.slice(0, 5)) // Prendre les 5 dernières
      } catch (error) {
        console.error("Erreur lors de la récupération des données du dashboard", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount / 100)
  }

  const totalBalance = wallets.reduce((acc, curr) => acc + curr.balance, 0)
  const devWallet = wallets.find(w => w.type === 'dev')
  const vendorWallet = wallets.find(w => w.type === 'vendor')

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-sidebar-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Synchronisation de vos comptes...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
            {/* 2FA Reminder Banner */}
     <div className="relative overflow-hidden bg-amber-50 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-center gap-4 text-center md:text-left">
              <div>
                 <h3 className="font-bold text-amber-900 leading-tight">Sécurisez votre compte KashFlow</h3>
                 <p className="text-xs text-amber-700 mt-1 font-medium">L'authentification à deux facteurs n'est pas encore activée sur votre profil.</p>
              </div>
           </div>
           <Link to="/settings">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 rounded-xl shadow-none">
                 CONFIGURER MAINTENANT
              </Button>
           </Link>
           {/* Decorative background icon */}
           {/* <Lock className="absolute -right-4 -bottom-4 w-24 h-24 text-amber-200/30 -rotate-12 pointer-events-none" /> */}
        </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Aperçu financier</h1>
          <p className="text-muted-foreground text-sm mt-1">Gérez vos revenus développeur et vos ventes en un seul endroit.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 border-border bg-background hover:bg-muted">
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </Button>
          <Link to="/withdraw">
            <Button size="sm" className="h-9 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              Retrait
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <Card className="md:col-span-1 border-none bg-sidebar-primary text-sidebar-primary-foreground p-1 shadow-lg shadow-sidebar-primary/10 rounded-2xl">
           <CardContent className="p-6">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Solde Global</p>
              <div className="text-4xl font-black mb-6">{formatCurrency(totalBalance)}</div>
              <div className="flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-2 py-1 rounded">
                 <TrendingUp className="w-3 h-3" />
                 +4.2% ce mois
              </div>
           </CardContent>
        </Card>

        {/* Dev Wallet Card */}
        <Card className="border-border shadow-none rounded-2xl bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Commissions App (Dev)</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Building2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(devWallet?.balance || 0)}</div>
            <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
               Dernière mise à jour: {devWallet ? new Date(devWallet.updatedAt).toLocaleDateString() : 'N/A'}
            </p>
          </CardContent>
        </Card>

        {/* Vendor Wallet Card */}
        <Card className="border-border shadow-none rounded-2xl bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ventes Directes (Vendeur)</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(vendorWallet?.balance || 0)}</div>
            <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
               Dernière mise à jour: {vendorWallet ? new Date(vendorWallet.updatedAt).toLocaleDateString() : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content: Recent Activity */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold tracking-tight">Activité récente</h2>
            <Link to="/transactions">
              <Button variant="ghost" size="sm" className="text-sidebar-primary hover:bg-sidebar-primary/5 font-bold text-xs uppercase tracking-tighter">
                Voir tout l'historique <ArrowRight className="w-3 h-3 ml-1.5" />
              </Button>
            </Link>
          </div>
          
          <div className="border border-border rounded-2xl bg-card overflow-hidden">
             {transactions.length === 0 ? (
               <div className="py-20 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground/30">
                     <Wallet className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Aucune transaction pour le moment.</p>
               </div>
             ) : (
               <div className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm",
                          tx.status === 'completed' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-muted text-muted-foreground border border-border"
                        )}>
                          {tx.type === 'credit' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-tight">#{tx.id} - {tx.externalReference || 'Transaction Directe'}</p>
                          <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-tighter font-medium">
                            {new Date(tx.createdAt).toLocaleDateString()} • {tx.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-base font-black",
                          tx.type === 'credit' ? "text-emerald-600" : "text-foreground"
                        )}>
                          {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.vendorNetAmount)}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mt-1">
                          {tx.type === 'credit' ? 'Crédit' : 'Débit'}
                        </p>
                      </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        </div>

        {/* Sidebar: Goals & Quick Actions */}
        <div className="lg:col-span-4 space-y-10">
          <section className="space-y-4">
             <h2 className="text-xl font-bold tracking-tight px-2">Objectif d'épargne</h2>
             <Card className="border-border shadow-none rounded-2xl p-6 bg-muted/20 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
                      <Target className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Voyage Japon</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Progression</span>
                      <span className="text-xl font-black">69%</span>
                    </div>
                    <div className="h-2.5 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-sidebar-primary rounded-full w-[69%]" />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium italic">
                      Encore 1,550 € pour atteindre votre but !
                    </p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <TrendingUp className="w-24 h-24 rotate-12" />
                </div>
             </Card>
          </section>

          <section className="p-8 border border-dashed border-border rounded-2xl bg-muted/10 text-center space-y-3">
             <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">Astuce Budget</div>
             <p className="text-sm leading-relaxed text-foreground/80 italic font-medium">
               "Vos revenus développeur ont augmenté de 12% ce mois-ci. Envisagez de réinvestir une partie dans de nouvelles fonctionnalités."
             </p>
          </section>
        </div>
      </div>
    </div>
  )
}
