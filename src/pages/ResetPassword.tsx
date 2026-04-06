import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { KeyRound, CheckCircle, AlertTriangle } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check URL for error params (e.g. expired token)
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));
    const errorCode = params.get("error_code");
    const errorDesc = params.get("error_description");

    if (errorCode || errorDesc) {
      setError(
        errorCode === "otp_expired"
          ? "El enlace ha expirado. Solicita un nuevo correo de recuperación desde el panel de administración."
          : errorDesc?.replace(/\+/g, " ") || "Error en el enlace de recuperación."
      );
      return;
    }

    // Also check query params (Supabase PKCE flow)
    const searchParams = new URLSearchParams(window.location.search);
    const searchError = searchParams.get("error_code");
    const searchDesc = searchParams.get("error_description");

    if (searchError || searchDesc) {
      setError(
        searchError === "otp_expired"
          ? "El enlace ha expirado. Solicita un nuevo correo de recuperación desde el panel de administración."
          : searchDesc?.replace(/\+/g, " ") || "Error en el enlace de recuperación."
      );
      return;
    }

    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setSessionReady(true);
        }
      }
    );

    // Also check if we already have a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success("Contraseña actualizada exitosamente");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">
            Contraseña Actualizada
          </h1>
          <p className="text-muted-foreground">
            Tu contraseña ha sido cambiada exitosamente.
          </p>
          <Link to="/login">
            <Button className="w-full rounded-full">
              Ir a Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">
            Enlace Inválido
          </h1>
          <p className="text-muted-foreground">
            {error}
          </p>
          <Link to="/login">
            <Button className="w-full rounded-full">
              Ir a Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <KeyRound className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">
            Nueva Contraseña
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {!sessionReady ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Verificando enlace...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nueva contraseña</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmar contraseña</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={loading}
            >
              {loading ? "Actualizando..." : "Actualizar Contraseña"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
