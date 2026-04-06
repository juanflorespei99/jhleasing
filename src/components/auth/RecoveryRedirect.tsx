import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const isRecoveryFlow = (search: string, hash: string) =>
  search.includes("type=recovery") ||
  search.includes("token_hash=") ||
  hash.includes("type=recovery");

export default function RecoveryRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/reset-password") return;
    if (!isRecoveryFlow(location.search, location.hash)) return;

    navigate(`/reset-password${location.search}${location.hash}`, {
      replace: true,
    });
  }, [location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "PASSWORD_RECOVERY") return;
      if (window.location.pathname === "/reset-password") return;

      navigate(
        `/reset-password${window.location.search}${window.location.hash}`,
        { replace: true }
      );
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
}
