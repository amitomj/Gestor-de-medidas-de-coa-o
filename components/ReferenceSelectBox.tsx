
import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  TrashIcon, 
  PencilIcon, 
  ClipboardDocumentCheckIcon,
  CheckIcon,
  PlusIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface Item {
  id: string;
  label: string;
  secondaryLabel?: string;
}

interface ReferenceSelectBoxProps {
  title: string;
  category: string;
  theme: 'light' | 'dark';
  items: Item[];
  selectedIds: string[];
  onToggle: (label: string) => void;
  onAdd: (label: string, secondary?: string, third?: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, newLabel: string, newSecondary?: string, newThird?: string) => void;
  placeholderAdd?: string;
  showSecondaryInput?: boolean;
  showThirdInput?: boolean;
  showSecondaryInList?: boolean;
  placeholderSecondary?: string;
  placeholderThird?: string;
}

const ReferenceSelectBox: React.FC<ReferenceSelectBoxProps> = ({
  title, category, theme, items, selectedIds, onToggle, onAdd, onRemove, onEdit,
  placeholderAdd = "Novo...", showSecondaryInput = false, showThirdInput = false, showSecondaryInList = true, placeholderSecondary = "Sub-info...", placeholderThird = "Telefone..."
}) => {
  const [filter, setFilter] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newSecondary, setNewSecondary] = useState('');
  const [newThird, setNewThird] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editSecondary, setEditSecondary] = useState('');
  const [editThird, setEditThird] = useState('');

  const filteredItems = items.filter(i => 
    i.label.toLowerCase().includes(filter.toLowerCase()) ||
    (i.secondaryLabel && i.secondaryLabel.toLowerCase().includes(filter.toLowerCase()))
  );

  const externalSelected = selectedIds.filter(id => !items.find(item => item.label === id));

  const handleAddNew = () => {
    if (!newValue.trim()) return;
    onAdd(newValue.trim(), showSecondaryInput ? newSecondary.trim() : undefined, showThirdInput ? newThird.trim() : undefined);
    setNewValue('');
    setNewSecondary('');
    setNewThird('');
  };

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      onEdit(editingId, editValue.trim(), showSecondaryInput ? editSecondary.trim() : undefined, showThirdInput ? editThird.trim() : undefined);
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleAddNew();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      saveEdit();
    }
  };

  const boxClasses = theme === 'dark' 
    ? 'bg-[#0f172a]/40 border-[#334155] text-white shadow-xl' 
    : 'bg-white border-slate-200 text-slate-900 shadow-md';

  const inputBase = "w-full outline-none transition-all font-black text-[11px] ";
  const inputTheme = theme === 'dark'
    ? 'bg-[#1e293b] border-slate-700 text-white placeholder-slate-500'
    : 'bg-slate-100 border-slate-200 text-black placeholder-slate-500';

  return (
    <div className={`rounded-xl border overflow-hidden flex flex-col transition-all duration-300 ${boxClasses}`}>
      <div className={`px-4 py-2.5 border-b flex items-center justify-between ${theme === 'dark' ? 'bg-[#1e293b] border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <ClipboardDocumentCheckIcon className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-indigo-600'}`} />
          <h3 className="text-[10px] font-black uppercase tracking-widest">{title}</h3>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${theme === 'dark' ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600'}`}>{category}</span>
      </div>

      <div className="p-2 border-b border-slate-700/30">
        <div className="relative">
          <MagnifyingGlassIcon className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
          <input 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            className={`${inputBase} ${inputTheme} pl-8 pr-2 py-1.5 border rounded-lg`}
            placeholder="Filtrar..."
          />
        </div>
      </div>

      <div className="overflow-y-auto p-1.5 space-y-0.5 h-[140px]">
        {externalSelected.length > 0 && externalSelected.map(label => (
          <div key={label} className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'bg-blue-600/5 hover:bg-blue-600/10' : 'bg-slate-50 hover:bg-slate-100'}`}>
            <input 
              type="checkbox"
              checked={true}
              onChange={() => onToggle(label)}
              className="w-3.5 h-3.5 rounded-md cursor-pointer accent-indigo-600"
            />
            <div className="flex-1 flex flex-col cursor-pointer" onClick={() => onToggle(label)}>
              <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                {label} <ExclamationCircleIcon className="w-3 h-3" title="Item externo ao banco de dados" />
              </span>
            </div>
          </div>
        ))}

        {filteredItems.map(item => (
          <div key={item.id} className={`flex items-center gap-2 p-1.5 rounded-lg group relative transition-colors ${theme === 'dark' ? 'hover:bg-blue-600/10' : 'hover:bg-slate-100'}`}>
            <input 
              type="checkbox"
              checked={selectedIds.includes(item.label)}
              onChange={() => onToggle(item.label)}
              className="w-3.5 h-3.5 rounded-md cursor-pointer accent-indigo-600"
            />
            {editingId === item.id ? (
              <div className="flex-1 flex flex-col gap-1">
                <input 
                  autoFocus 
                  value={editValue} 
                  onChange={e => setEditValue(e.target.value)} 
                  onKeyDown={handleEditKeyDown}
                  className={`${inputBase} ${inputTheme} px-1.5 py-0.5 border rounded-md`} 
                />
                <button type="button" onClick={saveEdit} className="p-1 text-emerald-400 self-end"><CheckIcon className="w-4 h-4"/></button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col cursor-pointer" onClick={() => onToggle(item.label)}>
                <span className="text-[11px] font-bold">{item.label}</span>
                {showSecondaryInList && item.secondaryLabel && <span className="text-[9px] opacity-60 italic leading-none truncate max-w-[120px]">{item.secondaryLabel}</span>}
              </div>
            )}
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button" onClick={() => {setEditingId(item.id); setEditValue(item.label);}} className="p-1 text-slate-500 hover:text-blue-400"><PencilIcon className="w-3.5 h-3.5"/></button>
              <button type="button" onClick={() => onRemove(item.id)} className="p-1 text-slate-500 hover:text-rose-400"><TrashIcon className="w-3.5 h-3.5"/></button>
            </div>
          </div>
        ))}
      </div>

      <div className={`p-2 border-t space-y-1.5 ${theme === 'dark' ? 'bg-[#0f172a]/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex gap-1.5">
          <div className="flex-1 flex flex-col gap-1">
            <input 
              value={newValue} 
              onChange={e => setNewValue(e.target.value)} 
              onKeyDown={handleKeyDown}
              className={`${inputBase} ${inputTheme} px-2.5 py-1.5 rounded-lg border`} 
              placeholder={placeholderAdd} 
            />
            {showSecondaryInput && (
              <input 
                value={newSecondary} 
                onChange={e => setNewSecondary(e.target.value)} 
                onKeyDown={handleKeyDown}
                className={`${inputBase} ${inputTheme} px-2.5 py-1.5 rounded-lg border`} 
                placeholder={placeholderSecondary} 
              />
            )}
            {showThirdInput && (
              <input 
                value={newThird} 
                onChange={e => setNewThird(e.target.value)} 
                onKeyDown={handleKeyDown}
                className={`${inputBase} ${inputTheme} px-2.5 py-1.5 rounded-lg border`} 
                placeholder={placeholderThird} 
              />
            )}
          </div>
          <button type="button" onClick={handleAddNew} className="w-8 h-8 rounded-lg transition-all shadow-md active:scale-90 flex items-center justify-center shrink-0 bg-indigo-600 text-white hover:bg-indigo-500">
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferenceSelectBox;
