'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { api, type AssistantResponse } from '@/lib/api';
import { Mic, MicOff, Send, Loader2, Volume2, User, Leaf, Sparkles } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
}

export default function AssistantPage() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      content: language === 'hi'
        ? 'नमस्ते! मैं आपका AI फसल स्वास्थ्य सहायक हूं। मैं आपकी मदद कर सकता हूं: रोग निदान, उपचार सिफारिशें, मौसम की स्थिति, और आपके खेत के स्वास्थ्य की निगरानी। आप क्या जानना चाहेंगे?'
        : "Hello! I'm your AI crop health assistant. I can help you with disease diagnosis, treatment recommendations, weather conditions, and monitoring your farm health. What would you like to know?",
      suggestions: language === 'hi'
        ? ['मेरी फसल स्कैन करें', 'मौसम जांचें', 'रोग जोखिम दिखाएं', 'मेरी खेत प्रोफ़ाइल']
        : ['Scan my crop', 'Check weather', 'Show disease risk', 'My farm profile'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.askAssistant(text, language);
      const reply = language === 'hi' ? response.replyHi : response.reply;
      const suggestions = language === 'hi' ? response.suggestionsHi : response.suggestions;

      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: reply,
        suggestions,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: language === 'hi'
          ? 'माफ करें, सर्वर से कनेक्ट नहीं हो पा रहा। कृपया सुनिश्चित करें कि बैकएंड सर्वर चल रहा है।'
          : 'Sorry, unable to connect to the server. Please ensure the backend is running.',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t.assistant.voiceNotSupported);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
    recognitionRef.current = recognition;
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <h1 className="text-2xl font-bold">{t.assistant.title}</h1>
        <p className="text-gray-400 text-sm mt-1">{t.assistant.subtitle}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-emerald-400" />
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-md'
                  : 'bg-white/[0.05] border border-white/[0.08] rounded-bl-md'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'assistant' && (
                <button
                  onClick={() => speakText(msg.content)}
                  className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-400 transition-colors"
                >
                  <Volume2 size={12} className={isSpeaking ? 'text-emerald-400' : ''} />
                  {isSpeaking ? 'Speaking...' : 'Listen'}
                </button>
              )}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {msg.suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      className="px-3 py-1.5 text-xs rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <User size={16} className="text-blue-400" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-emerald-400" />
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/[0.08] rounded-bl-md">
              <Loader2 size={16} className="animate-spin text-emerald-400" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/5">
        <div className="flex gap-3">
          <button
            onClick={isListening ? stopVoice : startVoice}
            className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:text-white hover:border-emerald-500/30'
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder={language === 'hi' ? t.assistant.placeholderHi : t.assistant.placeholder}
            className="flex-1 px-5 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] focus:border-emerald-500/50 focus:outline-none text-sm transition-colors"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 shrink-0 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all"
          >
            <Send size={20} />
          </button>
        </div>
        {isListening && (
          <p className="text-center text-sm text-red-400 mt-3 animate-pulse">
            🎙️ {t.assistant.listening}
          </p>
        )}
      </div>
    </div>
  );
}

// TypeScript declarations for Speech API
declare global {
  var SpeechRecognition: any;
  var webkitSpeechRecognition: any;
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
