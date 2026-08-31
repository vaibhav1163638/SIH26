'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { api } from '@/lib/api';
import { Mic, MicOff, Send, Loader2, Volume2, User, Sparkles, MessageSquare, Plus, Menu, X, ImageIcon } from 'lucide-react';

interface Message {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  _id: string;
  title: string;
  updatedAt: string;
}

export default function AssistantPage() {
  const { t, language } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Image upload state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load conversation list on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.getConversations();
      if (res.success) setConversations(res.conversations);
    } catch (err) {
      console.error(err);
    }
  };

  const loadConversation = async (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
    setIsLoading(true);
    setMessages([]);
    try {
      const res = await api.getConversation(id);
      if (res.success && res.conversation) {
        setMessages(res.conversation.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setSidebarOpen(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() && !selectedImage) return;

    // Display user message in UI
    const displayMsg: Message = { 
      role: 'user', 
      content: selectedImage ? JSON.stringify({ text, hasImage: true }) : text 
    };
    setMessages(prev => [...prev, displayMsg]);
    
    const currentText = text;
    const currentImage = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const payload: any = { 
        message: currentText, 
        language,
        conversationId: activeConversationId || undefined
      };
      
      if (currentImage) {
        payload.imageBase64 = currentImage;
      }

      const response = await api.askAssistant(payload);
      
      if (response.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
        if (!activeConversationId && response.conversationId) {
          setActiveConversationId(response.conversationId);
          fetchConversations();
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Server error: ' + (response.error || 'Unknown') }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to communicate with the assistant. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t.assistant?.voiceNotSupported || 'Voice not supported');
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
    <div className="flex h-[calc(100vh-0px)] relative overflow-hidden bg-background">
      
      {/* Mobile Sidebar Toggle */}
      <button 
        className="md:hidden absolute top-4 left-4 z-50 p-2 bg-emerald-900 rounded-lg text-foreground"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 absolute md:relative z-40 w-64 h-full bg-sidebar border-r border-border flex flex-col`}>
        <div className="p-4 pt-16 md:pt-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-primary flex items-center gap-2">
            <MessageSquare size={18} /> History
          </h2>
          <button onClick={createNewChat} className="p-2 hover:bg-emerald-900 rounded-full transition-colors text-emerald-300">
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(conv => (
            <button
              key={conv._id}
              onClick={() => loadConversation(conv._id)}
              className={`w-full text-left p-3 rounded-lg text-sm truncate transition-colors ${
                activeConversationId === conv._id 
                  ? 'bg-emerald-900/50 text-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-muted-foreground'
              }`}
            >
              {conv.title}
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground text-center p-4">No previous chats</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative max-w-4xl mx-auto w-full">
        <div className="p-4 md:p-6 border-b border-border flex items-center justify-center bg-sidebar/50 backdrop-blur-sm z-10">
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              AgroSarthi AI
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm mt-1">Your agricultural copilot</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-4">
              <Sparkles size={48} className="text-primary" />
              <p className="text-sm">Ask me about your crops, weather, or farm health!</p>
              
              <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-md">
                {['Today\'s Weather', 'Will it rain tomorrow?', 'What crop am I growing?'].map(prompt => (
                  <button 
                    key={prompt} 
                    onClick={() => sendMessage(prompt)}
                    className="px-4 py-2 bg-accent border border-border rounded-full text-xs hover:bg-accent/80 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            
            // Handle image payload display
            let contentText = msg.content;
            let hasImage = false;
            try {
              if (contentText.startsWith('{') && contentText.includes('"hasImage":true')) {
                const parsed = JSON.parse(contentText);
                contentText = parsed.text;
                hasImage = true;
              }
            } catch(e) {}

            return (
              <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles size={16} className="text-primary" />
                  </div>
                )}
                
                <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? 'order-first' : ''}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-foreground rounded-tr-sm'
                      : 'bg-accent border border-border text-muted-foreground rounded-tl-sm'
                  }`}>
                    {hasImage && (
                      <div className="mb-2 text-xs opacity-75 flex items-center gap-1">
                        <ImageIcon size={12} /> [Image attached]
                      </div>
                    )}
                    {contentText}
                  </div>
                  
                  {!isUser && (
                    <button
                      onClick={() => speakText(contentText)}
                      className="mt-2 ml-1 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Volume2 size={12} className={isSpeaking ? 'text-primary' : ''} />
                      {isSpeaking ? 'Speaking...' : 'Listen'}
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-1">
                    <User size={16} className="text-blue-400" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
                <Sparkles size={16} className="text-primary" />
              </div>
              <div className="p-4 rounded-2xl bg-accent border border-border rounded-tl-sm">
                <Loader2 size={16} className="animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-sidebar/80 backdrop-blur-md">
          {selectedImage && (
             <div className="mb-3 flex items-center gap-2 p-2 bg-accent rounded-lg border border-emerald-500/30 inline-flex">
               <img src={selectedImage} alt="Preview" className="w-10 h-10 object-cover rounded" />
               <div className="text-xs text-primary flex-1 truncate">Image attached</div>
               <button onClick={() => setSelectedImage(null)} className="text-red-400 hover:text-red-300 p-1">
                 <X size={14} />
               </button>
             </div>
          )}
          
          <div className="flex gap-2 relative">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-all bg-accent border border-border text-muted-foreground hover:text-primary hover:border-emerald-500/30"
              title="Upload crop image"
            >
              <ImageIcon size={20} />
            </button>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageSelect}
            />

            <button
              onClick={isListening ? stopVoice : startVoice}
              className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 text-foreground animate-pulse'
                  : 'bg-accent border border-border text-muted-foreground hover:text-foreground hover:border-emerald-500/30'
              }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder={language === 'hi' ? t.assistant?.placeholderHi || 'अपना प्रश्न पूछें...' : t.assistant?.placeholder || 'Type your question...'}
              className="flex-1 px-4 py-3 rounded-xl bg-accent border border-border focus:border-emerald-500/50 focus:outline-none text-sm transition-colors text-foreground"
            />
            
            <button
              onClick={() => sendMessage(input)}
              disabled={( !input.trim() && !selectedImage ) || isLoading}
              className="w-12 h-12 shrink-0 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all text-foreground shadow-lg shadow-emerald-900/50"
            >
              <Send size={20} className={isLoading ? 'opacity-50' : ''} />
            </button>
          </div>
        </div>
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

