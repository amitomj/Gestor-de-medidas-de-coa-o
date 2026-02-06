
import React, { useState, useEffect, useRef } from 'react';
import { Processo, ReferenceItem, Procurador, Arguido, Juiz } from '../types';
import { XMarkIcon, DocumentIcon, FolderPlusIcon, CloudArrowUpIcon, TrashIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import ReferenceSelectBox from './ReferenceSelectBox';

interface ProcessFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Processo, 'id' | 'status' | 'createdAt'>) => void;
  initialData?: Processo;
  theme: 'light' | 'dark';
  crimes: ReferenceItem[]; setCrimes: React.Dispatch<React.SetStateAction<ReferenceItem[]>>;
  diaps: ReferenceItem[]; setDiaps: React.Dispatch<React.SetStateAction<ReferenceItem[]>>;
  medidas: ReferenceItem[]; setMedidas: React.Dispatch<React.SetStateAction<ReferenceItem[]>>;
  procuradores: Procurador[]; setProcuradores: React.Dispatch<React.SetStateAction<Procurador[]>>;
  arguidos: Arguido[]; setArguidos: React.Dispatch<React.SetStateAction<Arguido[]>>;
  juizes: Juiz[]; setJuizes: React.Dispatch<React.SetStateAction<Juiz[]>>;
  folderHandle: FileSystemDirectoryHandle | null;
  filesMap?: Map<string, File>;
}

