import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { searchImages } from "../api/search";
import { getImageUrl } from "../api/client";
import type { SearchResultItem } from "../types";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await searchImages(query.trim());
      setResults(res.results);
      setSearched(true);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Search</h1>
      <p className="text-sm text-text-secondary mb-8">Find knowledge by concept, topic, or keyword.</p>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">⌕</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your knowledge…"
            className="w-full pl-10 pr-4 py-3 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">Searching…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-danger bg-red-50 border border-red-100 rounded-md px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Empty state before search */}
      {!searched && !loading && (
        <div className="text-center py-12">
          <p className="text-sm text-text-tertiary">
            Search your knowledge to find something you've captured.
          </p>
        </div>
      )}

      {/* No results */}
      {searched && !loading && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-text-secondary mb-1">Nothing closely related yet.</p>
          <p className="text-[13px] text-text-tertiary">Try a different search.</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result) => (
            <Link
              key={result.id}
              to={`/app/images/${result.id}`}
              className="flex items-start gap-4 p-4 bg-surface border border-border rounded-lg hover:border-border-strong no-underline transition-colors group"
            >
              <div className="w-16 h-16 rounded bg-bg-secondary overflow-hidden shrink-0">
                <img
                  src={getImageUrl(result.filepath)}
                  alt={result.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-text-primary group-hover:text-accent transition-colors mb-1">
                  {result.filename}
                </p>
                {result.ocr_text && (
                  <p className="text-[13px] text-text-secondary line-clamp-2 leading-relaxed">
                    {result.ocr_text.slice(0, 200)}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-text-tertiary">
                    {(result.similarity_score * 100).toFixed(0)}% relevant
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
