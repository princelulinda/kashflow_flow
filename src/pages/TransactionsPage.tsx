import { useState, useEffect } from "react"
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MoreHorizontal,
  Download,
  Calendar,
  Wallet,
  Building2,
  Info,
  Loader2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { transactionService,type  Transaction } from "@/services/transactionService"
import { appService, type Application } from "@/services/appService"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [apps, setApps] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [appFilter, setAppFilter] = useState<number | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [txData, appData] = await Promise.all([
        transactionService.list({ application_id: appFilter }),
        appService.list()
      ])
      setTransactions(txData)
      setApps(appData)
    } catch (err: any) {
      setError("Impossible de synchroniser les transactions")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [appFilter])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />
      case 'failed': return <XCircle className="w-4 h-4 text-rose-500" />
      default: return null
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount / 100)
  }

  const filteredTransactions = transactions?.data?.filter(t => 
    t.externalReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toString().includes(searchQuery)
  )

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">Gérez et suivez l'historique complet de vos flux financiers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 border-border bg-background">
            <Download className="w-4 h-4 mr-2" /> Exporter
          </Button>
          <Button size="sm" className="h-9 bg-sidebar-primary text-sidebar-primary-foreground">
            <Calendar className="w-4 h-4 mr-2" /> Mars 2026
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between p-4 bg-muted/20 border border-border rounded-xl">
        <div className="flex flex-1 items-center gap-4 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher par référence ou ID..." 
              className="pl-10 h-10 rounded-lg border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="h-8 w-[1px] bg-border hidden md:block" />
          
          <select 
            className="h-10 bg-background border border-border rounded-lg px-3 text-sm font-medium focus:ring-1 focus:ring-sidebar-primary outline-none"
            onChange={(e) => setAppFilter(e.target.value ? Number(e.target.value) : undefined)}
            value={appFilter || ""}
          >
            <option value="">Toutes les applications</option>
            {apps.map(app => (
              <option key={app.id} value={app.id}>{app.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="sm" className="h-9 px-3 text-muted-foreground hover:text-foreground">
              Effacer les filtres
           </Button>
        </div>
      </div>

      {/* Transactions List */}
      <Card className="border-border shadow-none rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">ID / Date</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Source / Ref</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Status</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-right">Montant Brut</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-right">Commission App</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-right font-black">Net Vendeur</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-sidebar-primary opacity-40" />
                        <p className="text-muted-foreground font-medium italic">Chargement des flux financiers...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-muted-foreground">
                       Aucune transaction ne correspond à vos critères.
                    </td>
                  </tr>
                ) : filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">#{tx.id}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{new Date(tx.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium">
                        {tx.applicationId ? (
                           <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                           <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        {apps.find(a => a.id === tx.applicationId)?.name || (tx.applicationId ? `App #${tx.applicationId}` : "Portefeuille Direct")}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-tighter">
                        {tx.externalReference || "Réf. Interne"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider",
                        tx.status === 'completed' ? "bg-emerald-50 text-emerald-700" : 
                        tx.status === 'pending' ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                      )}>
                        {getStatusIcon(tx.status)}
                        {tx.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium">{formatCurrency(tx.totalAmount)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-muted-foreground italic">-{formatCurrency(tx.appCommissionAmount)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={cn(
                        "font-black text-lg",
                        tx.type === 'credit' ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.vendorNetAmount)}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">
                        Frais Plateforme: {formatCurrency(tx.platformFee)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-background border border-transparent hover:border-border">
                        <Info className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Summary / Info Footer */}
      {!isLoading && filteredTransactions.length > 0 && (
        <div className="flex flex-col md:flex-row gap-6">
           <div className="flex-1 p-6 border border-border rounded-xl bg-card flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Volume Total (Page)</p>
                <p className="text-2xl font-black">
                   {formatCurrency(filteredTransactions.reduce((acc, curr) => acc + curr.totalAmount, 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                 <ArrowUpRight className="w-6 h-6 text-emerald-600" />
              </div>
           </div>
           
           <div className="flex-1 p-6 border border-border rounded-xl bg-card flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Net Perçu</p>
                <p className="text-2xl font-black text-emerald-600">
                   {formatCurrency(filteredTransactions.reduce((acc, curr) => acc + curr.vendorNetAmount, 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                 <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
