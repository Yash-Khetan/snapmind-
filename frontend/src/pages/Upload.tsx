import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { uploadMultipleImages } from "../api/images";
import type { UploadResult } from "../types";

type UploadState = "idle" | "selected" | "processing" | "done" | "error";

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<UploadState>("idle");
  const [results, setResults] = useState<UploadResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;
    setFiles((prev) => [...prev, ...arr]);
    setState("selected");
    setErrorMsg("");
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        addFiles(e.target.files);
      }
    },
    [addFiles]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setState("idle");
      return next;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setState("processing");
    setErrorMsg("");
    try {
      const res = await uploadMultipleImages(files);
      setResults(res);
      setState("done");
    } catch {
      setErrorMsg("Something went wrong while processing these images. Try again.");
      setState("error");
    }
  };

  const reset = () => {
    setFiles([]);
    setResults([]);
    setState("idle");
    setErrorMsg("");
  };

  const totalConnections = results.reduce((sum, r) => sum + r.connections_created, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Upload</h1>
      <p className="text-sm text-text-secondary mb-8">Add images to your knowledge base.</p>

      {/* Drop zone */}
      {(state === "idle" || state === "selected") && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-accent bg-accent-light"
                : "border-border hover:border-border-strong bg-surface"
            }`}
          >
            <p className="text-text-secondary text-sm mb-2">Drop images here</p>
            <p className="text-text-tertiary text-[13px]">or</p>
            <button className="mt-2 text-sm text-accent font-medium bg-transparent border-none cursor-pointer">
              Browse files
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Selected files */}
          {files.length > 0 && (
            <div className="mt-6">
              <p className="text-[13px] font-medium text-text-secondary mb-3">
                {files.length} image{files.length !== 1 ? "s" : ""} selected
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-6">
                {files.map((file, i) => (
                  <div key={i} className="relative group aspect-square rounded-md overflow-hidden bg-bg-secondary border border-border">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-text-primary/70 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleUpload}
                className="bg-text-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 cursor-pointer border-none"
              >
                Process images
              </button>
            </div>
          )}
        </>
      )}

      {/* Processing */}
      {state === "processing" && (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-secondary">Processing your knowledge…</p>
          <p className="text-[13px] text-text-tertiary mt-1">
            {files.length} image{files.length !== 1 ? "s" : ""} being analyzed
          </p>
        </div>
      )}

      {/* Done */}
      {state === "done" && (
        <div className="text-center py-20">
          <div className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
            <span className="text-success text-lg">✓</span>
          </div>
          <p className="text-base font-semibold mb-1">
            {results.length} image{results.length !== 1 ? "s" : ""} processed
          </p>
          <p className="text-sm text-text-secondary mb-6">
            {totalConnections} connection{totalConnections !== 1 ? "s" : ""} discovered
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/app/explore"
              className="bg-text-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 no-underline"
            >
              Explore connections
            </Link>
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-md text-sm font-medium text-text-secondary border border-border hover:bg-bg-secondary cursor-pointer bg-transparent"
            >
              Upload more
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div className="text-center py-20">
          <p className="text-sm text-danger mb-4">{errorMsg}</p>
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-md text-sm font-medium text-text-secondary border border-border hover:bg-bg-secondary cursor-pointer bg-transparent"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
