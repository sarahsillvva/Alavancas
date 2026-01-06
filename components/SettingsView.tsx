
import React, { useState } from 'react';
import { Goal, Language } from '../types';
import { PRESET_COLORS } from '../constants';
import { translations } from '../i18n';
import { Plus, Trash2, X, Edit3 } from 'lucide-react';
import ColorPickerWheel from './ColorPickerWheel';

interface Props {
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  language: Language;
}

const SettingsView: React.FC<Props> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal, language }) => {
  const t = translations[language];
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  
  const [newArea, setNewArea] = useState('');
  const [newLevers, setNewLevers] = useState(['']);
  const [newColor, setNewColor] = useState('#3b82f6');
  const [showWheel, setShowWheel] = useState(false);

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingGoalId(null);
    setNewArea('');
    setNewLevers(['']);
    setNewColor('#3b82f6');
    setShowWheel(false);
  };

  const handleEditClick = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setNewArea(goal.area);
    setNewColor(goal.color);
    setNewLevers(goal.levers.map(l => l.text));
    setIsFormOpen(true);
  };

  const addLeverInput = () => {
    setNewLevers([...newLevers, '']);
  };

  const removeLeverInput = (idx: number) => {
    const updated = newLevers.filter((_, i) => i !== idx);
    setNewLevers(updated.length ? updated : ['']);
  };

  const handleConfirm = () => {
    if (!newArea.trim()) return;
    const activeLevers = newLevers.filter(t => t.trim() !== '');
    if (activeLevers.length === 0) return;
    
    const goalData: Goal = {
      id: editingGoalId || `goal-${Date.now()}`,
      area: newArea,
      color: newColor,
      levers: activeLevers.map((text, i) => ({ id: `l-${Date.now()}-${i}`, text }))
    };

    if (editingGoalId) {
      onUpdateGoal(goalData);
    } else {
      onAddGoal(goalData);
    }
    resetForm();
  };

  const isButtonDisabled = !newArea.trim() || !newLevers.some(l => l.trim() !== '');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-lg font-medium text-slate-800 dark:text-slate-100">{t.settings_title}</h2>
        {!isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-6 shadow-md animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {editingGoalId ? (language === 'pt' ? 'Editar Área' : language === 'es' ? 'Editar Área' : 'Edit Area') : t.settings_new_title}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:text-slate-500">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{t.settings_area_label}</label>
              <input 
                type="text" 
                placeholder={t.settings_area_placeholder}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.settings_color_label}</label>
                <button 
                  onClick={() => setShowWheel(!showWheel)}
                  className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase hover:underline"
                >
                  {showWheel ? t.settings_color_presets : t.settings_color_wheel}
                </button>
              </div>
              
              {showWheel ? (
                <ColorPickerWheel color={newColor} onChange={setNewColor} />
              ) : (
                <div className="flex flex-wrap gap-2.5 py-1">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${newColor === c ? 'scale-110 ring-2 ring-offset-2 ring-blue-400 dark:ring-offset-slate-900 border-white dark:border-slate-800' : 'opacity-80 border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.settings_levers_label}</label>
              {newLevers.map((lever, idx) => (
                <div key={idx} className="flex gap-2">
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
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:border-blue-200 hover:text-blue-500 transition-all"
              >
                <Plus size={16} />
                {t.settings_add_lever}
              </button>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-1">{t.settings_levers_hint}</p>
            </div>

            <button 
              onClick={handleConfirm}
              disabled={isButtonDisabled}
              className="w-full bg-slate-900 dark:bg-blue-600 text-white rounded-xl py-4 font-bold mt-4 hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-30 transition-all shadow-lg active:scale-[0.98]"
            >
              {editingGoalId ? (language === 'pt' ? 'Salvar Alterações' : language === 'es' ? 'Guardar Cambios' : 'Save Changes') : t.settings_confirm}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: goal.color }} />
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">{goal.area}</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">{goal.levers.length} {t.settings_levers_label.split(' ')[0].toLowerCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEditClick(goal)}
                className="p-2 text-slate-300 dark:text-slate-700 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                <Edit3 size={18} />
              </button>
              <button 
                onClick={() => onDeleteGoal(goal.id)}
                className="p-2 text-slate-300 dark:text-slate-700 hover:text-red-400 dark:hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {goals.length === 0 && !isFormOpen && (
          <div className="text-center py-12">
            <p className="text-slate-400 dark:text-slate-600 text-sm font-medium italic">{t.settings_no_goals}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
