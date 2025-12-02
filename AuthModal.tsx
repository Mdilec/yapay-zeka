import React, { useState } from 'react';
import { BrainCircuit, Loader2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  onLogin: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulation of login process
    setTimeout(() => {
      onLogin(email);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0f172a] border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="relative text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20 transform rotate-3">
            <BrainCircuit size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Nexarion'a Katıl</h2>
          <p className="text-gray-400">Gelecek nesil kodlama deneyimine hoş geldin.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">E-Posta Adresi</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@sirket.com"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (
              <>
                Giriş Yap / Kayıt Ol <ArrowRight size={18} />
              </>
            )}
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0f172a] px-2 text-gray-500">Hızlı Erişim</span></div>
          </div>
          
           <div className="text-center">
             <button 
               type="button" 
               onClick={() => onLogin("demo@nexarion.ai")}
               className="text-gray-400 hover:text-white text-sm transition-colors"
             >
               Demo Hesabı ile Dene
             </button>
           </div>
        </form>

        <p className="mt-6 text-center text-[10px] text-gray-600">
          Devam ederek Hizmet Şartları ve Gizlilik Politikasını kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
};