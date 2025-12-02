import React, { useState, useEffect } from 'react';
import { Loader2, Lock, ShieldCheck, X } from 'lucide-react';

interface PaymentGatewayProps {
  amount: number;
  onSuccess: (cardDetails: any) => Promise<void>;
  onCancel: () => void;
  isProcessing: boolean;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({ amount, onSuccess, onCancel, isProcessing }) => {
  const [loadingIframe, setLoadingIframe] = useState(true);

  useEffect(() => {
    // Simulate PayTR Iframe loading time
    const timer = setTimeout(() => setLoadingIframe(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handlePayTRSuccess = () => {
    // This function simulates the callback from PayTR
    // In a real scenario, PayTR posts to your backend, and your backend confirms via webhook
    onSuccess({ method: 'PayTR_IFrame_Token' });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] overflow-hidden shadow-2xl relative flex flex-col">
        
        {/* Header mimicking a secure payment window */}
        <div className="bg-[#f8f9fa] border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold tracking-tighter text-blue-900">PayTR</div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2 text-green-700 text-xs font-semibold bg-green-100 px-2 py-1 rounded">
              <Lock size={12} />
              SSL Secured 256-Bit
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white relative">
          {loadingIframe ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-sm text-gray-500">Güvenli ödeme sayfası yükleniyor...</p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col">
              {/* Fake IFrame Content */}
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-6">
                    <p className="text-gray-500 text-sm">İşyeri: <strong>Syntra AI Yazılım A.Ş.</strong></p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₺{amount.toFixed(2)}</p>
                  </div>

                  {/* Mock PayTR Form Fields */}
                  <div className="space-y-4">
                    <div className="p-4 border border-blue-100 bg-blue-50 rounded-lg mb-4">
                      <h4 className="font-bold text-blue-900 text-sm mb-2">Kart Bilgileri</h4>
                      <div className="space-y-3">
                         <input type="text" placeholder="Kart Numarası" className="w-full border border-gray-300 rounded p-2 text-sm" disabled />
                         <div className="flex gap-2">
                           <input type="text" placeholder="AA/YY" className="w-1/2 border border-gray-300 rounded p-2 text-sm" disabled />
                           <input type="text" placeholder="CVC" className="w-1/2 border border-gray-300 rounded p-2 text-sm" disabled />
                         </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200">
                      <strong>Demo Modu:</strong> Gerçek bir PayTR entegrasyonunda bu alan PayTR sunucularından gelen IFrame içeriği ile dolar. 
                    </div>
                  </div>
                  
                  <button 
                    onClick={handlePayTRSuccess}
                    className="w-full mt-6 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-3 rounded shadow-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : 'Ödemeyi Tamamla (Simülasyon)'}
                  </button>
                  
                  <div className="mt-4 flex justify-center gap-2 opacity-50 grayscale">
                    <div className="h-6 w-10 bg-blue-800 rounded"></div>
                    <div className="h-6 w-10 bg-red-600 rounded"></div>
                    <div className="h-6 w-10 bg-blue-500 rounded"></div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="border-t border-gray-100 p-4 text-center text-[10px] text-gray-400">
                PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};