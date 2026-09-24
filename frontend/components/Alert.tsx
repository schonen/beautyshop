export function Alert({ variant = "error", children }: { variant?: "error" | "success" | "info"; children: React.ReactNode }) {
  const styles = {
    error: "bg-red-50 text-red-700 border-red-200",
    success: "bg-green-50 text-green-700 border-green-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  }[variant];

  return <div className={`rounded-xl border px-4 py-3 font-body-md text-body-md ${styles}`}>{children}</div>;
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent ${className}`}
    />
  );
}
