// Speech Synthesis (Text-to-Speech) & Speech Recognition utility for FieldNerve
import { Language } from '../types';

export function speakText(text: string, lang: Language, onEnd?: () => void): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return () => {};
  }

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  // Strip Markdown symbols for natural speech
  const cleanText = text
    .replace(/[#*_`~>-]/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/\n+/g, '. ')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  utterance.rate = 0.92; // Slightly slower for clarity
  utterance.pitch = 1.0;

  // Try to pick a natural voice if available
  const voices = window.speechSynthesis.getVoices();
  const targetLangPrefix = lang === 'hi' ? 'hi' : 'en';
  const matchingVoice = voices.find(v => v.lang.startsWith(targetLangPrefix));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);

  // Return cancel function
  return () => {
    window.speechSynthesis.cancel();
  };
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Browser Speech Recognition (Web Speech API)
export function createSpeechRecognizer(
  lang: Language,
  onResult: (transcript: string) => void,
  onError: (err: string) => void,
  onEnd: () => void
) {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Speech recognition not supported in this browser. Please use Chrome/Edge.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    onError(event.error || 'Voice input error');
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}
