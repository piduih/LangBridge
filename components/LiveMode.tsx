import React from 'react';
import { useLiveTranslation } from '../hooks/useLiveTranslation';

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>
);

const Waveform: React.FC<{ volume: number, active: boolean }> = ({ volume, active }) => {
  // Create a visual representation of audio
  const bars = 5;
  
  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {Array.from({ length: bars }).map((_, i) => {
        // Pseudo-random animation based on volume
        const height = active ? Math.max(10, volume * 100 * (Math.random() * 0.5 + 0.5)) : 4;
        return (
          <div 
            key={i}
            className={`w-3 rounded-full transition-all duration-75 ${active ? 'bg-indigo-500' : 'bg-gray-300'}`}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
};

export const LiveMode: React.FC = () => {
  const { isConnected, isConnecting, error, volume, connect, disconnect } = useLiveTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto p-6 text-center font-sc">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Perbualan Langsung / 实时对话</h2>
        <p className="text-gray-500">
          Cakap dalam BM atau Mandarin. AI akan menterjemah secara terus.
          <br />
          <span className="text-sm">请讲马来语或华语。AI将实时为您翻译。</span>
        </p>
      </div>

      {/* Visualizer Circle */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        {/* Pulsing rings when active */}
        {isConnected && (
          <>
             <div 
               className="absolute inset-0 bg-indigo-100 rounded-full opacity-50"
               style={{ transform: `scale(${1 + volume * 0.5})`, transition: 'transform 0.1s ease-out' }}
             />
             <div 
               className="absolute inset-4 bg-indigo-200 rounded-full opacity-30"
               style={{ transform: `scale(${1 + volume * 0.3})`, transition: 'transform 0.1s ease-out' }}
             />
          </>
        )}
        
        {/* Main Status Circle */}
        <div className={`
          relative z-10 w-40 h-40 rounded-full flex items-center justify-center shadow-xl transition-all duration-500
          ${isConnected ? 'bg-white border-4 border-indigo-500' : 'bg-white border border-gray-200'}
        `}>
           {isConnected ? (
             <div className="h-20 flex items-center gap-1">
               <div className="w-2 bg-indigo-500 rounded-full animate-[bounce_1s_infinite]" style={{ height: `${20 + volume * 80}%`, animationDelay: '0ms' }}></div>
               <div className="w-2 bg-indigo-500 rounded-full animate-[bounce_1s_infinite]" style={{ height: `${20 + volume * 80}%`, animationDelay: '100ms' }}></div>
               <div className="w-2 bg-indigo-500 rounded-full animate-[bounce_1s_infinite]" style={{ height: `${20 + volume * 80}%`, animationDelay: '200ms' }}></div>
             </div>
           ) : (
             <span className="text-gray-300">
               <MicIcon />
             </span>
           )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 w-full">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-2">
            {error}
          </div>
        )}

        {!isConnected ? (
          <button
            onClick={connect}
            disabled={isConnecting}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all
              ${isConnecting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'}
            `}
          >
             {isConnecting ? (
               <>Menyambung... / 连接中...</>
             ) : (
               <>
                 <MicIcon /> Mula / 开始对话
               </>
             )}
          </button>
        ) : (
          <button
            onClick={disconnect}
            className="flex items-center gap-3 px-8 py-4 rounded-full text-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-100"
          >
            <StopIcon /> Tamat / 结束会话
          </button>
        )}
      </div>
      
      <div className="mt-8 text-xs text-gray-400">
        Mod kelaian rendah • Powered by Gemini Live
      </div>
    </div>
  );
};