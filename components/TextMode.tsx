import React, { useState, useEffect, useCallback } from 'react';
import { streamTranslation, speakText } from '../services/geminiService';
import { Language } from '../types';

// Icons
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
);
const SpeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
);

export const TextMode: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [debouncedInput, setDebouncedInput] = useState(input);

  // Debounce input to avoid API spam
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input);
    }, 800);
    return () => clearTimeout(timer);
  }, [input]);

  const handleTranslate = useCallback(async (text: string) => {
    if (!text.trim()) {
      setOutput('');
      return;
    }
    
    setIsTranslating(true);
    setOutput(''); // Reset output before streaming
    try {
      await streamTranslation(text, (chunk) => {
        setOutput(chunk);
      });
    } catch (e) {
      console.error(e);
      setOutput('Error processing translation.');
    } finally {
      setIsTranslating(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedInput) {
      handleTranslate(debouncedInput);
    }
  }, [debouncedInput, handleTranslate]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSpeak = async () => {
    if (!output || isSpeaking) return;
    setIsSpeaking(true);
    try {
      await speakText(output);
    } catch (e) {
      console.error("Failed to play audio", e);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-4 md:p-8 gap-4 font-sc">
      {/* Language Header (Visual only since it detects automatically) */}
      <div className="flex items-center justify-center gap-4 text-sm font-medium text-gray-500 mb-2">
        <span className="bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">Auto / 自动检测</span>
        <ArrowRightIcon />
        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full shadow-sm border border-indigo-100">Melayu / 华语</span>
      </div>

      <div className="flex flex-col md:flex-row gap-4 h-full min-h-[400px]">
        {/* Input Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <textarea
            className="flex-1 w-full p-6 text-lg md:text-xl text-gray-800 bg-transparent resize-none focus:outline-none placeholder-gray-300 font-sc"
            placeholder="Taip dalam BM atau Mandarin...&#10;在此输入马来文或华文..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
          <div className="p-4 border-t border-gray-50 flex justify-between items-center text-gray-400">
             <span className="text-xs">{input.length} huruf / 字符</span>
             {input && (
                <button onClick={() => setInput('')} className="hover:text-gray-600 transition-colors text-sm">
                  Padam / 清除
                </button>
             )}
          </div>
        </div>

        {/* Output Area */}
        <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col relative overflow-hidden">
          {isTranslating && !output && (
             <div className="absolute inset-0 flex items-center justify-center text-gray-400 gap-2">
               <span className="animate-spin"><RefreshIcon /></span>
               Menterjemah / 翻译中...
             </div>
          )}
          <div className="flex-1 p-6 text-lg md:text-xl text-gray-800 font-sc leading-relaxed overflow-y-auto whitespace-pre-wrap">
            {output || <span className="text-gray-300">Terjemahan akan muncul di sini...<br/>翻译结果将显示在此处...</span>}
          </div>
          <div className="p-4 border-t border-gray-100 flex justify-end items-center gap-2">
             <button 
               onClick={handleSpeak}
               className={`p-2 rounded-lg transition-all ${isSpeaking ? 'text-indigo-600 bg-indigo-50 animate-pulse' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
               title="Dengar / 收听"
               disabled={!output || isSpeaking}
             >
               <SpeakerIcon />
             </button>
             <button 
               onClick={() => copyToClipboard(output)} 
               className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
               title="Salin / 复制"
               disabled={!output}
             >
               <CopyIcon />
             </button>
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-400 mt-4">
         Powered by Gemini 2.5 Flash
      </div>
    </div>
  );
};