
import React, { useState, useRef, useMemo } from 'react';
import { DishAnalysis, GroundingSource } from '../types';
import { Share2, RefreshCw, ChevronDown, ChevronUp, MapPin, Zap, Star, Send, Instagram, X } from 'lucide-react';

interface Props {
  analysis: DishAnalysis;
  sources: GroundingSource[];
  userPhoto: string;
  onReset: () => void;
  onAddPoints: (amount: number) => void;
}

const PORTION_SCALES = [
  { id: 'yarım', label: 'Yarım', multiplier: 0.5 },
  { id: 'küçük', label: 'Küçük', multiplier: 0.75 },
  { id: 'normal', label: 'Normal', multiplier: 1.0 },
  { id: 'büyük', label: 'Büyük', multiplier: 1.25 },
  { id: 'duble', label: 'Duble', multiplier: 1.6 },
];

export const AnalysisDisplay: React.FC<Props> = ({ analysis, sources, userPhoto, onReset, onAddPoints }) => {
  const [showIngredients, setShowIngredients] = useState(false);
  const [isShareMode, setIsShareMode] = useState(false);
  const [actualPrice, setActualPrice] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPointFeedback, setShowPointFeedback] = useState(false);
  
  const initialScaleIndex = PORTION_SCALES.findIndex(s => s.id === analysis.portion_size) !== -1 
    ? PORTION_SCALES.findIndex(s => s.id === analysis.portion_size) 
    : 2; 
    
  const [scaleIndex, setScaleIndex] = useState(initialScaleIndex);
  const shareRef = useRef<HTMLDivElement>(null);

  const currentScale = PORTION_SCALES[scaleIndex].multiplier;

  const scaledTotalCost = useMemo(() => Math.round(analysis.estimated_total_cost_try * currentScale), [analysis.estimated_total_cost_try, currentScale]);
  const scaledMarketPrice = useMemo(() => Math.round(analysis.estimated_market_price_try * currentScale), [analysis.estimated_market_price_try, currentScale]);
  
  const multiplier = (scaledMarketPrice / scaledTotalCost).toFixed(1);
  const marginPercentage = (((scaledMarketPrice - scaledTotalCost) / scaledMarketPrice) * 100).toFixed(0);

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualPrice || isSubmitted) return;
    
    onAddPoints(25);
    setIsSubmitted(true);
    setShowPointFeedback(true);
    setTimeout(() => setShowPointFeedback(false), 3000);
  };

  if (isShareMode) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in duration-500">
        <div className="p-6 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-10">
          <button onClick={() => setIsShareMode(false)} className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <X size={18} /> Kapat
          </button>
          <div className="flex items-center gap-2">
            <Instagram size={16} className="text-pink-500" />
            <span className="text-white font-black italic uppercase text-[10px] tracking-widest">Instagram Story Modu</span>
          </div>
        </div>
        
        <div ref={shareRef} className="flex-1 flex flex-col justify-center p-4">
          <div className="relative aspect-[9/16] w-full max-h-[85vh] mx-auto rounded-[3rem] overflow-hidden border-[6px] border-white shadow-2xl bg-zinc-900">
            <img src={userPhoto} alt="Food" className="absolute inset-0 w-full h-full object-cover brightness-[0.75] scale-105" />
            
            <div className="absolute top-12 left-8 -rotate-6 bg-red-600 text-white px-6 py-3 font-black text-5xl uppercase italic shadow-2xl z-20 border-2 border-white">
              BOOM!
            </div>

            <div className="absolute top-12 right-8 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20">
              <span className="text-red-600 font-semibold text-lg tracking-tighter">
                dish<span className="italic">o</span>
              </span>
            </div>
            
            <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent pt-32">
              <h2 className="text-white text-4xl font-black uppercase italic tracking-tighter mb-6 leading-none drop-shadow-2xl">{analysis.dish}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-3xl">
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Maliyet</span>
                  <div className="text-3xl font-black text-white italic">₺{scaledTotalCost}</div>
                </div>
                <div className="bg-red-600 p-5 rounded-3xl shadow-2xl border border-white/20">
                  <span className="text-[10px] font-black text-white/80 uppercase tracking-widest block mb-1">Dışarıda</span>
                  <div className="text-3xl font-black text-white italic">₺{scaledMarketPrice}</div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Kar Marjı</span>
                    <span className="text-2xl font-black text-red-500 italic">%{marginPercentage}</span>
                </div>
                <div className="px-5 py-2.5 bg-white text-black rounded-2xl font-black italic uppercase text-xs shadow-lg">
                    {PORTION_SCALES[scaleIndex].label}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center text-white/40 animate-pulse">
            <p className="text-xs font-black uppercase tracking-widest italic">Ekran Görüntüsü Al ve Paylaş!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24 relative">
      
      {showPointFeedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-yellow-400 text-black px-6 py-3 rounded-full font-black italic shadow-2xl animate-bounce flex items-center gap-2 border-2 border-black">
          <Star className="fill-black" size={20} />
          +25 PUAN KAZANDIN!
        </div>
      )}

      {/* Hero Card with Photo Background */}
      <div className="relative bg-black text-white rounded-[2.5rem] min-h-[360px] shadow-2xl shadow-zinc-200 border border-zinc-800 mb-6 overflow-hidden transition-all duration-300 group">
        <div className="absolute inset-0">
          <img src={userPhoto} alt="Dish Background" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[3000ms] ease-out" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 p-8 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-3 drop-shadow-lg">{analysis.dish}</h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                 <Zap size={10} className="text-red-500 fill-red-500" /> {PORTION_SCALES[scaleIndex].label} Porsiyon
              </div>
            </div>
            <button onClick={() => setIsShareMode(true)} className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg">
              <Share2 size={20} className="text-white" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-3xl">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Maliyet</span>
                <div className="text-3xl font-black italic tabular-nums">₺{scaledTotalCost}</div>
              </div>
              <div className="bg-red-600/90 backdrop-blur-md p-5 rounded-3xl shadow-xl border border-white/10">
                <span className="text-[10px] font-black text-white/80 uppercase tracking-widest block mb-1">Ort. Piyasa</span>
                <div className="text-3xl font-black italic tabular-nums">₺{scaledMarketPrice}</div>
              </div>
            </div>

            <div className="flex items-center justify-between px-2 pt-2 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tahmini Kar</span>
                <span className="text-xl font-black text-red-500 italic">%{marginPercentage}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Çarpan</span>
                <span className="text-xl font-black text-white italic">{multiplier}x</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portion Slider Section - UPDATED TO BRUTALIST STYLE */}
      <div className="px-1 mb-8">
        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
           <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Porsiyonu Ayarla</span>
                <span className="text-xl font-black uppercase italic tracking-tighter text-black">{PORTION_SCALES[scaleIndex].label}</span>
              </div>
              <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full font-black text-[10px] uppercase italic tracking-widest border border-red-100">
                {PORTION_SCALES[scaleIndex].multiplier}x
              </div>
           </div>
           
           <div className="relative h-14 flex items-center px-2">
             <div className="absolute inset-x-2 h-2 bg-zinc-100 rounded-full"></div>
             <input 
                type="range" 
                min="0" 
                max={PORTION_SCALES.length - 1} 
                step="1"
                value={scaleIndex}
                onChange={(e) => setScaleIndex(parseInt(e.target.value))}
                className="absolute inset-x-0 w-full h-14 opacity-0 cursor-pointer z-20"
             />
             <div 
                className="absolute h-2 bg-black rounded-full transition-all duration-200"
                style={{ width: `calc(${ (scaleIndex / (PORTION_SCALES.length - 1)) * 100 }%)`, left: '8px' }}
             ></div>
             <div 
                className="absolute w-10 h-10 bg-white border-[4px] border-black rounded-2xl shadow-xl z-10 transition-all duration-200 -translate-x-1/2"
                style={{ left: `calc(8px + ${(scaleIndex / (PORTION_SCALES.length - 1)) * 100}% - ${scaleIndex === 0 ? '-16px' : scaleIndex === 4 ? '16px' : '0px'})` }}
             >
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1.5 h-4 bg-zinc-100 rounded-full"></div>
                </div>
             </div>
           </div>
           
           <div className="flex justify-between mt-3 px-1">
              {PORTION_SCALES.map((s, i) => (
                <span key={s.id} className={`text-[10px] font-black uppercase transition-all duration-200 ${i === scaleIndex ? 'text-black scale-110 italic' : 'text-zinc-300'}`}>
                  {s.label}
                </span>
              ))}
           </div>
        </div>
      </div>

      {/* User Contribution: Actual Price */}
      <section className="mb-8">
        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center border border-black shadow-sm">
              <Star size={16} className="fill-black" />
            </div>
            <h3 className="font-black uppercase italic tracking-tight text-sm text-black">Puan Kazan: Gerçek Fiyat Gir</h3>
          </div>
          
          <form onSubmit={handlePriceSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-400 text-lg italic">₺</span>
              <input 
                type="number" 
                value={actualPrice}
                onChange={(e) => setActualPrice(e.target.value)}
                placeholder="Bu yemeği kaça yedin?"
                disabled={isSubmitted}
                className="w-full pl-10 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-black text-lg focus:outline-none focus:border-red-600 disabled:opacity-50 italic"
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitted || !actualPrice}
              className={`px-6 rounded-2xl flex items-center justify-center transition-all ${isSubmitted ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-black text-white active:scale-95 shadow-lg shadow-zinc-200'}`}
            >
              {isSubmitted ? <Star className="fill-white" size={20} /> : <Send size={20} />}
            </button>
          </form>
          
          {isSubmitted && (
            <p className="text-[10px] font-black text-emerald-600 uppercase italic mt-4 flex items-center gap-1">
              <Zap size={10} /> Harika! Verin topluluğa katkı sağlıyor.
            </p>
          )}
        </div>
      </section>

      {/* Ingredients Breakdown */}
      <section className="mb-8">
        <button 
          onClick={() => setShowIngredients(!showIngredients)}
          className="w-full flex items-center justify-between p-6 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-center">
              <RefreshCw size={18} className="text-black" />
            </div>
            <span className="font-black uppercase italic tracking-tight text-black">İçerik Dökümü</span>
          </div>
          {showIngredients ? <ChevronUp size={20} className="text-zinc-400" /> : <ChevronDown size={20} className="text-zinc-400" />}
        </button>
        
        {showIngredients && (
          <div className="mt-2 bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-400 font-black text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Malzeme</th>
                    <th className="px-6 py-4 text-right">Miktar</th>
                    <th className="px-6 py-4 text-right">Maliyet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {analysis.detailed_ingredients.map((ing, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 font-bold text-black uppercase text-xs">
                        {ing.name}
                        <div className="text-[9px] font-medium text-zinc-400 normal-case tracking-normal">₺{ing.unit_price_try_per_kg}/kg</div>
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-500 font-bold tabular-nums">{(ing.weight_grams * currentScale).toFixed(0)}g</td>
                      <td className="px-6 py-4 text-right font-black text-red-600 italic tabular-nums">₺{(ing.total_item_cost_try * currentScale).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Nearby Pricing */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4 px-2">
          <MapPin size={16} className="text-red-600" />
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest italic">Çevre Analizi</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
          {analysis.nearby_restaurants.map((rest, i) => (
            <div key={i} className="bg-white min-w-[190px] p-6 rounded-[2.5rem] border border-zinc-100 shadow-sm flex flex-col justify-between hover:border-red-100 transition-colors">
              <div>
                <div className="text-[9px] font-black text-red-600 uppercase tracking-tighter mb-1 italic">{rest.location}</div>
                <div className="font-black text-sm uppercase italic leading-tight mb-1 line-clamp-1">{rest.name}</div>
                <div className="text-[10px] text-zinc-400 font-medium mb-4 line-clamp-1">{rest.dish_name}</div>
              </div>
              <div className="text-2xl font-black italic text-black">₺{rest.price_try}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Action Buttons */}
      <div className="fixed bottom-0 inset-x-0 p-6 bg-white/80 backdrop-blur-xl border-t border-zinc-100 z-[55]">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
          <button 
            onClick={onReset}
            className="flex items-center justify-center gap-2 py-5 bg-black text-white font-black uppercase tracking-widest rounded-[1.5rem] active:scale-95 transition-all text-xs"
          >
            <RefreshCw size={16} /> Yeni Foto
          </button>
          <button 
            onClick={() => setIsShareMode(true)}
            className="flex items-center justify-center gap-2 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-[1.5rem] shadow-xl shadow-red-100 active:scale-95 transition-all text-xs italic"
          >
            <Instagram size={16} /> Paylaş
          </button>
        </div>
      </div>
    </div>
  );
};
