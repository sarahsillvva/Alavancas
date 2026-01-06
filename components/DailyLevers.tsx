
import React, { useMemo, useRef, useEffect } from 'react';
import { Goal, LeverStatus, Language } from '../types';
import { formatDate, getGoalStyles } from '../constants';
import { translations, getMotivationByLang } from '../i18n';
import { Circle, CheckCircle2, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { addDays, format, isSameDay, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { enUS } from 'date-fns/locale/en-US';
import { es } from 'date-fns/locale/es';

const locales = {
  pt: ptBR,
  en: enUS,
  es: es
};

interface Props {
  goals: Goal[];
  logs: { [goalId: string]: LeverStatus };
  selectedDate: string;
  onDateChange: (date: string) => void;
  onToggle: (goalId: string, leverIndex: number) => void;
  language: Language;
}

const DailyLevers: React.FC<Props> = ({ goals, logs, selectedDate, onDateChange, onToggle, language }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[language];
  const currentLocale = locales[language];
  
  const parsedDate = useMemo(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    return new Date(year, month - 1, day);
  }, [selectedDate]);

  const isToday = useMemo(() => isSameDay(parsedDate, new Date()), [parsedDate]);

  const days = useMemo(() => {
    const start = addDays(parsedDate, -15);
    const end = addDays(parsedDate, 15);
    return eachDayOfInterval({ start, end });
  }, [parsedDate]);

  useEffect(() => {
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate]);

  const todayTotal = useMemo(() => {
    let count = 0;
    Object.values(logs).forEach(log => {
      (log as LeverStatus).forEach(status => { if (status) count++; });
    });
    return count;
  }, [logs]);

  const maxPossible = useMemo(() => {
    return goals.reduce((acc, goal) => acc + goal.levers.length, 0);
  }, [goals]);

  const handlePrevDay = () => onDateChange(formatDate(addDays(parsedDate, -1)));
  const handleNextDay = () => onDateChange(formatDate(addDays(parsedDate, 1)));
  const handleGoToToday = () => onDateChange(formatDate(new Date()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Visual Calendar Selector */}
      <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
              {format(parsedDate, "MMMM yyyy", { locale: currentLocale })}
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize">
                {format(parsedDate, "EEEE, d", { locale: currentLocale })}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
             {!isToday && (
              <button 
                onClick={handleGoToToday}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <CalendarIcon size={14} />
                {t.today_btn}
              </button>
            )}
            <div className="flex bg-slate-50 dark:bg-slate-800 rounded-full p-1 border border-slate-100 dark:border-slate-700">
              <button onClick={handlePrevDay} className="p-2 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-full text-slate-400 transition-all">
                <ChevronLeft size={20} />
              </button>
              <button onClick={handleNextDay} className="p-2 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-full text-slate-400 transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {days.map((day) => {
            const dateKey = formatDate(day);
            const active = isSameDay(day, parsedDate);
            const isDayToday = isSameDay(day, new Date());

            return (
              <button
                key={dateKey}
                data-selected={active}
                onClick={() => onDateChange(dateKey)}
                className={`flex-shrink-0 w-14 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                  active 
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xl -translate-y-1' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-tighter ${active ? 'opacity-70' : 'opacity-50'}`}>
                  {format(day, 'EEE', { locale: currentLocale })}
                </span>
                <span className="text-lg font-bold">
                  {format(day, 'd')}
                </span>
                {isDayToday && !active && (
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Progress Motivation */}
      <section className="text-center py-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-light text-slate-800 dark:text-slate-100">{todayTotal}</span>
          <span className="text-xl text-slate-300 dark:text-slate-700 font-light">/ {maxPossible}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-[240px] mx-auto leading-relaxed px-4 text-balance">
          {getMotivationByLang(language, todayTotal)}
        </p>
      </section>

      {/* Goals List */}
      <div className="space-y-4 pb-8">
        {goals.map((goal) => {
          const goalLog = logs[goal.id] || Array(goal.levers.length).fill(false);
          const styles = getGoalStyles(goal.color);

          return (
            <div 
              key={goal.id} 
              className="rounded-[2rem] border bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all duration-300"
              style={{ borderColor: styles.border.borderColor }}
            >
              <div 
                className="px-6 py-4 border-b flex justify-between items-center"
                style={{ ...styles.bg, borderColor: styles.border.borderColor }}
              >
                <h3 className="font-semibold" style={styles.text}>{goal.area}</h3>
                <span 
                  className="text-[10px] font-bold bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full uppercase tracking-widest"
                  style={styles.text}
                >
                  {goalLog.filter(Boolean).length} / {goal.levers.length}
                </span>
              </div>
              <div className="p-3">
                {goal.levers.map((lever, idx) => (
                  <button
                    key={lever.id}
                    onClick={() => onToggle(goal.id, idx)}
                    className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group rounded-2xl"
                  >
                    <div className="transition-all duration-300">
                      {goalLog[idx] ? (
                        <CheckCircle2 
                          size={26} 
                          className="bg-white dark:bg-slate-900 rounded-full shadow-sm" 
                          style={{ fill: styles.bar, color: styles.bar }}
                        />
                      ) : (
                        <Circle size={26} className="text-slate-200 dark:text-slate-700 group-hover:text-slate-300" />
                      )}
                    </div>
                    <span className={`text-sm font-medium flex-1 transition-colors ${goalLog[idx] ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}`}>
                      {lever.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="text-center py-16 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem]">
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">{t.empty_goals}</p>
            <p className="text-slate-400 dark:text-slate-600 text-xs mt-2 italic">{t.empty_goals_sub}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyLevers;
