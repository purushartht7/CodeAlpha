"""
CodeAlpha - Task 1: Chatbot for FAQs
Author: Purusharth Tripathi

A simple FAQ chatbot that matches a user's question to the closest
FAQ using TF-IDF + cosine similarity, and returns the best answer.

Run locally with:
    streamlit run app.py
"""

import os
import re
import streamlit as st
import pandas as pd
import numpy as np

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
except Exception:
    # Built-in NumPy implementation to avoid Windows Application Control policy blocking scipy DLLs
    _STOP_WORDS = {
        'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
        'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
        'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
        'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
        'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
        'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
        'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
        'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
        'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
        'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'you', 'your', 'yours', 'yourself'
    }

    class TfidfVectorizer:
        def __init__(self, stop_words="english"):
            self.stop_words = _STOP_WORDS if stop_words == "english" else set()
            self.vocabulary_ = {}
            self.idf_ = None

        def _tokenize(self, text):
            tokens = re.findall(r"\b\w+\b", str(text).lower())
            return [t for t in tokens if t not in self.stop_words and len(t) > 1]

        def fit_transform(self, documents):
            doc_tokens = [self._tokenize(doc) for doc in documents]
            vocab = sorted(list({token for tokens in doc_tokens for token in tokens}))
            self.vocabulary_ = {term: idx for idx, term in enumerate(vocab)}

            N = len(documents)
            df = np.zeros(len(vocab))
            for tokens in doc_tokens:
                unique_tokens = set(tokens)
                for token in unique_tokens:
                    if token in self.vocabulary_:
                        df[self.vocabulary_[token]] += 1

            self.idf_ = np.log((1.0 + N) / (1.0 + df)) + 1.0

            matrix = np.zeros((N, len(vocab)))
            for i, tokens in enumerate(doc_tokens):
                for token in tokens:
                    if token in self.vocabulary_:
                        matrix[i, self.vocabulary_[token]] += 1
                matrix[i] = matrix[i] * self.idf_
                norm = np.linalg.norm(matrix[i])
                if norm > 0:
                    matrix[i] = matrix[i] / norm
            return matrix

        def transform(self, documents):
            matrix = np.zeros((len(documents), len(self.vocabulary_)))
            for i, doc in enumerate(documents):
                tokens = self._tokenize(doc)
                for token in tokens:
                    if token in self.vocabulary_:
                        matrix[i, self.vocabulary_[token]] += 1
                matrix[i] = matrix[i] * self.idf_
                norm = np.linalg.norm(matrix[i])
                if norm > 0:
                    matrix[i] = matrix[i] / norm
            return matrix

    def cosine_similarity(user_vec, matrix):
        return np.dot(user_vec, matrix.T)

# ---------- Page setup ----------
st.set_page_config(page_title="FAQ Chatbot", page_icon="💬", layout="centered")
st.title("💬 FAQ Chatbot")
st.caption("Ask me anything about the internship process — I'll match it to the closest known FAQ.")

# ---------- Load FAQ data ----------
@st.cache_data
def load_faqs():
    faq_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "faqs.csv")
    return pd.read_csv(faq_path)

faqs = load_faqs()

# ---------- Preprocessing ----------
def clean_text(text: str) -> str:
    """Lowercase, strip punctuation/extra whitespace."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

faqs["clean_question"] = faqs["question"].apply(clean_text)

# ---------- Build the TF-IDF matching model ----------
@st.cache_resource
def build_vectorizer(questions):
    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform(questions)
    return vectorizer, matrix

vectorizer, faq_matrix = build_vectorizer(faqs["clean_question"])

def get_best_answer(user_question: str, threshold: float = 0.25):
    cleaned = clean_text(user_question)
    user_vec = vectorizer.transform([cleaned])
    similarities = cosine_similarity(user_vec, faq_matrix).flatten()
    best_idx = similarities.argmax()
    best_score = similarities[best_idx]

    if best_score < threshold:
        return ("I'm not confident I know the answer to that. "
                "Try rephrasing, or ask something about the CodeAlpha internship process."), best_score
    return faqs.iloc[best_idx]["answer"], best_score

# ---------- Chat UI ----------
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "Hi! Ask me a question about the CodeAlpha internship, and I'll do my best to answer."}
    ]

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])

user_input = st.chat_input("Type your question here...")

if user_input:
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.write(user_input)

    answer, score = get_best_answer(user_input)
    with st.chat_message("assistant"):
        st.write(answer)
        st.caption(f"Match confidence: {score:.2f}")

    st.session_state.messages.append({"role": "assistant", "content": answer})

with st.expander("📋 View all FAQs in the knowledge base"):
    st.dataframe(faqs[["question", "answer"]], hide_index=True, use_container_width=True)

st.divider()
st.caption("Built with Streamlit + scikit-learn (TF-IDF & cosine similarity) · CodeAlpha AI Internship")
