import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAllImages } from "../api/images";
import { getImageUrl } from "../api/client";
import type { ImageRecord } from "../types";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllImages("newest")
      .then((res) => setImages(res.images))
      .catch(() => setError("Failed to load your knowledge."))
      .finally(() => setLoading(false));
  }, []);

  // const totalConnections = Math.round(images.reduce((sum, img) => sum + img.connections_count, 0) / 2);
  const uniqueTopics = new Set(images.map((img) => img.filename.split(".")[0])).size;
  const recentImages = images.slice(0, 8);
  const mostConnected = [...images].sort((a, b) => b.connections_count - a.connections_count).slice(0, 4);

  return (
    <div>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          {getGreeting()}, {user?.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-sm text-text-secondary">Your knowledge at a glance.</p>
      </div>

      {/* Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Images captured", value: images.length },
            // { label: "Connections found", value: totalConnections },
            { label: "Topics explored", value: uniqueTopics },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface border border-border rounded-lg px-5 py-4">
              <p className="text-2xl font-semibold tracking-tight mb-0.5">{stat.value}</p>
              <p className="text-[13px] text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-sm text-text-tertiary py-12 text-center">Loading your knowledge…</div>
      )}

      {error && (
        <div className="text-sm text-danger bg-red-50 border border-red-100 rounded-md px-4 py-3 mb-8">
          {error}
        </div>
      )}

      {!loading && !error && images.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-secondary mb-1">Your knowledge starts here.</p>
          <Link
            to="/app/upload"
            className="text-sm text-accent hover:underline no-underline"
          >
            Upload your first image →
          </Link>
        </div>
      )}

      {/* Recently captured */}
      {recentImages.length > 0 && (
        <div className="mb-10">
          <h2 className="text-base font-semibold mb-4 tracking-tight">Recently captured</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {recentImages.map((img) => (
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
                      {img.connections_count} connections
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Most connected */}
      {mostConnected.length > 0 && mostConnected[0].connections_count > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-4 tracking-tight">Most connected</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {mostConnected.map((img) => (
              <Link
                key={img.id}
                to={`/app/images/${img.id}`}
                className="group flex items-center gap-3 bg-surface border border-border rounded-lg p-3 hover:border-border-strong no-underline transition-colors"
              >
                <div className="w-12 h-12 rounded bg-bg-secondary overflow-hidden shrink-0">
                  <img
                    src={getImageUrl(img.filepath)}
                    alt={img.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-text-primary truncate">{img.filename}</p>
                  <p className="text-[11px] text-accent">{img.connections_count} connections</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
