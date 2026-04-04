import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Loader2, 
  ArrowLeft, 
  Wallet, 
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Building,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { paymentService, type Currency, type PaymentMethod } from "@/services/paymentService"
import { accountService, type Wallet as WalletType } from "@/services/accountService"
import { cn } from "@/lib/utils"

export default function WithdrawPage() {
  const navigate = useNavigate()
  const [wallets, setWallets] = useState<WalletType[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(1)
  const [selectedCurrency, setSelectedCurrency] = useState<string>("")
  const [selectedMethod, setSelectedMethod] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [recipient, setRecipient] = useState<string>("")
  const [comment, setComment] = useState<string>("")
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletData, currencyData] = await Promise.all([
          accountService.getWallets(),
          paymentService.getCurrencies()
        ])
        setWallets(walletData)
        setCurrencies(currencyData)
        if (walletData.length > 0) setSelectedWallet(walletData[0])
        if (currencyData.length > 0) setSelectedCurrency(currencyData[0].code)
      } catch (err) {
        console.error("Erreur de chargement", err)
        setError("Impossible de charger les données nécessaires.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedCurrency) {
      const fetchMethods = async () => {
        try {
          const methods = await paymentService.getPaymentMethods(selectedCurrency, true)
          setPaymentMethods(methods)
          if (methods?.length > 0) setSelectedMethod(methods?.[0]?.payment_method_name)
          else setSelectedMethod("")
        } catch (err) {
          console.error("Erreur méthodes de paiement", err)
        }
      }
      fetchMethods()
    }
  }, [selectedCurrency])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWallet || !selectedCurrency || !selectedMethod || !amount || !recipient) {
      setError("Veuillez remplir tous les champs obligatoires.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await paymentService.withdraw({
        amount: parseFloat(amount),
        currency: selectedCurrency,
        payment_method: selectedMethod,
        recipient: recipient,
        wallet_id: selectedWallet.id,
        comment: comment || undefined
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue lors du retrait.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: selectedCurrency || 'BIF' }).format(amount / 100)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-sidebar-primary" />
        <p className="text-muted-foreground font-medium">Préparation du formulaire de retrait...</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <div className="bg-emerald-500 h-2" />
          <CardContent className="p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Demande envoyée !</h2>
              <p className="text-muted-foreground">Votre demande de retrait de {amount} {selectedCurrency} a été prise en compte et est en cours de traitement.</p>
            </div>
            <Button 
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold"
              onClick={() => navigate('/dashboard')}
            >
              Retour au tableau de bord
            </Button>

          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Effectuer un retrait</h1>
          <p className="text-muted-foreground text-sm">Transférez vos fonds vers votre compte mobile money ou bancaire.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Wallet Selection */}
          <Card className="border-border shadow-none rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Wallet className="w-4 h-4 text-sidebar-primary" />
                1. Choisissez le portefeuille
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {wallets.map((wallet) => (
                <div 
                  key={wallet.id}
                  onClick={() => setSelectedWallet(wallet)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1",
                    selectedWallet?.id === wallet.id 
                      ? "border-sidebar-primary bg-sidebar-primary/5" 
                      : "border-border hover:border-muted-foreground/30 bg-card"
                  )}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {wallet.type === 'vendor' ? 'Ventes Directes' : 'Commissions App'}
                  </span>
                  <span className="text-lg font-black">{formatCurrency(wallet.balance)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Currency & Method */}
          <Card className="border-border shadow-none rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building className="w-4 h-4 text-sidebar-primary" />
                2. Moyen de paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <select 
                    id="currency"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {currencies.map(c => (
                      <option key={c.currency_slug} value={c.currency_slug}>{c.currency_name} ({c.currency_slug})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">Méthode de retrait</Label>
                  <select 
                    id="method"
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    disabled={paymentMethods.length === 0}
                  >
                    {paymentMethods.length === 0 ? (
                      <option value="">Aucune méthode disponible</option>
                    ) : (
                      paymentMethods.map(m => {
                        return(
                        <option key={m.payment_method_name} value={m.payment_method_name}>{m.payment_method_name} (Frais: {m.withdrawal_fee}%)</option>
                      )})
                    )}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amount & Recipient */}
          <Card className="border-border shadow-none rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-sidebar-primary" />
                3. Détails du transfert
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant à retirer</Label>
                  <div className="relative">
                    <Input 
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-12 h-12 text-lg font-bold rounded-xl"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                      {selectedCurrency}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">Numéro/Compte bénéficiaire</Label>
                  <Input 
                    id="recipient"
                    placeholder="Ex: 25771234567"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Note (Optionnel)</Label>
                <Input 
                  id="comment"
                  placeholder="Ex: Retrait de mes ventes hebdomadaires"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 text-destructive text-sm font-medium rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </form>

        {/* Summary Section */}
        {selectedWallet && selectedCurrency && selectedMethod && amount && recipient && (
          <Card className="border-border shadow-none rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sidebar-primary" />
                Récapitulatif de votre retrait
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Portefeuille</p>
                <p className="text-sm font-bold">{selectedWallet.type === 'vendor' ? 'Ventes Directes' : 'Commissions App'}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Devise</p>
                <p className="text-sm font-bold">{selectedCurrency}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Moyen de paiement</p>
                <p className="text-sm font-bold">{paymentMethods.find(m => m.payment_method_name === selectedMethod)?.payment_method_name || 'N/A'}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Montant</p>
                <p className="text-sm font-bold">{formatCurrency(parseFloat(amount))}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Bénéficiaire</p>
                <p className="text-sm font-bold">{recipient}</p>
              </div>
              {comment && (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Note</p>
                  <p className="text-sm font-bold">{comment}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}


          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Vos transactions sont sécurisées par cryptage de bout en bout.
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 text-lg font-bold rounded-2xl shadow-lg shadow-sidebar-primary/20"
              disabled={isSubmitting || paymentMethods.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                "Confirmer le retrait"
              )}
            </Button>
          </div>
        </div>
      </div>
  )
}