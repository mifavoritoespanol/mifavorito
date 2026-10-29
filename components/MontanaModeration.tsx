"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import type { Category, Item } from "@/lib/shared";
import { COUNTRIES, countryFlag, countryName } from "@/lib/countries";

type Proposal = {
  id: string;
  name: string;
  country_code?: string | null;
  wikipedia_url?: string | null;
  info_summary?: string | null;
  created_at?: string | null;
};

type AdminCategory = Category & { sort?: number | null };
type AdminItem = Item & {
  status: "pending" | "approved" | "rejected";
  country_code: string | null;
  wikipedia_url?: string | null;
  created_at?: string | null;
};
type AdminSession = { access_token: string; user: { email?: string } };
type Panel = "proposals" | "manage";

const inputClass = "w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-amber-200/60 focus:outline-none";

function statusLabel(status: AdminItem["status"]) {
  if (status === "approved") return "Visible";
  if (status === "pending") return "Pendiente";
  return "Oculta";
}

export default function MontanaModeration() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [panel, setPanel] = useState<Panel>("proposals");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [manageLoading, setManageLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [wikipediaUrl, setWikipediaUrl] = useState("");
  const [description, setDescription] = useState("");

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

  const loadManagement = useCallback(async (accessToken: string) => {
    setManageLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/manage", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudieron cargar las categorías.");
      setCategories(result.categories ?? []);
      setItems(result.items ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al cargar las categorías.");
    } finally {
      setManageLoading(false);
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
      if (next) {
        if (panel === "proposals") void loadProposals(next.access_token);
        else void loadManagement(next.access_token);
      } else {
        setProposals([]);
        setCategories([]);
        setItems([]);
        setSelectedCategoryId(null);
        setLoading(false);
      }
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, [loadManagement, loadProposals, panel]);

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId) ?? null;
  const categoryItems = useMemo(
    () => items.filter((item) => item.category_id === selectedCategoryId),
    [items, selectedCategoryId],
  );

  function openManagement() {
    setPanel("manage");
    setSelectedCategoryId(null);
    if (session) void loadManagement(session.access_token);
  }

  async function decideProposal(proposal: Proposal, status: "approved" | "rejected") {
    if (!session) return;
    setBusy(proposal.id);
    setMessage("");
    try {
      const response = await fetch("/api/admin/proposals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: proposal.id, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo guardar la decisión.");
      setProposals((current) => current.filter((item) => item.id !== proposal.id));
      setItems((current) => current.map((item) => item.id === Number(proposal.id) ? { ...item, status } : item));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al guardar la decisión.");
    } finally {
      setBusy(null);
    }
  }

  async function addOption(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !selectedCategory) return;
    setBusy("new");
    setMessage("");
    try {
      const response = await fetch("/api/admin/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          categoryId: selectedCategory.id,
          name,
          countryCode,
          wikipediaUrl,
          description,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo añadir la opción.");
      setItems((current) => [...current, result.item].sort((a, b) => a.name.localeCompare(b.name, "es")));
      setName("");
      setCountryCode("");
      setWikipediaUrl("");
      setDescription("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al añadir la opción.");
    } finally {
      setBusy(null);
    }
  }

  async function changeItemStatus(item: AdminItem, status: "approved" | "rejected") {
    if (!session) return;
    if (item.status === "approved" && status === "rejected" &&
        !window.confirm(`¿Ocultar «${item.name}» del ranking público? Se conservarán sus apoyos y podrás volver a mostrarla.`)) return;

    setBusy(String(item.id));
    setMessage("");
    try {
      const response = await fetch("/api/admin/manage", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: item.id, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo actualizar la opción.");
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status } : entry));
      if (status === "approved") {
        setProposals((current) => current.filter((entry) => Number(entry.id) !== item.id));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al actualizar la opción.");
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

  const tabs = (
    <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
      <button onClick={() => { setPanel("proposals"); if (session) void loadProposals(session.access_token); }} className={`rounded-full px-4 py-2 text-sm font-bold ${panel === "proposals" ? "bg-white text-zinc-950" : "border border-white/15 text-white"}`}>
        Propuestas pendientes
      </button>
      <button onClick={openManagement} className={`rounded-full px-4 py-2 text-sm font-bold ${panel === "manage" ? "bg-white text-zinc-950" : "border border-white/15 text-white"}`}>
        Administrar rondas
      </button>
    </div>
  );

  return (
    <main className="mx-auto max-w-4xl space-y-5 px-4 pb-20 pt-10">
      <section className="rounded-3xl border border-white/10 bg-zinc-950/85 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/75">Área privada</p>
        <h1 className="mt-2 text-3xl font-black text-white">Administración de mifavorito</h1>
        <p className="mt-2 text-sm text-zinc-400">Revisa propuestas y administra categorías y opciones aunque la ronda pública esté cerrada.</p>
        {!session ? (
          <button onClick={() => void signIn()} className="btn-apoyar mt-5 rounded-full px-5 py-3 font-bold">Entrar con Google</button>
        ) : (
          <>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-300">Sesión: {session.user.email}</p>
              <div className="flex gap-2">
                <button onClick={() => panel === "proposals" ? void loadProposals(session.access_token) : void loadManagement(session.access_token)} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white">Actualizar</button>
                <button onClick={() => void supabase.auth.signOut()} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white">Salir</button>
              </div>
            </div>
            {tabs}
          </>
        )}
      </section>

      {message && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-100">{message}</p>}

      {session && panel === "proposals" && (
        loading ? <p className="text-sm text-zinc-400">Cargando propuestas…</p> : proposals.length === 0 ? (
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
                    <button disabled={busy === proposal.id} onClick={() => void decideProposal(proposal, "approved")} className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Aprobar</button>
                    <button disabled={busy === proposal.id} onClick={() => void decideProposal(proposal, "rejected")} className="rounded-full bg-red-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Rechazar</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )
      )}

      {session && panel === "manage" && (
        manageLoading ? <p className="text-sm text-zinc-400">Cargando categorías…</p> : selectedCategory ? (
          <section className="space-y-4">
            <button onClick={() => setSelectedCategoryId(null)} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white">← Todas las rondas</button>
            <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-200/75">Administración sin bloqueo público</p>
              <h2 className="mt-1 text-2xl font-extrabold text-white">{selectedCategory.emoji} {selectedCategory.name}</h2>
              <p className="mt-1 text-sm text-zinc-400">Slug: {selectedCategory.slug} · Las modificaciones se aplican al ranking público.</p>
            </div>

            <form onSubmit={(event) => void addOption(event)} className="space-y-3 rounded-2xl border border-white/10 bg-zinc-950/80 p-5">
              <h3 className="text-lg font-bold text-white">Añadir opción aprobada</h3>
              <p className="text-sm leading-6 text-zinc-400">Se publicará directamente en esta categoría. Indica país y enlace Wikipedia para mantener las fichas coherentes y evitar duplicados.</p>
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} placeholder="Nombre de la opción" className={inputClass} required />
              <select value={countryCode} onChange={(event) => setCountryCode(event.target.value)} className={inputClass} required>
                <option value="">Selecciona un país</option>
                {COUNTRIES.map((country) => <option key={country.code} value={country.code}>{countryFlag(country.code)} {country.name}</option>)}
              </select>
              <input type="url" value={wikipediaUrl} onChange={(event) => setWikipediaUrl(event.target.value)} maxLength={500} placeholder="https://es.wikipedia.org/wiki/..." className={inputClass} required />
              <input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={80} placeholder="Descripción corta (opcional)" className={inputClass} />
              <button disabled={busy === "new" || !name.trim() || !countryCode || !wikipediaUrl.trim()} className="btn-apoyar rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-50">
                {busy === "new" ? "Añadiendo…" : "Añadir al ranking"}
              </button>
            </form>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h3 className="text-lg font-bold text-white">Opciones de {selectedCategory.name}</h3>
                <p className="text-xs text-zinc-400">{categoryItems.length} en total · {categoryItems.filter((item) => item.status === "approved").length} visibles</p>
              </div>
              {categoryItems.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-400">Esta categoría todavía no tiene opciones.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {categoryItems.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-sm text-white">{item.name}</strong>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${item.status === "approved" ? "bg-emerald-400/10 text-emerald-200" : item.status === "pending" ? "bg-amber-300/10 text-amber-200" : "bg-zinc-700 text-zinc-300"}`}>{statusLabel(item.status)}</span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-400">{item.country_code ? `${countryFlag(item.country_code)} ${countryName(item.country_code)}` : "Sin país"} · ${Math.round(item.total_cents / 100).toLocaleString("es-ES")} votos</p>
                        {item.wikipedia_url && <a href={item.wikipedia_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-sky-300 underline">Wikipedia</a>}
                      </div>
                      <div className="flex gap-2">
                        {item.status === "approved" ? (
                          <button disabled={busy === String(item.id)} onClick={() => void changeItemStatus(item, "rejected")} className="rounded-full border border-red-300/25 px-3 py-2 text-xs font-bold text-red-200 disabled:opacity-50">Ocultar</button>
                        ) : (
                          <>
                            <button disabled={busy === String(item.id)} onClick={() => void changeItemStatus(item, "approved")} className="rounded-full border border-emerald-300/25 px-3 py-2 text-xs font-bold text-emerald-200 disabled:opacity-50">{item.status === "pending" ? "Aprobar" : "Mostrar"}</button>
                            {item.status === "pending" && <button disabled={busy === String(item.id)} onClick={() => void changeItemStatus(item, "rejected")} className="rounded-full border border-red-300/25 px-3 py-2 text-xs font-bold text-red-200 disabled:opacity-50">Rechazar</button>}
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5">
            <h2 className="text-xl font-extrabold text-white">Todas las categorías</h2>
            <p className="mt-1 text-sm text-zinc-400">Elige una categoría; el calendario público no limita este panel.</p>
            {categories.length === 0 ? <p className="mt-4 text-sm text-zinc-400">No hay categorías registradas.</p> : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {categories.map((category) => {
                  const categoryRows = items.filter((item) => item.category_id === category.id);
                  const visible = categoryRows.filter((item) => item.status === "approved").length;
                  const pending = categoryRows.filter((item) => item.status === "pending").length;
                  return (
                    <li key={category.id}>
                      <button onClick={() => setSelectedCategoryId(category.id)} className="w-full rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-white/25 hover:bg-white/[0.07]">
                        <span className="flex items-center justify-between gap-2">
                          <strong className="text-base text-white">{category.emoji} {category.name}</strong>
                          <span className="text-zinc-400">→</span>
                        </span>
                        <span className="mt-2 block text-xs text-zinc-400">{visible} visibles · {pending} pendientes · {categoryRows.length - visible - pending} ocultas</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )
      )}
    </main>
  );
}
