import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllImages } from "../api/images";
import { getImageUrl } from "../api/client";
import type { ImageRecord } from "../types";

export default function Explore() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<"newest" | "connections">("newest");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    getAllImages(sort)
      .then((res) => setImages(res.images))
      .catch(() => setError("Failed to load images."))
      .finally(() => setLoading(false));
  }, [sort]);

  const filtered = filter
    ? images.filter(
        (img) =>
          img.filename.toLowerCase().includes(filter.toLowerCase()) ||
          img.ocr_text?.toLowerCase().includes(filter.toLowerCase())
      )
    : images;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Explore</h1>
          <p className="text-sm text-text-secondary">Browse your knowledge library.</p>
        </div>
        <Link
          to="/app/upload"
          className="text-[13px] font-medium bg-text-primary text-white px-4 py-2 rounded-md hover:opacity-90 no-underline"
        >
          + Upload
        </Link>
      </div>

      {/* Filter & sort */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter images…"
          className="flex-1 max-w-xs px-3 py-2 text-sm border border-border rounded-md bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
        <div className="flex items-center gap-1 bg-surface border border-border rounded-md overflow-hidden">
          <button
            onClick={() => setSort("newest")}
            className={`px-3 py-1.5 text-[12px] font-medium cursor-pointer border-none transition-colors ${
              sort === "newest"
                ? "bg-accent-light text-accent"
                : "bg-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSort("connections")}
            className={`px-3 py-1.5 text-[12px] font-medium cursor-pointer border-none transition-colors ${
              sort === "connections"
                ? "bg-accent-light text-accent"
                : "bg-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Most connected
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">Loading images…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-danger bg-red-50 border border-red-100 rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && images.length === 0 && (
        <div className="text-center py-20">
          <p className="text-sm text-text-secondary mb-1">Your knowledge starts here.</p>
          <Link to="/app/upload" className="text-sm text-accent hover:underline no-underline">
            Upload your first image →
          </Link>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((img) => (
            <Link
              key={img.id}
              to={`/app/images/${img.id}`}
              className="group block bg-surface border border-border rounded-lg overflow-hidden hover:border-border-strong no-underline transition-colors"
            >
              <div className="aspect-square bg-bg-secondary overflow-hidden">
                <img
                  src={getImageUrl(img.filepath)}
                  alt={img.filename}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                  loading="lazy"
                />
              </div>
              <div className="px-3 py-2.5">
                <p className="text-[13px] font-medium text-text-primary truncate">{img.filename}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-text-tertiary">
                    {new Date(img.uploaded_at).toLocaleDateString()}
                  </span>
                  <span className="text-[11px] text-text-tertiary">
                    {img.connections_count} conn.
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Filtered empty */}
      {!loading && filtered.length === 0 && images.length > 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-text-tertiary">No images match your filter.</p>
        </div>
      )}
    </div>
  );
}
