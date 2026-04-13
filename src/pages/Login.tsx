import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import logoDark from "@/assets/logo-jhl-dark.png";
import { toast } from "sonner";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate("/");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Ingresa tu correo electrónico primero");
      return;
    }
    setResetLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://jhleasing.scaletechconsulting.mx/reset-password",
    });
    setResetLoading(false);
    if (error) {
      setError(error.message);
    } else {
      toast.success("Correo enviado. Revisa tu bandeja de entrada para restablecer tu contraseña.");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10">
          <Link to="/">
            <img src={logoDark} alt="JH Leasing" className="h-16 w-auto" />
          </Link>
        </div>

        <div className="neu-card">
          <div className="p-10">
            <h1 className="heading-md text-center mb-8">Iniciar Sesión</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label-micro block mb-2">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-4 rounded-2xl text-sm outline-none transition-all"
                  style={{ boxShadow: "var(--shadow-inset-sm)", background: "hsl(var(--background))" }}
                  placeholder="tu@correo.com"
                />
              </div>

              <div>
                <label className="label-micro block mb-2">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-4 rounded-2xl text-sm outline-none transition-all"
                  style={{ boxShadow: "var(--shadow-inset-sm)", background: "hsl(var(--background))" }}
                  placeholder="••••••••"
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-xs underline transition-opacity hover:opacity-70 disabled:opacity-50"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  {resetLoading ? "Enviando..." : "¿Olvidaste tu contraseña?"}
                </button>
              </div>

              {error && (
                <p className="text-sm text-center" style={{ color: "hsl(var(--destructive))" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>

            <p className="text-sm text-center mt-6" style={{ color: "hsl(var(--muted-foreground))" }}>
              ¿No tienes cuenta?{" "}
              <Link to="/registro" className="font-semibold underline" style={{ color: "hsl(var(--primary))" }}>
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}