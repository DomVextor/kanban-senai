import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreVertical, MessageSquare, Paperclip, Clock, Edit2, Trash2, CheckCircle } from 'lucide-react';
import TaskModal from '../components/TaskModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const COLUMNS = [
  { id: 'A Fazer', title: 'A Fazer', color: 'bg-zinc-200 dark:bg-zinc-800' },
  { id: 'Em Andamento', title: 'Em Andamento', color: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { id: 'Concluído', title: 'Concluído', color: 'bg-emerald-100 dark:bg-emerald-900/30' }
];

export default function KanbanBoard() {
  const queryClient = useQueryClient();
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/tasks', { headers: { 'Authorization': `Bearer ${token}` }});
      if (!res.ok) throw new Error('Falha ao obter tarefas');
      return res.json();
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/categories', { headers: { 'Authorization': `Bearer ${token}` }});
      if (!res.ok) throw new Error('Falha ao obter categorias');
      return res.json();
    }
  });

  const saveMutation = useMutation({
    mutationFn: async ({ payload, taskId }) => {
      const token = localStorage.getItem('token');
      const method = taskId ? 'PUT' : 'POST';
      const url = taskId ? `http://localhost:5000/api/tasks/${taskId}` : 'http://localhost:5000/api/tasks';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Erro ao salvar tarefa');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro ao deletar tarefa');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  });

  const handleSaveTask = async (payload, taskId) => {
    return saveMutation.mutateAsync({ payload, taskId });
  };

  const handleDeleteTask = async () => {
    return deleteMutation.mutateAsync(taskToDelete.id);
  };

  const markAsDone = async (task) => {
    const payload = { ...task, tags: task.tags?.map(t => t.name) || [], status: 'Concluído' };
    await handleSaveTask(payload, task.id);
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('taskId', task.id.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    const taskIdString = e.dataTransfer.getData('taskId');
    if (!taskIdString) return;
    
    const taskId = parseInt(taskIdString, 10);
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.status !== columnId) {
      // Optimistic cache update is tricky with tags here, so we invalidate aggressively
      const payload = { ...task, tags: task.tags?.map(t => t.name) || [], status: columnId };
      try {
        await handleSaveTask(payload, task.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    if (priority === 'Medium') return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
    return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
  };

  return (
    <div className="h-full flex flex-col pt-2 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Kanban Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Quadro de Tarefas
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Organize e arraste atividades de acordo com seu progresso.
          </p>
        </div>
        
        <button 
          onClick={() => { setEditingTask(null); setTaskModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Nova Tarefa
        </button>
      </div>

      {/* Columns */}
      <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
        {COLUMNS.map(column => {
          const columnTasks = tasks.filter(t => t.status === column.id);
          return (
          <div 
            key={column.id} 
            className="flex-1 min-w-[320px] max-w-2xl flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`p-3 rounded-xl flex justify-between items-center mb-4 ${column.color}`}>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
                {column.title} <span className="ml-2 px-2 py-0.5 bg-white/50 dark:bg-black/20 rounded-full text-xs">{columnTasks.length}</span>
              </h3>
              <button 
                onClick={() => { setEditingTask({ status: column.id }); setTaskModalOpen(true); }}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm"
              >
                <Plus size={14} /> Nova
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {columnTasks.length === 0 && (
                <div className="text-sm text-center text-zinc-500 dark:text-zinc-500 py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  Nenhuma tarefa aqui
                </div>
              )}
              {columnTasks.map(task => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow relative group hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all cursor-grab active:cursor-grabbing"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden">
                    {task.status !== 'Concluído' && (
                      <button onClick={() => markAsDone(task)} className="p-1.5 text-zinc-400 hover:text-emerald-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" title="Concluir">
                        <CheckCircle size={14} />
                      </button>
                    )}
                    <button onClick={() => openEditModal(task)} className="p-1.5 text-zinc-400 hover:text-indigo-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" title="Editar">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => { setTaskToDelete(task); setDeleteModalOpen(true); }} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" title="Deletar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3 pr-16 flex-wrap">
                    {(() => {
                      const cat = categories.find(c => c.id === task.category_id);
                      const catColor = cat ? cat.color : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300';
                      const catName = cat ? cat.name : (task.category_name || 'Geral');
                      return (
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${catColor} truncate max-w-[120px]`}>
                          {catName}
                        </span>
                      );
                    })()}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.tags && task.tags.map(tag => (
                      <span key={tag.name} className={`text-[10px] font-medium px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 truncate max-w-[80px]`}>
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                  
                  <h4 className="font-semibold text-zinc-800 dark:text-zinc-100 mb-4 leading-snug">
                    {task.title}
                  </h4>
                  
                  <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs">
                    <div className="flex items-center gap-1 font-medium bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded">
                      <Clock size={14} className="text-zinc-400" />
                      {task.due_date || 'Sem data'}
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200">
                        <MessageSquare size={14} /> 2
                      </div>
                      <div className="flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200">
                        <Paperclip size={14} /> 1
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          );
        })}
      </div>

      {/* Modals */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setTaskModalOpen(false)} 
        onSave={handleSaveTask}
        task={editingTask}
        categories={categories}
      />
      
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setTaskToDelete(null); }}
        onConfirm={handleDeleteTask}
        itemName={taskToDelete?.title}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
