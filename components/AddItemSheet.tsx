"use client";
import { useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/shared";
 
const field =
  "w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-base text-white";
 
function slugify(s: string) {
  return s
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
  const [categoryId, setCategoryId] = useState<number | "">(
    categories[0]?.id ?? ""
  );
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
 
  async function submit() {
    if (!name.trim() || categoryId === "") return;
    setLoading(true);
    setError("");
    const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
    const { error: dbError } = await supabase.from("items").insert({
      category_id: categoryId,
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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-t-3xl border-t border-zinc-700 bg-zinc-900 p-5 pb-8 text-white"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xl font-extrabold">Añadir un favorito</div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full bg-zinc-800 p-3"
          >
            <FaXmark />
          </button>
        </div>
 
        {done ? (
          <p className="py-4 text-center">
            ¡Gracias! Lo revisaremos y aparecerá muy pronto. 🎉
          </p>
        ) : (
          <div className="space-y-3">
            <input
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              maxLength={60}
              placeholder="Nombre (estrella, país, empresa…)"
              className={field}
            />
            <select
              value={categoryId}
              onChange={(ev) => setCategoryId(Number(ev.target.value))}
              className={field}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
            <input
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              maxLength={80}
              placeholder="Descripción corta (opcional)"
              className={field}
            />
            {error && <div className="text-rose-400">{error}</div>}
            <button
              onClick={submit}
              disabled={!name.trim() || loading}
              className="btn-apoyar w-full rounded-full py-4 text-lg"
            >
              {loading ? "..." : "Enviar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
 