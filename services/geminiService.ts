import { GoogleGenAI, Modality } from "@google/genai";
import { Language } from "../types";

// Helper to get key from storage or env
const getApiKey = () => {
  return localStorage.getItem("gemini_api_key") || process.env.API_KEY;
};

// System instruction to ensure high-quality translation including dialects
const SYSTEM_INSTRUCTION = `You are a professional, high-speed translator specializing in Malay (Bahasa Melayu) and Mandarin (Simplified Chinese). 
Your goal is to provide natural, culturally accurate translations. 
You are an expert in understanding and translating native dialects, slang, and colloquialisms (e.g., Bahasa Pasar, Loghat Utara, Pantai Timur, colloquial Mandarin).
Do not explain the translation. Just output the translated text.
If the input is Malay (standard or dialect), translate to Mandarin.
If the input is Mandarin, translate to Malay.
If the input is mixed, translate to the primary target language of the context.
Maintain the tone (formal/informal) of the original text.`;

export const streamTranslation = async (
  text: string, 
  onChunk: (text: string) => void
): Promise<string> => {
  if (!text.trim()) return "";

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing. Please click the Gear icon to set your API Key.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // Low temperature for deterministic translations
      },
    });

    let fullText = "";
    for await (const chunk of response) {
      if (chunk.text) {
        fullText += chunk.text;
        onChunk(fullText);
      }
    }
    return fullText;
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};

// --- TTS Helpers ---

const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const playPCM = async (pcmData: Uint8Array, sampleRate: number = 24000) => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioContextClass({ sampleRate });
  
  const dataInt16 = new Int16Array(pcmData.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
  
  return new Promise<void>((resolve) => {
    source.onended = () => {
      resolve();
      // ctx.close(); // Clean up context if desired, or let garbage collector handle it
    };
  });
};

export const speakText = async (text: string): Promise<void> => {
  if (!text.trim()) return;

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing. Please click the Gear icon to set your API Key.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text: text }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio generated");
    }

    const pcmBytes = decodeBase64(base64Audio);
    await playPCM(pcmBytes, 24000);

  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
};