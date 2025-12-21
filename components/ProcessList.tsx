
import React from 'react';
import { Processo, ReferenceItem, Procurador as TProcurador } from '../types';
import { 
  PencilSquareIcon, TrashIcon, CheckCircleIcon, DocumentDuplicateIcon, 
  MapPinIcon, ExclamationTriangleIcon, DocumentIcon, UserGroupIcon, 
  ShieldCheckIcon, ScaleIcon, ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

interface ProcessListProps {
  processos: Processo[];
  theme: 'light' | 'dark';
  onEdit: (p: Processo) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDuplicate: (p: Processo) => void;
  onOpenDoc: (fileName: string) => void;
  diaps: ReferenceItem[];
  procuradores: TProcurador[];
}

const ProcessList: React.FC<ProcessListProps> = ({ processos, theme, onEdit, onDelete, onToggleStatus, onDuplicate, onOpenDoc, diaps, procuradores }) => {
  const getUrgencyData = (p: Processo) => {
    const now = Date.now();
    const revTime = new Date(p.prazoRevisao).getTime();
    const maxTime = new Date(p.prazoMaximo).getTime();
    const minTime = Math.min(revTime, maxTime);
    const diffDays = (minTime - now) / (1000 * 60 * 60 * 24);
    return {
      isUrgent: diffDays <= 15 && p.status === 'pendente',
      isOverdue: diffDays < 0 && p.status === 'pendente',
      triggeredBy: revTime <= maxTime ? 'revisao' : 'maximo'
    };
  };

  return (
    <div className={`divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-100'}`}>
      {processos.map(p => {
        const { isUrgent, isOverdue, triggeredBy } = getUrgencyData(p);
        const shouldHighlight = isUrgent || isOverdue;
        
        const safeCrimes = Array.isArray(p.crime) ? p.crime : [p.crime as unknown as string];
        const safeMedidas = Array.isArray(p.medidasAplicadas) ? p.medidasAplicadas : [p.medidasAplicadas as unknown as string];
        const safeProcuradores = Array.isArray(p.nomeProcurador) ? p.nomeProcurador : [p.nomeProcurador as unknown as string];
        const safeDiaps = Array.isArray(p.diap) ? p.diap : [p.diap as unknown as string];

        return (
          <div key={p.id} className={`p-8 transition-all border-l-[16px] relative overflow-hidden group ${
            shouldHighlight 
              ? 'border-l-orange-500 ' + (theme === 'dark' ? 'bg-amber-500/5' : 'bg-amber-50/50')
              : (theme === 'dark' ? 'hover:bg-slate-800/30 border-l-transparent' : 'hover:bg-slate-50 border-l-transparent')
          }`}>
            <div className="flex flex-col lg:flex-row gap-8 relative z-10">
              <div className="flex-1 space-y-6">
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest mb-1 block ${theme === 'dark' ? 'text-blue-400' : 'text-indigo-600'}`}>
                    PROC. {p.numeroProcesso}
                  </span>
                  <h3 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                    {Array.isArray(p.arguidos) ? p.arguidos.join(', ') : p.arguidos || 'Sem arguido'}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-slate-500 shrink-0"/>
                  {safeCrimes.map(c => (
                    <span key={c} className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${theme === 'dark' ? 'bg-blue-600/20 text-blue-400' : 'bg-indigo-50 text-indigo-700'}`}>
                      {c}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ScaleIcon className="w-4 h-4 text-slate-500 shrink-0"/>
                  {safeMedidas.map(m => (
                    <span key={m} className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border-2 ${theme === 'dark' ? 'bg-black border-slate-700 text-slate-400' : 'bg-white border-slate-100 text-slate-600'}`}>
                      {m}
                    </span>
                  ))}
                </div>

                {p.comentarios && (
                  <div className={`p-4 rounded-xl border-l-4 flex gap-3 ${theme === 'dark' ? 'bg-[#0f172a] border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-slate-400 shrink-0 mt-0.5"/>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Notas / Observações</span>
                      <p className={`text-xs font-bold leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        {p.comentarios}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <DocumentIcon className="w-4 h-4 text-slate-500 shrink-0"/>
                  {p.documentosRelacionados && p.documentosRelacionados.length > 0 ? p.documentosRelacionados.map(doc => (
                    <button key={doc} onClick={() => onOpenDoc(doc)} className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all active:scale-95 ${theme === 'dark' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-600 text-white'}`}>
                      {doc}
                    </button>
                  )) : <span className="text-[10px] italic text-slate-500">Nenhum despacho associado</span>}
                </div>
              </div>

              <div className={`w-full lg:w-[400px] flex flex-col gap-4 lg:border-l lg:pl-10 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex flex-col gap-2">
                  {shouldHighlight && (
                    <div className={`${isOverdue ? 'bg-red-700' : 'bg-orange-600'} text-white px-4 py-2 rounded-xl text-[9px] font-black shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest`}>
                      <ExclamationTriangleIcon className="w-4 h-4"/>
                      {isOverdue ? 'PRAZO CRÍTICO' : 'ALERTA DE PRAZO'}
                    </div>
                  )}
                  
                  <div className={`p-5 rounded-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900/50 border border-slate-700' : 'bg-slate-50 border border-slate-100'}`}>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2 flex items-center gap-2">
                        <UserGroupIcon className="w-4 h-4"/> Procuradores
                      </p>
                      <div className="space-y-1">
                        {safeProcuradores.map(nome => {
                           const proc = procuradores.find(pr => pr.nome === nome);
                           return (
                             <p key={nome} className={`text-xs font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                               {nome} {proc?.telefone && <span className="opacity-50 ml-1 font-bold">({proc.telefone})</span>}
                             </p>
                           );
                        })}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-700/30">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2 flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4"/> DIAP / Unidades
                      </p>
                      <div className="space-y-1">
                        {safeDiaps.map(nome => {
                           const diap = diaps.find(d => d.valor === nome);
                           return (
                             <p key={nome} className={`text-xs font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                               {nome} {diap?.telefone && <span className="opacity-50 ml-1 font-bold">({diap.telefone})</span>}
                             </p>
                           );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-4 rounded-xl border-2 transition-all ${triggeredBy === 'revisao' && shouldHighlight ? 'bg-blue-600 border-white scale-105' : (theme === 'dark' ? 'bg-black/40' : 'bg-black/10') + ' border-transparent'}`}>
                    <p className={`text-[8px] uppercase font-black tracking-widest mb-1 ${triggeredBy === 'revisao' && shouldHighlight ? 'text-white' : 'text-slate-500'}`}>Revisão</p>
                    <p className={`text-sm font-black ${triggeredBy === 'revisao' && shouldHighlight ? 'text-white' : (theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}`}>
                      {new Date(p.prazoRevisao).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl border-2 transition-all ${triggeredBy === 'maximo' && shouldHighlight ? 'bg-rose-600 border-white scale-105' : (theme === 'dark' ? 'bg-black/40' : 'bg-black/10') + ' border-transparent'}`}>
                    <p className={`text-[8px] uppercase font-black tracking-widest mb-1 ${triggeredBy === 'maximo' && shouldHighlight ? 'text-white' : 'text-slate-500'}`}>Máximo</p>
                    <p className={`text-sm font-black ${triggeredBy === 'maximo' && shouldHighlight ? 'text-white' : (theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}`}>
                      {new Date(p.prazoMaximo).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`flex flex-row lg:flex-col justify-end items-center gap-3 p-3 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'}`}>
                <button onClick={() => onToggleStatus(p.id)} className="action-btn text-emerald-400 hover:bg-emerald-400/10" title="Concluir"><CheckCircleIcon className="w-7 h-7"/></button>
                <button onClick={() => onEdit(p)} className="action-btn text-blue-400 hover:bg-blue-400/10" title="Editar"><PencilSquareIcon className="w-7 h-7"/></button>
                <button onClick={() => onDuplicate(p)} className="action-btn text-indigo-400 hover:bg-indigo-400/10" title="Duplicar"><DocumentDuplicateIcon className="w-7 h-7"/></button>
                <button onClick={() => onDelete(p.id)} className="action-btn text-rose-400 hover:bg-rose-400/10" title="Eliminar"><TrashIcon className="w-7 h-7"/></button>
              </div>
            </div>
          </div>
        );
      })}
      <style>{`
        .action-btn { @apply p-2 rounded-xl transition-all hover:scale-110 active:scale-95; }
      `}</style>
    </div>
  );
};

export default ProcessList;
