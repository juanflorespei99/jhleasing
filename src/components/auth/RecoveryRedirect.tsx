import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  getRecoveryRedirectPath,
  RECOVERY_PATH,
  shouldRedirectToRecovery,
} from "@/lib/auth-recovery";

export default function RecoveryRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!shouldRedirectToRecovery(location)) return;

    navigate(getRecoveryRedirectPath(location), {
      replace: true,
    });
  }, [location, navigate]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "PASSWORD_RECOVERY") return;
      if (window.location.pathname === RECOVERY_PATH) return;

      navigate(getRecoveryRedirectPath(window.location), {
        replace: true,
      });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
}
