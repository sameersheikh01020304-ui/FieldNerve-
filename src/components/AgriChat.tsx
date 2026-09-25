import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Square,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  Languages,
  Check
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { speakText, stopSpeaking, createSpeechRecognizer } from '../utils/speech';
import { saveUserQueryToCloud } from '../lib/firebase';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  textHindi?: string;
  textEnglish?: string;
  audioScriptHindi?: string;
  audioScriptEnglish?: string;
  currentViewLang: 'hi' | 'en';
  timestamp: string;
}

interface AgriChatProps {
  language: Language;
  onOpenExpert: (problemDesc?: string) => void;
  onQuestionAnswered?: () => void;
  currentUserUid?: string;
}

export const AgriChat: React.FC<AgriChatProps> = ({
  language,
  onOpenExpert,
  onQuestionAnswered,
  currentUserUid,
}) => {
  // Direct language preference for AI answer & speech (defaulting to App language or user choice)
  const [chatLanguage, setChatLanguage] = useState<'hi' | 'en'>('en');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_1',
      sender: 'ai',
      text:
        'Welcome to FieldNerve AI! Ask any question regarding crop pests, fertilizers (Urea/DAP), irrigation schedules, or seasonal care. You can choose to receive and listen to answers in English or Hindi below.',
      textEnglish:
        'Welcome to FieldNerve AI! Ask any question regarding crop pests, fertilizers (Urea/DAP), irrigation schedules, or seasonal care. You can choose to receive and listen to answers in English or Hindi below.',
      textHindi:
        'नमस्ते किसान भाई! मैं फील्डनर्व कृषि एआई सहायक हूँ। अपनी फसल, खाद, बीज, कीटनाशक या सरकारी योजनाओं के बारे में पूछें। आप नीचे हिंदी या अंग्रेजी में उत्तर सुनने और पढ़ने का विकल्प चुन सकते हैं।',
      audioScriptEnglish:
        'Welcome to FieldNerve AI. Ask any question about your crops, fertilizers, or diseases in English or Hindi.',
      audioScriptHindi:
        'नमस्ते किसान भाई। फील्डनर्व कृषि एआई में आपका स्वागत है। अपनी फसल, खाद या बीमारी के बारे में कोई भी सवाल पूछें।',
      currentViewLang: 'en',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeSpeechInfo, setActiveSpeechInfo] = useState<{ msgId: string; lang: 'hi' | 'en' } | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognizerRef = useRef<any>(null);
  const t = TRANSLATIONS[language].chat;

  // Sync default chatLanguage if app language toggles
  useEffect(() => {
    setChatLanguage(language);
    // Update welcome message view
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === 'welcome_1'
          ? {
              ...msg,
              currentViewLang: language,
              text: language === 'hi' ? (msg.textHindi || msg.text) : (msg.textEnglish || msg.text),
            }
          : msg
      )
    );
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }
    };
  }, []);

  // When input text changes, auto-detect if the user is asking in Hindi
  const handleInputChange = (val: string) => {
    setInputQuery(val);
    const containsDevanagari = /[\u0900-\u097F]/.test(val);
    const requestedHindiInPrompt = /\b(hindi|hindi mein|hindi me|हिंदी|हिन्दी)\b/i.test(val);
    if ((containsDevanagari || requestedHindiInPrompt) && chatLanguage !== 'hi') {
      setChatLanguage('hi');
    }
  };

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isLoading) return;

    // Detect if this query explicitly wants Hindi
    const containsDevanagari = /[\u0900-\u097F]/.test(text);
    const requestedHindiInPrompt = /\b(hindi|hindi mein|hindi me|हिंदी|हिन्दी)\b/i.test(text);
    const targetLang: 'hi' | 'en' = containsDevanagari || requestedHindiInPrompt || chatLanguage === 'hi' ? 'hi' : 'en';

    if (targetLang !== chatLanguage) {
      setChatLanguage(targetLang);
    }

    const userMessage: Message = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text,
      currentViewLang: targetLang,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);
    setVoiceNotice(null);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          language: targetLang,
          preferredLanguage: targetLang,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get answer');
      }

      const hindiText = data.answerHindi || data.answer;
      const englishText = data.answerEnglish || data.answer;

      const aiMessage: Message = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: targetLang === 'hi' ? hindiText : englishText,
        textHindi: hindiText,
        textEnglish: englishText,
        audioScriptHindi: data.audioScriptHindi || hindiText,
        audioScriptEnglish: data.audioScriptEnglish || englishText,
        currentViewLang: targetLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
      if (currentUserUid) {
        saveUserQueryToCloud(currentUserUid, {
          question: text,
          answer: targetLang === 'hi' ? hindiText : englishText,
          answerHindi: hindiText,
          answerEnglish: englishText,
          audioScriptHindi: data.audioScriptHindi || hindiText,
          audioScriptEnglish: data.audioScriptEnglish || englishText,
          language: targetLang,
        }).catch((e) => console.warn('Could not persist query to Firebase:', e));
      }
      if (onQuestionAnswered) onQuestionAnswered();

      // Auto read aloud in the chosen language if initiated via mic
      if (isListening || queryToSend) {
        handlePlayAudio(aiMessage.id, targetLang, targetLang === 'hi' ? aiMessage.audioScriptHindi || hindiText : aiMessage.audioScriptEnglish || englishText);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errMsg: Message = {
        id: 'err_' + Date.now(),
        sender: 'ai',
        text:
          targetLang === 'hi'
            ? 'क्षमा करें, सर्वर से उत्तर प्राप्त करने में समस्या हुई। कृपया इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।'
            : 'Sorry, unable to get an answer right now. Please check your connection and try again.',
        currentViewLang: targetLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      setIsListening(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
      setVoiceNotice(null);
      return;
    }

    // Use current chatLanguage for speech recognition so it understands Hindi or English natively
    const recognizer = createSpeechRecognizer(
      chatLanguage,
      (transcript) => {
        setIsListening(false);
        setVoiceNotice(null);
        handleSend(transcript);
      },
      (error) => {
        setIsListening(false);
        setVoiceNotice(chatLanguage === 'hi' ? 'आवाज़ पहचानी नहीं गई। कृपया दोबारा बोलें।' : 'Could not recognize speech. Please speak again.');
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
        setVoiceNotice(
          chatLanguage === 'hi'
            ? 'सुन रहे हैं... कृपया अपनी फसल या खेती की समस्या हिंदी में बोलें।'
            : 'Listening... Please speak your agricultural question in English.'
        );
      } catch (e) {
        console.error('Recognizer start error:', e);
        setIsListening(false);
      }
    } else {
      setIsListening(false);
      setVoiceNotice(
        chatLanguage === 'hi'
          ? 'आपके ब्राउज़र में आवाज़ इनपुट समर्थित नहीं है।'
          : 'Voice input not supported in this browser.'
      );
    }
  };

  const handlePlayAudio = (msgId: string, lang: 'hi' | 'en', text: string) => {
    if (activeSpeechInfo?.msgId === msgId && activeSpeechInfo.lang === lang) {
      stopSpeaking();
      setActiveSpeechInfo(null);
    } else {
      stopSpeaking();
      setActiveSpeechInfo({ msgId, lang });
      speakText(text, lang, () => {
        setActiveSpeechInfo(null);
      });
    }
  };

  const toggleMessageViewLang = (msgId: string, targetLang: 'hi' | 'en') => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const newText = targetLang === 'hi' ? (m.textHindi || m.text) : (m.textEnglish || m.text);
        return {
          ...m,
          currentViewLang: targetLang,
          text: newText,
        };
      })
    );
  };

  // Presets based on selected chatLanguage
  const presets =
    chatLanguage === 'hi'
      ? [
          'गेहूं की पत्तियां पीली हो रही हैं क्या करें?',
          'धान में यूरिया और डीएपी कब और कितना डालें?',
          'सरसों में माहू (कीट) रोकथाम के घरेलू उपाय',
          'सब्जियों में कीट नियंत्रण के लिए नीम तेल का छिड़काव कैसे करें?',
        ]
      : [
          'Wheat leaves turning yellow - what is the remedy?',
          'Best fertilizer schedule (Urea / DAP) for paddy?',
          'How to control aphids and whiteflies organically?',
          'How to prepare and spray Neem oil insecticide?',
        ];

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col h-[670px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            🌱
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {chatLanguage === 'hi' ? 'फील्डनर्व कृषि एआई सहायक' : 'FieldNerve Agri AI Assistant'}
            </h2>
            <p className="text-xs text-slate-500">
              {chatLanguage === 'hi' ? 'फसल, खाद, रोग व मौसम पर सटीक सलाह' : 'Ask any crop, soil, fertilizer or disease questions'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenExpert()}
          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1 shrink-0"
        >
          <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
          <span>KVK Helpline</span>
        </button>
      </div>

      {/* Quick Questions Presets */}
      <div className="py-2.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-emerald-600" />
            <span>{chatLanguage === 'hi' ? 'अक्सर पूछे जाने वाले सवाल:' : 'Quick Suggested Questions:'}</span>
          </p>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(preset)}
              className="text-xs whitespace-nowrap px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all text-left shrink-0"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-none'
                  : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none'
              }`}
            >
              {/* If AI Message with Dual Translation Available, show view toggle */}
              {msg.sender === 'ai' && (msg.textHindi || msg.textEnglish) && (
                <div className="mb-2 pb-1.5 border-b border-slate-200/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <Languages className="w-3 h-3 text-emerald-600" />
                    <span>View Text:</span>
                  </span>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-slate-200 text-[10px]">
                    <button
                      type="button"
                      onClick={() => toggleMessageViewLang(msg.id, 'en')}
                      className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                        msg.currentViewLang === 'en'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleMessageViewLang(msg.id, 'hi')}
                      className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                        msg.currentViewLang === 'hi'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      हिन्दी
                    </button>
                  </div>
                </div>
              )}

              {/* Message Content */}
              <div className="whitespace-pre-line">
                {msg.currentViewLang === 'hi' ? (msg.textHindi || msg.text) : (msg.textEnglish || msg.text)}
              </div>

              {/* Action Toolbar for AI Message: Audio in Hindi & Audio in English */}
              <div
                className={`mt-3 pt-2 flex flex-wrap items-center justify-between gap-2 border-t text-[11px] ${
                  msg.sender === 'user'
                    ? 'border-emerald-600 text-emerald-100'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                <span>{msg.timestamp}</span>

                {msg.sender === 'ai' && (
                  <div className="flex items-center gap-1.5">
                    {/* Listen in English Audio Button */}
                    <button
                      type="button"
                      onClick={() =>
                        handlePlayAudio(
                          msg.id,
                          'en',
                          msg.audioScriptEnglish || msg.textEnglish || msg.text
                        )
                      }
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeSpeechInfo?.msgId === msg.id && activeSpeechInfo.lang === 'en'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                      title="Listen to this answer in English"
                    >
                      {activeSpeechInfo?.msgId === msg.id && activeSpeechInfo.lang === 'en' ? (
                        <>
                          <Square className="w-3 h-3" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-sky-600" />
                          <span>Listen (EN)</span>
                        </>
                      )}
                    </button>

                    {/* Listen in Hindi Audio Button (Crucial for Indian farmers) */}
                    <button
                      type="button"
                      onClick={() =>
                        handlePlayAudio(
                          msg.id,
                          'hi',
                          msg.audioScriptHindi || msg.textHindi || msg.text
                        )
                      }
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeSpeechInfo?.msgId === msg.id && activeSpeechInfo.lang === 'hi'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                      }`}
                      title="यह उत्तर हिंदी में सुनें"
                    >
                      {activeSpeechInfo?.msgId === msg.id && activeSpeechInfo.lang === 'hi' ? (
                        <>
                          <Square className="w-3 h-3" />
                          <span>रोकें</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-emerald-200" />
                          <span>हिंदी में सुनें</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>
                {chatLanguage === 'hi'
                  ? 'कृषि एआई उत्तर तैयार कर रहा है (हिंदी व अंग्रेजी दोनों)...'
                  : 'Preparing agricultural guidance in English and Hindi...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Input Notice */}
      {voiceNotice && (
        <div className="p-2.5 mb-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
            <span>{voiceNotice}</span>
          </div>
          <button
            type="button"
            onClick={toggleVoiceInput}
            className="text-xs font-bold text-rose-600 underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Language Question & Selector Bar: Directly asks farmer which language they want to listen/read in */}
      <div className="pt-2.5 pb-2 px-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 shrink-0 bg-slate-50/50 rounded-t-xl">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
          <Volume2 className="w-4 h-4 text-emerald-600" />
          <span>
            {chatLanguage === 'hi'
              ? 'उत्तर किस भाषा में सुनना व पढ़ना चाहते हैं?'
              : 'Which language do you want to listen & read in?'}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setChatLanguage('en')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              chatLanguage === 'en'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🇬🇧 English</span>
            {chatLanguage === 'en' && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setChatLanguage('hi')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              chatLanguage === 'hi'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🇮🇳 हिन्दी (Hindi)</span>
            {chatLanguage === 'hi' && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-2 flex items-center gap-2 shrink-0"
      >
        {/* Voice Input Mic Button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
            isListening
              ? 'bg-rose-600 text-white border-rose-600 shadow-md animate-pulse'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
          }`}
          title={chatLanguage === 'hi' ? 'बोलकर पूछें (आवाज़ पहचान)' : 'Speak your question (Voice Recognition)'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={
            chatLanguage === 'hi'
              ? 'अपनी फसल, खाद, बीमारी या सिंचाई के बारे में पूछें...'
              : 'Ask any question about crops, fertilizers, diseases, or irrigation...'
          }
          className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-slate-50 focus:bg-white transition-all"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center"
          title={chatLanguage === 'hi' ? 'भेजें' : 'Send'}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
