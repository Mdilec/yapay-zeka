import React, { useMemo } from 'react';
import { Role, Message } from '../types';
import { Bot, User, AlertCircle } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  // Simple Markdown Parser specifically for Code Blocks
  // This allows us to render nice code blocks without heavy dependencies
  const contentParts = useMemo(() => {
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(message.content)) !== null) {
      // Text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: message.content.substring(lastIndex, match.index)
        });
      }

      // Code block
      parts.push({
        type: 'code',
        language: match[1] || '',
        content: match[2]
      });

      lastIndex = regex.lastIndex;
    }

    // Remaining text
    if (lastIndex < message.content.length) {
      parts.push({
        type: 'text',
        content: message.content.substring(lastIndex)
      });
    }

    return parts;
  }, [message.content]);

  return (
    <div className={`flex w-full gap-4 py-6 ${isUser ? 'bg-transparent' : 'bg-gray-850/30'}`}>
      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10">
        {isUser ? (
          <div className="flex items-center justify-center w-full h-full rounded-full bg-indigo-600 shadow-indigo-500/20 shadow-lg">
            <User size={20} className="text-white" />
          </div>
        ) : (
          <div className={`flex items-center justify-center w-full h-full rounded-full ${message.isError ? 'bg-red-500/20' : 'bg-emerald-600'} shadow-lg`}>
            {message.isError ? <AlertCircle size={20} className="text-red-500" /> : <Bot size={20} className="text-white" />}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-200">
            {isUser ? 'Siz' : 'DevMind AI'}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className={`prose prose-invert max-w-none text-gray-300 leading-7 ${message.isError ? 'text-red-400' : ''}`}>
          {contentParts.length === 0 ? (
             <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            contentParts.map((part, index) => {
              if (part.type === 'code') {
                return (
                  <CodeBlock 
                    key={index} 
                    language={part.language} 
                    code={part.content.trim()} 
                  />
                );
              }
              // Basic formatting for bold/italic in text parts
              // This is a lightweight substitute for a full markdown parser
              return (
                <div key={index} className="whitespace-pre-wrap mb-2">
                  {part.content.split(/(\*\*.*?\*\*)/g).map((chunk, i) => {
                    if (chunk.startsWith('**') && chunk.endsWith('**')) {
                      return <strong key={i} className="text-white font-bold">{chunk.slice(2, -2)}</strong>;
                    }
                    return chunk;
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};