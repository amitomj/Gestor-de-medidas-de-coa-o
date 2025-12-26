
import React, { useState } from 'react';
import { ReferenceItem, Procurador, Arguido } from '../types';
import { XMarkIcon, PlusIcon, TrashIcon, UserGroupIcon, ShieldCheckIcon, MapPinIcon, ScaleIcon } from '@heroicons/react/24/outline';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  crimes: ReferenceItem[]; setCrimes: React.Dispatch<React.SetStateAction<ReferenceItem[]>>;
  diaps: ReferenceItem[]; setDiaps: React.Dispatch<React.SetStateAction<ReferenceItem[]>>;
  medidas: ReferenceItem[]; setMedidas: React.Dispatch<React.SetStateAction<ReferenceItem[]>>;
  procuradores: Procurador[]; setProcuradores: React.Dispatch<React.SetStateAction<Procurador[]>>;
  arguidos: Arguido[]; setArguidos: React.Dispatch<React.SetStateAction<Arguido[]>>;
}

const ReferenceDataManager: React.FC<Props> = ({ 
  isOpen, onClose, crimes, setCrimes, diaps, setDiaps, medidas, setMedidas, procuradores, setProcuradores, arguidos, setArguidos 
}) => {
  const [activeTab, setActiveTab] = useState<'crimes' | 'diaps' | 'medidas' | 'procuradores' | 'arguidos'>('crimes');
  const [inputVal, setInputVal] = useState('');
  const [inputSecondary, setInputSecondary] = useState('');

  const handleAdd = () => {
    if (!inputVal) return;
    const id = crypto.randomUUID();
    if (activeTab === 'procuradores') {
      setProcuradores(p => [...p, { id, nome: inputVal, telefone: inputSecondary }]);
    } else if (activeTab === 'arguidos') {
      setArguidos(p => [...p, { id, nome: inputVal, nif: inputSecondary }]);
    } else if (activeTab === 'crimes') setCrimes(p => [...p, { id, valor: inputVal }]);
    else if (activeTab === 'diaps') setDiaps(p => [...p, { id, valor: inputVal, telefone: inputSecondary }]);
    else if (activeTab === 'medidas') setMedidas(p => [...p, { id, valor: inputVal }]);
    
    setInputVal('');
    setInputSecondary('');
  };

  const remove = (id: string) => {
    if (activeTab === 'crimes') setCrimes(p => p.filter(i => i.id !== id));
    else if (activeTab === 'diaps') setDiaps(p => p.filter(i => i.id !== id));
    else if (activeTab === 'medidas') setMedidas(p => p.filter(i => i.id !== id));
    else if (activeTab === 'arguidos') setArguidos(p => p.filter(i => i.id !== id));
    else setProcuradores(p => p.filter(i => i.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] shadow-3xl w-full max-w-3xl overflow-hidden border border-slate-200">
        <div className="px-10 py-8 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Listas Auxiliares</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Gira as opções para os formulários</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-full transition-all text-slate-400"><XMarkIcon className="w-8 h-8"/></button>
        </div>

        <div className="flex border-b overflow-x-auto bg-slate-50">
          {[
            { id: 'crimes', label: 'Crimes', icon: ShieldCheckIcon },
            { id: 'diaps', label: 'DIAPs', icon: MapPinIcon },
            { id: 'medidas', label: 'Medidas', icon: ScaleIcon },
            { id: 'procuradores', label: 'Procuradores', icon: UserGroupIcon },
            { id: 'arguidos', label: 'Arguidos', icon: UserGroupIcon },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 py-5 px-6 text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 border-b-4 ${activeTab === tab.id ? 'text-indigo-600 border-indigo-600 bg-white' : 'text-slate-400 border-transparent hover:bg-slate-100 hover:text-slate-600'}`}>
              <tab.icon className="w-6 h-6"/>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-10">
          <div className="flex gap-4 mb-10">
            <div className="flex-1 space-y-4">
              <input 
                value={inputVal} 
                onChange={e => setInputVal(e.target.value)} 
                className="w-full px-6 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-bold text-slate-900 shadow-sm" 
                placeholder={activeTab === 'procuradores' ? "Nome do Procurador" : activeTab === 'arguidos' ? "Nome do Arguido" : activeTab === 'diaps' ? "Nome da DIAP / Unidade" : "Novo item..."}
              />
              {(activeTab === 'procuradores' || activeTab === 'arguidos' || activeTab === 'diaps') && (
                <input 
                  value={inputSecondary} 
                  onChange={e => setInputSecondary(e.target.value)} 
                  className="w-full px-6 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-bold text-slate-900 shadow-sm" 
                  placeholder={activeTab === 'procuradores' ? "Telefone" : activeTab === 'arguidos' ? "NIF (Opcional)" : "Telefone / Contacto"}
                />
              )}
            </div>
            <button onClick={handleAdd} className="bg-indigo-600 text-white w-20 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 active:scale-95 flex items-center justify-center">
              <PlusIcon className="w-10 h-10"/>
            </button>
          </div>

          <div className="max-h-[40vh] overflow-y-auto space-y-3 pr-2">
            {(activeTab === 'crimes' ? crimes : activeTab === 'diaps' ? diaps : activeTab === 'medidas' ? medidas : activeTab === 'arguidos' ? arguidos : procuradores).map((item: any) => (
              <div key={item.id} className="flex justify-between items-center p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group">
                <div>
                  <span className="font-black text-sm text-slate-800 tracking-tight uppercase">
                    {item.valor || item.nome}
                  </span>
                  {(item.telefone || item.nif) && (
                    <span className="ml-4 text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">
                      {item.telefone || item.nif}
                    </span>
                  )}
                </div>
                <button onClick={() => remove(item.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><TrashIcon className="w-6 h-6"/></button>
              </div>
            ))}
            {(activeTab === 'crimes' ? crimes : activeTab === 'diaps' ? diaps : activeTab === 'medidas' ? medidas : activeTab === 'arguidos' ? arguidos : procuradores).length === 0 && (
              <div className="text-center py-10 opacity-30">
                <p className="text-xs font-black uppercase tracking-widest">Nenhum item registado</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .shadow-3xl { box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3); }
      `}</style>
    </div>
  );
};

export default ReferenceDataManager;
