import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSave, task, categories }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Medium',
    status: 'A Fazer',
    category_id: '',
    tags: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          due_date: task.due_date || '',
          priority: task.priority || 'Medium',
          status: task.status || 'A Fazer',
          category_id: task.category_id || '',
          tags: task.tags ? task.tags.map(t => t.name).join(', ') : ''
        });
      } else {
        setFormData({
          title: '', description: '', due_date: '', priority: 'Medium', status: 'A Fazer', category_id: categories?.[0]?.id || '', tags: ''
        });
      }
      setError('');
    }
  }, [isOpen, task, categories]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('O Título da tarefa é obrigatório.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      await onSave(payload, task?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao salvar a tarefa');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-3 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form id="task-form" className="space-y-5" onSubmit={handleSave}>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Título *</label>
              <input
                type="text"
                autoFocus
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: Entrevistar candidato"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Descrição</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Detalhes sobre a tarefa..."
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Data Limite</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={e => setFormData({...formData, due_date: e.target.value})}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Prioridade</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="Low">Baixa</option>
                  <option value="Medium">Média</option>
                  <option value="High">Alta</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Categoria Fixa</label>
              <select
                value={formData.category_id}
                onChange={e => setFormData({...formData, category_id: e.target.value})}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="">Selecione...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tags Customizadas</label>
              <input
                type="text"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                placeholder="urgente, cliente x, reunião (separadas por vírgula)"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </form>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-950/50 p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            form="task-form"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={18} /> Salvar Tarefa</>}
          </button>
        </div>

      </div>
    </div>
  );
}
