import React, { useState } from 'react';
import { AppMode } from './types';
import { TextMode } from './components/TextMode';
import { LiveMode } from './components/LiveMode';

// Simple Icons
const TextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
const VoiceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);
const HelpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.TEXT);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#f9fafe] overflow-hidden font-sc">
      {/* Header */}
      <header className="flex-none bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            J
          </div>
          <h1 className="font-semibold text-gray-800 text-lg tracking-tight hidden md:block">Jambatan Bahasa</h1>
          <h1 className="font-semibold text-gray-800 text-lg tracking-tight md:hidden">Jambatan</h1>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl mx-2">
          <button
            onClick={() => setMode(AppMode.TEXT)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === AppMode.TEXT ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TextIcon /> <span className="hidden sm:inline">Teks / 文字</span><span className="sm:hidden">Teks</span>
          </button>
          <button
             onClick={() => setMode(AppMode.LIVE)}
             className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === AppMode.LIVE ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <VoiceIcon /> <span className="hidden sm:inline">Langsung / 实时</span><span className="sm:hidden">Live</span>
          </button>
        </div>

        <button 
          onClick={() => setShowGuide(true)}
          className="text-gray-400 hover:text-indigo-600 transition-colors p-2"
          title="Panduan / 指南"
        >
          <HelpIcon />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 transition-opacity duration-300 ${mode === AppMode.TEXT ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
           <TextMode />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${mode === AppMode.LIVE ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
           <LiveMode />
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-none bg-white border-t border-gray-100 py-3 px-6 z-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-2">
          <div>
            &copy; {new Date().getFullYear()} <a href="https://afiladesign.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 font-medium transition-colors">afiladesign.com</a>
          </div>
          <button 
            onClick={() => setShowPrivacy(true)}
            className="hover:text-indigo-600 transition-colors"
          >
            Terma & Privasi / 条款与隐私
          </button>
        </div>
      </footer>

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={() => setShowPrivacy(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Terma & Privasi / 条款与隐私</h3>
            <div className="space-y-3 text-sm text-gray-600 font-sc">
              <p>
                <span className="font-medium text-gray-900">Dasar Privasi / 隐私政策:</span><br/>
                Kami menghormati privasi anda. Aplikasi ini tidak menyimpan, merekod, atau berkongsi data peribadi anda. Semua pemprosesan suara dan teks dilakukan secara selamat dalam masa nyata menggunakan Google Gemini API.
                <br/><span className="text-xs text-gray-400 mt-1 block">我们尊重您的隐私。此应用程序不存储、记录或共享您的个人数据。</span>
              </p>
              <p>
                <span className="font-medium text-gray-900">Terma Perkhidmatan / 服务条款:</span><br/>
                Alat ini disediakan "seadanya" untuk tujuan maklumat sahaja. Walaupun kami menyasarkan ketepatan, terjemahan automatik mungkin mengandungi ralat.
                <br/><span className="text-xs text-gray-400 mt-1 block">此工具按“原样”提供。自动翻译可能包含错误。</span>
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowPrivacy(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                Tutup / 关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={() => setShowGuide(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Panduan / 指南</h3>
              <button onClick={() => setShowGuide(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="space-y-6 font-sc">
              {/* Text Mode Guide */}
              <div className="flex gap-4">
                <div className="flex-none w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                  <TextIcon />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Mod Teks / 文字模式</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    1. Taip dalam <strong>Bahasa Melayu</strong> atau <strong>Mandarin</strong>.<br/>
                    <span className="text-xs text-gray-500">输入马来文或华文。</span><br/>
                    2. AI akan mengesan bahasa secara automatik.<br/>
                    <span className="text-xs text-gray-500">AI 将自动检测语言。</span><br/>
                    3. Tekan ikon <strong>Speaker</strong> untuk mendengar sebutan.<br/>
                    <span className="text-xs text-gray-500">点击喇叭图标收听发音。</span>
                  </p>
                </div>
              </div>

              {/* Live Mode Guide */}
              <div className="flex gap-4">
                <div className="flex-none w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                  <VoiceIcon />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Mod Langsung / 实时对话</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    1. Tekan butang <strong>Mula Perbualan</strong>.<br/>
                    <span className="text-xs text-gray-500">点击“开始对话”按钮。</span><br/>
                    2. Bercakap secara semula jadi.<br/>
                    <span className="text-xs text-gray-500">自然地交谈。</span><br/>
                    3. AI akan menterjemah suara anda secara serentak.<br/>
                    <span className="text-xs text-gray-500">AI 将实时翻译您的语音。</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 text-center">
              <button 
                onClick={() => setShowGuide(false)}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-all shadow-sm hover:shadow-md"
              >
                Faham / 明白了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;