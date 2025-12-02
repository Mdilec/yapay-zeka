import React, { useState } from 'react';
import { BrainCircuit, ChevronRight, Code2, Zap, Shield, Cpu, ArrowRight, Check, Plus, Minus } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-800">
      <button 
        className="w-full py-6 text-left flex items-center justify-between focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-gray-200">{question}</span>
        {isOpen ? <Minus className="text-cyan-400" size={20} /> : <Plus className="text-gray-500" size={20} />}
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-gray-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  // Helper function for smooth scrolling without URL hash changes
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans overflow-x-hidden selection:bg-cyan-500/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">Syntra</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors bg-transparent border-none cursor-pointer">Özellikler</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors bg-transparent border-none cursor-pointer">Fiyatlandırma</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors bg-transparent border-none cursor-pointer">SSS</button>
          </div>
          <button 
            onClick={onGetStarted}
            className="px-5 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            Giriş Yap
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] -z-10 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs font-medium text-cyan-400 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Gemini 3 Pro Modeli Yayında
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-500 animate-slide-up">
            Kodlamanın <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Yeni Frekansı.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Syntra, karmaşık mimarileri tasarlayan, güvenli kod yazan ve modern arayüzler üreten elit yapay zeka asistanınızdır.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button 
              onClick={onGetStarted}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Hemen Başla <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="w-full md:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 font-semibold rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              Demoyu İzle
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid (Bento Box) */}
      <section id="features" className="py-20 bg-gray-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Main Feature */}
            <div className="md:col-span-2 bg-[#0b1120] rounded-3xl p-8 border border-gray-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/20 transition-all"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                  <Code2 className="text-cyan-400" size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Akıllı Kod Mimarı</h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  Sadece snippet değil, tam kapsamlı sistem mimarileri tasarlayın. React, Node.js, Python ve Go dillerinde uzmanlaşmış motor.
                </p>
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 font-mono text-xs text-gray-400">
                  <div className="text-cyan-400">import</div> <div className="text-white inline">Syntra</div> <div className="text-purple-400 inline">from</div> <div className="text-green-400 inline">'@ai/core'</div>;
                  <br/>
                  <div className="text-blue-400">const</div> solution = <div className="text-yellow-400 inline">await</div> Syntra.architect(<span className="text-orange-400">'SaaS Platform'</span>);
                </div>
              </div>
            </div>

            {/* Side Feature 1 */}
            <div className="bg-[#0b1120] rounded-3xl p-8 border border-gray-800 relative overflow-hidden group">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                <Zap className="text-yellow-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Işık Hızında</h3>
              <p className="text-gray-400 text-sm">
                Gemini 2.5 Flash motoru ile milisaniyeler içinde yanıt alın. Beklemek yok.
              </p>
            </div>

            {/* Side Feature 2 */}
            <div className="bg-[#0b1120] rounded-3xl p-8 border border-gray-800 relative overflow-hidden group">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                <Shield className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Güvenli Altyapı</h3>
              <p className="text-gray-400 text-sm">
                Kurumsal seviyede şifreleme ve güvenli ödeme (PayTR) altyapısı.
              </p>
            </div>

             {/* Side Feature 3 */}
             <div className="md:col-span-2 bg-[#0b1120] rounded-3xl p-8 border border-gray-800 relative overflow-hidden group flex flex-col md:flex-row items-center gap-8">
               <div className="flex-1">
                 <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                  <Cpu className="text-purple-400" size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Gemini 3 Pro Gücü</h3>
                <p className="text-gray-400">
                  Syntra PRO ile Google'ın en gelişmiş modeline erişin. Karmaşık mantık yürütme, "Thinking Budget" ile derinlemesine analiz.
                </p>
               </div>
               <div className="w-full md:w-1/3 aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-gray-800">
                 <div className="text-6xl font-bold text-white/10">3.0</div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Basit Fiyatlandırma</h2>
          <p className="text-gray-400">Gizli ücret yok. İstediğiniz zaman iptal edin.</p>
        </div>

        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Free Plan */}
          <div className="bg-[#0b1120] rounded-3xl p-8 border border-gray-800 flex flex-col">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Başlangıç</h3>
              <div className="text-4xl font-bold text-white mb-2">Ücretsiz</div>
              <p className="text-sm text-gray-500">Hobi projeleri ve öğrenciler için.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-gray-300">
                <Check size={18} className="text-gray-500" /> Standart Hız (Flash Model)
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Check size={18} className="text-gray-500" /> Temel Kod Desteği
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Check size={18} className="text-gray-500" /> Günlük 50 Mesaj
              </li>
            </ul>
            <button 
              onClick={onGetStarted}
              className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
            >
              Ücretsiz Başla
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-b from-gray-900 to-[#0b1120] rounded-3xl p-8 border border-cyan-500/30 relative flex flex-col shadow-2xl shadow-cyan-900/20">
            <div className="absolute top-0 right-0 bg-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
              EN POPÜLER
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-cyan-400 mb-2">Syntra PRO</h3>
              <div className="flex items-end gap-1 mb-2">
                <div className="text-4xl font-bold text-white">₺299</div>
                <div className="text-gray-500 mb-1">/ay</div>
              </div>
              <p className="text-sm text-gray-500">Profesyonel geliştiriciler için tam güç.</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-white">
                <div className="bg-cyan-500/20 p-1 rounded-full"><Check size={14} className="text-cyan-400" /></div>
                Gemini 3 Pro Modeli
              </li>
              <li className="flex items-center gap-3 text-white">
                <div className="bg-cyan-500/20 p-1 rounded-full"><Check size={14} className="text-cyan-400" /></div>
                Sınırsız Mesajlaşma
              </li>
              <li className="flex items-center gap-3 text-white">
                <div className="bg-cyan-500/20 p-1 rounded-full"><Check size={14} className="text-cyan-400" /></div>
                Derin Düşünme (Thinking Mode)
              </li>
              <li className="flex items-center gap-3 text-white">
                <div className="bg-cyan-500/20 p-1 rounded-full"><Check size={14} className="text-cyan-400" /></div>
                Erken Erişim Özellikleri
              </li>
            </ul>
            <button 
              onClick={onGetStarted}
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-cyan-500/25"
            >
              PRO'ya Yükselt
            </button>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-950/50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Sıkça Sorulan Sorular</h2>
            <p className="text-gray-400">Aklınıza takılan soruların cevapları burada.</p>
          </div>
          
          <div className="space-y-2">
            <FAQItem 
              question="Syntra ücretsiz kullanılabilir mi?" 
              answer="Evet, Syntra'yı temel özelliklerle ve Gemini Flash modeliyle tamamen ücretsiz olarak kullanabilirsiniz. Daha gelişmiş özellikler için PRO pakete geçebilirsiniz." 
            />
            <FAQItem 
              question="İstediğim zaman üyeliğimi iptal edebilir miyim?" 
              answer="Kesinlikle. Üyeliğinizi panelinizden tek tıkla iptal edebilirsiniz. Herhangi bir taahhüt veya cayma bedeli yoktur." 
            />
            <FAQItem 
              question="Ödeme bilgilerim güvende mi?" 
              answer="Evet, ödemeler PayTR altyapısı ile 256-bit SSL şifreleme kullanılarak işlenir. Kart bilgileriniz sunucularımızda saklanmaz." 
            />
            <FAQItem 
              question="Gemini 3 Pro modelinin farkı nedir?" 
              answer="Gemini 3 Pro, özellikle karmaşık mantık yürütme, derinlemesine kod analizi ve çok adımlı problem çözme konularında Flash modele göre çok daha yeteneklidir." 
            />
            <FAQItem 
              question="Mobil uygulaması var mı?" 
              answer="Syntra bir PWA (Progressive Web App) uygulamasıdır. Tarayıcınızdan 'Ana Ekrana Ekle' diyerek telefonunuza uygulama gibi yükleyebilirsiniz." 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-900 bg-[#02040a] text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
           <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="text-gray-600" size={24} />
            <span className="text-xl font-bold text-gray-500">Syntra AI</span>
          </div>
          <p className="text-gray-600 text-sm">© 2024 Syntra Inc. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};