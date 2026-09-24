"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth, ApiClientError } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { api } from "@/lib/api";
import { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/Button";

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

const suggestions = [
  "Peau sèche à moins de 10 000 FCFA",
  "Routine anti-imperfections peau grasse",
  "Crème hydratante visage",
  "Soin cheveux crépus abîmés",
];

export default function AssistantPage() {
  const { user, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour 👋 Je suis l'assistant BeautyShop. Décris-moi ce que tu cherches (type de peau, budget) et je te proposerai des produits de notre catalogue.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: text.trim() }]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await api.post<{
        success: boolean;
        data: { reply: string; products: Product[] };
      }>("/ai/chat", { message: text.trim() });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply, products: res.data.products },
      ]);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "L'assistant est momentanément indisponible");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  if (!authLoading && !user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <span className="material-symbols-outlined mb-4 text-[56px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          smart_toy
        </span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Connecte-toi pour discuter avec l'assistant
        </h1>
        <Link href="/connexion" className="mt-6 inline-block">
          <Button>Se connecter</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-3xl flex-col px-6 py-6 lg:px-12">
      {/* En-tête */}
      <div className="mb-4 flex flex-col items-start justify-between gap-3 rounded-2xl border border-surface-container bg-surface-container-lowest p-4 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary-container text-on-primary shadow-md">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">Assistant BeautyShop</h1>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-label-sm text-[11px] font-bold text-emerald-800">
                En ligne
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Recommandations basées sur notre catalogue réel
            </p>
          </div>
        </div>
      </div>

      {/* Suggestions rapides */}
      <div className="mb-2 flex items-center gap-2 overflow-x-auto pb-3">
        <span className="whitespace-nowrap font-label-sm text-xs font-bold uppercase text-outline">
          Idées rapides :
        </span>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="whitespace-nowrap rounded-full border border-surface-container bg-surface-container-lowest px-3 py-1 font-body-sm text-xs text-on-surface shadow-sm transition-colors hover:bg-secondary-fixed"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-surface-container bg-surface-container-low p-4 shadow-inner sm:p-6">
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div key={i} className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    smart_toy
                  </span>
                </div>
              )}

              <div
                className={`max-w-[85%] space-y-3 rounded-2xl p-4 shadow-sm sm:max-w-[75%] ${
                  isUser
                    ? "rounded-tr-sm bg-on-surface text-surface-bright"
                    : "rounded-tl-sm border border-surface-container bg-surface-container-lowest text-on-surface"
                }`}
              >
                <p className="whitespace-pre-wrap font-body-md text-body-md leading-relaxed">{msg.content}</p>

                {msg.products && msg.products.length > 0 && (
                  <div className="space-y-2 border-t border-surface-container pt-2">
                    <span className="block font-label-sm text-xs font-bold uppercase tracking-wider text-primary">
                      Produits recommandés :
                    </span>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {msg.products.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-xl border border-surface-container bg-surface-container-low p-2 transition-colors hover:border-primary"
                        >
                          <Link href={`/produits/${p.id}`} className="min-w-0 flex-1">
                            <p className="truncate font-label-md text-xs font-semibold text-on-surface">{p.name}</p>
                            <p className="text-xs font-bold text-primary">{formatPrice(p.price)}</p>
                          </Link>
                          <button
                            onClick={() => addItem(p, 1)}
                            title="Ajouter au panier"
                            className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm hover:opacity-90"
                          >
                            <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-on-secondary-fixed shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm border border-surface-container bg-surface-container-lowest px-4 py-3">
              <span className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-outline [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-outline [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-outline" />
              </span>
            </div>
          </div>
        )}
        {error && <p className="text-center font-body-sm text-body-sm text-error">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* Champ de saisie */}
      <form onSubmit={handleSubmit} className="relative mt-3 flex items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Décrivez votre peau, un budget ou une routine..."
          className="h-12 w-full rounded-full border border-surface-container bg-surface-container-lowest pl-4 pr-24 font-body-md text-body-md text-on-surface shadow-md outline-none placeholder:text-outline focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm transition-all hover:opacity-95 disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </form>
    </div>
  );
}
