import React, { useState, useRef, useEffect } from 'react';
import { ModelType, Message, Role, User, ChatSession } from './types';
import { sendMessageStream } from './services/geminiService';
import { 
  loginUser, 
  getCurrentUser, 
  logoutUser, 
  getUserChats, 
  saveChatSession, 
  deleteChatSession, 
  processPayment 
} from './services/storageService';
import { MessageBubble } from './components/MessageBubble';
import { InputArea } from './components/InputArea';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { PaymentGateway } from './components/PaymentGateway';
import { LandingPage } from './components/LandingPage';
import { Sparkles, Trash2, Zap, Menu, Crown, Lock, CheckCircle2, X, BrainCircuit, LogOut, Plus, Shield, History, MessageSquare, Code2 } from 'lucide-react';

const ADMIN_ACCESS_KEY = process.env.ADMIN_KEY || "nexarion_master_key"; 

// Pricing Modal Component
const UpgradeModal = ({ onClose, onUpgrade, isProcessing }: { onClose: () => void, onUpgrade: () => void, isProcessing: boolean }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
    <div className="bg-[#0f172a] border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
      
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
        <X size={20} />
      </button>

      <div className="text-center mb-6 relative">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
          <Crown size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Syntra <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">PRO</span></h2>
        <p className="text-gray-400 text-sm">Profesyonel araçların kilidini açın ve sınırlar olmadan kodlayın.</p>
      </div>

      <div className="space-y-3 mb-8 relative">
        <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800">
          <BrainCircuit className="text-purple-400" size={20} />
          <div className="text-sm">
            <div className="text-gray-200 font-medium">Gemini 3 Pro Modeli</div>
            <div className="text-gray-500 text-xs">Derin düşünme ve karmaşık mantık.</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800">
          <Zap className="text-yellow-400" size={20} />
          <div className="text-sm">
            <div className="text-gray-200 font-medium">Sınırsız Performans</div>
            <div className="text-gray-500 text-xs">Daha hızlı yanıtlar ve öncelik.</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800">
          <CheckCircle2 className="text-emerald-400" size={20} />
          <div className="text-sm">
            <div className="text-gray-200 font-medium">Gelişmiş Kod Analizi</div>
            <div className="text-gray-500 text-xs">Detaylı hata ayıklama ve refactoring.</div>
          </div>
        </div>
      </div>

      <button 
        onClick={onUpgrade}
        className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
      >
        PRO'ya Yükselt - ₺299/ay
      </button>
      <p className="text-center text-[10px] text-gray-500 mt-3">PayTR ile güvenli ödeme.</p>
    </div>
  </div>
);

