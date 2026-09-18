/**
 * OrthoVoice AI — Gemini API Integration Service
 * Provides advanced LLM clinical reasoning for complex medical dialogues,
 * with seamless fallback to the local built-in Orthopedic parser.
 */

class GeminiService {
  constructor() {
    this.apiKey = localStorage.getItem('ortho_gemini_api_key') || '';
    this.model = localStorage.getItem('ortho_gemini_model') || 'local-heuristic';
  }

  setApiKey(key) {
    this.apiKey = key ? key.trim() : '';
    localStorage.setItem('ortho_gemini_api_key', this.apiKey);
  }

  getApiKey() {
    return this.apiKey;
  }

  setModel(model) {
    this.model = model;
    localStorage.setItem('ortho_gemini_model', this.model);
  }

  getModel() {
    return this.model;
  }

  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey.length > 10);
  }

  /**
   * Process dialogue text using Gemini API if configured, otherwise fallback to local parser
   */
  async extractOrthoRecord(dialogueTurns, localParser) {
    // If local heuristic is selected or no API key, use local parser
    if (this.model === 'local-heuristic' || !this.hasApiKey()) {
      return localParser.parseClinicalDialogue(dialogueTurns);
    }

    const conversationText = Array.isArray(dialogueTurns)
      ? dialogueTurns.map(t => `${t.speaker}: ${t.text}`).join('\n')
      : dialogueTurns;

    const prompt = `
You are an expert Orthopedic Surgeon and Medical Scribe AI.
Analyze the following doctor-patient consultation transcript in Thailand (mix of Thai and English medical terms).
Extract and structure the medical record strictly following orthopedic clinical standards.

Return a valid JSON object with the following structure:
{
  "soap": {
    "cc": "Chief complaint and duration (e.g. ปวดเข่าขวามา 2 สัปดาห์)",
    "pi": "Present illness including mechanism of injury, pain characteristics, morning stiffness, aggravating/relieving factors, cauda equina/red flags rule-out",
    "pmh": "Underlying diseases, allergies, past surgeries",
    "pe": "Inspection, palpation tenderness, ROM, special tests, and neurovascular exam",
    "imaging": "X-ray or MRI findings and interpretations",
    "dx": "Primary Orthopedic diagnosis with ICD-10 if applicable",
    "ddx": "Differential diagnoses",
    "treatment": "Medications, doses, physical therapy, and surgical plan",
    "advice": "Patient home care and lifestyle precautions",
    "followUp": "Follow-up timeline"
  },
  "patientInstructions": "Compassionate, clear Thai verbal explanation for the patient to listen to via Text-to-Speech",
  "systematicExam": {
    "inspection": ["Findings for Inspection & Gait"],
    "palpation": ["Points of tenderness"],
    "rom": ["Degrees of Range of Motion"],
    "specialTests": ["Provocative tests with Positive/Negative status"],
    "neuro": ["Motor, Sensory, Pulses"]
  }
}

Transcript:
${conversationText}
`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) {
        const parsedJson = JSON.parse(content);
        // Also extract local entity tags to keep UI rich
        parsedJson.entities = localParser.extractEntities(conversationText);
        return parsedJson;
      }
      throw new Error('Empty response from Gemini model');
    } catch (error) {
      console.warn('Gemini API call failed, falling back to local heuristic engine:', error);
      // Fallback
      return localParser.parseClinicalDialogue(dialogueTurns);
    }
  }
}

// Export globally
if (typeof window !== 'undefined') {
  window.GeminiService = GeminiService;
}
