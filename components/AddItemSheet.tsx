"use client";
import { useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/shared";
import { COUNTRIES, countryFlag } from "@/lib/countries";

const field =
  "w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-base text-white";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

export default function AddItemSheet({
  categories,
  initialName,
  onClose,
}: {
  categories: Category[];
  initialName: string;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    const artistCategory = categories.find((category) => category.slug === "estrellas");
    if (!name.trim() || !artistCategory || !countryCode) return;
    setLoading(true);
    setError("");
    const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
    const { error: dbError } = await supabase.from("items").insert({
      category_id: artistCategory.id,
      country_code: countryCode,
      name: name.trim().slice(0, 60),
      slug,
      description: description.trim().slice(0, 80) || null,
      status: "pending",
    });
    setLoading(false);
    if (dbError) setError("No se pudo añadir. Inténtalo de nuevo.");
    else setDone(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-xl rounded-t-3xl border-t border-zinc-700 bg-zinc-900 p-5 pb-8 text-white" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xl font-extrabold">Proponer una entrada de Música</div>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-full bg-zinc-800 p-3">
            <FaXmark />
          </button>
        </div>

        <p className="-mt-2 mb-4 text-sm text-zinc-400">La elección actual es para cantantes. Indica el país de origen; revisaremos cada propuesta antes de publicarla.</p>

        {done ? (
          <p className="py-4 text-center">¡Gracias! Revisaremos la propuesta antes de publicarla. 🎉</p>
        ) : (
          <div className="space-y-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              placeholder="Nombre del cantante"
              className={field}
            />
            <label className="block space-y-2 text-sm text-zinc-300">
              <span>País asociado</span>
              <select value={countryCode} onChange={(event) => setCountryCode(event.target.value)} className={field} required>
                <option value="">Selecciona un país</option>
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>{countryFlag(country.code)} {country.name}</option>
                ))}
              </select>
            </label>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={80}
              placeholder="Descripción corta (opcional)"
              className={field}
            />
            {error && <div className="text-rose-400">{error}</div>}
            <button
              onClick={submit}
              disabled={!name.trim() || !countryCode || loading || categories.length === 0}
              className="btn-apoyar w-full rounded-full py-4 text-lg"
            >
              {loading ? "..." : "Enviar propuesta"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
