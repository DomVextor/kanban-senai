import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
              <AlertTriangle size={24} />
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Excluir Tarefa?</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Tem certeza que deseja excluir a tarefa <span className="font-semibold text-zinc-800 dark:text-zinc-300">"{itemName}"</span>? Esta ação não pode ser desfeita.
          </p>
        </div>
        
        <div className="bg-zinc-50 dark:bg-zinc-950/50 p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-800 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sim, Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}
