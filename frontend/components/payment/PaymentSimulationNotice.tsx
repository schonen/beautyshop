export function PaymentSimulationNotice() {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-body-sm text-body-sm text-amber-800">
      <span className="material-symbols-outlined text-[18px]">info</span>
      <p>
        <strong>Mode simulation.</strong> Aucun paiement réel ne sera effectué ni aucun montant débité.
      </p>
    </div>
  );
}
