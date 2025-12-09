import React, { useState, useEffect } from 'react';
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
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const AwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.LIVE);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      // Automatically open settings if no key is found
      setShowSettings(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    setShowSettings(false);
    // Reload to ensure all services pick up the new key immediately if needed, 
    // though our services read from localStorage dynamically.
    window.location.reload(); 
  };

  return (
    <div className="flex flex-col h-screen bg-[#f9fafe] overflow-hidden font-sc">
      {/* Header */}
      <header className="flex-none bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            J
          </div>
          <div className="flex flex-col">
             <h1 className="font-semibold text-gray-800 text-lg tracking-tight leading-none hidden md:block">Jambatan Bahasa</h1>
             <h1 className="font-semibold text-gray-800 text-lg tracking-tight leading-none md:hidden">Jambatan</h1>
          </div>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl mx-2">
          <button
             onClick={() => setMode(AppMode.LIVE)}
             className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === AppMode.LIVE ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <VoiceIcon /> <span className="hidden sm:inline">Langsung / 实时</span><span className="sm:hidden">Live</span>
          </button>
          <button
            onClick={() => setMode(AppMode.TEXT)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === AppMode.TEXT ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TextIcon /> <span className="hidden sm:inline">Teks / 文字</span><span className="sm:hidden">Teks</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowComparison(true)}
            className="text-gray-400 hover:text-indigo-600 transition-colors p-2 hidden sm:block"
            title="Kelebihan / 优势"
          >
            <AwardIcon />
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="text-gray-400 hover:text-indigo-600 transition-colors p-2"
            title="Tetapan API / API设置"
          >
            <SettingsIcon />
          </button>
          <button 
            onClick={() => setShowGuide(true)}
            className="text-gray-400 hover:text-indigo-600 transition-colors p-2"
            title="Panduan / 指南"
          >
            <HelpIcon />
          </button>
        </div>
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
          <div className="flex gap-4">
             {/* Mobile Comparison Link */}
             <button 
              onClick={() => setShowComparison(true)}
              className="sm:hidden hover:text-indigo-600 transition-colors"
            >
              Kelebihan / 优势
            </button>
            <button 
              onClick={() => setShowPrivacy(true)}
              className="hover:text-indigo-600 transition-colors"
            >
              Terma & Privasi / 条款与隐私
            </button>
          </div>
        </div>
      </footer>

      {/* Comparison Modal */}
      {showComparison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={() => setShowComparison(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600"><AwardIcon /></span>
                Kenapa Kami? / 为什么选择我们?
              </h3>
              <button onClick={() => setShowComparison(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="font-sc">
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="px-4 py-3">Ciri / 功能</th>
                      <th className="px-4 py-3 text-indigo-600">Jambatan Bahasa</th>
                      <th className="px-4 py-3 text-gray-400">Google Translate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-700">Dialek & Slanga<br/><span className="text-xs text-gray-400 font-normal">方言与俚语</span></td>
                      <td className="px-4 py-3 bg-indigo-50/50 text-indigo-700 font-medium">
                        ✅ Cemerlang / 卓越<br/><span className="text-xs opacity-75">Faham Bahasa Pasar / 理解巴刹语</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        ⚠️ Terhad / 有限<br/><span className="text-xs opacity-75">Hanya Baku / 仅限标准语</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-700">Mod Suara<br/><span className="text-xs text-gray-400 font-normal">语音模式</span></td>
                      <td className="px-4 py-3 bg-indigo-50/50 text-indigo-700 font-medium">
                        ✅ Serentak / 实时 (Live)<br/><span className="text-xs opacity-75">Tanpa henti / 无间断</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        ⏳ Gilir-gilir / 轮流<br/><span className="text-xs opacity-75">Kena tunggu / 需等待</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-700">Konteks Budaya<br/><span className="text-xs text-gray-400 font-normal">文化语境</span></td>
                      <td className="px-4 py-3 bg-indigo-50/50 text-indigo-700 font-medium">
                        ✅ Tinggi / 高<br/><span className="text-xs opacity-75">Lokal / 本地化</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        ⚪ Umum / 一般<br/><span className="text-xs opacity-75">Global / 全球化</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 bg-green-50 p-4 rounded-xl border border-green-100 text-sm text-green-800 space-y-2">
                <p><strong>Rumusan:</strong> Aplikasi ini dibina khas untuk perbualan natural rakyat Malaysia, memahami perkataan seperti "makan dak lagi?", "guane gamok", dan loghat Mandarin tempatan.</p>
                <p><strong>总结:</strong> 此应用专为马来西亚人的自然对话打造，能理解“makan dak lagi?”等本地词汇及本地华语方言。</p>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowComparison(false)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                  Tutup / 关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tetapan API / API 设置</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">
                Kunci ini disimpan secara lokal di pelayar anda.
                <br/>此密钥仅存储在您的浏览器本地。
              </p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg mb-6">
              <h4 className="text-sm font-semibold text-indigo-900 mb-2">Cara dapatkan Key / 如何获取密钥:</h4>
              <ol className="list-decimal list-inside text-xs text-indigo-800 space-y-1">
                <li>Klik <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-bold">Pautan Rasmi Ini</a> / 点击<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-bold">此官方链接</a>.</li>
                <li>Log masuk akaun / 登录帐户.</li>
                <li>Klik "Create API Key" / 点击 "Create API Key".</li>
                <li>Salin dan tampal di sini / 复制并粘贴到此处.</li>
              </ol>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                Batal / 取消
              </button>
              <button 
                onClick={handleSaveKey}
                disabled={!apiKey.trim()}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  !apiKey.trim() 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Simpan & Muat Semula / 保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={() => setShowPrivacy(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Terma & Privasi / 条款与隐私</h3>
            <div className="space-y-3 text-sm text-gray-600 font-sc">
              <p>
                <span className="font-medium text-gray-900">Dasar Privasi / 隐私政策:</span><br/>
                Kami menghormati privasi anda. Aplikasi ini tidak menyimpan, merekod, atau berkongsi data peribadi anda. Semua pemprosesan suara dan teks dilakukan secara selamat dalam masa nyata menggunakan teknologi AI terkini.
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
              {/* API Key Guide */}
              <div className="flex gap-4 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                <div className="flex-none w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                  <SettingsIcon />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Tetapan API / API设置</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Jika aplikasi tidak berfungsi, sila masukkan <strong>API Key</strong> anda sendiri di menu Tetapan.<br/>
                    <span className="text-xs text-gray-500">如果应用无法运行，请在设置菜单中输入您自己的 API 密钥。</span>
                  </p>
                </div>
              </div>

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