type ToastKind = "success" | "error" | "info";

// A single toast item announces action feedback using the shared accessible toast styles.
export function ToastMessage({ message, kind }: { message: string; kind: ToastKind }) {
  return <div className={`toast-message ${kind}`} role="status">{message}</div>;
}
