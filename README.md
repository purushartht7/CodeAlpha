# CodeAlpha AI Internship — Unified Web Portal

**Candidate:** Purusharth Tripathi  
**Internship Domain:** Artificial Intelligence (AI)  
**Program:** CodeAlpha Virtual Internship  
**Hosting Platform:** Vercel (Ready for 1-Click Deployment via GitHub)

---

## 🌟 Overview

This repository unites both CodeAlpha Artificial Intelligence internship tasks into a **single, responsive, full-stack web application**:

1. **Task 1: NLP FAQ Chatbot**
   * Uses an Information Retrieval pipeline (**TF-IDF Vector Space Model & Cosine Similarity**).
   * 100% deterministic, zero hallucination risk, and runs completely offline with zero API cost.
   * Dynamic confidence scoring, prompt pills, full knowledge-base table, and live custom Q&A indexing.

2. **Task 2: AI Multi-Lingual Translation & Voice Synthesis**
   * Real-time machine translation across **130+ global languages**.
   * Automatic script & language detection.
   * High-definition **Text-to-Speech (TTS)** voice synthesis without saving temporary files to disk.
   * Resilient dual-tier architecture: Vercel Serverless Function (`/api/translate.js`) with client-side failover.

3. **Project Documentation & Protected Assessment Records**
   * Public technical guide covering NLP mathematics, machine translation architecture, and viva defense notes.
   * **🔒 Password-Protected Evaluation Section (`dilshaan69#`):** Contains official academic records (NIET Greater Noida, CSE-AI, Course BCSE-0559, Submitted to Ms. Ishakshi Gupta), verified PDF documents (Offer Letter, LOR, Completion Certificate), and the complete 30-Day Internship Daily Work Calendar.

---

## 🚀 How to Host on Vercel via GitHub (Step-by-Step)

### Step 1: Push this Project to GitHub

If you haven't initialized Git yet:
1. Open terminal in this folder (`d:\internship sem V`).
2. Run:
```bash
git init
git add .
git commit -m "Initial commit: CodeAlpha AI unified portfolio"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/CodeAlpha_AI_Internship.git
git push -u origin main
```
*(Or drag and drop this folder directly into a new repository on [GitHub.com](https://github.com)).*

### Step 2: Deploy to Vercel

1. Go to **[vercel.com](https://vercel.com)** and log in with your GitHub account.
2. Click **"Add New..."** &rarr; **"Project"**.
3. Locate your repository (`CodeAlpha_AI_Internship`) and click **"Import"**.
4. In the Project Configuration screen:
   * **Framework Preset:** Leave as *Other* (or *Vite/Plain*).
   * **Root Directory:** `./` (default).
   * **Build Command:** Leave blank.
   * **Output Directory:** Leave blank.
5. Click **"Deploy"**.

Within 10 seconds, Vercel will give you a live production link (e.g., `https://codealpha-ai-internship.vercel.app`) that you can share with your teacher!

---

## 💻 How to Run Locally

### Option A: Using Node.js (Full API + Frontend)
```bash
node server.js
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option B: Using Python Streamlit (Original Standalone Apps)
* **Task 1 Chatbot:**
  ```bash
  python -m streamlit run "TASK 1\app.py" --server.port 8501
  ```
* **Task 2 Translator:**
  ```bash
  python -m streamlit run "TASK 2\app.py" --server.port 8502
  ```

---

## 📁 Repository Structure

```
├── index.html           # Unified web application interface
├── style.css            # Modern dark-theme responsive design
├── app.js               # Client-side TF-IDF, Cosine Similarity & Translation engine
├── server.js            # Local zero-dependency development server
├── vercel.json          # Vercel serverless routing & CORS configuration
├── package.json         # Project metadata
├── api/
│   └── translate.js     # Vercel Serverless Function for Google Translate
├── TASK 1/              # Original Python Streamlit Task 1 project
│   ├── app.py
│   ├── faqs.csv
│   └── requirements.txt
└── TASK 2/              # Original Python Streamlit Task 2 project
    ├── app.py
    └── requirements.txt
```
