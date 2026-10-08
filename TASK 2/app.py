"""
CodeAlpha - Task 2: Language Translation Tool
Author: Purusharth Tripathi

A simple, working web app that lets a user type text, pick a source
and target language, and get an instant translation.

Run locally with:
    streamlit run app.py
"""

import streamlit as st
import requests
from deep_translator import GoogleTranslator
from gtts import gTTS
import io

# ---------- Page setup ----------
st.set_page_config(page_title="AI Language Translator", page_icon="🌐", layout="centered")

st.title("🌐 AI Language Translation Tool")
st.caption("Type text, choose your languages, and translate instantly.")

# ---------- Supported languages ----------
# deep_translator gives us a live dict of {language_name: language_code}
LANGUAGES = GoogleTranslator().get_supported_languages(as_dict=True)
LANGUAGE_NAMES = sorted(LANGUAGES.keys())

def translate_text(text: str, src: str, tgt: str) -> str:
    """Translates text using GoogleTranslator with resilient API fallback."""
    try:
        return GoogleTranslator(source=src, target=tgt).translate(text)
    except Exception:
        url = "https://translate.googleapis.com/translate_a/single"
        params = {"client": "gtx", "sl": src, "tl": tgt, "dt": "t", "q": text}
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return "".join(part[0] for part in data[0] if part and part[0])

# ---------- UI: input + language selection ----------
col1, col2 = st.columns(2)
with col1:
    source_lang = st.selectbox("Translate from", ["auto (detect)"] + LANGUAGE_NAMES, index=0)
with col2:
    target_lang = st.selectbox("Translate to", LANGUAGE_NAMES,
                                index=LANGUAGE_NAMES.index("english") if "english" in LANGUAGE_NAMES else 0)

input_text = st.text_area("Enter text to translate", height=150, placeholder="Type or paste text here...")

translate_clicked = st.button("Translate 🔄", type="primary")

# ---------- Translation logic ----------
if translate_clicked:
    if not input_text.strip():
        st.warning("Please enter some text first.")
    else:
        try:
            src_code = "auto" if source_lang == "auto (detect)" else LANGUAGES[source_lang]
            tgt_code = LANGUAGES[target_lang]

            translated_text = translate_text(input_text, src_code, tgt_code)

            st.subheader("Translated Text")
            st.success(translated_text)

            # Optional feature 1: Copy button (Streamlit auto-adds a copy icon on code blocks)
            st.code(translated_text, language=None)

            # Optional feature 2: Text-to-speech playback
            try:
                tts = gTTS(text=translated_text, lang=tgt_code)
                audio_bytes = io.BytesIO()
                tts.write_to_fp(audio_bytes)
                audio_bytes.seek(0)
                st.audio(audio_bytes, format="audio/mp3")
            except Exception:
                st.info("🔊 Audio playback isn't available for this language.")

        except Exception as e:
            st.error(f"Translation failed: {e}")

st.divider()
st.caption("Built with Streamlit + deep-translator (free, no API key needed) · CodeAlpha AI Internship")
