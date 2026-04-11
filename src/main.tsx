import { createRoot } from "react-dom/client";
import "./index.css";
import { preserveRecoveryRedirect } from "@/lib/auth-recovery";

const APP_IMPORT_RETRY_DELAY_MS = 400;
const APP_IMPORT_MAX_ATTEMPTS = 3;
const APP_IMPORT_RELOAD_KEY = "__app_import_reload__";

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const isDynamicImportFetchError = (error: unknown) =>
  error instanceof TypeError && error.message.includes("Failed to fetch dynamically imported module");

async function loadApp() {
  let lastError: unknown;

  for (let attempt = 1; attempt <= APP_IMPORT_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await import("./App.tsx");
    } catch (error) {
      lastError = error;

      if (!isDynamicImportFetchError(error) || attempt === APP_IMPORT_MAX_ATTEMPTS) {
        throw error;
      }

      await wait(APP_IMPORT_RETRY_DELAY_MS * attempt);
    }
  }

  throw lastError;
}

function renderBootstrapError() {
  const rootElement = document.getElementById("root");
  if (!rootElement) return;

  rootElement.innerHTML = `
    <div style="min-height:100vh;display:grid;place-items:center;padding:24px;background:hsl(0 0% 100%);color:hsl(222 47% 11%);font-family:system-ui,sans-serif;">
      <div style="max-width:420px;text-align:center;display:grid;gap:12px;">
        <h1 style="margin:0;font-size:1.5rem;font-weight:700;">No pudimos cargar la app</h1>
        <p style="margin:0;color:hsl(215 16% 47%);line-height:1.5;">Intenta recargar la página. Si el problema continúa, vuelve a intentarlo en unos segundos.</p>
        <button id="retry-app-load" style="border:0;border-radius:999px;padding:12px 18px;background:hsl(222 47% 11%);color:hsl(210 40% 98%);font-weight:600;cursor:pointer;">Recargar</button>
      </div>
    </div>
  `;

  rootElement.querySelector<HTMLButtonElement>("#retry-app-load")?.addEventListener("click", () => {
    window.location.reload();
  });
}

async function bootstrap() {
  preserveRecoveryRedirect();

  const { default: App } = await loadApp();
  window.sessionStorage.removeItem(APP_IMPORT_RELOAD_KEY);
  createRoot(document.getElementById("root")!).render(<App />);
}

void bootstrap().catch((error) => {
  if (
    isDynamicImportFetchError(error) &&
    !window.sessionStorage.getItem(APP_IMPORT_RELOAD_KEY)
  ) {
    window.sessionStorage.setItem(APP_IMPORT_RELOAD_KEY, "true");
    window.location.reload();
    return;
  }

  console.error("App bootstrap failed", error);
  renderBootstrapError();
});
