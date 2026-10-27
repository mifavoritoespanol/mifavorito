"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Proposal = {
  id: string;
  name: string;
  country_code?: string | null;
  wikipedia_url?: string | null;
  info_summary?: string | null;
  created_at?: string | null;
};

type AdminSession = { access_token: string; user: { email?: string } };

export default function MontanaModeration() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const loadProposals = useCallback(async (accessToken: string) => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/proposals", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudieron cargar las propuestas.");
      setProposals(result.proposals ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al cargar las propuestas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      const next = data.session;
      setSession(next ? { access_token: next.access_token, user: next.user } : null);
      if (next) void loadProposals(next.access_token);
      else setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next ? { access_token: next.access_token, user: next.user } : null);
      if (next) void loadProposals(next.access_token);
      else { setProposals([]); setLoading(false); }
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, [loadProposals]);

  async function decide(proposal: Proposal, status: "approved" | "rejected") {
    if (!session) return;
    setBusy(proposal.id);
    setMessage("");
    try {
      const response = await fetch("/api/admin/proposals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ id: proposal.id, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo guardar la decisión.");
      setProposals((current) => current.filter((item) => item.id !== proposal.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al guardar la decisión.");
    } finally {
      setBusy(null);
    }
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/montana` },
    });
    if (error) setMessage(error.message);
  }

  return (
    <main className="mx-auto max-w-4xl space-y-5 px-4 pb-20 pt-10">
      <section className="rounded-3xl border border-white/10 bg-zinc-950/85 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/75">Área privada</p>
        <h1 className="mt-2 text-3xl font-black text-white">Revisión de propuestas</h1>
        <p className="mt-2 text-sm text-zinc-400">Solo la cuenta Google autorizada puede consultar o decidir sobre propuestas.</p>
        {!session ? (
          <button onClick={() => void signIn()} className="btn-apoyar mt-5 rounded-full px-5 py-3 font-bold">Entrar con Google</button>
        ) : (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-300">Sesión: {session.user.email}</p>
            <div className="flex gap-2">
              <button onClick={() => void loadProposals(session.access_token)} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white">Actualizar</button>
              <button onClick={() => void supabase.auth.signOut()} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white">Salir</button>
            </div>
          </div>
        )}
      </section>
      {message && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-100">{message}</p>}
      {session && (loading ? <p className="text-sm text-zinc-400">Cargando propuestas…</p> : proposals.length === 0 ? (
        <section className="rounded-2xl border border-white/10 bg-zinc-950/75 p-6 text-zinc-300">No hay propuestas pendientes.</section>
      ) : (
        <ul className="space-y-3">
          {proposals.map((proposal) => (
            <li key={proposal.id} className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-white">{proposal.name}</h2>
                  <p className="mt-1 text-sm text-zinc-400">País: {proposal.country_code || "Sin especificar"}</p>
                  {proposal.wikipedia_url && <a className="mt-2 inline-block text-sm text-sky-300 underline" href={proposal.wikipedia_url} target="_blank" rel="noreferrer">Revisar Wikipedia</a>}
                  {proposal.info_summary && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{proposal.info_summary}</p>}
                  {proposal.created_at && <p className="mt-3 text-xs text-zinc-500">Recibida: {new Date(proposal.created_at).toLocaleString("es-ES")}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button disabled={busy === proposal.id} onClick={() => void decide(proposal, "approved")} className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Aprobar</button>
                  <button disabled={busy === proposal.id} onClick={() => void decide(proposal, "rejected")} className="rounded-full bg-red-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Rechazar</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ))}
    </main>
  );
}
