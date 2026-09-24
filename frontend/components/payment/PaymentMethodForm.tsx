"use client";

import { useState } from "react";
import { PaymentMethod } from "@/types";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { formatPrice } from "@/lib/format";
import { PaymentSimulationNotice } from "./PaymentSimulationNotice";

interface Props {
  amount: number;
  loading: boolean;
  merchantName?: string;
  onSubmit: (payload: Record<string, unknown>) => void;
}

const METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: "ORANGE_MONEY", label: "Orange Money", icon: "phone_iphone" },
  { value: "MTN_MOBILE_MONEY", label: "MTN Mobile Money", icon: "phone_iphone" },
  { value: "CARD", label: "Carte bancaire", icon: "credit_card" },
];

/* ─────────────────── Clavier numérique réutilisable ─────────────────── */

function NumericKeypad({
  onDigit,
  onBackspace,
  theme = "light",
}: {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  theme?: "light" | "dark";
}) {
  const keyStyle =
    theme === "dark"
      ? "bg-neutral-800 text-white hover:bg-neutral-700"
      : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200";
  const backspaceStyle =
    theme === "dark"
      ? "bg-orange-600 text-white hover:bg-orange-500"
      : "bg-orange-100 text-orange-700 hover:bg-orange-200";

  return (
    <div className="grid grid-cols-3 gap-3">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onDigit(d)}
          className={`flex h-14 items-center justify-center rounded-2xl text-xl font-semibold transition-colors ${keyStyle}`}
        >
          {d}
        </button>
      ))}
      <div />
      <button
        type="button"
        onClick={() => onDigit("0")}
        className={`flex h-14 items-center justify-center rounded-2xl text-xl font-semibold transition-colors ${keyStyle}`}
      >
        0
      </button>
      <button
        type="button"
        onClick={onBackspace}
        className={`flex h-14 items-center justify-center rounded-2xl text-lg transition-colors ${backspaceStyle}`}
        aria-label="Effacer"
      >
        ⌫
      </button>
    </div>
  );
}

/* ─────────────────────────── Orange Money ────────────────────────────── */

