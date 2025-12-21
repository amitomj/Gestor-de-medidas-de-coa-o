
import React, { useState, useMemo } from 'react';
import { Processo } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Props {
  processos: Processo[];
}

const CalendarView: React.FC<Props> = ({ processos }) => {
  const [view, setView] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) days.push(null);
    for (let i = 1; i <= lastDate; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(currentDate.setDate(diff));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  const getEventsForDay = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    const revisions = processos.filter(p => p.prazoRevisao === dStr);
    const maxDurations = processos.filter(p => p.prazoMaximo === dStr);
    return { revisions, maxDurations };
  };

  const nav = (dir: number) => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(currentDate.getMonth() + dir);
    else newDate.setDate(currentDate.getDate() + (dir * 7));
    setCurrentDate(newDate);
  };

  const dayGrid = view === 'month' ? daysInMonth : weekDays;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            {currentDate.toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex bg-white rounded-2xl border p-1 shadow-inner">
            <button onClick={() => setView('month')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${view === 'month' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>MÊS</button>
            <button onClick={() => setView('week')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${view === 'week' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>SEMANA</button>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => nav(-1)} className="p-3 border rounded-xl hover:bg-white hover:border-indigo-200 transition-all text-slate-400 hover:text-indigo-600"><ChevronLeftIcon className="w-6 h-6"/></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-6 py-3 border rounded-xl text-xs font-black hover:bg-white hover:border-indigo-200 transition-all text-slate-500 hover:text-indigo-600 uppercase tracking-widest">Hoje</button>
          <button onClick={() => nav(1)} className="p-3 border rounded-xl hover:bg-white hover:border-indigo-200 transition-all text-slate-400 hover:text-indigo-600"><ChevronRightIcon className="w-6 h-6"/></button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b bg-slate-100/50">
        {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(d => (
          <div key={d} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[160px]">
        {dayGrid.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="border-r border-b bg-slate-50/30" />;
          const { revisions, maxDurations } = getEventsForDay(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div key={date.toISOString()} className={`border-r border-b p-3 overflow-y-auto space-y-2 group transition-colors ${isToday ? 'bg-indigo-50/20' : 'hover:bg-slate-50/30'}`}>
              <span className={`text-xs font-black inline-flex items-center justify-center w-8 h-8 rounded-full transition-all ${isToday ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {date.getDate()}
              </span>
              
              <div className="space-y-1.5">
                {revisions.map(p => (
                  <div key={p.id + '-rev'} className="text-[9px] p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 leading-tight font-black shadow-sm uppercase tracking-tighter">
                    <span className="block opacity-40 text-[7px] mb-0.5">REVISÃO</span> 
                    <span className="truncate block">{p.arguidos.join(', ')}</span>
                  </div>
                ))}
                {maxDurations.map(p => (
                  <div key={p.id + '-max'} className="text-[9px] p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 leading-tight font-black shadow-sm uppercase tracking-tighter">
                    <span className="block opacity-40 text-[7px] mb-0.5">MÁXIMO</span> 
                    <span className="truncate block">{p.arguidos.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
