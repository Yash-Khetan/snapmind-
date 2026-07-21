from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import DBSCAN
import numpy as np

model = SentenceTransformer(
    "BAAI/bge-small-en-v1.5"
)

texts = [
    "The cat is sitting on the sofa",
    "A cat is resting on a couch",
    "A kitten is sleeping on the furniture",

    "The stock market crashed today",
    "Stock prices fell sharply today",
    "Investors are worried about the financial markets",

    "I ate pizza for dinner",
]

embeddings = model.encode(texts)

# --------------------------------
# STEP 1: Check cosine similarities
# --------------------------------

similarity_matrix = cosine_similarity(embeddings)

np.set_printoptions(
    precision=3,
    suppress=True
)

print("\nCOSINE SIMILARITY MATRIX")
print(similarity_matrix)


# --------------------------------
# STEP 2: Run DBSCAN
# --------------------------------

# for eps in [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]:

dbscan = DBSCAN(
        eps=0.3,
        min_samples=2,
        metric="cosine"
    )

labels = dbscan.fit_predict(embeddings)
print(f"\neps = 0.2")
print("Labels:", labels)

for text, label in zip(texts, labels):
    print(f"[Cluster {label}] {text}")