function OrangeMoneyPayment({
  amount,
  loading,
  merchantName,
  onSubmit,
}: {
  amount: number;
  loading: boolean;
  merchantName: string;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const [step, setStep] = useState<"phone" | "review" | "pin">("phone");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const phoneValid = /^6\d{8}$/.test(phone);

  return (
    <div className="overflow-hidden rounded-3xl border border-orange-200">
      {step === "phone" && (
        <div className="bg-white p-6">
          <h3 className="mb-4 text-lg font-bold text-neutral-900">Transfert Orange Money</h3>
          <p className="mb-2 text-sm text-neutral-500">Destinataire</p>
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
              {merchantName.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-semibold text-neutral-900">{merchantName}</p>
              <p className="text-xs text-neutral-500">Marchand vérifié</p>
            </div>
          </div>
          <p className="mb-2 text-sm text-neutral-500">Votre numéro Orange Money</p>
          <input
            readOnly
            value={phone}
            placeholder="Saisir le numéro de téléphone"
            className="mb-4 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-lg tracking-wide text-neutral-900 outline-none"
          />
          <NumericKeypad
            onDigit={(d) => phone.length < 9 && setPhone(phone + d)}
            onBackspace={() => setPhone(phone.slice(0, -1))}
            theme="light"
          />
          <Button className="mt-5 w-full" disabled={!phoneValid} onClick={() => setStep("review")}>
            Valider
          </Button>
        </div>
      )}

      {step === "review" && (
        <div className="bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-neutral-900">Transfert Orange Money</h3>
            <button onClick={() => setStep("phone")} className="text-neutral-400 hover:text-neutral-600" aria-label="Retour">
              ✕
            </button>
          </div>
          <div className="mb-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs text-neutral-500">Depuis</p>
            <p className="font-semibold text-neutral-900">{phone}</p>
          </div>
          <div className="mb-4 flex justify-center">
            <span className="rounded-full bg-neutral-900 px-4 py-1 text-sm font-semibold text-white">
              ↓ {formatPrice(amount)}
            </span>
          </div>
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                {merchantName.slice(0, 2).toUpperCase()}
              </span>
              <p className="font-semibold text-neutral-900">{merchantName}</p>
            </div>
            <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white">Marchand</span>
          </div>
          <div className="mb-4 flex justify-between border-t border-neutral-100 pt-3 text-sm text-neutral-500">
            <span>Frais de la transaction</span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Offerte</span>
          </div>
          <div className="mb-4 rounded-2xl bg-neutral-50 p-4 text-center">
            <p className="text-xs text-neutral-500">Total</p>
            <p className="text-xl font-bold text-neutral-900">{formatPrice(amount)}</p>
          </div>
          <PaymentSimulationNotice />
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setStep("phone")}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-600"
              aria-label="Retour"
            >
              ←
            </button>
            <Button className="flex-1" onClick={() => setStep("pin")}>
              Confirmer le transfert
            </Button>
          </div>
        </div>
      )}

      {step === "pin" && (
        <div className="bg-neutral-950 p-8 text-center text-white">
          <p className="mb-1 text-sm text-neutral-400">{phone}</p>
          <h3 className="mb-6 text-lg font-semibold">Saisissez votre code secret</h3>
          <div className="mb-6 flex justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={`h-3 w-3 rounded-full ${i < pin.length ? "bg-orange-500" : "border border-neutral-600"}`} />
            ))}
          </div>
          <NumericKeypad
            onDigit={(d) => pin.length < 4 && setPin(pin + d)}
            onBackspace={() => setPin(pin.slice(0, -1))}
            theme="dark"
          />
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep("review")}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 text-white"
              aria-label="Retour"
            >
              ←
            </button>
            <Button
              className="flex-1"
              loading={loading}
              disabled={pin.length !== 4}
              onClick={() => pin.length === 4 && onSubmit({ method: "ORANGE_MONEY", phone })}
            >
              Confirmer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────── MTN MoMo ──────────────────────────────── */

function MtnMoneyPayment({
  amount,
  loading,
  merchantName,
  onSubmit,
}: {
  amount: number;
  loading: boolean;
  merchantName: string;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const [step, setStep] = useState<"form" | "review">("form");
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");
  const phoneValid = /^6\d{8}$/.test(phone);
  const fee = 4;

  return (
    <div className="overflow-hidden rounded-3xl border border-yellow-300 bg-white">
      {step === "form" && (
        <div className="p-6">
          <h3 className="mb-5 text-lg font-bold text-neutral-900">Utilisateur MoMo</h3>
          <div className="mb-5">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-lg">🇨🇲</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                placeholder="Entrez le numéro"
                className="w-full border-none bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-400"
              />
            </div>
            <div className="h-px bg-neutral-200" />
          </div>
          <div className="mb-5">
            <input
              readOnly
              value={formatPrice(amount)}
              className="w-full border-none bg-transparent text-base text-neutral-500 outline-none"
            />
            <div className="h-px bg-neutral-200" />
          </div>
          <div className="mb-8">
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Entrez la référence (optionnel)"
              className="w-full border-none bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-400"
            />
            <div className="h-px bg-neutral-200" />
          </div>
          <Button className="w-full bg-[#003366] hover:bg-[#002850]" disabled={!phoneValid} onClick={() => setStep("review")}>
            Continuer
          </Button>
        </div>
      )}

      {step === "review" && (
        <div className="p-6">
          <h3 className="mb-5 text-lg font-bold text-neutral-900">Confirmer la transaction</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-neutral-500">Nom d'utilisateur MoMo</p>
              <p className="text-base font-bold text-neutral-900">{merchantName}</p>
            </div>
            <div>
              <p className="text-neutral-500">Numéro</p>
              <p className="text-base font-bold text-neutral-900">237{phone}</p>
            </div>
            <div>
              <p className="text-neutral-500">Frais</p>
              <p className="text-base font-bold text-neutral-900">{fee}</p>
            </div>
            <div>
              <p className="text-neutral-500">Montant total</p>
              <p className="text-base font-bold text-neutral-900">{formatPrice(amount)}</p>
            </div>
            {reference && (
              <div>
                <p className="text-neutral-500">Référence</p>
                <p className="text-base font-bold text-neutral-900">{reference}</p>
              </div>
            )}
          </div>
          <div className="my-5">
            <PaymentSimulationNotice />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep("form")}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-600"
              aria-label="Retour"
            >
              ←
            </button>
            <Button
              className="flex-1 bg-[#003366] hover:bg-[#002850]"
              loading={loading}
              onClick={() => onSubmit({ method: "MTN_MOBILE_MONEY", phone })}
            >
              Confirmer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────── Carte ────────────────────────────────── */

function CardPayment({
  amount,
  loading,
  onSubmit,
}: {
  amount: number;
  loading: boolean;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      method: "CARD",
      cardNumber,
      expiryMonth: Number(expiryMonth),
      expiryYear: Number(expiryYear),
      cvv,
      cardHolder,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-surface-container bg-white p-6">
      <h3 className="text-lg font-bold text-neutral-900">Carte bancaire</h3>
      <Input
        label="Numéro de carte"
        icon="credit_card"
        placeholder="4242 4242 4242 4242"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        required
      />
      <div className="grid grid-cols-3 gap-3">
        <Input label="MM" placeholder="12" value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value)} required />
        <Input label="YYYY" placeholder="2028" value={expiryYear} onChange={(e) => setExpiryYear(e.target.value)} required />
        <Input label="CVV" placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value)} required />
      </div>
      <Input label="Nom du titulaire" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} required />
      <PaymentSimulationNotice />
      <Button type="submit" loading={loading} className="w-full">
        Payer {formatPrice(amount)}
      </Button>
    </form>
  );
}

/* ────────────────────────── Composant exporté ─────────────────────────── */

export function PaymentMethodForm({ amount, loading, merchantName = "BeautyShop", onSubmit }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("ORANGE_MONEY");

  return (
    <div className="space-y-space-md">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {METHODS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMethod(m.value)}
            className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-center transition-colors ${
              method === m.value ? "border-primary bg-primary-container/30" : "border-surface-container hover:bg-surface-container-low"
            }`}
          >
            <span className="material-symbols-outlined text-primary">{m.icon}</span>
            <span className="font-label-sm text-label-sm text-on-surface">{m.label}</span>
          </button>
        ))}
      </div>

      {method === "ORANGE_MONEY" && (
        <OrangeMoneyPayment amount={amount} loading={loading} merchantName={merchantName} onSubmit={onSubmit} />
      )}
      {method === "MTN_MOBILE_MONEY" && (
        <MtnMoneyPayment amount={amount} loading={loading} merchantName={merchantName} onSubmit={onSubmit} />
      )}
      {method === "CARD" && <CardPayment amount={amount} loading={loading} onSubmit={onSubmit} />}
    </div>
  );
}