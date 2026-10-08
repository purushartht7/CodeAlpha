# CodeAlpha_LanguageTranslationTool

A web-based Language Translation Tool built as part of the CodeAlpha AI Internship.

## Features
- Text input with source & target language selection
- Auto-detect source language option
- Translation powered by Google Translate (via `deep-translator`, free, no API key)
- Displayed translated text with a copy-friendly code block
- **Optional:** Text-to-speech playback of the translated text (`gTTS`)

## Tech Stack
- Python
- Streamlit (UI)
- deep-translator (translation engine)
- gTTS (text-to-speech)

## How to Run Locally
```bash
pip install -r requirements.txt
streamlit run app.py
```
Then open the local URL Streamlit prints (usually http://localhost:8501).

## How it Works
1. User enters text and selects source/target language.
2. On clicking **Translate**, the app sends the text to Google Translate's
   translation engine through the `deep-translator` library.
3. The translated text is displayed on screen, along with an optional
   audio playback of the translation.

## Project Structure
```
CodeAlpha_LanguageTranslationTool/
├── app.py              # Main Streamlit application
├── requirements.txt    # Python dependencies
└── README.md           # Project documentation
```

## Author
Purusharth Tripathi — CodeAlpha AI Internship
