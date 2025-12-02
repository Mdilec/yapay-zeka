import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface InputAreaProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading && !disabled) {
      onSend(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2 bg-gradient-to-t from-[#030712] via-[#030712] to-transparent">
      <form onSubmit={handleSubmit} className="relative group">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Syntra'ya mimari, kod veya tasarım hakkında sorun..."
          className="w-full bg-gray-900/90 text-gray-100 rounded-2xl border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pl-4 pr-14 py-4 min-h-[60px] max-h-[200px] resize-none scrollbar-hide shadow-lg transition-all text-base placeholder-gray-500"
          disabled={isLoading || disabled}
          rows={1}
        />
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!input.trim() || isLoading || disabled}
          className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all duration-200 ${
            input.trim() && !isLoading 
              ? 'bg-cyan-600 text-white shadow-lg hover:bg-cyan-500' 
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
      <div className="text-center mt-2">
        <p className="text-xs text-gray-600">Syntra AI hata yapabilir. Lütfen kodu ve bilgileri doğrulayın.</p>
      </div>
    </div>
  );
};