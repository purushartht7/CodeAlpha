// Vercel Serverless Function: api/translate.js
// Powered by Google Translate GTX Endpoint with Zero API Key Requirement

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let text = '';
  let source = 'auto';
  let target = 'en';

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    text = (body && body.text) || '';
    source = (body && body.source) || 'auto';
    target = (body && body.target) || 'en';
  } else {
    text = req.query.text || '';
    source = req.query.source || 'auto';
    target = req.query.target || 'en';
  }

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text query parameter is required' });
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(source)}&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Translation upstream responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Extract translated sentences from array [ [ [translated, original, ...] ] ]
    const segments = data[0] || [];
    const translatedText = segments.map(seg => (seg && seg[0]) ? seg[0] : '').join('');
    const detectedSource = data[2] || source;

    return res.status(200).json({
      success: true,
      translatedText,
      detectedSource,
      originalText: text
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal translation error'
    });
  }
};
