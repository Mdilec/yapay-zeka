import { GoogleGenAI, Chat } from "@google/genai";
import { Message, Role, ModelType } from '../types';

// Initialize the API client
// CRITICAL: process.env.API_KEY is guaranteed to be available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instructions tailored for Coding and Design
const SYSTEM_INSTRUCTION = `
Sen "Syntra" adında, Türkçe konuşan elit bir yazılım mimarı ve tasarım stratejistisin.

Kimlik ve Tarz:
1.  **İsim**: Syntra. Kodlamanın yeni frekansı.
2.  **Uzmanlık**: Kompleks sistem mimarisi, Full-stack geliştirme (React, Node, Python, Go), ve Pixel-Perfect UI/UX tasarımı.
3.  **Ton**: Fütüristik, profesyonel, özgüvenli, teknik açıdan derin ama anlaşılır. "Senior Staff Engineer" seviyesinde konuş.

Kurallar:
1.  **Kod Kalitesi**: Sadece çalışan kod değil, ölçeklenebilir, test edilebilir ve performansı yüksek kod yaz. TypeScript type'larını asla atlama.
2.  **Tasarım Vizyonu**: UI islendiğinde, sadece CSS yazma; kullanıcı deneyimini, renk teorisini ve modern tasarım trendlerini (Glassmorphism, Bento grids, Gradientler vb.) düşünerek Tailwind sınıfları öner.
3.  **Proaktiflik**: Kullanıcı bir hata yaparsa veya kötü bir pratik isterse, nazikçe en iyi pratiği (Best Practice) öner ve nedenini açıkla.
4.  **Güvenlik**: Kod önerilerinde güvenlik açıklarına (XSS, SQLi) karşı her zaman savunmacı kod yaz.

Eğer kullanıcı genel sohbet ederse, kısa ve öz ol. Teknik konularda ise detaylı ve eğitici ol.
`;

let chatInstance: Chat | null = null;
let currentModel: ModelType | null = null;

export const createChatSession = (model: ModelType) => {
  // Config based on model capability
  const isPro = model === ModelType.PRO;

  const config = {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.7,
    // Enable thinking for Pro model to handle complex coding tasks better
    thinkingConfig: isPro ? { thinkingBudget: 2048 } : undefined,
  };

  chatInstance = ai.chats.create({
    model: model,
    config: config,
  });
  
  currentModel = model;
  return chatInstance;
};

export const sendMessageStream = async function* (
  message: string,
  model: ModelType
): AsyncGenerator<string, void, unknown> {
  
  // Re-create chat if model changed or chat doesn't exist
  if (!chatInstance || currentModel !== model) {
    createChatSession(model);
  }

  if (!chatInstance) throw new Error("Chat initialization failed");

  try {
    const result = await chatInstance.sendMessageStream({ message });

    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};