"""
RAG Store — Vector indexing and retrieval over fitness biomechanics research corpus.
Uses FAISS index with sentence embeddings (via sentence-transformers or Ollama) over
the research abstracts stored in data/research_corpus/.
Includes fallback TF-IDF vector search for environment resiliency.
"""

import math
import os
import re
from pathlib import Path
from typing import List, Tuple, Union, Optional

# Optional imports for FAISS and SentenceTransformers
try:
    import faiss
    import numpy as np
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    np = None

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

_CORPUS_DIR = Path(__file__).resolve().parent.parent / "data" / "research_corpus"


class RAGStore:
    def __init__(self, corpus_dir: Path = _CORPUS_DIR):
        self.corpus_dir = corpus_dir
        self.documents: List[dict] = []
        self.use_faiss = False
        self.faiss_index = None
        self.embeddings_matrix = None
        self.embedder = None
        
        # TF-IDF Fallback structures
        self.vocab: set[str] = set()
        self.idf: dict[str, float] = {}
        self.tfidf_vectors: List[dict[str, float]] = []

        self.load_corpus()
        self._init_index()

    def _tokenize(self, text: str) -> List[str]:
        """Simple lowercase word tokenizer for fallback searching."""
        return re.findall(r"\b[a-z0-9]+\b", text.lower())

    def load_corpus(self):
        """Load text files from corpus directory."""
        self.documents = []
        if not self.corpus_dir.exists():
            return

        for file_path in sorted(self.corpus_dir.glob("*.txt")):
            content = file_path.read_text(encoding="utf-8").strip()
            if content:
                self.documents.append({
                    "filename": file_path.name,
                    "content": content,
                    "tokens": self._tokenize(content)
                })

        if not self.documents:
            return

        # Prepare TF-IDF structures as fallback
        num_docs = len(self.documents)
        doc_freq: dict[str, int] = {}
        for doc in self.documents:
            for token in set(doc["tokens"]):
                doc_freq[token] = doc_freq.get(token, 0) + 1

        self.idf = {
            token: math.log((num_docs + 1) / (freq + 1)) + 1
            for token, freq in doc_freq.items()
        }
        self.vocab = set(self.idf.keys())

        self.tfidf_vectors = []
        for doc in self.documents:
            self.tfidf_vectors.append(self._vectorize_tfidf(doc["tokens"]))

    def _init_index(self):
        """Initialize FAISS index using SentenceTransformers if available."""
        if not self.documents:
            return

        if FAISS_AVAILABLE and SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                # Load lightweight local sentence embedding model
                model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
                self.embedder = SentenceTransformer(model_name)
                
                doc_texts = [d["content"] for d in self.documents]
                raw_embeddings = self.embedder.encode(doc_texts, show_progress_bar=False)
                
                # Normalize embeddings for Cosine Similarity via Inner Product in FAISS
                embeddings = np.array(raw_embeddings, dtype=np.float32)
                faiss.normalize_L2(embeddings)
                
                dimension = embeddings.shape[1]
                self.faiss_index = faiss.IndexFlatIP(dimension)
                self.faiss_index.add(embeddings)
                self.embeddings_matrix = embeddings
                self.use_faiss = True
                print(f"[Flexion RAG] Initialized FAISS index with {len(self.documents)} documents (dim={dimension}).")
                return
            except Exception as e:
                print(f"[Flexion RAG] SentenceTransformers/FAISS init failed ({e}), falling back to TF-IDF vector index.")

        print("[Flexion RAG] FAISS/SentenceTransformers not active. Using TF-IDF vector store.")

    def _vectorize_tfidf(self, tokens: List[str]) -> dict[str, float]:
        """Compute normalized TF-IDF vector for token list."""
        tf: dict[str, int] = {}
        for token in tokens:
            tf[token] = tf.get(token, 0) + 1

        vec: dict[str, float] = {}
        norm_sq = 0.0
        for token, count in tf.items():
            if token in self.idf:
                val = (1 + math.log(count)) * self.idf[token]
                vec[token] = val
                norm_sq += val * val

        norm = math.sqrt(norm_sq) if norm_sq > 0 else 1.0
        return {k: v / norm for k, v in vec.items()}

    def _cosine_similarity_tfidf(self, vec_a: dict[str, float], vec_b: dict[str, float]) -> float:
        """Compute cosine similarity between two unit TF-IDF vectors."""
        dot = 0.0
        if len(vec_a) > len(vec_b):
            vec_a, vec_b = vec_b, vec_a
        for token, val in vec_a.items():
            if token in vec_b:
                dot += val * vec_b[token]
        return dot

    def query(self, query_text: str, top_k: int = 1) -> List[Tuple[dict, float]]:
        """Retrieve top_k documents matching the query using FAISS or TF-IDF fallback."""
        if not self.documents:
            return []

        # 1. FAISS Search Path
        if self.use_faiss and self.faiss_index is not None and self.embedder is not None:
            try:
                q_emb = self.embedder.encode([query_text], show_progress_bar=False)
                q_vec = np.array(q_emb, dtype=np.float32)
                faiss.normalize_L2(q_vec)
                
                scores, indices = self.faiss_index.search(q_vec, k=min(top_k, len(self.documents)))
                results = []
                for score, idx in zip(scores[0], indices[0]):
                    if idx >= 0 and idx < len(self.documents):
                        results.append((self.documents[idx], float(score)))
                return results
            except Exception as exc:
                print(f"[Flexion RAG] FAISS query search error ({exc}), switching to TF-IDF search.")

        # 2. TF-IDF Fallback Path
        q_tokens = self._tokenize(query_text)
        q_vec = self._vectorize_tfidf(q_tokens)

        scores = []
        for idx, doc_vec in enumerate(self.tfidf_vectors):
            sim = self._cosine_similarity_tfidf(q_vec, doc_vec)
            scores.append((self.documents[idx], sim))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]


# Global store singleton instance
_rag_store = RAGStore()


def retrieve_research_snippet(
    exercise: str = "",
    deviations: Union[list[dict], str, None] = None
) -> str:
    """
    Construct a query from exercise name and form deviation(s),
    and return the best matching research abstract snippet from the FAISS RAG index.
    """
    query_parts = []
    if exercise:
        query_parts.append(str(exercise))

    if isinstance(deviations, str):
        query_parts.append(deviations)
    elif isinstance(deviations, list):
        for d in deviations:
            if isinstance(d, dict):
                query_parts.append(d.get("joint", ""))
                query_parts.append(d.get("issue", "").replace("_", " "))
                query_parts.append(d.get("detail", ""))

    query_str = " ".join(query_parts).strip()
    if not query_str:
        query_str = "exercise biomechanics form stability joint alignment"

    results = _rag_store.query(query_str, top_k=1)
    if results and len(results) > 0:
        return results[0][0]["content"]

    return _rag_store.documents[0]["content"] if _rag_store.documents else ""
