import React, { useEffect, useState } from 'react';
import { getAdminStats } from '../services/storageService';
import { Transaction } from '../types';
import { DollarSign, Users, Activity, X, Search } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeProUsers: number;
    totalRevenue: number;
    transactions: Transaction[];
  } | null>(null);

  useEffect(() => {
    // Refresh stats every time panel opens
    const data = getAdminStats();
    setStats(data);
  }, []);

  if (!stats) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0b1120] border border-gray-800 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Nexarion <span className="text-indigo-500">Admin</span>
            </h2>
            <p className="text-gray-400 text-sm">Platform yönetimi ve finansal raporlar.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <DollarSign size={20} />
                </div>
                <span className="text-gray-400 text-sm font-medium">Toplam Gelir</span>
              </div>
              <div className="text-3xl font-bold text-white">₺{stats.totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-emerald-500 mt-1">+12% geçen aydan</div>
            </div>

            <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Users size={20} />
                </div>
                <span className="text-gray-400 text-sm font-medium">Toplam Kullanıcı</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
              <div className="text-xs text-gray-500 mt-1">{stats.activeProUsers} Premium üye</div>
            </div>

            <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <Activity size={20} />
                </div>
                <span className="text-gray-400 text-sm font-medium">Sistem Durumu</span>
              </div>
              <div className="text-xl font-bold text-emerald-400">Aktif</div>
              <div className="text-xs text-gray-500 mt-1">API Latency: 45ms</div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-gray-900/30 rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-200">Son İşlemler & Satın Alımlar</h3>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="İşlem ara..." 
                  className="bg-gray-950 border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-300 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-500 uppercase bg-gray-950/50">
                  <tr>
                    <th className="px-6 py-3">İşlem ID</th>
                    <th className="px-6 py-3">Kullanıcı</th>
                    <th className="px-6 py-3">Tarih</th>
                    <th className="px-6 py-3">Tutar</th>
                    <th className="px-6 py-3">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-600">Henüz işlem kaydı yok.</td>
                    </tr>
                  ) : (
                    stats.transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                        <td className="px-6 py-4 font-mono text-xs">{tx.id.slice(-8)}</td>
                        <td className="px-6 py-4 text-white">{tx.userEmail}</td>
                        <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</td>
                        <td className="px-6 py-4 font-medium text-emerald-400">+₺{tx.amount}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                            Başarılı
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};