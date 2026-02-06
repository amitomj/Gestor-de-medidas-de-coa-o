
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Processo, ProcessStatus, Procurador, ReferenceItem, AppFilters, INITIAL_FILTERS, Arguido, Juiz } from './types';
import { 
  PlusIcon, 
  ArchiveBoxIcon,
  CalendarDaysIcon,
  ListBulletIcon,
  Cog6ToothIcon,
  FolderOpenIcon,
  SunIcon,
  MoonIcon,
  DevicePhoneMobileIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ProcessForm from './components/ProcessForm';
import ProcessList from './components/ProcessList';
import CalendarView from './components/CalendarView';
import ReferenceDataManager from './components/ReferenceDataManager';
import FilterBar from './components/FilterBar';
import StartupScreen from './components/StartupScreen';
import { exportToWord } from './services/wordExport';

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPwaTip, setShowPwaTip] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  const [processos, setProcessos] = useState<Processo[]>([]);
  const [crimes, setCrimes] = useState<ReferenceItem[]>([]);
  const [diaps, setDiaps] = useState<ReferenceItem[]>([]);
  const [medidas, setMedidas] = useState<ReferenceItem[]>([]);
  const [procuradores, setProcuradores] = useState<Procurador[]>([]);
  const [arguidos, setArguidos] = useState<Arguido[]>([]);
  const [juizes, setJuizes] = useState<Juiz[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Processo | undefined>(undefined);
  const [currentStatusView, setCurrentStatusView] = useState<ProcessStatus>('pendente');
  const [currentDisplayMode, setCurrentDisplayMode] = useState<'list' | 'calendar'>('list');
  const [filters, setFilters] = useState<AppFilters>(INITIAL_FILTERS);
  
  const [folderHandle, setFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [filesMap, setFilesMap] = useState<Map<string, File>>(new Map());
  const directoryInputRef = useRef<HTMLInputElement>(null);

  const getCurrentDataState = () => ({
    processos, crimes, diaps, medidas, procuradores, arguidos, juizes, lastUpdate: Date.now()
  });

  useEffect(() => {
    if (isInitialized) {
      const data = getCurrentDataState();
      localStorage.setItem('gestor_judicial_data', JSON.stringify(data));
    }
  }, [processos, crimes, diaps, medidas, procuradores, arguidos, juizes, isInitialized]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleIdentifyFolder = async () => {
    if (!('showDirectoryPicker' in window)) {
      directoryInputRef.current?.click();
      return;
    }
    try {
      const handle = await (window as any).showDirectoryPicker();
      setFolderHandle(handle);
    } catch (err: any) {
      if (err.name !== 'AbortError') alert("Erro ao aceder à pasta.");
    }
  };

  const openDocument = async (fileName: string) => {
    if (filesMap.has(fileName)) {
      const file = filesMap.get(fileName);
      if (file) window.open(URL.createObjectURL(file), '_blank');
      return;
    }
    if (folderHandle) {
      try {
        const fileHandle = await folderHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        window.open(URL.createObjectURL(file), '_blank');
      } catch (err) { alert("Documento não encontrado na pasta."); }
      return;
    }
    alert("Associe a pasta mãe para abrir documentos.");
  };

  const filteredProcessos = useMemo(() => {
    return processos
      .filter(p => p.status === currentStatusView)
      .filter(p => {
        const search = (arr: any, filter: string) => !filter || (Array.isArray(arr) ? arr : [arr]).some((i: any) => String(i).toLowerCase().includes(filter.toLowerCase()));
        return (
          (!filters.numeroProcesso || p.numeroProcesso.toLowerCase().includes(filters.numeroProcesso.toLowerCase())) &&
          search(p.crime, filters.crime) &&
          search(p.arguidos, filters.arguido) &&
          search(p.diap, filters.diap) &&
          search(p.nomeProcurador, filters.procurador) &&
          search(p.medidasAplicadas, filters.medida)
        );
      })
      .sort((a, b) => {
        const getMin = (p: Processo) => Math.min(new Date(p.prazoRevisao).getTime(), new Date(p.prazoMaximo).getTime());
        return getMin(a) - getMin(b);
      });
  }, [processos, currentStatusView, filters]);

  if (!isInitialized) {
    return <StartupScreen theme={theme} onInitialize={(data, folder, fallbackFiles) => {
      if (data) {
        setProcessos(data.processos || []);
        setCrimes(data.crimes || []);
        setDiaps(data.diaps || []);
        setMedidas(data.medidas || []);
        setProcuradores(data.procuradores || []);
        setArguidos(data.arguidos || []);
        setJuizes(data.juizes || []);
      }
      if (folder) setFolderHandle(folder);
      if (fallbackFiles) setFilesMap(fallbackFiles);
      setIsInitialized(true);
    }} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <input type="file" ref={directoryInputRef} onChange={(e) => {
        const files = e.target.files;
        if (!files) return;
        const newMap = new Map<string, File>();
        for (let i = 0; i < files.length; i++) if (files[i].name.toLowerCase().endsWith('.pdf')) newMap.set(files[i].name, files[i]);
        setFilesMap(newMap);
      }} style={{ display: 'none' }} webkitdirectory="true" directory="" />

      {showPwaTip && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-8 rounded-[2.5rem] border shadow-3xl text-center relative ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <button onClick={() => setShowPwaTip(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-800 transition-all"><XMarkIcon className="w-6 h-6"/></button>
            <DevicePhoneMobileIcon className="w-16 h-16 text-blue-500 mx-auto mb-6" />
            <h3 className="text-xl font-black uppercase mb-4 tracking-tighter">Instalar no Telemóvel</h3>
            <div className="space-y-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              <p className="bg-blue-600/10 p-3 rounded-xl border border-blue-500/20 text-blue-400">
                <span className="text-white">No iPhone (Safari):</span><br/>Clique em "Partilhar" ↑ e depois em "Ecrã Principal" +
              </p>
              <p className="bg-emerald-600/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-400">
                <span className="text-white">No Android (Chrome):</span><br/>Clique nos 3 pontos ⋮ e depois em "Instalar"
              </p>
            </div>
            <button onClick={() => setShowPwaTip(false)} className="mt-8 w-full py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em]">Entendido</button>
          </div>
        </div>
      )}

      <header className={`${theme === 'dark' ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-200'} border-b shadow-lg sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-blue-600' : 'bg-indigo-600'}`}>
              <ArchiveBoxIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase">Gestor Judicial</h1>
              <p className={`text-[10px] uppercase font-bold tracking-[0.2em] ${theme === 'dark' ? 'text-blue-400' : 'text-indigo-600'}`}>Prazos e Documentos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button onClick={() => setShowPwaTip(true)} className={`p-2.5 rounded-xl transition-all border ${theme === 'dark' ? 'border-slate-700 text-blue-400 hover:bg-slate-800' : 'border-slate-200 text-indigo-600 hover:bg-slate-100'}`} title="Como instalar no telemóvel">
              <DevicePhoneMobileIcon className="w-6 h-6"/>
            </button>
            <button onClick={() => { setEditingProcess(undefined); setIsFormOpen(true); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm shadow-xl transition-all active:scale-95 ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
              <PlusIcon className="w-5 h-5" /> NOVO
            </button>
            <div className={`flex items-center rounded-xl p-1 border shadow-inner ${theme === 'dark' ? 'bg-[#0f172a] border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
              <button onClick={() => setCurrentStatusView('pendente')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${currentStatusView === 'pendente' ? (theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white') : 'text-slate-500 hover:text-slate-300'}`}>PENDENTES</button>
              <button onClick={() => setCurrentStatusView('findo')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${currentStatusView === 'findo' ? (theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white') : 'text-slate-500 hover:text-slate-300'}`}>FINDOS</button>
            </div>
            <div className={`flex items-center rounded-xl p-1 border shadow-inner ${theme === 'dark' ? 'bg-[#0f172a] border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
              <button onClick={() => setCurrentDisplayMode('list')} className={`p-2 rounded-lg transition-all ${currentDisplayMode === 'list' ? (theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-indigo-500 text-white') : 'text-slate-500'}`}><ListBulletIcon className="w-5 h-5"/></button>
              <button onClick={() => setCurrentDisplayMode('calendar')} className={`p-2 rounded-lg transition-all ${currentDisplayMode === 'calendar' ? (theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-indigo-500 text-white') : 'text-slate-500'}`}><CalendarDaysIcon className="w-5 h-5"/></button>
            </div>
            <button onClick={toggleTheme} className={`p-2.5 rounded-xl transition-all border ${theme === 'dark' ? 'border-slate-700 text-yellow-400 hover:bg-slate-800' : 'border-slate-200 text-indigo-600 hover:bg-slate-100'}`}>
              {theme === 'light' ? <MoonIcon className="w-6 h-6"/> : <SunIcon className="w-6 h-6"/>}
            </button>
            <button onClick={handleIdentifyFolder} className={`p-2.5 rounded-xl transition-all border ${ (folderHandle || filesMap.size > 0) ? (theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-900/40' : 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-900/10') : (theme === 'dark' ? 'text-slate-400 border-slate-700 hover:bg-slate-800' : 'text-slate-400 border-slate-200 hover:bg-slate-100')}`} title="Pasta Mãe">
              <FolderOpenIcon className="w-6 h-6"/>
            </button>
            <button onClick={() => setIsConfigOpen(true)} className={`p-2.5 transition-all ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-indigo-600'}`}><Cog6ToothIcon className="w-6 h-6"/></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <FilterBar 
          filters={filters} setFilters={setFilters} theme={theme}
          onExportWord={() => exportToWord(filteredProcessos, currentStatusView)}
          onExportJson={() => {
            const data = getCurrentDataState();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'backup_judicial.json'; a.click();
          }}
          crimes={crimes} diaps={diaps} procuradores={procuradores} medidas={medidas}
        />

        <div className="mt-8">
          {currentDisplayMode === 'list' ? (
            <div className={`rounded-3xl shadow-2xl border overflow-hidden ${theme === 'dark' ? 'bg-[#161e2d] border-[#334155]' : 'bg-white border-slate-200'}`}>
              <ProcessList 
                processos={filteredProcessos} theme={theme}
                onEdit={(p) => { setEditingProcess(p); setIsFormOpen(true); }}
                onDelete={(id) => confirm('Deseja eliminar?') && setProcessos(prev => prev.filter(p => p.id !== id))}
                onToggleStatus={(id) => setProcessos(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'pendente' ? 'findo' : 'pendente' } : p))}
                onDuplicate={(p) => { setEditingProcess({...p, id: 'temp-copy'}); setIsFormOpen(true); }}
                onOpenDoc={openDocument}
                diaps={diaps} procuradores={procuradores} juizes={juizes}
              />
            </div>
          ) : (
            <CalendarView processos={filteredProcessos} theme={theme} />
          )}
        </div>
      </main>

      {(isFormOpen || editingProcess) && (
        <ProcessForm 
          isOpen={true} onClose={() => { setIsFormOpen(false); setEditingProcess(undefined); }}
          onSubmit={(data) => {
             if (editingProcess && editingProcess.id !== 'temp-copy') {
               setProcessos(prev => prev.map(p => p.id === editingProcess.id ? { ...p, ...data } : p));
             } else {
               setProcessos(prev => [{...data, id: crypto.randomUUID(), status: 'pendente', createdAt: Date.now()}, ...prev]);
             }
             setIsFormOpen(false);
             setEditingProcess(undefined);
          }}
          initialData={editingProcess} theme={theme}
          crimes={crimes} setCrimes={setCrimes}
          diaps={diaps} setDiaps={setDiaps}
          medidas={medidas} setMedidas={setMedidas}
          procuradores={procuradores} setProcuradores={setProcuradores}
          arguidos={arguidos} setArguidos={setArguidos}
          juizes={juizes} setJuizes={setJuizes}
          folderHandle={folderHandle}
          filesMap={filesMap}
        />
      )}

      {isConfigOpen && (
        <ReferenceDataManager 
          isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)}
          crimes={crimes} setCrimes={setCrimes}
          diaps={diaps} setDiaps={setDiaps}
          medidas={medidas} setMedidas={setMedidas}
          procuradores={procuradores} setProcuradores={setProcuradores}
          arguidos={arguidos} setArguidos={setArguidos}
          juizes={juizes} setJuizes={setJuizes}
        />
      )}
    </div>
  );
};

export default App;
