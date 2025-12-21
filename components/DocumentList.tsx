

import React, { useState } from 'react';
import { DocumentoDecisao, Processo } from '../types';
import { 
  CloudArrowUpIcon, 
  TrashIcon, 
  DocumentMagnifyingGlassIcon,
  MagnifyingGlassIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

interface Props {
  documentos: DocumentoDecisao[];
  processos: Processo[];
  onAddDoc: (doc: DocumentoDecisao) => void;
  onRemoveDoc: (id: string) => void;
}

const DocumentList: React.FC<Props> = ({ documentos, processos, onAddDoc, onRemoveDoc }) => {
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProcessId) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const newDoc: DocumentoDecisao = {
        id: crypto.randomUUID(),
        processoId: selectedProcessId,
        nomeArquivo: file.name,
        conteudoExtraido: content.substring(0, 10000), // Simula extração de texto
        dataUpload: Date.now(),
        tamanho: file.size,
        tipo: file.type
      };
      onAddDoc(newDoc);
      setIsUploading(false);
      setSelectedProcessId('');
    };
    // Em browsers reais, para ler PDF/Word como texto precisaríamos de bibliotecas. 
    // Aqui usamos readAsText como simplificação para o requisito de "ler conteúdo".
    reader.readAsText(file); 
  };

  const filtered = documentos.filter(d => 
    d.nomeArquivo.toLowerCase().includes(search.toLowerCase()) || 
    d.conteudoExtraido.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-black tracking-tighter">BIBLIOTECA DE DESPACHOS</h2>
          <p className="text-indigo-100 opacity-80 text-sm">Gira os documentos de decisão associados aos processos.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            value={selectedProcessId} 
            onChange={e => setSelectedProcessId(e.target.value)}
            className="flex-1 bg-indigo-500 text-white border-none rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-white/50 text-sm font-bold"
          >
            <option value="">Associar a Processo...</option>
            {/* Corrected: Processo has 'arguidos' array, not 'nomeArguido' string */}
            {processos.map(p => <option key={p.id} value={p.id}>{p.numeroProcesso} - {p.arguidos.join(', ')}</option>)}
          </select>
          <label className={`btn-upload flex items-center gap-2 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${!selectedProcessId ? 'opacity-50 pointer-events-none bg-indigo-400' : 'bg-white text-indigo-600 hover:shadow-xl active:scale-95'}`}>
            <CloudArrowUpIcon className="w-5 h-5"/> {isUploading ? 'A LER...' : 'CARREGAR DECISÃO'}
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} disabled={!selectedProcessId} />
          </label>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            placeholder="Pesquisar em despachos ou conteúdo extraído..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => {
            const proc = processos.find(p => p.id === doc.processoId);
            return (
              <div key={doc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><DocumentMagnifyingGlassIcon className="w-6 h-6"/></div>
                  <button onClick={() => onRemoveDoc(doc.id)} className="p-2 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"><TrashIcon className="w-5 h-5"/></button>
                </div>
                <h4 className="font-bold text-slate-800 text-sm truncate">{doc.nomeArquivo}</h4>
                <div className="flex items-center gap-2 text-[10px] text-indigo-500 font-black uppercase mt-1">
                  <LinkIcon className="w-3 h-3"/> {proc?.numeroProcesso || 'Desconhecido'}
                </div>
                <div className="mt-3 p-2 bg-white rounded-lg text-[10px] text-slate-500 italic max-h-20 overflow-hidden line-clamp-3">
                  {doc.conteudoExtraido || 'Sem conteúdo legível.'}
                </div>
                <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-widest">{new Date(doc.dataUpload).toLocaleDateString()}</p>
              </div>
            );
          })}
        </div>
        
        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <DocumentMagnifyingGlassIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum despacho encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;