
import React from 'react';
import { AppFilters, ReferenceItem, Procurador, INITIAL_FILTERS } from '../types';
import { 
  ArrowPathIcon, 
  CircleStackIcon,
  AdjustmentsHorizontalIcon,
  CloudArrowDownIcon,
  // Added ArchiveBoxIcon to fix the "Cannot find name 'ArchiveBoxIcon'" error
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

interface Props {
  filters: AppFilters;
  setFilters: React.Dispatch<React.SetStateAction<AppFilters>>;
  theme: 'light' | 'dark';
  onExportWord: () => void;
  onExportJson: () => void;
  crimes: ReferenceItem[];
  diaps: ReferenceItem[];
  procuradores: Procurador[];
  medidas: ReferenceItem[];
}

const FilterBar: React.FC<Props> = ({ 
  filters, setFilters, theme, onExportWord, onExportJson, crimes, diaps, procuradores, medidas 
}) => {
  const update = (field: keyof AppFilters, val: string) => setFilters(p => ({ ...p, [field]: val }));

  return (
    <div className={`p-8 rounded-[2rem] border shadow-2xl space-y-8 transition-all duration-300 ${theme === 'dark' ? 'bg-[#1e293b]/30 border-[#334155]' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <AdjustmentsHorizontalIcon className="w-6 h-6"/>
          </div>
          <div>
            <h3 className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Filtros Avançados
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Refinar pesquisa por campos</p>
          </div>
        </div>
        <button onClick={() => setFilters(INITIAL_FILTERS)} className="text-[10px] font-black text-slate-500 hover:text-rose-500 flex items-center gap-2 transition-all uppercase tracking-[0.2em] group">
          <ArrowPathIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"/> Limpar Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="flex flex-col gap-2">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>Nº Processo</label>
          <input 
            value={filters.numeroProcesso} 
            onChange={e => update('numeroProcesso', e.target.value)} 
            className={`filter-input ${theme === 'dark' ? 'dark-filter' : 'light-filter'}`} 
            placeholder="PESQUISAR..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>Arguido</label>
          <input 
            value={filters.arguido} 
            onChange={e => update('arguido', e.target.value)} 
            className={`filter-input ${theme === 'dark' ? 'dark-filter' : 'light-filter'}`} 
            placeholder="NOME..."
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>Crime</label>
          <select value={filters.crime} onChange={e => update('crime', e.target.value)} className={`filter-input ${theme === 'dark' ? 'dark-filter' : 'light-filter'}`}>
            <option value="">TODOS</option>
            {crimes.map(c => <option key={c.id} value={c.valor}>{c.valor.toUpperCase()}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>DIAP / Unidade</label>
          <select value={filters.diap} onChange={e => update('diap', e.target.value)} className={`filter-input ${theme === 'dark' ? 'dark-filter' : 'light-filter'}`}>
            <option value="">TODAS</option>
            {diaps.map(d => <option key={d.id} value={d.valor}>{d.valor.toUpperCase()}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>Procurador</label>
          <select value={filters.procurador} onChange={e => update('procurador', e.target.value)} className={`filter-input ${theme === 'dark' ? 'dark-filter' : 'light-filter'}`}>
            <option value="">TODOS</option>
            {procuradores.map(p => <option key={p.id} value={p.nome}>{p.nome.toUpperCase()}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>Medida</label>
          <select value={filters.medida} onChange={e => update('medida', e.target.value)} className={`filter-input ${theme === 'dark' ? 'dark-filter' : 'light-filter'}`}>
            <option value="">TODAS</option>
            {medidas.map(m => <option key={m.id} value={m.valor}>{m.valor.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-4 pt-6 border-t border-slate-700/30">
        <button onClick={onExportWord} className={`btn-action group ${theme === 'dark' ? 'bg-blue-600/10 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
           <ArchiveBoxIcon className="w-5 h-5 group-hover:scale-110 transition-transform"/> EXPORTAR RELATÓRIO WORD
        </button>
        
        <button onClick={onExportJson} className={`btn-action group ${theme === 'dark' ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
           <CloudArrowDownIcon className="w-5 h-5 group-hover:scale-110 transition-transform"/> DESCARREGAR JSON (BACKUP)
        </button>
      </div>

      <style>{`
        .filter-input {
          @apply w-full px-4 py-3 text-[11px] font-black uppercase tracking-wider rounded-2xl outline-none transition-all border shadow-sm;
        }
        .dark-filter {
          background-color: #000 !important;
          border-color: #334155 !important;
          color: #94a3b8 !important;
        }
        .dark-filter::placeholder {
          color: #475569 !important;
        }
        .light-filter {
          @apply bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5;
        }
        .btn-action {
          @apply flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl border transition-all hover:shadow-xl active:scale-95;
        }
        select.filter-input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='3' stroke='%2394a3b8' %3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1.1em;
        }
        .dark-filter option {
          background-color: #000;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default FilterBar;
