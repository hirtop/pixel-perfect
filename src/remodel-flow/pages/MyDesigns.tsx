import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMyDesigns, softDeleteDesign, type ListItem } from "../persistence/client";

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

export default function MyDesigns() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await listMyDesigns();
      if (!cancelled) {
        setItems(rows);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpen = (id: string) => {
    navigate(`/remodel-flow?design=${id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this design?")) return;
    setDeletingId(id);
    const res = await softDeleteDesign(id);
    setDeletingId(null);
    if (res.ok) {
      setItems((prev) => prev.filter((it) => it.id !== id));
    } else {
      alert(res.error || "Failed to delete");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-semibold text-foreground">My designs</h1>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved designs yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((it) => (
            <li
              key={it.id}
              onClick={() => handleOpen(it.id)}
              className="flex cursor-pointer items-center justify-between gap-4 py-4 hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {it.name?.trim() || "Untitled design"}
                </div>
                <div className="mt-1 truncate text-xs text-muted-foreground">
                  {[it.selected_style, it.selected_tier, it.selected_package_id]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatDate(it.last_active_at)}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => handleDelete(e, it.id)}
                disabled={deletingId === it.id}
                className="shrink-0 text-xs text-muted-foreground hover:text-destructive disabled:opacity-50"
              >
                {deletingId === it.id ? "Deleting…" : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
