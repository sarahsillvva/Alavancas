
import React, { useMemo, useState } from 'react';
import { Goal, DailyLog, LeverStatus, Language } from '../types';
import { translations } from '../i18n';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from 'recharts';
import { endOfMonth, eachDayOfInterval, format, endOfWeek, isAfter, isSameDay, addDays } from 'date-fns';

interface Props {
  goals: Goal[];
  logs: DailyLog;
  language: Language;
}

const StatsView: React.FC<Props> = ({ goals, logs, language }) => {
  const now = new Date();
  const t = translations[language];
  const [showCumulative, setShowCumulative] = useState(true);
  const [selectedGoalId, setSelectedGoalId] = useState<string | 'all'>('all');

  // Weekly Summary Calculation - Fixed to use dynamic lever counts
  const weekSummary = useMemo(() => {
    const endOfW = endOfWeek(now, { weekStartsOn: 1 });
    const startOfW = addDays(endOfW, -6);
    const days = eachDayOfInterval({ start: startOfW, end: endOfW });
    
    let totalPulled = 0;
    let totalPossiblePerDay = 0;

    if (selectedGoalId === 'all') {
      totalPossiblePerDay = goals.reduce((acc, g) => acc + g.levers.length, 0);
    } else {
      const goal = goals.find(g => g.id === selectedGoalId);
      totalPossiblePerDay = goal ? goal.levers.length : 0;
    }

    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayLogs = logs[dateStr] || {};
      
      if (selectedGoalId === 'all') {
        Object.values(dayLogs).forEach(leverStatus => {
          if (Array.isArray(leverStatus)) {
            leverStatus.forEach(s => { if (s) totalPulled++; });
          }
        });
      } else {
        const goalLog = dayLogs[selectedGoalId];
        if (Array.isArray(goalLog)) {
          goalLog.forEach(s => { if (s) totalPulled++; });
        }
      }
    });
    
    const possible = totalPossiblePerDay * 7;
    return { pulled: totalPulled, possible };
  }, [goals, logs, selectedGoalId]);

  // Chart Data Generation
  const chartData = useMemo(() => {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endOfMonth(now);
    const daysInMonth = eachDayOfInterval({ start, end });

    const runningTotals: { [goalId: string]: number } = {};
    goals.forEach(g => { runningTotals[g.id] = 0; });

    return daysInMonth.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayLogs = logs[dateStr] || {};
      const isFuture = isAfter(day, now) && !isSameDay(day, now);
      
      const dayData: any = {
        day: format(day, 'd'),
        fullDate: format(day, 'dd/MM'),
      };

      goals.forEach(goal => {
        const status = dayLogs[goal.id];
        const pulledToday = Array.isArray(status) ? status.filter(Boolean).length : 0;
        
        if (!isFuture) {
          runningTotals[goal.id] += pulledToday;
          dayData[goal.area] = showCumulative ? runningTotals[goal.id] : pulledToday;
        } else {
          dayData[goal.area] = null;
        }
      });

      return dayData;
    });
  }, [goals, logs, showCumulative]);

  const filteredGoals = useMemo(() => {
    if (selectedGoalId === 'all') return goals;
    return goals.filter(g => g.id === selectedGoalId);
  }, [goals, selectedGoalId]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
      
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-3 px-1">{t.stats_filter}</h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedGoalId('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedGoalId === 'all' 
                ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-sm' 
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {t.stats_filter_all}
          </button>
          {goals.map(goal => {
            const active = selectedGoalId === goal.id;
            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoalId(goal.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                  active 
                    ? 'shadow-sm ring-1 ring-offset-2 dark:ring-offset-slate-900' 
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
                style={{ 
                  backgroundColor: active ? goal.color : undefined, 
                  color: active ? 'white' : undefined,
                  borderColor: active ? goal.color : undefined
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? 'white' : goal.color }} />
                {goal.area}
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest">{t.stats_weekly_res}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              {selectedGoalId === 'all' ? t.stats_filter_all : goals.find(g => g.id === selectedGoalId)?.area}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-light text-slate-800 dark:text-slate-100">{weekSummary.pulled}</span>
            <span className="text-xs text-slate-400 dark:text-slate-600 ml-1">/ {weekSummary.possible}</span>
          </div>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-blue-500 h-full transition-all duration-1000 ease-out"
            style={{ width: `${weekSummary.possible > 0 ? (weekSummary.pulled / weekSummary.possible) * 100 : 0}%` }}
          />
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest">{t.stats_progress_viz}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tighter">
              {showCumulative ? t.stats_growth : t.stats_daily}
            </p>
          </div>
          <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-100 dark:border-slate-700">
            <button 
              onClick={() => setShowCumulative(true)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${showCumulative ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}
            >
              {t.stats_growth}
            </button>
            <button 
              onClick={() => setShowCumulative(false)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${!showCumulative ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}
            >
              {t.stats_daily}
            </button>
          </div>
        </div>
        
        <div className="h-[300px] w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                interval={4}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                hide={false}
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                domain={showCumulative ? [0, 'auto'] : [0, 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#1e293b'
                }}
                itemStyle={{ padding: '2px 0' }}
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle" 
                wrapperStyle={{ 
                  fontSize: '10px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  paddingBottom: '20px',
                  fontWeight: 600
                }}
              />
              {filteredGoals.map((goal) => {
                return (
                  <Line
                    key={goal.id}
                    type="monotone"
                    dataKey={goal.area}
                    stroke={goal.color}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: goal.color, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    animationDuration={1500}
                    connectNulls
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10">
          <p className="text-xs font-medium text-blue-300 uppercase tracking-widest mb-2">Levers</p>
          <p className="text-sm font-light leading-relaxed opacity-90 italic">
            "{t.stats_philosophy}"
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
      </section>
    </div>
  );
};

export default StatsView;
