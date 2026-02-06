
import React, { useState, useRef, useEffect } from 'react';
import { CircleStackIcon, RocketLaunchIcon, ScaleIcon, FolderOpenIcon, CloudArrowDownIcon, DocumentCheckIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

interface Props {
  onInitialize: (project: any, folder: FileSystemDirectoryHandle | null, fallbackFiles: Map<string, File> | null) => void;
  theme: 'light' | 'dark';
}

const StartupScreen: React.FC<Props> = ({ onInitialize, theme }) => {
  const [projectData, setProjectData] = useState<any>(null);
  const [folderHandle, setFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fallbackMap, setFallbackMap] = useState<Map<string, File> | null>(null);
  const [hasSavedSession, setHasSavedSession] = useState(false);
  
  const directoryInputRef = useRef<HTMLInputElement>(null);
  const fileInputManualRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('gestor_judicial_data');
    if (saved) {
      setHasSavedSession(true);
      try { setProjectData(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleFileManual = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        setProjectData(data);
        setFileName(file.name);
        setHasSavedSession(false);
      } catch (err) { alert('Erro ao carregar ficheiro JSON.'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-8 font-sans">
      <input type="file" ref={directoryInputRef} onChange={(e) => {
        const files = e.target.files;
        if (!files) return;
        const newMap = new Map<string, File>();
        for (let i = 0; i < files.length; i++) if (files[i].name.toLowerCase().endsWith('.pdf')) newMap.set(files[i].name, files[i]);
        setFallbackMap(newMap);
      }} style={{ display: 'none' }} webkitdirectory="true" directory="" />

      <div className="max-w-4xl w-full space-y-10 text-center bg-slate-900/50 p-12 rounded-[3rem] border border-slate-800 backdrop-blur-3xl shadow-3xl">
        <div className="flex flex-col items-center">
          <div className="p-6 bg-blue-600 rounded-[2.5rem] shadow-3xl mb-8 rotate-3 animate-float">
            <ScaleIcon className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-4 uppercase">Gestor Judicial</h1>
          <p className="text-blue-400 font-bold uppercase tracking-[0.3em] text-[10px]">Controlo de Prazos e Medidas de Coação</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => fileInputManualRef.current?.click()}
            className={`relative p-8 rounded-[2rem] border-4 border-dashed transition-all group h-full flex flex-col items-center justify-center gap-4 ${projectData ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-800/50 border-slate-700 hover:border-blue-500'}`}
          >
            <div className={`p-5 rounded-2xl transition-all ${projectData ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-500 group-hover:text-blue-400'}`}>
              {projectData ? <DocumentCheckIcon className="w-10 h-10"/> : <CloudArrowDownIcon className="w-10 h-10" />}
            </div>
            <div>
              <p className="font-black text-white text-lg tracking-tight uppercase">Base de Dados</p>
              <p className="text-[10px] font-black uppercase tracking-widest mt-1 text-slate-500">
                {fileName ? fileName : 'Importar Ficheiro .JSON'}
              </p>
            </div>
            <input type="file" ref={fileInputManualRef} className="hidden" accept=".json" onChange={handleFileManual} />
          </button>

          <button 
            onClick={() => directoryInputRef.current?.click()} 
            className={`relative p-8 rounded-[2rem] border-4 border-dashed transition-all group h-full flex flex-col items-center justify-center gap-4 ${ (folderHandle || (fallbackMap && fallbackMap.size > 0)) ? 'bg-blue-500/10 border-blue-500' : 'bg-slate-800/50 border-slate-700 hover:border-blue-500'}`}>
            <div className={`p-5 rounded-2xl transition-all ${ (folderHandle || (fallbackMap && fallbackMap.size > 0)) ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-500 group-hover:text-blue-400'}`}>
              <FolderOpenIcon className="w-10 h-10" />
            </div>
            <div>
              <p className="font-black text-white text-lg tracking-tight uppercase">Pasta Mãe (PDFs)</p>
              <p className="text-[10px] font-black uppercase tracking-widest mt-1 text-slate-500">
                {(fallbackMap && fallbackMap.size > 0) ? `${fallbackMap.size} PDFs Preparados` : 'Opcional'}
              </p>
            </div>
          </button>
        </div>

        <div className="pt-6 space-y-4">
          <button 
            onClick={() => onInitialize(projectData, folderHandle, fallbackMap)} 
            className={`w-full py-6 font-black rounded-[1.5rem] shadow-3xl transition-all flex items-center justify-center gap-3 text-lg active:scale-95 ${projectData || hasSavedSession ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
          >
            {projectData ? 'INICIAR COM DADOS CARREGADOS' : (hasSavedSession ? 'RETOMAR SESSÃO NO BROWSER' : 'INICIAR APLICAÇÃO VAZIA')} 
            <RocketLaunchIcon className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col gap-1 items-center">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
              Lembre-se de usar o botão "Descarregar JSON" no final para fazer backup.
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(3deg); } 50% { transform: translateY(-10px) rotate(1deg); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .shadow-3xl { box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.5); }
      `}</style>
    </div>
  );
};

export default StartupScreen;