const CookieBanner = () => {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('syntra_cookies')) setAccepted(true);
  }, []);

  if (accepted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 p-4 z-[100] animate-slide-up">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-400 text-center md:text-left">
          Size en iyi deneyimi sunmak için çerezleri ve yerel depolamayı kullanıyoruz. Sitemizi kullanarak bunu kabul etmiş olursunuz.
        </p>
        <button 
          onClick={() => {
            localStorage.setItem('syntra_cookies', 'true');
            setAccepted(true);
          }}
          className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm whitespace-nowrap"
        >
          Kabul Et
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  
  // Chat State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.FLASH);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modals & Flows
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Admin State
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    // 1. Check for Admin Access in URL (?access=KEY)
    const params = new URLSearchParams(window.location.search);
    const accessKey = params.get('access');
    
    // In production, we should handle this server-side or via protected routes,
    // but for client-side SPA, this works with the "secret URL" concept.
    if (accessKey === ADMIN_ACCESS_KEY) {
      setHasAdminAccess(true);
      window.history.replaceState({}, '', window.location.pathname); // Hide key from URL
    }

    // 2. Load User
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadHistory(user.id);
      setShowLanding(false); // Skip landing if logged in
    }
  }, []);

  // Update Document Title
  useEffect(() => {
    if (currentUser) {
      document.title = "Syntra | Chat";
    } else {
      document.title = "Syntra AI | Yeni Nesil Kodlama Asistanı";
    }
  }, [currentUser]);

  // Save current chat session whenever messages change
  useEffect(() => {
    if (currentUser && sessionId && messages.length > 0) {
      const title = messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? '...' : '');
      const session: ChatSession = {
        id: sessionId,
        userId: currentUser.id,
        title: title,
        messages: messages,
        createdAt: Date.now(), // In real app, preserve original created date
        lastUpdated: Date.now()
      };
      saveChatSession(session);
      loadHistory(currentUser.id); // Refresh sidebar
    }
  }, [messages, sessionId, currentUser]);

  const loadHistory = (userId: string) => {
    const history = getUserChats(userId);
    setChatHistory(history);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogin = async (email: string) => {
    const user = await loginUser(email);
    setCurrentUser(user);
    loadHistory(user.id);
    setShowAuthModal(false);
    setShowLanding(false);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setMessages([]);
    setSessionId(null);
    setChatHistory([]);
    setShowLanding(true);
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(Date.now().toString());
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  const loadChat = (session: ChatSession) => {
    setSessionId(session.id);
    setMessages(session.messages);
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Bu sohbeti silmek istediğinize emin misiniz?')) {
      deleteChatSession(id);
      if (sessionId === id) {
        startNewChat();
      }
      if (currentUser) loadHistory(currentUser.id);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentUser) return;

    // Ensure we have a session ID
    if (!sessionId) {
      setSessionId(Date.now().toString());
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = {
      id: botMsgId,
      role: Role.MODEL,
      content: '',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, botMsg]);

    try {
      const stream = sendMessageStream(content, selectedModel);
      let fullContent = '';

      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId ? { ...msg, content: fullContent } : msg
          )
        );
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? { ...msg, content: "Üzgünüm, bir hata oluştu. Bağlantınızı kontrol edin.", isError: true }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSelect = (model: ModelType) => {
    if (model === ModelType.PRO && !currentUser?.isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    setSelectedModel(model);
  };

  const startPaymentProcess = () => {
    setShowUpgradeModal(false);
    setShowPaymentGateway(true);
  }

  const handlePaymentSuccess = async (cardDetails: any) => {
    if (!currentUser) return;
    setIsProcessingUpgrade(true);
    
    // Simulate Secure API Call to Backend which talks to PayTR
    // In a real app, this would be validating the PayTR token
    const success = await processPayment(currentUser.id, 299, cardDetails);
    
    if (success) {
      // Refresh user data
      const updatedUser = getCurrentUser();
      if (updatedUser) setCurrentUser(updatedUser);
      
      setShowPaymentGateway(false);
      setSelectedModel(ModelType.PRO);
      // alert replaced with a smoother UI notification typically, but for now:
      alert("Ödeme Onaylandı! Syntra PRO hesabınız aktif.");
    } else {
      alert("Ödeme sırasında bankanız işlemi reddetti.");
    }
    setIsProcessingUpgrade(false);
  };

  // If user is not logged in and not explicitly asking for auth modal, show landing
  if (!currentUser && showLanding && !showAuthModal) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowAuthModal(true)} />
        <CookieBanner />
      </>
    );
  }
  
  // Show Auth Modal if requested
  if (!currentUser && showAuthModal) {
    return (
      <>
        <AuthModal onLogin={handleLogin} />
        <CookieBanner />
      </>
    );
  }

  // If logged in, show the App
  return (
    <div className="flex h-screen bg-[#030712] text-gray-100 font-sans overflow-hidden">
      
      {showUpgradeModal && (
        <UpgradeModal 
          onClose={() => setShowUpgradeModal(false)} 
          onUpgrade={startPaymentProcess} 
          isProcessing={false}
        />
      )}

      {showPaymentGateway && (
        <PaymentGateway 
           amount={299}
           onSuccess={handlePaymentSuccess}
           onCancel={() => setShowPaymentGateway(false)}
           isProcessing={isProcessingUpgrade}
        />
      )}

      {showAdminPanel && hasAdminAccess && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-50 w-72 h-full bg-[#0b1120] border-r border-gray-800 flex flex-col transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
               <div className="p-2 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/30">
                <BrainCircuit size={20} className="text-white" />
              </div>
              {currentUser?.isPremium && (
                <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border-2 border-[#0b1120]">
                  <Crown size={10} className="text-white fill-current" />
                </div>
              )}
            </div>
           
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 truncate">
                Syntra AI
              </h1>
              <div className="text-[10px] text-gray-400 truncate">{currentUser?.email}</div>
            </div>
          </div>

          <button 
            onClick={startNewChat}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors shadow-lg shadow-cyan-900/20 font-medium text-sm"
          >
            <Plus size={18} />
            Yeni Sohbet
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          
          {/* Recent Chats Section */}
          <div>
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-1">
              <History size={10} /> Geçmiş
            </h3>
            <div className="space-y-1">
              {chatHistory.length === 0 ? (
                <div className="px-2 text-xs text-gray-600 italic">Henüz geçmiş yok.</div>
              ) : (
                chatHistory.map((chat) => (
                  <div 
                    key={chat.id} 
                    onClick={() => loadChat(chat)}
                    className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      sessionId === chat.id 
                        ? 'bg-gray-800/80 text-white border border-gray-700/50' 
                        : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate flex-1">
                      <MessageSquare size={14} className={sessionId === chat.id ? 'text-cyan-400' : 'text-gray-600'} />
                      <span className="text-xs truncate">{chat.title}</span>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Model Selection */}
           <div>
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Zeka Motoru
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleModelSelect(ModelType.FLASH)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                  selectedModel === ModelType.FLASH
                    ? 'bg-cyan-600/10 border-cyan-500/50 text-cyan-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <Zap size={18} className={selectedModel === ModelType.FLASH ? 'text-yellow-400' : ''} />
                <div className="text-left">
                  <div className="text-sm font-medium">Syntra Flash</div>
                  <div className="text-[10px] opacity-70">Hızlı & Standart</div>
                </div>
              </button>

              <button
                onClick={() => handleModelSelect(ModelType.PRO)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border relative overflow-hidden group ${
                  selectedModel === ModelType.PRO
                    ? 'bg-purple-600/10 border-purple-500/50 text-purple-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                {!currentUser?.isPremium && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Lock size={16} className="text-gray-300" />
                  </div>
                )}
                <div className="relative z-0 flex items-center gap-3 w-full">
                  <Crown size={18} className={selectedModel === ModelType.PRO || !currentUser?.isPremium ? 'text-amber-400' : ''} />
                  <div className="text-left flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Syntra Pro</div>
                      {!currentUser?.isPremium && <Lock size={12} className="text-gray-600" />}
                    </div>
                    <div className="text-[10px] opacity-70">Gemini 3.0 & Logic</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          {!currentUser?.isPremium && (
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="w-full flex items-center justify-center gap-2 p-2 text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:brightness-110 transition-all shadow-lg shadow-cyan-900/20"
            >
              <Crown size={14} />
              PRO'ya Yükselt
            </button>
          )}

          {hasAdminAccess && (
             <button
              onClick={() => setShowAdminPanel(true)}
              className="w-full flex items-center gap-2 p-2 text-xs text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors border border-gray-800 hover:border-gray-600"
            >
              <Shield size={14} className="text-emerald-500" />
              Yönetici Paneli
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-2 text-xs text-red-400 hover:bg-red-950/20 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={14} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative w-full h-full bg-[#030712]">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#0b1120] border-b border-gray-800">
           <div className="flex items-center gap-2">
            <BrainCircuit size={18} className="text-cyan-400" />
            <span className="font-bold text-gray-100">Syntra</span>
           </div>
           <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400">
             <Menu size={24} />
           </button>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 md:px-10 lg:px-20 py-8 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
              <div className="relative group cursor-default">
                <div className="absolute -inset-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-1000 animate-pulse"></div>
                <div className="relative p-8 bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl">
                  <BrainCircuit size={72} className="text-cyan-400" />
                </div>
              </div>
              <div className="space-y-3 max-w-lg">
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 tracking-tight">Syntra AI</h2>
                <p className="text-gray-400 text-lg">
                  Merhaba {currentUser?.name}, bugün ne inşa ediyoruz?
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
                <button onClick={() => handleSendMessage("Modern bir E-Ticaret sitesi için React component yapısı tasarla.")} className="p-4 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 hover:border-cyan-500/30 rounded-xl text-left transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-200 group-hover:text-cyan-300">Sistem Mimarisi</span>
                    <Code2 size={14} className="text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs text-gray-500">E-Ticaret sitesi component yapısı.</span>
                </button>
                <button onClick={() => handleSendMessage("Node.js ve Stripe ile güvenli ödeme endpointi yaz.")} className="p-4 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 hover:border-purple-500/30 rounded-xl text-left transition-all group">
                   <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-200 group-hover:text-purple-300">Backend Güvenliği</span>
                    <Sparkles size={14} className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs text-gray-500">Secure Payment endpoint.</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6 pb-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <InputArea 
          onSend={handleSendMessage} 
          isLoading={isLoading} 
        />
      </main>
    </div>
  );
};

export default App;