# CodeAlpha_FAQChatBot

A simple, working FAQ chatbot built as part of the CodeAlpha AI Internship.

## Features
- Pre-loaded FAQ knowledge base (`faqs.csv`) — easy to expand
- Text preprocessing (lowercasing, punctuation removal)
- Matches user questions to the closest FAQ using **TF-IDF + cosine similarity**
- Returns the best-matching answer with a confidence score
- **Optional:** Full chat-style UI built with Streamlit's chat components

## Tech Stack
- Python
- Streamlit (chat UI)
- scikit-learn (TF-IDF vectorization + cosine similarity)
- pandas (FAQ data handling)

## How to Run Locally
```bash
pip install -r requirements.txt
streamlit run app.py
```
Then open the local URL Streamlit prints (usually http://localhost:8501).

## How it Works
1. All FAQ questions are cleaned and converted into TF-IDF vectors.
2. When a user asks a question, it's cleaned and converted into the same
   vector space.
3. Cosine similarity is calculated between the user's question and every
   FAQ question.
4. The FAQ with the highest similarity score is returned as the answer
   (if the score passes a minimum confidence threshold).

## Project Structure
```
CodeAlpha_FAQChatBot/
├── app.py              # Main Streamlit chatbot application
├── faqs.csv            # FAQ knowledge base (question, answer)
├── requirements.txt    # Python dependencies
└── README.md           # Project documentation
```

## Author
Purusharth Tripathi — CodeAlpha AI Internship
