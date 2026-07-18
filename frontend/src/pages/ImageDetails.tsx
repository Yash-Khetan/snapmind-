import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getImage, getConnections } from "../api/images";
import { getImageUrl } from "../api/client";
import type { ImageRecord, ConnectedImage } from "../types";

export default function ImageDetails() {
  const { id } = useParams<{ id: string }>();
  const [image, setImage] = useState<ImageRecord | null>(null);
  const [connections, setConnections] = useState<ConnectedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const imageId = parseInt(id, 10);
    setLoading(true);
    setError("");

    Promise.all([getImage(imageId), getConnections(imageId)])
      .then(([img, conns]) => {
        setImage(img);
        setConnections(conns.connections);
      })
      .catch(() => setError("Failed to load image details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-danger">{error || "Image not found."}</p>
        <Link to="/app/explore" className="text-sm text-accent hover:underline no-underline mt-2 inline-block">
          ← Back to explore
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back */}
      <Link
        to="/app/explore"
        className="text-[13px] text-text-tertiary hover:text-text-secondary no-underline mb-6 inline-block"
      >
        ← Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Image */}
        <div className="lg:col-span-3">
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <img
              src={getImageUrl(image.filepath)}
              alt={image.filename}
              className="w-full h-auto block"
            />
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          <h1 className="text-xl font-semibold tracking-tight mb-4">{image.filename}</h1>

          <div className="space-y-4 mb-8">
            <div>
              <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-1">
                Uploaded
              </p>
              <p className="text-sm text-text-secondary">
                {new Date(image.uploaded_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-1">
                Connections
              </p>
              <p className="text-sm text-text-secondary">{image.connections_count}</p>
            </div>
            {image.ocr_text && (
              <div>
                <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-1">
                  Extracted text
                </p>
                <p className="text-[13px] text-text-secondary leading-relaxed bg-bg-secondary rounded-md p-3 max-h-48 overflow-y-auto">
                  {image.ocr_text}
                </p>
              </div>
            )}
          </div>

          {/* Related knowledge */}
          {connections.length > 0 && (
            <div>
              <h2 className="text-base font-semibold tracking-tight mb-3">Related knowledge</h2>
              <div className="space-y-2">
                {connections.map((conn) => (
                  <Link
                    key={conn.image_id}
                    to={`/app/images/${conn.image_id}`}
                    className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-border-strong no-underline transition-colors group"
                  >
                    <div className="w-12 h-12 rounded bg-bg-secondary overflow-hidden shrink-0">
                      <img
                        src={getImageUrl(conn.filepath)}
                        alt={conn.filename}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-text-primary group-hover:text-accent transition-colors truncate">
                        {conn.filename}
                      </p>
                      <p className="text-[11px] text-text-tertiary">Related to this image</p>
                    </div>
                    <span className="text-[11px] text-text-tertiary shrink-0">
                      {(conn.similarity_score * 100).toFixed(0)}%
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {connections.length === 0 && (
            <div>
              <h2 className="text-base font-semibold tracking-tight mb-2">Related knowledge</h2>
              <p className="text-[13px] text-text-tertiary">
                No connections yet. Upload more images to discover relationships.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
