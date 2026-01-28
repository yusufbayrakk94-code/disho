
import React, { useState, useEffect } from 'react';
import { analyzeFoodImage } from './services/geminiService';
import { AnalysisResponse } from './types';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { Camera, Image as ImageIcon, Loader2, Info, Star, UtensilsCrossed, Search, Map } from 'lucide-react';

const LOADING_STEPS = [
  { text: "Görsel işleniyor...", icon: <Camera size={20} /> },
  { text: "Malzemeler ayrıştırılıyor...", icon: <UtensilsCrossed size={20} /> },
  { text: "Güncel piyasa taranıyor...", icon: <Search size={20} /> },
  { text: "Yakındaki restoranlara bakılıyor...", icon: <Map size={20} /> },
  { text: "Maliyet raporu derleniyor...", icon: <Star size={20} /> }
];

const CHEF_TIPS = [
  "Biliyor muydun? Evde yapılan bir tabak yemeğin maliyeti, dışarıdakinden genellikle %70 daha düşüktür.",
  "Dışarıdaki yemek fiyatlarında kira ve işçilik maliyeti %40'a kadar çıkabilir.",
  "Taze baharat kullanmak tabak maliyetini çok az artırırken lezzeti 2 katına çıkarır.",
  "Şu an Google verileriyle bölgendeki en güncel menü fiyatlarını tarıyorum...",
  "Analiz tamamlanmak üzere, malzemelerin gramajlarını tek tek hesaplıyorum.",
  "Porsiyonun 'duble' olması hammadde maliyetini %60, restoran fiyatını %80 artırır."
];

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('user_points');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('user_points', points.toString());
  }, [points]);

  useEffect(() => {
    let stepInterval: number;
    let tipInterval: number;
    if (isLoading) {
      stepInterval = window.setInterval(() => {
        setLoadingStep(prev => (prev + 1) % LOADING_STEPS.length);
      }, 1500);
      tipInterval = window.setInterval(() => {
        setTipIndex(prev => (prev + 1) % CHEF_TIPS.length);
      }, 4000);
    }
    return () => {
      clearInterval(stepInterval);
      clearInterval(tipInterval);
    };
  }, [isLoading]);

  const addPoints = (amount: number) => {
    setPoints(prev => prev + amount);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
        setAnalysis(null);
        setError(null);
        setTimeout(() => startAnalysis(result), 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async (imgToAnalyze?: string) => {
    const targetImage = imgToAnalyze || image;
    if (!targetImage) return;
    
    setIsLoading(true);
    setLoadingStep(0);
    setTipIndex(Math.floor(Math.random() * CHEF_TIPS.length));
    setError(null);

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
      }).catch(() => null);

      const location = pos ? { latitude: pos.coords.latitude, longitude: pos.coords.longitude } : undefined;
      const result = await analyzeFoodImage(targetImage, location);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Analiz başarısız oldu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-red-100">
      <main className="max-w-md mx-auto min-h-screen flex flex-col">
        
        {/* Header */}
        <header className="p-6 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-[60]">
           <div className="flex items-center">
              <span className="text-red-600 font-semibold text-2xl tracking-tighter">
                dish<span className="italic">o</span>
              </span>
           </div>
           
           <div className="flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-full shadow-lg">
             <Star size={14} className="text-yellow-400 fill-yellow-400" />
             <span className="text-xs font-black italic">{points} PUAN</span>
           </div>
        </header>

        <div className="flex-1 flex flex-col px-6">
          {!analysis && !isLoading && (
            <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-500 pb-12">
              <div className="mb-12">
                <h1 className="text-5xl font-black leading-[0.9] tracking-tighter uppercase mb-4 italic">
                  Yemeğinin fotoğrafını çek, <br />
                  <span className="text-red-600">maliyetini öğren.</span>
                </h1>
                <p className="text-slate-500 font-medium text-lg leading-snug">
                  Saniyeler içinde içerik dökümü ve piyasa satış fiyatı analizi.
                </p>
              </div>

              <div className="flex flex-col items-center gap-8 w-full">
                <div className="relative group">
                  <div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-20 group-active:opacity-40 transition-opacity"></div>
                  <label className="relative flex items-center justify-center w-48 h-48 bg-red-600 rounded-full cursor-pointer shadow-[0_20px_50px_rgba(225,29,72,0.3)] transition-transform active:scale-90 z-10">
                    <Camera size={64} className="text-white" strokeWidth={2.5} />
                    <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleImageUpload} />
                  </label>
                  <div className="mt-4 text-center">
                    <span className="text-sm font-black uppercase tracking-widest text-red-600">Fotoğraf Çek</span>
                  </div>
                </div>

                <label className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full cursor-pointer hover:bg-zinc-800 transition-colors active:scale-95 shadow-lg w-full justify-center">
                  <ImageIcon size={20} />
                  <span className="font-bold text-sm uppercase tracking-wider">Galeriden Yükle</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>

                <button 
                  onClick={() => setShowHowItWorks(true)}
                  className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1 mt-4"
                >
                  Nasıl çalışır?
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-300">
              <div className="relative w-32 h-32 mb-12">
                <div className="absolute inset-0 border-[4px] border-zinc-100 rounded-full"></div>
                <div className="absolute inset-0 border-[4px] border-red-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-red-600 animate-pulse">
                    {LOADING_STEPS[loadingStep].icon}
                  </div>
                </div>
              </div>
              
              <div className="text-center w-full max-w-xs space-y-6">
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-black mb-1">
                    {LOADING_STEPS[loadingStep].text}
                  </h3>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                     <div 
                      className="h-full bg-red-600 transition-all duration-700 ease-out" 
                      style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                     ></div>
                  </div>
                </div>

                <div className="bg-zinc-50 p-5 rounded-[2rem] border border-zinc-100 animate-in slide-in-from-bottom-2 duration-500 min-h-[100px] flex flex-col justify-center">
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 block">Şef Analist Notu</span>
                  <p className="text-xs font-semibold text-zinc-500 leading-relaxed italic">
                    "{CHEF_TIPS[tipIndex]}"
                  </p>
                </div>
                
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest animate-pulse">
                  Canlı veriler taranıyor, lütfen bekleyin...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
                <Info size={40} />
              </div>
              <h2 className="text-2xl font-black uppercase italic mb-2">Eyvah! Bir sorun var.</h2>
              <p className="text-slate-500 font-medium mb-8 px-4">{error}</p>
              <button 
                onClick={() => { setError(null); setImage(null); }}
                className="w-full py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95"
              >
                Yeniden Dene
              </button>
            </div>
          )}

          {analysis && image && (
            <AnalysisDisplay 
              analysis={analysis.data} 
              sources={analysis.sources} 
              userPhoto={image}
              onReset={() => { setAnalysis(null); setImage(null); }} 
              onAddPoints={addPoints}
            />
          )}
        </div>
      </main>

      {/* Modal: Nasıl Çalışır */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm relative">
            <button 
              onClick={() => setShowHowItWorks(false)}
              className="absolute top-6 right-6 text-black"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h2 className="text-2xl font-black uppercase italic mb-6">Nasıl Çalışır?</h2>
            <div className="space-y-6">
              {[
                { i: "01", t: "Fotoğraf Çek", d: "Yemeğin tabağını net bir şekilde fotoğrafla." },
                { i: "02", t: "AI Analizi", d: "Gemini AI malzemeleri ve porsiyonu belirlesin." },
                { i: "03", t: "Maliyet & Piyasa", d: "Güncel piyasa verileriyle kar oranını gör." },
                { i: "04", t: "Puan Kazan", d: "Yediğin gerçek fiyatı girerek topluluğa katkı sağlıyorsun." }
              ].map(step => (
                <div key={step.i} className="flex gap-4">
                  <span className="text-red-600 font-black text-xl italic">{step.i}</span>
                  <div>
                    <h4 className="font-black uppercase text-sm mb-1">{step.t}</h4>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowHowItWorks(false)}
              className="w-full mt-8 py-4 bg-black text-white font-black uppercase tracking-widest rounded-xl"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
