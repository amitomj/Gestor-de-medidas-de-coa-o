
import React, { useState, useRef } from 'react';
import { CircleStackIcon, RocketLaunchIcon, ScaleIcon, FolderOpenIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  onInitialize: (project: any, folder: FileSystemDirectoryHandle | null, fallbackFiles: Map<string, File> | null) => void;
  theme: 'light' | 'dark';
}

const StartupScreen: React.FC<Props> = ({ onInitialize, theme }) => {
  const [projectData, setProjectData] = useState<any>(null);
  const [folderHandle, setFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [fallbackMap, setFallbackMap] = useState<Map<string, File> | null>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        setProjectData(data);
      } catch (err) {
        alert('Erro ao carregar ficheiro JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleDirectoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newMap = new Map<string, File>();
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.name.toLowerCase().endsWith('.pdf')) {
        newMap.set(f.name, f);
      }
    }
    setFallbackMap(newMap);
    setFolderHandle(null);
  };

  const handleFolderClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if ('showDirectoryPicker' in window) {
        const handle = await (window as any).showDirectoryPicker();
        setFolderHandle(handle);
        setFallbackMap(null);
      } else {
        directoryInputRef.current?.click();
      }
    } catch (err: any) {
      // Fix: Casting err to any to avoid "Property 'name' does not exist on type 'unknown'"
      if (err && (err as any).name !== 'AbortError') {
        // Fallback imediato se falhar o seletor moderno
        directoryInputRef.current?.click();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-8">
      {/* Input invisível para fallback */}
      <input 
        type="file" 
        ref={directoryInputRef} 
        onChange={handleDirectoryChange} 
        style={{ display: 'none' }} 
        //@ts-ignore
        webkitdirectory="true" 
        directory="" 
      />

      <div className="max-w-4xl w-full space-y-12 text-center bg-slate-900/50 p-12 rounded-[3rem] border border-slate-800 backdrop-blur-3xl shadow-3xl">
        <div className="flex flex-col items-center">
          <div className="p-6 bg-blue-600 rounded-[2.5rem] shadow-3xl mb-8 rotate-6 animate-float">
            <ScaleIcon className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-4 uppercase">Gestor Judicial</h1>
          <p className="text-blue-400 font-bold uppercase tracking-[0.3em] text-[10px]">Controlo de Prazos e Documentação Local</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className={`relative block p-8 rounded-[2rem] border-4 border-dashed transition-all cursor-pointer group h-full ${projectData ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-800/50 border-slate-700 hover:border-blue-500'}`}>
            <input type="file" className="hidden" accept=".json" onChange={handleFile} />
            <div className="flex flex-col items-center text-center gap-4">
              <div className={`p-5 rounded-2xl transition-all ${projectData ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-500 group-hover:text-blue-400'}`}>
                {projectData ? <CheckCircleIcon className="w-10 h-10"/> : <CircleStackIcon className="w-10 h-10" />}
              </div>
              <div>
                <p className="font-black text-white text-lg tracking-tight uppercase">Base de Dados</p>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${projectData ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {projectData ? 'Ficheiro Carregado' : 'Carregar .JSON'}
                </p>
              </div>
            </div>
          </label>

          <button 
            type="button"
            onClick={handleFolderClick} 
            className={`relative block p-8 rounded-[2rem] border-4 border-dashed transition-all group h-full text-center outline-none ${ (folderHandle || (fallbackMap && fallbackMap.size > 0)) ? 'bg-blue-500/10 border-blue-500' : 'bg-slate-800/50 border-slate-700 hover:border-blue-500'}`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`p-5 rounded-2xl transition-all ${ (folderHandle || (fallbackMap && fallbackMap.size > 0)) ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-500 group-hover:text-blue-400'}`}>
                { (folderHandle || (fallbackMap && fallbackMap.size > 0)) ? <CheckCircleIcon className="w-10 h-10"/> : <FolderOpenIcon className="w-10 h-10" />}
              </div>
              <div>
                <p className="font-black text-white text-lg tracking-tight uppercase">Pasta Mãe</p>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${ (folderHandle || (fallbackMap && fallbackMap.size > 0)) ? 'text-blue-400' : 'text-slate-500'}`}>
                  { (folderHandle || (fallbackMap && fallbackMap.size > 0)) ? `${fallbackMap ? fallbackMap.size : 'Pasta'} PDFs Vinculados` : 'Identificar Pasta PDFs'}
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="pt-6 space-y-4">
          <button 
            type="button"
            onClick={() => onInitialize(projectData, folderHandle, fallbackMap)}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[1.5rem] shadow-3xl shadow-blue-900/40 transition-all flex items-center justify-center gap-3 text-lg active:scale-95"
          >
            INICIAR GESTÃO <RocketLaunchIcon className="w-6 h-6" />
          </button>
          
          <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em]">
            Os seus ficheiros permanecem no seu computador.
          </p>
        </div>
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(6deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .shadow-3xl { box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.5); }
      `}</style>
    </div>
  );
};

export default StartupScreen;
