/**
 * Voice Input (Speech-to-Text) and Text-to-Speech Audio Reader Utilities
 */

// Declare Web Speech Recognition window types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

let activeRecognition: any = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Check if Web Speech Recognition is supported in user's browser
 */
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Check if Text-to-Speech is supported
 */
export function isTextToSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Map EduPlanner Language to BCP 47 Speech recognition locale
 */
function getSpeechLocale(lang: string): string {
  if (lang === 'bad' || lang === 'ku') return 'ku-IQ'; // Kurdish (Iraq)
  if (lang === 'ar') return 'ar-SA';                  // Arabic
  return 'en-US';                                    // Academic English
}

/**
 * Start Voice Input Recognition (Speech-to-Text)
 */
export function startVoiceInput(
  lang: string,
  onResult: (transcript: string) => void,
  onError?: (err: string) => void,
  onEnd?: () => void
) {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError('Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
    return;
  }

  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (activeRecognition) {
      activeRecognition.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = getSpeechLocale(lang);

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      onResult(currentTranscript);
    };

    recognition.onerror = (event: any) => {
      console.warn('[Speech Recognition Warning]:', event.error);
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      activeRecognition = null;
      if (onEnd) onEnd();
    };

    activeRecognition = recognition;
    recognition.start();
  } catch (err: any) {
    if (onError) onError(err?.message || 'Failed to start voice input');
  }
}

/**
 * Stop Voice Recognition
 */
export function stopVoiceInput() {
  if (activeRecognition) {
    activeRecognition.stop();
    activeRecognition = null;
  }
}

/**
 * Text-to-Speech Audio Reader (Reads Assistant Responses Aloud)
 */
export function speakText(
  text: string,
  lang: string,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (!isTextToSpeechSupported()) return;

  // Strip markdown symbols for natural speech reading
  const cleanText = text
    .replace(/[*_#`~>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, 'link')
    .trim();

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 1500));
  utterance.lang = getSpeechLocale(lang);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

/**
 * Stop active Text-to-Speech playback
 */
export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}
