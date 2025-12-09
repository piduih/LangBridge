import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// Audio configs
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

interface UseLiveTranslationReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  volume: number; // For visualization 0-1
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useLiveTranslation = (): UseLiveTranslationReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  // Refs for audio processing to avoid stale closures and re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Helper: Encode PCM for Gemini
  const encodePCM = (inputData: Float32Array): string => {
    const l = inputData.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      // Simple clamping
      const s = Math.max(-1, Math.min(1, inputData[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Helper: Decode Audio from Gemini
  const decodeAudioData = async (
    base64: string,
    ctx: AudioContext
  ): Promise<AudioBuffer> => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const dataInt16 = new Int16Array(bytes.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, OUTPUT_SAMPLE_RATE);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const disconnect = useCallback(() => {
    // Stop microphone
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Disconnect audio nodes
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    // Close Audio Context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Clear Audio Queue
    audioQueueRef.current.forEach(source => source.stop());
    audioQueueRef.current.clear();

    // Close Session
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => {
        if (session && typeof session.close === 'function') {
          session.close();
        }
      }).catch((e: any) => {
         console.debug("Session close error/ignored", e);
      });
      sessionRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setVolume(0);
    nextStartTimeRef.current = 0;
  }, []);

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    setIsConnecting(true);
    setError(null);

    try {
      const apiKey = localStorage.getItem("gemini_api_key") || process.env.API_KEY;

      if (!apiKey) {
        throw new Error("API Key missing. Click the Gear icon to set it.");
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({ sampleRate: OUTPUT_SAMPLE_RATE });
      audioContextRef.current = ctx;
      nextStartTimeRef.current = ctx.currentTime;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        sampleRate: INPUT_SAMPLE_RATE,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }});
      mediaStreamRef.current = stream;

      // Start Session
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Live Session Opened");
            setIsConnected(true);
            setIsConnecting(false);

            // Setup Input Stream Processing
            const source = ctx.createMediaStreamSource(stream);
            sourceRef.current = source;
            
            // Use ScriptProcessor for raw PCM access
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate volume for visualizer
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(1, rms * 5));

              // Send to API
              const b64Data = encodePCM(inputData);
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: {
                    mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}`,
                    data: b64Data
                  }
                });
              });
            };

            const mute = ctx.createGain();
            mute.gain.value = 0;
            source.connect(processor);
            processor.connect(mute);
            mute.connect(ctx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const serverContent = msg.serverContent;
            
            // Handle Audio Output
            const audioData = serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
               const audioCtx = audioContextRef.current;
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
               
               const buffer = await decodeAudioData(audioData, audioCtx);
               const source = audioCtx.createBufferSource();
               source.buffer = buffer;
               source.connect(audioCtx.destination);
               
               source.addEventListener('ended', () => {
                 audioQueueRef.current.delete(source);
               });
               
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += buffer.duration;
               audioQueueRef.current.add(source);
            }

            // Handle Interruption
            if (serverContent?.interrupted) {
               console.log("Interrupted");
               audioQueueRef.current.forEach(s => s.stop());
               audioQueueRef.current.clear();
               if(audioContextRef.current) {
                 nextStartTimeRef.current = audioContextRef.current.currentTime;
               }
            }
          },
          onclose: () => {
            console.log("Session Closed");
            setIsConnected(false);
          },
          onerror: (e) => {
            console.error("Session Error", e);
            // This callback catches runtime errors, but not necessarily initial connection errors
            setError("Connection error. Please try again.");
            disconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: `You are a simultaneous interpreter between Malay (Bahasa Melayu) and Mandarin. 
          You are expert in handling native dialects, slang, and colloquial speech in both languages (e.g. Bahasa Pasar, regional Malay dialects).
          If you hear Malay, translate it to Mandarin spoken audio. 
          If you hear Mandarin, translate it to Malay spoken audio. 
          Keep translations concise, natural, and immediate. Do not chat, only translate.`,
        }
      });
      
      sessionRef.current = sessionPromise;
      // Await connection to catch initial failures (Network Error, etc.)
      await sessionPromise;

    } catch (err: any) {
      console.error("Connection failed:", err);
      setError(err.message || "Failed to start session");
      setIsConnecting(false);
      disconnect(); // Ensure cleanup
    }
  }, [isConnected, isConnecting, disconnect]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    volume,
    connect,
    disconnect
  };
};