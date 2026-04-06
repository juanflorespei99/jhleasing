const RECOVERY_PATH = "/reset-password";

type RecoveryLocation = Pick<Location, "pathname" | "search" | "hash">;

const getParams = (value: string, prefix: "#" | "?") =>
  new URLSearchParams(value.startsWith(prefix) ? value.slice(1) : value);

const isRecoveryParams = (params: URLSearchParams) => {
  const type = params.get("type");

  if (type === "recovery") return true;
  if (!params.has("token_hash")) return false;

  return !type || type === "recovery";
};

const isRecoveryErrorParams = (params: URLSearchParams) => {
  const errorCode = params.get("error_code");
  const errorDescription =
    params.get("error_description")?.toLowerCase() ?? "";

  return (
    errorCode === "otp_expired" ||
    errorDescription.includes("email link is invalid or has expired")
  );
};

export const isRecoveryFlow = (
  location: Pick<RecoveryLocation, "search" | "hash">
) =>
  isRecoveryParams(getParams(location.search, "?")) ||
  isRecoveryParams(getParams(location.hash, "#")) ||
  isRecoveryErrorParams(getParams(location.search, "?")) ||
  isRecoveryErrorParams(getParams(location.hash, "#"));

export const getRecoveryRedirectPath = (
  location: Pick<RecoveryLocation, "search" | "hash">
) => `${RECOVERY_PATH}${location.search}${location.hash}`;

export const shouldRedirectToRecovery = (location: RecoveryLocation) =>
  location.pathname !== RECOVERY_PATH && isRecoveryFlow(location);

export const preserveRecoveryRedirect = (
  location: RecoveryLocation = window.location
) => {
  if (!shouldRedirectToRecovery(location)) return false;

  window.history.replaceState(
    window.history.state,
    "",
    getRecoveryRedirectPath(location)
  );

  return true;
};

export { RECOVERY_PATH };
