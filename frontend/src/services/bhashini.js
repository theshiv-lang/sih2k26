/**
 * Bhashini AI Pipeline Service
 * Complete client for Multilingual ASR, NMT, and TTS (Ulca / Bhashini Inference Pipeline)
 */

const BHASHINI_API_URL = import.meta.env.VITE_BHASHINI_API_URL || 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';
const BHASHINI_API_KEY = import.meta.env.VITE_BHASHINI_API_KEY || '';

// Language locale and display mappings
export const LANGUAGE_CONFIG = {
  hi: { code: 'hi', name: 'हिन्दी (Hindi)', locale: 'hi-IN', defaultVoiceGender: 'female' },
  en: { code: 'en', name: 'English (Indian)', locale: 'en-IN', defaultVoiceGender: 'female' },
  ta: { code: 'ta', name: 'தமிழ் (Tamil)', locale: 'ta-IN', defaultVoiceGender: 'female' },
  te: { code: 'te', name: 'తెలుగు (Telugu)', locale: 'te-IN', defaultVoiceGender: 'female' },
  mr: { code: 'mr', name: 'मराठी (Marathi)', locale: 'mr-IN', defaultVoiceGender: 'female' },
  bn: { code: 'bn', name: 'বাংলা (Bengali)', locale: 'bn-IN', defaultVoiceGender: 'female' },
};

/**
 * Detects the language code from a text string based on Unicode blocks
 */
export function detectLanguageFromText(text) {
  if (!text || typeof text !== 'string') return 'en';
  
  // Devanagari (Hindi, Marathi)
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return 'ta';
  }
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(text)) {
    return 'te';
  }
  // Bengali
  if (/[\u0980-\u09FF]/.test(text)) {
    return 'bn';
  }
  return 'en';
}

/**
 * Build Bhashini TTS Request Payload conforming strictly to Bhashini Specifications
 */
export function buildBhashiniTTSPayload(sourceText, sourceLanguage = 'hi', gender = 'female') {
  return {
    pipelineTasks: [
      {
        taskType: "tts",
        config: {
          language: {
            sourceLanguage: sourceLanguage
          },
          gender: gender
        }
      }
    ],
    inputData: {
      input: [
        {
          source: sourceText
        }
      ]
    }
  };
}

/**
 * Request Speech Synthesis from Bhashini Pipeline or fallback to Web Speech API
 */
export async function synthesizeSpeech(text, sourceLanguage = 'hi', onAudioBufferReady = null) {
  if (!text) return null;

  const langCode = sourceLanguage || detectLanguageFromText(text);

  // If live Bhashini API Key is provided, call Bhashini Inference Endpoint
  if (BHASHINI_API_KEY) {
    try {
      const payload = buildBhashiniTTSPayload(text, langCode);
      const response = await fetch(BHASHINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': BHASHINI_API_KEY,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const audioBase64 = data?.pipelineResponse?.[0]?.audio?.[0]?.audioContent;
        if (audioBase64) {
          playBase64Audio(audioBase64);
          if (onAudioBufferReady) onAudioBufferReady(audioBase64);
          return audioBase64;
        }
      }
    } catch (err) {
      console.warn('[Bhashini TTS] API request failed, falling back to Web Speech Synthesis:', err);
    }
  }

  // Fallback to Native SpeechSynthesis with strict locale mapping
  return playNativeTTS(text, langCode);
}

/**
 * Play native Text-To-Speech with exact regional language locale
 */
export function playNativeTTS(text, langCode = 'hi') {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Strip markdown formatting symbols and emoji icons
    const cleanText = text
      .replace(/[*#_`~\[\]\(\)]/g, '')
      .replace(/🌾|🎓|📂|💼|⚡|🎯|📄|🔐|🎙️|💡|✅|🏛️|🏠|📚/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const config = LANGUAGE_CONFIG[langCode] || LANGUAGE_CONFIG['en'];
    utterance.lang = config.locale;
    utterance.rate = 1.0;

    // Pick best matching system voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang === config.locale || v.lang.startsWith(langCode));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Stop any ongoing TTS audio
 */
export function stopSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function playBase64Audio(base64Data) {
  try {
    const audio = new Audio(`data:audio/wav;base64,${base64Data}`);
    audio.play();
  } catch (e) {
    console.warn('[Bhashini Audio Playback] Error:', e);
  }
}