const ProcessForm: React.FC<ProcessFormProps> = ({ 
  isOpen, onClose, onSubmit, initialData, theme, crimes, setCrimes, diaps, setDiaps, medidas, setMedidas, procuradores, setProcuradores, arguidos, setArguidos, juizes, setJuizes, folderHandle, filesMap 
}) => {
  const [formData, setFormData] = useState<Omit<Processo, 'id' | 'status' | 'createdAt'>>({
    numeroProcesso: '', crime: [], medidasAplicadas: [], prazoRevisao: '', prazoMaximo: '',
    arguidos: [], comentarios: '', diap: [], nomeProcurador: [], juiz: [], telefoneProcurador: '',
    documentosRelacionados: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      const { id, status, createdAt, ...rest } = initialData;
      setFormData(prev => ({ ...prev, ...rest }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const removeDocument = (fileName: string) => {
    setFormData(prev => ({
      ...prev,
      documentosRelacionados: prev.documentosRelacionados.filter(f => f !== fileName)
    }));
  };

  const openNativePicker = async () => {
    if ('showOpenFilePicker' in window) {
      try {
        const options: any = {
          multiple: true,
          types: [{ description: 'Documentos PDF', accept: { 'application/pdf': ['.pdf'] } }]
        };
        if (folderHandle) options.startIn = folderHandle;

        const fileHandles = (await (window as any).showOpenFilePicker(options)) as any[];
        const newDocs = fileHandles.map((h: any) => h.name as string);
        
        setFormData(prev => ({
          ...prev,
          documentosRelacionados: Array.from(new Set([...prev.documentosRelacionados, ...newDocs]))
        }));
        return;
      } catch (err: any) {
        if (err && err.name === 'AbortError') {
          return;
        }
      }
    }
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newDocs = Array.from(files).map((f: any) => f.name);
    setFormData(prev => ({
      ...prev,
      documentosRelacionados: Array.from(new Set([...prev.documentosRelacionados, ...newDocs]))
    }));
  };

  const handleToggleReference = (field: 'arguidos' | 'crime' | 'diap' | 'medidasAplicadas' | 'nomeProcurador' | 'juiz', value: string) => {
    setFormData(prev => {
      const current = (prev[field] as string[]) || [];
      const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const isCopy = initialData?.id === 'temp-copy-id';
  const title = initialData ? (isCopy ? 'Duplicar Processo' : 'Editar Processo') : 'Novo Processo';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md ${theme === 'dark' ? 'bg-[#0f172a]/95' : 'bg-slate-900/40'}`}>
      <input type="file" multiple accept=".pdf" ref={fileInputRef} className="hidden" onChange={handleFileInputChange} />

      <div className={`w-full max-w-7xl my-auto rounded-[2rem] shadow-2xl border transition-all duration-300 overflow-hidden flex flex-col ${theme === 'dark' ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-200'}`}>
        
        <div className="px-10 pt-12 pb-8 flex justify-between items-start">
           <div className="text-left">
              <h2 className={`text-4xl font-black tracking-tighter leading-none mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </h2>
              <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-blue-400' : 'text-slate-400'}`}>
                Identificação e Prazos Processuais
              </p>
           </div>
           <button type="button" onClick={onClose} className={`p-3 rounded-full transition-all ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
             <XMarkIcon className="w-8 h-8"/>
           </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="px-10 pb-12 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Nº de Processo</label>
              <input required name="numeroProcesso" value={formData.numeroProcesso} onChange={handleChange} className={`form-input-styled ${theme === 'dark' ? 'dark-input-special' : 'light-input'}`} placeholder="Ex: 1234/23.0ABC"/>
            </div>
            <div className="space-y-2">
              <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Data de Revisão</label>
              <div className="relative group">
                <input required type="date" name="prazoRevisao" value={formData.prazoRevisao} onChange={handleChange} className={`form-input-styled pr-12 ${theme === 'dark' ? 'dark-input-special' : 'light-input'}`}/>
                <CalendarDaysIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-500 pointer-events-none group-hover:scale-110 transition-transform"/>
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Duração Máxima</label>
              <div className="relative group">
                <input required type="date" name="prazoMaximo" value={formData.prazoMaximo} onChange={handleChange} className={`form-input-styled pr-12 ${theme === 'dark' ? 'dark-input-special' : 'light-input'}`}/>
                <CalendarDaysIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-orange-500 pointer-events-none group-hover:scale-110 transition-transform"/>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] border-b pb-3 ${theme === 'dark' ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-100'}`}>Intervenientes e Unidades</h3>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <ReferenceSelectBox 
                title="Arguidos" category="SEL" theme={theme}
                items={arguidos.map(a => ({ id: a.id, label: a.nome, secondaryLabel: a.nif }))}
                selectedIds={formData.arguidos}
                onToggle={(v) => handleToggleReference('arguidos', v)}
                onAdd={(n, s) => setArguidos(prev => [...prev, { id: crypto.randomUUID(), nome: n, nif: s }])}
                onRemove={(id) => setArguidos(prev => prev.filter(a => a.id !== id))}
                onEdit={(id, n, s) => setArguidos(prev => prev.map(a => a.id === id ? { ...a, nome: n, nif: s } : a))}
                placeholderAdd="Novo..."
              />
              <ReferenceSelectBox 
                title="Crime" category="TIPO" theme={theme}
                items={crimes.map(c => ({ id: c.id, label: c.valor }))}
                selectedIds={formData.crime}
                onToggle={(v) => handleToggleReference('crime', v)}
                onAdd={(v) => setCrimes(prev => [...prev, { id: crypto.randomUUID(), valor: v }])}
                onRemove={(id) => setCrimes(prev => prev.filter(c => c.id !== id))}
                onEdit={(id, v) => setCrimes(prev => prev.map(c => c.id === id ? { ...c, valor: v } : c))}
                placeholderAdd="Tipo..."
              />
              <ReferenceSelectBox 
                title="DIAP / Unid." category="LOC" theme={theme}
                items={diaps.map(d => ({ id: d.id, label: d.valor, secondaryLabel: d.telefone }))}
                selectedIds={formData.diap}
                onToggle={(v) => handleToggleReference('diap', v)}
                onAdd={(v, t) => setDiaps(prev => [...prev, { id: crypto.randomUUID(), valor: v, telefone: t }])}
                onRemove={(id) => setDiaps(prev => prev.filter(d => d.id !== id))}
                onEdit={(id, v, t) => setDiaps(prev => prev.map(d => d.id === id ? { ...d, valor: v, telefone: t } : d))}
                showSecondaryInput={true} placeholderSecondary="Tel..." placeholderAdd="Nova..."
              />
              <ReferenceSelectBox 
                title="Procurador" category="TIT" theme={theme}
                items={procuradores.map(p => ({ id: p.id, label: p.nome, secondaryLabel: [p.email, p.telefone].filter(Boolean).join(' | ') }))}
                selectedIds={formData.nomeProcurador}
                onToggle={(v) => handleToggleReference('nomeProcurador', v)}
                onAdd={(n, e, t) => setProcuradores(prev => [...prev, { id: crypto.randomUUID(), nome: n, telefone: t || '', email: e || '' }])}
                onRemove={(id) => setProcuradores(prev => prev.filter(p => p.id !== id))}
                onEdit={(id, n, e, t) => setProcuradores(prev => prev.map(p => p.id === id ? { ...p, nome: n, email: e || '', telefone: t || '' } : p))}
                showSecondaryInput={true} showThirdInput={true} placeholderSecondary="Email..." placeholderThird="Tel..."
              />
              <ReferenceSelectBox 
                title="Juiz" category="TIT" theme={theme}
                items={juizes.map(j => ({ id: j.id, label: j.nome, secondaryLabel: [j.email, j.telefone].filter(Boolean).join(' | ') }))}
                selectedIds={formData.juiz || []}
                onToggle={(v) => handleToggleReference('juiz', v)}
                onAdd={(n, e, t) => setJuizes(prev => [...prev, { id: crypto.randomUUID(), nome: n, telefone: t || '', email: e || '' }])}
                onRemove={(id) => setJuizes(prev => prev.filter(j => j.id !== id))}
                onEdit={(id, n, e, t) => setJuizes(prev => prev.map(j => j.id === id ? { ...j, nome: n, email: e || '', telefone: t || '' } : j))}
                showSecondaryInput={true} showThirdInput={true} placeholderSecondary="Email..." placeholderThird="Tel..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-3">
              <ReferenceSelectBox 
                title="Medidas" category="COAÇÃO" theme={theme}
                items={medidas.map(m => ({ id: m.id, label: m.valor }))}
                selectedIds={formData.medidasAplicadas}
                onToggle={(v) => handleToggleReference('medidasAplicadas', v)}
                onAdd={(v) => setMedidas(prev => [...prev, { id: crypto.randomUUID(), valor: v }])}
                onRemove={(id) => setMedidas(prev => prev.filter(m => m.id !== id))}
                onEdit={(id, v) => setMedidas(prev => prev.map(m => m.id === id ? { ...m, valor: v } : m))}
                placeholderAdd="Nova medida..."
              />
            </div>

            <div className="lg:col-span-5 space-y-2 self-start">
              <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Observações</label>
              <textarea 
                name="comentarios" 
                value={formData.comentarios} 
                onChange={handleChange} 
                className={`w-full px-6 py-5 rounded-2xl outline-none transition-all text-xs font-bold border resize-none h-[225px] focus:ring-4 focus:ring-blue-500/20 ${theme === 'dark' ? 'bg-[#0f172a] text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-200'}`}
                placeholder="Notas..."
              />
            </div>

            <div className="lg:col-span-4 space-y-2 self-start">
              <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Ficheiros (Pasta Mãe)</label>
              <div className={`p-5 rounded-2xl border flex flex-col justify-between h-[225px] ${theme === 'dark' ? 'bg-[#0f172a]/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex flex-col gap-4">
                  <div className={`p-4 rounded-xl border font-black text-[10px] tracking-widest truncate flex items-center justify-between ${formData.documentosRelacionados.length > 0 ? 'bg-blue-600/10 text-blue-400 border-blue-500/30' : (theme === 'dark' ? 'bg-slate-800/50 text-slate-500 border-slate-700' : 'bg-slate-200 text-slate-600 border-slate-300')}`}>
                    <div className="flex items-center gap-3">
                      <DocumentIcon className="w-5 h-5 shrink-0"/>
                      {formData.documentosRelacionados.length} PDF(S) VINCULADOS
                    </div>
                  </div>
                  <button type="button" onClick={openNativePicker} className="flex items-center justify-center gap-3 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/30">
                    <CloudArrowUpIcon className="w-5 h-5" /> Abrir Explorador PC
                  </button>
                </div>
                <div className="mt-4 flex-1 overflow-y-auto space-y-1 p-2 rounded-xl border border-slate-700/30">
                  {formData.documentosRelacionados.length > 0 ? (
                    formData.documentosRelacionados.map(f => (
                      <div key={f} className="w-full flex justify-between items-center px-3 py-2 rounded-lg text-[9px] font-bold bg-blue-600/10 text-blue-400">
                        <span className="truncate flex-1">{f}</span>
                        <button type="button" onClick={() => removeDocument(f)} className="ml-2 text-rose-400 hover:text-rose-600"><TrashIcon className="w-3.5 h-3.5"/></button>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-1">
                      <FolderPlusIcon className="w-6 h-6"/><p className="text-[9px] font-black uppercase">Nenhum ficheiro selecionado</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={`flex justify-between items-center pt-10 border-t ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'}`}>
            <button type="button" onClick={onClose} className="px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all">Cancelar</button>
            <button type="submit" className="px-16 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 bg-indigo-600 text-white hover:bg-indigo-500">Guardar Processo</button>
          </div>
        </form>
      </div>
      <style>{`
        .form-input-styled {
          @apply w-full px-6 py-4 rounded-2xl outline-none transition-all text-xs font-bold border focus:ring-4;
        }
        .dark-input-special {
          background-color: #000 !important;
          border-color: #334155 !important;
          color: #94a3b8 !important;
          color-scheme: dark;
        }
        .dark-input-special::placeholder {
          color: #475569 !important;
        }
        .light-input {
          @apply bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-indigo-500/20;
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ProcessForm;
