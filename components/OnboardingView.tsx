
import React, { useState } from 'react';
import { Goal, Language } from '../types';
import { PRESET_COLORS } from '../constants';
import { translations } from '../i18n';
import { ArrowRight, ChevronLeft, Check, Sparkles, Layers, Target, Plus, Trash2 } from 'lucide-react';
import ColorPickerWheel from './ColorPickerWheel';

interface Props {
  onComplete: (goals: Goal[]) => void;
  language: Language;
  onLangChange: (lang: Language) => void;
}

const OnboardingView: React.FC<Props> = ({ onComplete, language, onLangChange }) => {
  const t = translations[language];
  const [step, setStep] = useState(1);
  const [newArea, setNewArea] = useState('');
  const [newLevers, setNewLevers] = useState(['']);
  const [newColor, setNewColor] = useState('#3b82f6');
  const [showWheel, setShowWheel] = useState(false);

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const activeLevers = newLevers.filter(t => t.trim() !== '');
      const timestamp = Date.now();
      const initialGoal: Goal = {
        id: `goal-${timestamp}`,
        area: newArea || (language === 'pt' ? 'Saúde' : language === 'es' ? 'Salud' : 'Health'),
        color: newColor,
        levers: activeLevers.map((text, i) => ({ id: `l-${timestamp}-${i}`, text }))
      };
      onComplete([initialGoal]);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const addLeverInput = () => {
    setNewLevers([...newLevers, '']);
  };

  const removeLeverInput = (idx: number) => {
    const updated = newLevers.filter((_, i) => i !== idx);
    setNewLevers(updated.length ? updated : ['']);
  };

  const isNextDisabled = step === 3 && (!newArea.trim() || !newLevers.some(l => l.trim() !== ''));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-all duration-500">
      
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-8 relative overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex flex-col items-center gap-6 mb-8 shrink-0">
          <div className="flex gap-1.5 p-1 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-800">
            {(['pt', 'en', 'es'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => onLangChange(l)}
                className={`text-[9px] font-bold px-3 py-1 rounded-full transition-all uppercase tracking-widest ${
                  language === l 
                    ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-500'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200 dark:bg-slate-800'}`} 
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 -mr-1 no-scrollbar min-h-[340px]">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center flex flex-col items-center justify-center h-full py-4">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 mx-auto">
                <Sparkles size={32} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 tracking-tight">{t.onboarding_welcome}</h1>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-balance">
                {t.onboarding_p1}
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col justify-center py-4">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 mx-auto">
                <Layers size={32} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-center mb-4 tracking-tight">{t.onboarding_what_is}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-center leading-relaxed mb-6 text-balance">
                {t.onboarding_p2}
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mb-2">{t.onboarding_golden_rule}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">"{t.onboarding_p3}"</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-4">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 mx-auto">
                <Target size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-center mb-1 tracking-tight">{t.onboarding_first_goal}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-6">{t.onboarding_first_goal_sub}</p>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder={t.settings_area_placeholder}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                />

                <div>
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.onboarding_visual}</span>
                    <button 
                      onClick={() => setShowWheel(!showWheel)}
                      className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase"
                    >
                      {showWheel ? t.onboarding_basic : t.onboarding_customize}
                    </button>
                  </div>
                  
                  {showWheel ? (
                    <ColorPickerWheel color={newColor} onChange={setNewColor} />
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-center py-2">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setNewColor(c)}
                          className={`w-7 h-7 rounded-full border-2 transition-transform ${newColor === c ? 'scale-110 ring-2 ring-offset-2 ring-blue-400 dark:ring-offset-slate-900 border-white dark:border-slate-800' : 'opacity-40 hover:opacity-100'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.settings_levers_label}</span>
                  </div>
                  {newLevers.map((lever, idx) => (
                    <div key={idx} className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
                      <input 
                        type="text" 
                        placeholder={`${t.settings_levers_placeholder} ${idx + 1}`}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-300 placeholder:text-slate-400"
                        value={lever}
                        onChange={(e) => {
                          const updated = [...newLevers];
                          updated[idx] = e.target.value;
                          setNewLevers(updated);
                        }}
                      />
                      {newLevers.length > 1 && (
                        <button 
                          onClick={() => removeLeverInput(idx)}
                          className="p-3 text-slate-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={addLeverInput}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:border-blue-200 hover:text-blue-500 transition-all active:scale-[0.98]"
                  >
                    <Plus size={16} />
                    {t.settings_add_lever}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4 items-center shrink-0">
          {step > 1 && (
            <button 
              onClick={handleBack}
              className="h-14 w-14 flex items-center justify-center text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <button 
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`flex-1 h-14 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-30 shadow-lg active:scale-95 ${step === 1 ? 'w-full' : ''}`}
          >
            {step === totalSteps ? (
              <>{t.onboarding_start} <Check size={20} /></>
            ) : (
              <>{t.onboarding_next} <ArrowRight size={20} /></>
            )}
          </button>
        </div>
      </div>

      <p className="mt-8 text-[10px] text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] font-medium">{t.onboarding_footer}</p>
    </div>
  );
};

export default OnboardingView;
