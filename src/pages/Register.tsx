import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logoDark from "@/assets/logo-jhl-dark.png";

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
      setError("Por favor ingresa un correo válido");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    const { error } = await signUp(trimmedEmail, password);
    setLoading(false);

    if (error) {
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("weak") || msg.includes("leaked") || msg.includes("easy to guess")) {
        setError("La contraseña es muy común o fue filtrada en una brecha de datos. Por favor elige una diferente.");
      } else {
        setError(error.message);
      }
    } else {
      setSuccess(true);
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
            <h1 className="heading-md text-center mb-8">Crear Cuenta</h1>

            {success ? (
              <div className="text-center space-y-4">
                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                  ¡Registro exitoso! Revisa tu correo electrónico para confirmar tu cuenta.
                </p>
                <Link
                  to="/login"
                  className="inline-block px-8 py-4 rounded-full text-xs uppercase tracking-widest font-bold"
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                >
                  Ir a Login
                </Link>
              </div>
            ) : (
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
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label className="label-micro block mb-2">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-2xl text-sm outline-none transition-all"
                    style={{ boxShadow: "var(--shadow-inset-sm)", background: "hsl(var(--background))" }}
                    placeholder="Repite tu contraseña"
                  />
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
                  {loading ? "Creando cuenta..." : "Crear Cuenta"}
                </button>
              </form>
            )}

            <p className="text-sm text-center mt-6" style={{ color: "hsl(var(--muted-foreground))" }}>
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="font-semibold underline" style={{ color: "hsl(var(--primary))" }}>
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
