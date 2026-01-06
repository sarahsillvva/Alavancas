
import React, { useState, useEffect } from 'react';
import { CheckCircle2, BarChart3, Settings2 } from 'lucide-react';
import { Goal, DailyLog, ViewMode, LeverStatus, Language } from './types';
import { formatDate } from './constants';
import { translations } from './i18n';
import DailyLevers from './components/DailyLevers';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';
import Header from './components/Header';
import OnboardingView from './components/OnboardingView';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('alavancas_lang');
    if (saved) return saved as Language;
    
    const browserLang = navigator.language.split('-')[0];
    if (['pt', 'en', 'es'].includes(browserLang)) return browserLang as Language;
    
    return 'pt';
  });

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return !localStorage.getItem('alavancas_onboarding_complete');
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('alavancas_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [logs, setLogs] = useState<DailyLog>(() => {
    const saved = localStorage.getItem('alavancas_logs');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeView, setActiveView] = useState<ViewMode>(ViewMode.TODAY);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));

  useEffect(() => {
    localStorage.setItem('alavancas_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('alavancas_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('alavancas_lang', language);
  }, [language]);

  const toggleLever = (goalId: string, leverIndex: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    setLogs(prev => {
      const dayLogs = prev[selectedDate] || {};
      // Inicializa com o tamanho correto da meta específica
      const goalLog = dayLogs[goalId] || new Array(goal.levers.length).fill(false);
      const newGoalLog = [...goalLog];
      newGoalLog[leverIndex] = !newGoalLog[leverIndex];

      return {
        ...prev,
        [selectedDate]: {
          ...dayLogs,
          [goalId]: newGoalLog as LeverStatus
        }
      };
    });
  };

  const addGoal = (newGoal: Goal) => {
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (updatedGoal: Goal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    // Opcional: Ajustar logs existentes se as alavancas mudarem drasticamente? 
    // Por simplicidade, mantemos os logs. Se o índice existir, ele funciona.
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const handleCompleteOnboarding = (initialGoals: Goal[]) => {
    setGoals(initialGoals);
    localStorage.setItem('alavancas_onboarding_complete', 'true');
    setShowOnboarding(false);
  };

  const t = translations[language];

  if (showOnboarding) {
    return <OnboardingView 
      onComplete={handleCompleteOnboarding} 
      language={language} 
      onLangChange={setLanguage} 
    />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      <Header currentLang={language} onLangChange={setLanguage} />

      <main className="max-w-xl mx-auto px-4 pt-6">
        {activeView === ViewMode.TODAY && (
          <DailyLevers
            goals={goals}
            logs={logs[selectedDate] || {}}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onToggle={toggleLever}
            language={language}
          />
        )}

        {activeView === ViewMode.STATS && (
          <StatsView
            goals={goals}
            logs={logs}
            language={language}
          />
        )}

        {activeView === ViewMode.SETTINGS && (
          <SettingsView
            goals={goals}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
            onDeleteGoal={deleteGoal}
            language={language}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 h-16 flex items-center justify-around px-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setActiveView(ViewMode.TODAY)}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === ViewMode.TODAY ? 'text-blue-600 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
        >
          <CheckCircle2 size={24} />
          <span className="text-[9px] font-bold uppercase tracking-wider">{t.nav_today}</span>
        </button>
        <button
          onClick={() => setActiveView(ViewMode.STATS)}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === ViewMode.STATS ? 'text-blue-600 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
        >
          <BarChart3 size={24} />
          <span className="text-[9px] font-bold uppercase tracking-wider">{t.nav_stats}</span>
        </button>
        <button
          onClick={() => setActiveView(ViewMode.SETTINGS)}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === ViewMode.SETTINGS ? 'text-blue-600 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
        >
          <Settings2 size={24} />
          <span className="text-[9px] font-bold uppercase tracking-wider">{t.nav_goals}</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
