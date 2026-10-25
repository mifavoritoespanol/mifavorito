"use client";
import { useState } from "react";
 
export default function Avatar({
  item,
  size = 48,
}: {
  item: { name: string; image_url: string | null };
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const initials = item.name
    .replace(/[()]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const box = { width: size, height: size };
 
  if (item.image_url && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.image_url}
        alt={item.name}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setFailed(true)}
        className="shrink-0 rounded-full object-cover shadow"
        style={{ ...box, background: "#fff" }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-extrabold text-black/70 shadow"
      style={{
        ...box,
        fontSize: size * 0.36,
        background: "linear-gradient(135deg,#ffd6a5,#ffadad 55%,#cdb4ff)",
      }}
    >
      {initials}
    </div>
  );
}
 