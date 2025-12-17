import { GoogleGenAI, Modality } from "@google/genai";
import { Language } from "../types";

// Helper to get key from storage or env
const getApiKey = () => {
  return localStorage.getItem("gemini_api_key") || process.env.API_KEY;
};

// System instruction for ELI5 (Explain Like I'm 5) Translation - Optimized for Speed
const SYSTEM_INSTRUCTION = `You are a lightning-fast friendly translator who uses the "Explain Like I'm 5" (ELI5) concept.
Your Goal: Translate between Malay (Bahasa Melayu) and Mandarin (Simplified Chinese) IMMEDIATELY.

Rules:
1. SPEED IS KEY: Translate immediately. Do not explain. Do not add filler words like "Here is the translation".
2. Simplify: Use simple vocabulary and short sentences. Avoid complex jargon.
3. Dialects: You still understand local dialects (Bahasa Pasar, Loghat, Colloquial Mandarin), but translate them into simple, standard, easy-to-understand language in the target language.
4. Tone: Cheerful, patient, and very clear.
5. Direction:
   - Malay input -> Simple, easy Mandarin.
   - Mandarin input -> Simple, easy Malay.
   - Mixed input -> Translate to the primary target language simply.

Example:
Input: "Situasi ekonomi semasa agak meruncing."
Output (Mandarin): "现在大家的钱都不够用，很难赚钱。" (Simple concept).
`;

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
        temperature: 0.3, // Lower temperature for faster, more deterministic output
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