import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { oauthService, type OAuthAppDetails } from "@/services/oauthService";
import { Loader2 } from "lucide-react";
import logo from "@/assets/kashflow_logo.png";

export default function OAuthConsentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");

  const [appDetails, setAppDetails] = useState<OAuthAppDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/login?returnTo=${returnTo}`, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!clientId || !redirectUri) {
      setError("Paramètres manquants dans la requête.");
      setIsLoading(false);
      return;
    }

    oauthService
      .authorize(clientId, redirectUri)
      .then(setAppDetails)
      .catch((err: any) => {
        setError(err.response?.data?.message || "Application introuvable ou URL de redirection invalide.");
      })
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, clientId, redirectUri]);

  const handleApprove = async () => {
    if (!clientId || !redirectUri) return;
    setIsApproving(true);
    try {
      const { redirect_url } = await oauthService.approve(clientId, redirectUri);
      window.location.href = redirect_url;
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'approbation.");
      setIsApproving(false);
    }
  };

  const handleDeny = () => {
    const uri = appDetails?.redirect_uri || redirectUri;
    if (!uri) return;
    const url = new URL(uri);
    url.searchParams.set("error", "access_denied");
    window.location.href = url.toString();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">

        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            <p className="text-sm text-slate-400">Chargement...</p>
          </div>
        ) : error ? (
          <div className="border border-slate-200 rounded-2xl p-10 text-center space-y-3">
            <p className="font-semibold text-slate-800">Requête invalide</p>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        ) : appDetails ? (
          <div className="border border-slate-200 rounded-2xl overflow-hidden">

            {/* Header */}
            <div className="px-10 pt-10 pb-8 text-center space-y-5">
              {/* Logos */}
              <div className="flex items-center justify-center gap-4">
                {/* App icon */}
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-600">
                  {appDetails.application.name.charAt(0).toUpperCase()}
                </div>
                {/* Arrow */}
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-slate-300" />
                  ))}
                </div>
                {/* KashFlow logo */}
                <img src={logo} alt="KashFlow" className="h-12 w-12 object-contain" />
              </div>

              <div className="space-y-1">
                <h1 className="text-xl font-semibold text-slate-800">
                  Se connecter à KashFlow
                </h1>
                <p className="text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{appDetails.application.name}</span>
                  {" "}souhaite accéder à votre compte
                </p>
              </div>

              {/* User pill */}
              {user && (
                <div className="inline-flex items-center gap-2 border border-slate-200 rounded-full px-3 py-1.5 text-sm text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.fullName?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                  {user.email}
                </div>
              )}
            </div>

            {/* Permissions */}
            <div className="px-10 py-6 border-t border-slate-100 space-y-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Cette application pourra
              </p>
              {[
                "Consulter les informations de votre compte",
                "Initier des transactions en votre nom",
              ].map((perm) => (
                <div key={perm} className="flex items-start gap-3 text-sm text-slate-600">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  </div>
                  {perm}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="px-10 py-6 border-t border-slate-100 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-10 text-sm font-medium border-slate-200 text-slate-600 hover:bg-slate-50"
                onClick={handleDeny}
                disabled={isApproving}
              >
                Refuser
              </Button>
              <Button
                className="flex-1 h-10 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-none"
                onClick={handleApprove}
                disabled={isApproving}
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Autoriser"
                )}
              </Button>
            </div>

            {/* Footer */}
            <div className="px-10 pb-8 text-center">
              <p className="text-xs text-slate-400">
                En autorisant, vous permettez à{" "}
                <span className="text-slate-500">{appDetails.application.name}</span>{" "}
                d'accéder à votre compte KashFlow.
              </p>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}
