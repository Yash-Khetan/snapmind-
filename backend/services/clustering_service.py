from typing import List, Dict, Any

import numpy as np
from sklearn.cluster import DBSCAN

from models.image_model import ImageRecord


def run_dbscan_clustering(
    images: List[ImageRecord],
    eps: float = 0.5,
    min_samples: int = 2,
) -> Dict[str, Any]:
    """
    Run DBSCAN clustering on the embeddings already stored in ImageRecord rows.

    Parameters
    ----------
    images : list[ImageRecord]
        Image records that **already** have valid embeddings.
    eps : float
        DBSCAN neighbourhood radius (cosine distance). Default 0.5.
    min_samples : int
        Minimum cluster size. Default 2.

    Returns
    -------
    dict
        A JSON-serialisable dictionary with cluster results.
    """

    # ── 1. Filter rows that have a usable embedding ──────────────────
    valid_images: List[ImageRecord] = [
        img for img in images
        if img.embeddings is not None and isinstance(img.embeddings, list) and len(img.embeddings) > 0
    ]

    print(f"[Clustering] Valid images with embeddings: {len(valid_images)}")

    if not valid_images:
        return {
            "eps": eps,
            "min_samples": min_samples,
            "total_images": 0,
            "num_clusters": 0,
            "num_noise": 0,
            "clusters": {},
            "noise": [],
        }

    # ── 2. Build the embedding matrix ────────────────────────────────
    embedding_matrix = np.array([img.embeddings for img in valid_images])
    print(f"[Clustering] Embedding matrix shape: {embedding_matrix.shape}")
    print(f"[Clustering] eps={eps}, min_samples={min_samples}")

    # ── 3. Run DBSCAN with cosine distance ───────────────────────────
    dbscan = DBSCAN(eps=eps, min_samples=min_samples, metric="cosine")
    labels = dbscan.fit_predict(embedding_matrix)

    # ── 4. Group results ─────────────────────────────────────────────
    clusters: Dict[str, list] = {}
    noise: List[dict] = []

    for img, label in zip(valid_images, labels):
        entry = {
            "id": img.id,
            "filename": img.filename,
            "filepath": img.filepath,
            "ocr_text": img.ocr_text,
        }

        if label == -1:
            noise.append(entry)
        else:
            cluster_key = str(int(label))
            clusters.setdefault(cluster_key, []).append(entry)

    num_clusters = len(clusters)
    num_noise = len(noise)

    print(f"[Clustering] Number of clusters: {num_clusters}")
    print(f"[Clustering] Number of noise points: {num_noise}")

    return {
        "eps": eps,
        "min_samples": min_samples,
        "total_images": len(valid_images),
        "num_clusters": num_clusters,
        "num_noise": num_noise,
        "clusters": clusters,
        "noise": noise,
    }
