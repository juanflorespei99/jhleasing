import { createRoot } from "react-dom/client";
import "./index.css";
import { preserveRecoveryRedirect } from "@/lib/auth-recovery";

async function bootstrap() {
  preserveRecoveryRedirect();

  const { default: App } = await import("./App.tsx");
  createRoot(document.getElementById("root")!).render(<App />);
}

void bootstrap();
