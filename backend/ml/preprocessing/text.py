import re
from typing import List

def clean_text(text: str) -> str:
    """Normalizes text: converts to lowercase, strips URLs, trims excessive whitespace"""
    if not text:
        return ""
    t = text.lower()
    # Normalize whitespace
    t = re.sub(r"\s+", " ", t).strip()
    return t

def extract_bow_features(text: str, vocab: List[str]) -> List[float]:
    """Generates normalized bag-of-words / TF feature vectors for lightweight fallback inference"""
    cleaned = clean_text(text)
    words = cleaned.split(" ")
    total_words = max(1, len(words))
    word_counts = {}
    for w in words:
        word_counts[w] = word_counts.get(w, 0) + 1

    return [word_counts.get(term, 0) / total_words for term in vocab]
