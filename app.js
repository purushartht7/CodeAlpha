// Unified Web Application Logic for CodeAlpha AI Internship
// Author: Purusharth Tripathi

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================
  // 1. TAB NAVIGATION
  // ========================================================
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      
      navTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const targetPanel = document.getElementById(`tab-${targetTab}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // ========================================================
  // 2. TASK 1: FAQ CHATBOT (TF-IDF & COSINE SIMILARITY)
  // ========================================================
  const ENGLISH_STOP_WORDS = new Set([
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
  ]);

  let faqs = [
    {
      question: "What is CodeAlpha?",
      answer: "CodeAlpha is a virtual internship platform that provides students with real-world project tasks in fields like AI, Web Development, and Data Science."
    },
    {
      question: "How do I submit my internship task?",
      answer: "You need to upload your source code to GitHub in a repository named CodeAlpha_ProjectName, post a video explanation on LinkedIn tagging CodeAlpha, and submit the link using the submission form."
    },
    {
      question: "How many tasks do I need to complete?",
      answer: "You need to complete any 2 or 3 tasks out of the 4 listed in your domain task list."
    },
    {
      question: "What should the GitHub repository be named?",
      answer: "The repository should be named CodeAlpha_ProjectName where ProjectName is replaced with your actual project name."
    },
    {
      question: "Do I need to post on LinkedIn?",
      answer: "Yes. You must share your internship status on LinkedIn and tag @CodeAlpha, and also post a video explanation of each project."
    },
    {
      question: "What is a chatbot?",
      answer: "A chatbot is a software application that simulates human conversation by matching user questions to the closest known answer using natural language processing techniques."
    },
    {
      question: "What is cosine similarity?",
      answer: "Cosine similarity is a mathematical measure used to determine how similar two pieces of text are by comparing the angle between their vector representations."
    },
    {
      question: "What programming language is used for this chatbot?",
      answer: "This chatbot is built using Python / JavaScript, using TF-IDF vectorization and cosine similarity for text matching and Streamlit/HTML for the user interface."
    },
    {
      question: "Is this chatbot free to use?",
      answer: "Yes. This chatbot runs entirely offline using open-source algorithms and does not require any paid API or external tokens."
    },
    {
      question: "Can I add my own questions and answers?",
      answer: "Yes. You can edit the faqs.csv file or use the live indexer on this page to add, remove, or modify question-answer pairs."
    }
  ];

  // NLP Functions
  function cleanText(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenize(text) {
    const cleaned = cleanText(text);
    if (!cleaned) return [];
    return cleaned.split(' ').filter(token => token.length > 1 && !ENGLISH_STOP_WORDS.has(token));
  }

  // Model State
  let vocab = [];
  let vocabMap = new Map();
  let idf = [];
  let faqVectors = [];

  function buildTfidfModel() {
    const docTokens = faqs.map(f => tokenize(f.question));
    const uniqueTokens = new Set();
    docTokens.forEach(tokens => tokens.forEach(t => uniqueTokens.add(t)));
    
    vocab = Array.from(uniqueTokens).sort();
    vocabMap = new Map(vocab.map((term, idx) => [term, idx]));

    const N = faqs.length;
    const df = new Array(vocab.length).fill(0);

    docTokens.forEach(tokens => {
      const distinctInDoc = new Set(tokens);
      distinctInDoc.forEach(t => {
        if (vocabMap.has(t)) df[vocabMap.get(t)]++;
      });
    });

    // Smooth IDF Formula: ln((1 + N) / (1 + df)) + 1
    idf = df.map(count => Math.log((1 + N) / (1 + count)) + 1);

    // Compute and L2-normalize vectors for each FAQ
    faqVectors = docTokens.map(tokens => vectorFromTokens(tokens));

    // Update UI Stats
    const faqCountEl = document.getElementById('faq-count');
    const vocabCountEl = document.getElementById('vocab-count');
    if (faqCountEl) faqCountEl.textContent = faqs.length;
    if (vocabCountEl) vocabCountEl.textContent = vocab.length;
    renderKnowledgeBaseList();
  }

  function vectorFromTokens(tokens) {
    const vec = new Array(vocab.length).fill(0);
    tokens.forEach(t => {
      if (vocabMap.has(t)) vec[vocabMap.get(t)]++;
    });

    for (let i = 0; i < vec.length; i++) {
      vec[i] *= idf[i];
    }

    const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < vec.length; i++) {
        vec[i] /= norm;
      }
    }
    return vec;
  }

  function getBestAnswer(userQuestion, threshold = 0.25) {
    const queryTokens = tokenize(userQuestion);
    if (queryTokens.length === 0) {
      return {
        answer: "Please ask a specific question using meaningful words.",
        score: 0,
        matchedQuestion: null
      };
    }

    const queryVec = vectorFromTokens(queryTokens);
    let bestScore = -1;
    let bestIdx = -1;

    for (let i = 0; i < faqVectors.length; i++) {
      // Dot product of normalized vectors = Cosine Similarity
      let sim = 0;
      for (let j = 0; j < vocab.length; j++) {
        sim += queryVec[j] * faqVectors[i][j];
      }
      if (sim > bestScore) {
        bestScore = sim;
        bestIdx = i;
      }
    }

    if (bestScore < threshold || bestIdx === -1) {
      return {
        answer: "I'm not confident I know the answer to that. Try rephrasing, or ask something specifically about the CodeAlpha internship process.",
        score: Math.max(0, bestScore),
        matchedQuestion: null
      };
    }

    return {
      answer: faqs[bestIdx].answer,
      score: bestScore,
      matchedQuestion: faqs[bestIdx].question
    };
  }

  // Render Knowledge Base List
  function renderKnowledgeBaseList(filter = '') {
    const kbContainer = document.getElementById('kb-list');
    if (!kbContainer) return;
    kbContainer.innerHTML = '';

    const cleanFilter = filter.toLowerCase().trim();
    const filtered = faqs.filter(f => 
      !cleanFilter || 
      f.question.toLowerCase().includes(cleanFilter) || 
      f.answer.toLowerCase().includes(cleanFilter)
    );

    if (filtered.length === 0) {
      kbContainer.innerHTML = '<p class="placeholder-text" style="padding: 10px;">No matching FAQs found.</p>';
      return;
    }

    filtered.forEach(item => {
      const el = document.createElement('div');
      el.className = 'kb-item';
      el.innerHTML = `
        <div class="kb-q">${escapeHtml(item.question)}</div>
        <div class="kb-a">${escapeHtml(item.answer)}</div>
      `;
      el.addEventListener('click', () => {
        handleUserQuestion(item.question);
      });
      kbContainer.appendChild(el);
    });
  }

  // Chat UI logic
  const chatMessages = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const clearChatBtn = document.getElementById('clear-chat-btn');

  function appendMessage(role, text, metaHtml = '') {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${role === 'user' ? 'user-message' : 'bot-message'}`;
    bubble.innerHTML = `
      <div class="avatar">${role === 'user' ? 'You' : '🤖'}</div>
      <div class="bubble-body">
        <div class="message-text">${escapeHtml(text)}</div>
        ${metaHtml ? `<div class="message-meta">${metaHtml}</div>` : ''}
      </div>
    `;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function handleUserQuestion(question) {
    if (!question || !question.trim()) return;
    appendMessage('user', question);

    // Compute answer
    const result = getBestAnswer(question);
    const scorePct = Math.round(result.score * 100);

    let meta = '';
    if (result.matchedQuestion) {
      meta = `
        <span class="confidence-badge ${scorePct < 40 ? 'low' : ''}">🎯 ${scorePct}% Match</span>
        <span>Matched: "${escapeHtml(result.matchedQuestion)}"</span>
      `;
    } else {
      meta = `<span class="confidence-badge low">Score: ${scorePct}% (Below 25% threshold)</span>`;
    }

    // Small delay to simulate realistic interaction
    setTimeout(() => {
      appendMessage('bot', result.answer, meta);
    }, 150);
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = chatInput.value.trim();
      if (!val) return;
      chatInput.value = '';
      handleUserQuestion(val);
    });
  }

  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      chatMessages.innerHTML = `
        <div class="message-bubble bot-message">
          <div class="avatar">🤖</div>
          <div class="bubble-body">
            <div class="message-text">Chat cleared! Feel free to ask another question about CodeAlpha.</div>
            <div class="message-meta">Knowledge base active</div>
          </div>
        </div>
      `;
    });
  }

  // Prompt Chips
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const p = chip.getAttribute('data-prompt');
      handleUserQuestion(p);
    });
  });

  // KB Filter Input
  const kbSearch = document.getElementById('kb-search');
  if (kbSearch) {
    kbSearch.addEventListener('input', (e) => {
      renderKnowledgeBaseList(e.target.value);
    });
  }

  // Toggle Add FAQ Form
  const toggleAddFaq = document.getElementById('toggle-add-faq');
  const addFaqBody = document.getElementById('add-faq-form-body');
  if (toggleAddFaq && addFaqBody) {
    toggleAddFaq.addEventListener('click', () => {
      addFaqBody.classList.toggle('collapsed');
      const ch = toggleAddFaq.querySelector('.chevron');
      if (ch) ch.classList.toggle('rotated');
    });
  }

  // Add FAQ Form submit
  const addFaqForm = document.getElementById('add-faq-form');
  if (addFaqForm) {
    addFaqForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const qInput = document.getElementById('new-question');
      const aInput = document.getElementById('new-answer');
      const q = qInput.value.trim();
      const a = aInput.value.trim();
      if (!q || !a) return;

      faqs.push({ question: q, answer: a });
      buildTfidfModel();

      qInput.value = '';
      aInput.value = '';
      addFaqBody.classList.add('collapsed');

      appendMessage('bot', `✅ Successfully indexed new question: "${q}". You can now query it in chat!`);
    });
  }

  // Initial TF-IDF Model Build
  buildTfidfModel();

  // ========================================================
  // 3. TASK 2: AI MULTI-LINGUAL TRANSLATOR & SPEECH SYNTHESIS
  // ========================================================
  const LANGUAGES = {
    'afrikaans': 'af', 'albanian': 'sq', 'amharic': 'am', 'arabic': 'ar', 'armenian': 'hy',
    'azerbaijani': 'az', 'basque': 'eu', 'belarusian': 'be', 'bengali': 'bn', 'bosnian': 'bs',
    'bulgarian': 'bg', 'catalan': 'ca', 'cebuano': 'ceb', 'chinese (simplified)': 'zh-CN',
    'chinese (traditional)': 'zh-TW', 'corsican': 'co', 'croatian': 'hr', 'czech': 'cs',
    'danish': 'da', 'dutch': 'nl', 'english': 'en', 'esperanto': 'eo', 'estonian': 'et',
    'filipino': 'tl', 'finnish': 'fi', 'french': 'fr', 'galician': 'gl', 'georgian': 'ka',
    'german': 'de', 'greek': 'el', 'gujarati': 'gu', 'haitian creole': 'ht', 'hausa': 'ha',
    'hawaiian': 'haw', 'hebrew': 'iw', 'hindi': 'hi', 'hmong': 'hmn', 'hungarian': 'hu',
    'icelandic': 'is', 'igbo': 'ig', 'indonesian': 'id', 'irish': 'ga', 'italian': 'it',
    'japanese': 'ja', 'javanese': 'jw', 'kannada': 'kn', 'kazakh': 'kk', 'khmer': 'km',
    'korean': 'ko', 'kurdish': 'ku', 'kyrgyz': 'ky', 'lao': 'lo', 'latin': 'la',
    'latvian': 'lv', 'lithuanian': 'lt', 'luxembourgish': 'lb', 'macedonian': 'mk',
    'malagasy': 'mg', 'malay': 'ms', 'malayalam': 'ml', 'maltese': 'mt', 'maori': 'mi',
    'marathi': 'mr', 'mongolian': 'mn', 'myanmar': 'my', 'nepali': 'ne', 'norwegian': 'no',
    'pashto': 'ps', 'persian': 'fa', 'polish': 'pl', 'portuguese': 'pt', 'punjabi': 'pa',
    'romanian': 'ro', 'russian': 'ru', 'samoan': 'sm', 'scots gaelic': 'gd', 'serbian': 'sr',
    'sesotho': 'st', 'shona': 'sn', 'sindhi': 'sd', 'sinhala': 'si', 'slovak': 'sk',
    'slovenian': 'sl', 'somali': 'so', 'spanish': 'es', 'sundanese': 'su', 'swahili': 'sw',
    'swedish': 'sv', 'tajik': 'tg', 'tamil': 'ta', 'telugu': 'te', 'thai': 'th',
    'turkish': 'tr', 'ukrainian': 'uk', 'urdu': 'ur', 'uzbek': 'uz', 'vietnamese': 'vi',
    'welsh': 'cy', 'xhosa': 'xh', 'yiddish': 'yi', 'yoruba': 'yo', 'zulu': 'zu'
  };

  const sourceLangSelect = document.getElementById('source-lang');
  const targetLangSelect = document.getElementById('target-lang');
  const transInput = document.getElementById('trans-input');
  const translateBtn = document.getElementById('translate-btn');
  const transOutputBox = document.getElementById('trans-output-box');
  const transPlaceholder = document.getElementById('trans-placeholder');
  const transResultText = document.getElementById('trans-result-text');
  const detectedBadge = document.getElementById('detected-badge');
  const detectedLangName = document.getElementById('detected-lang-name');
  const copyBtn = document.getElementById('copy-btn');
  const copyText = document.getElementById('copy-text');
  const playTtsBtn = document.getElementById('play-tts-btn');
  const audioBtnLabel = document.getElementById('audio-btn-label');
  const audioStatus = document.getElementById('audio-status');
  const swapLangBtn = document.getElementById('swap-lang-btn');
  const clearInputBtn = document.getElementById('clear-input-btn');
  const inputCharCount = document.getElementById('input-char-count');
  const outputCharCount = document.getElementById('output-char-count');

  // Populate Dropdowns
  const langNames = Object.keys(LANGUAGES).sort();

  langNames.forEach(name => {
    const code = LANGUAGES[name];
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    
    // Add to source dropdown
    const optSrc = document.createElement('option');
    optSrc.value = code;
    optSrc.textContent = capitalized;
    sourceLangSelect.appendChild(optSrc);

    // Add to target dropdown
    const optTgt = document.createElement('option');
    optTgt.value = code;
    optTgt.textContent = capitalized;
    if (code === 'en') optTgt.selected = true;
    targetLangSelect.appendChild(optTgt);
  });

  // Char Counter
  if (transInput) {
    transInput.addEventListener('input', () => {
      const len = transInput.value.length;
      inputCharCount.textContent = `${len} character${len === 1 ? '' : 's'}`;
    });
  }

  // Clear Input Button
  if (clearInputBtn) {
    clearInputBtn.addEventListener('click', () => {
      transInput.value = '';
      inputCharCount.textContent = '0 characters';
      transInput.focus();
    });
  }

  // Swap Languages Button
  if (swapLangBtn) {
    swapLangBtn.addEventListener('click', () => {
      const currentSrc = sourceLangSelect.value;
      const currentTgt = targetLangSelect.value;
      if (currentSrc !== 'auto') {
        sourceLangSelect.value = currentTgt;
        targetLangSelect.value = currentSrc;
      }
    });
  }

  // Sample Chips
  document.querySelectorAll('.sample-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const sample = chip.getAttribute('data-sample');
      transInput.value = sample;
      inputCharCount.textContent = `${sample.length} characters`;
      executeTranslation();
    });
  });

  // Translation Function with Resilient Multi-Tier Fallback
  let currentTranslatedText = '';
  let currentTargetLangCode = 'en';

  async function executeTranslation() {
    const text = transInput.value.trim();
    if (!text) {
      alert('Please enter some text to translate.');
      return;
    }

    const srcCode = sourceLangSelect.value;
    const tgtCode = targetLangSelect.value;
    currentTargetLangCode = tgtCode;

    translateBtn.disabled = true;
    translateBtn.innerHTML = '<span>Translating... ⏳</span>';

    try {
      let translated = '';
      let detected = srcCode;

      // Tier 1: Direct High-Speed Client Translation (Google GTX - 50ms latency)
      try {
        const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(srcCode)}&tl=${encodeURIComponent(tgtCode)}&dt=t&q=${encodeURIComponent(text)}`;
        const gtxRes = await fetch(gtxUrl);
        if (gtxRes.ok) {
          const gtxData = await gtxRes.json();
          const segments = gtxData[0] || [];
          translated = segments.map(s => (s && s[0]) ? s[0] : '').join('');
          detected = gtxData[2] || srcCode;
        }
      } catch (clientErr) {
        // Fallback to Serverless API if client fetch hits browser restriction
      }

      // Tier 2: Serverless API Fallback (/api/translate)
      if (!translated) {
        try {
          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, source: srcCode, target: tgtCode })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.translatedText) {
              translated = data.translatedText;
              detected = data.detectedSource || srcCode;
            }
          }
        } catch (apiErr) {
          throw new Error('All translation services are currently busy. Please retry.');
        }
      }

      currentTranslatedText = translated;

      // Update UI
      transPlaceholder.style.display = 'none';
      transResultText.style.display = 'block';
      transResultText.textContent = translated;
      outputCharCount.textContent = `${translated.length} characters`;

      // Detected language badge
      if (srcCode === 'auto' && detected) {
        const foundName = Object.keys(LANGUAGES).find(k => LANGUAGES[k] === detected) || detected;
        detectedLangName.textContent = foundName.charAt(0).toUpperCase() + foundName.slice(1);
        detectedBadge.style.display = 'inline-block';
      } else {
        detectedBadge.style.display = 'none';
      }

      // Enable TTS button
      playTtsBtn.disabled = false;
      audioStatus.textContent = '';

    } catch (err) {
      alert(`Translation failed: ${err.message}`);
    } finally {
      translateBtn.disabled = false;
      translateBtn.innerHTML = '<span>Translate 🔄</span>';
    }
  }

  if (translateBtn) {
    translateBtn.addEventListener('click', executeTranslation);
  }

  // Copy to Clipboard
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!currentTranslatedText) return;
      navigator.clipboard.writeText(currentTranslatedText).then(() => {
        copyText.textContent = 'Copied! ✓';
        setTimeout(() => { copyText.textContent = 'Copy'; }, 2000);
      }).catch(() => {
        copyText.textContent = 'Failed';
      });
    });
  }

  // Text-To-Speech (TTS) using Web Speech API + Audio Fallback
  let isSpeaking = false;

  if (playTtsBtn) {
    playTtsBtn.addEventListener('click', () => {
      if (!currentTranslatedText) return;

      if ('speechSynthesis' in window) {
        if (isSpeaking) {
          window.speechSynthesis.cancel();
          isSpeaking = false;
          audioBtnLabel.textContent = 'Listen (TTS)';
          audioStatus.textContent = '';
          return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(currentTranslatedText);
        utterance.lang = currentTargetLangCode;

        utterance.onstart = () => {
          isSpeaking = true;
          audioBtnLabel.textContent = 'Stop ⏹';
          audioStatus.textContent = '🔊 Speaking...';
        };

        utterance.onend = () => {
          isSpeaking = false;
          audioBtnLabel.textContent = 'Listen (TTS)';
          audioStatus.textContent = '';
        };

        utterance.onerror = () => {
          isSpeaking = false;
          audioBtnLabel.textContent = 'Listen (TTS)';
          audioStatus.textContent = '';
        };

        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback: Audio element from Google TTS audio stream
        const ttsAudioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(currentTargetLangCode)}&client=tw-ob&q=${encodeURIComponent(currentTranslatedText.slice(0, 100))}`;
        const audio = new Audio(ttsAudioUrl);
        audio.play();
      }
    });
  }

  // ========================================================
  // 4. PASSWORD PROTECTED DOCUMENTATION AUTHENTICATION
  // ========================================================
  const DOC_PASSKEY = "dilshaan69#";
  const docAuthForm = document.getElementById('doc-auth-form');
  const docPassInput = document.getElementById('doc-pass-input');
  const docLockedView = document.getElementById('doc-locked-view');
  const docUnlockedView = document.getElementById('doc-unlocked-view');
  const passErrorMsg = document.getElementById('pass-error-msg');
  const togglePassVisibility = document.getElementById('toggle-pass-visibility');
  const relockBtn = document.getElementById('relock-btn');

  function unlockDocumentation() {
    if (docLockedView && docUnlockedView) {
      docLockedView.style.display = 'none';
      docUnlockedView.style.display = 'block';
      sessionStorage.setItem('doc_auth', 'true');
      if (passErrorMsg) passErrorMsg.style.display = 'none';
      if (docPassInput) docPassInput.value = '';
    }
  }

  function lockDocumentation() {
    if (docLockedView && docUnlockedView) {
      docUnlockedView.style.display = 'none';
      docLockedView.style.display = 'block';
      sessionStorage.removeItem('doc_auth');
      if (passErrorMsg) passErrorMsg.style.display = 'none';
      if (docPassInput) {
        docPassInput.value = '';
        docPassInput.type = 'password';
      }
    }
  }

  // Check existing session
  if (sessionStorage.getItem('doc_auth') === 'true') {
    unlockDocumentation();
  }

  // Handle Authentication Form Submit
  if (docAuthForm) {
    docAuthForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = (docPassInput ? docPassInput.value : '').trim();

      if (entered === DOC_PASSKEY) {
        unlockDocumentation();
      } else {
        if (passErrorMsg) {
          passErrorMsg.style.display = 'block';
          // Trigger CSS shake animation
          passErrorMsg.style.animation = 'none';
          passErrorMsg.offsetHeight; // reflow
          passErrorMsg.style.animation = 'shake 0.3s ease';
        }
        if (docPassInput) {
          docPassInput.select();
        }
      }
    });
  }

  // Relock Button
  if (relockBtn) {
    relockBtn.addEventListener('click', () => {
      lockDocumentation();
    });
  }

  // Toggle Eye Show/Hide
  if (togglePassVisibility && docPassInput) {
    togglePassVisibility.addEventListener('click', () => {
      if (docPassInput.type === 'password') {
        docPassInput.type = 'text';
        togglePassVisibility.textContent = '🙈';
      } else {
        docPassInput.type = 'password';
        togglePassVisibility.textContent = '👁️';
      }
    });
  }

  // Utility
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

});
