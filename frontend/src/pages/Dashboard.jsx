import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, CalendarDays, TrendingUp, Plus, Calendar, AlertCircle } from 'lucide-react';
import TaskModal from '../components/TaskModal';
import { collection, onSnapshot, addDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [user] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { name: 'Usuário', uid: null };
  });

  const userId = user?.uid || user?.id;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const qTasks = query(collection(db, 'tasks'), where('user_id', '==', userId));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(data);
      queryClient.setQueryData(['tasks'], data);
    });
    
    const qCategories = query(collection(db, 'categories'), where('user_id', '==', userId));
    const unsubCategories = onSnapshot(qCategories, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(data);
      queryClient.setQueryData(['categories'], data);
    });

    return () => {
      unsubTasks();
      unsubCategories();
    };
  }, [queryClient, userId]);

  // Derived stats from real-time tasks
  const statsData = {
    total_tasks: tasks.length,
    completed_tasks: tasks.filter(t => t.status === 'Concluído').length,
    overdue_tasks: tasks.filter(t => {
      if (!t.due_date || t.status === 'Concluído') return false;
      const [year, month, day] = t.due_date.split('-');
      const dueDate = new Date(year, month - 1, day);
      dueDate.setHours(23, 59, 59, 999);
      return dueDate < new Date();
    }).length,
    due_today: tasks.filter(t => {
      if (!t.due_date || t.status === 'Concluído') return false;
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      return t.due_date === todayStr;
    }).length,
    completed_last_7_days: tasks.filter(t => t.status === 'Concluído').length, // Simplified for frontend-only
  };

  const saveMutation = useMutation({
    mutationFn: async ({ payload }) => {
      await addDoc(collection(db, 'tasks'), { ...payload, user_id: userId });
    },
    onSuccess: () => {
      setTaskModalOpen(false);
    }
  });

  const upcomingTasks = tasks.filter(t => t.status !== 'Concluído').slice(0, 5);

  const getCompletedTrend = (count) => {
    if (count > 3) return 'Ótimo Ritmo!';
    if (count >= 1) return 'Bom trabalho!';
    return '';
  };

  const stats = [
    { title: 'Concluídas p/ Últimos 7 dias', value: statsData.completed_last_7_days || 0, icon: <CheckCircle2 className="text-emerald-400" size={32} />, trend: getCompletedTrend(statsData.completed_last_7_days || 0) },
    { title: 'Para Hoje', value: statsData.due_today, icon: <Clock className="text-amber-400" size={32} />, trend: 'Foco de hoje' },
    { title: 'Atrasadas', value: statsData.overdue_tasks, icon: <AlertCircle className="text-red-400" size={32} />, trend: 'Exigem atenção', badge: true },
    { title: 'Total Cadastradas', value: statsData.total_tasks, icon: <TrendingUp className="text-blue-400" size={32} />, trend: 'Tarefas Globais' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-2rem)] flex flex-col pt-4 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Background decoration for aesthetics */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute top-40 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      {/* Welcome Section */}
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 drop-shadow-sm">
          {getGreeting()}, <span className="text-indigo-600 dark:text-indigo-400">{user.name.split(' ')[0]}!</span> 👋
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Este é o seu panorama de produtividade atual.
        </p>
      </div>

      {/* Stats Grid - Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="relative p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/40 dark:border-zinc-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col hover:scale-[1.02] hover:shadow-xl transition-all overflow-hidden group">
            
            <div className="absolute -right-6 -top-6 p-8 bg-zinc-100/50 dark:bg-zinc-800/30 rounded-full group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
               {stat.icon}
            </div>

            <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 z-10 mb-2 uppercase tracking-wider">{stat.title}</h3>
            
            <div className="flex items-end gap-3 z-10">
              <span className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">
                {stat.value}
              </span>
              {stat.badge && stat.value > 0 && (
                <span className="mb-1 w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
              )}
            </div>
            
            <div className="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-500 flex items-center gap-2 z-10">
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Tasks - Glassmorphism */}
      <div className="p-8 rounded-3xl bg-white/60 dark:bg-zinc-900/30 backdrop-blur-xl border border-white/40 dark:border-zinc-800/50 shadow-lg">
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
             <CalendarDays className="text-indigo-500" />
             Próximas para Vencer
           </h3>
           <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800/80 px-3 py-1 rounded-full">
             {upcomingTasks.length} pendentes
           </span>
        </div>
        
        <div className="space-y-4">
          {upcomingTasks.length === 0 ? (
             <div className="text-center py-10 text-zinc-500">
                Nenhuma tarefa ativa. Aproveite o dia!
             </div>
          ) : (
            upcomingTasks.map(task => (
              <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/80 dark:bg-zinc-950/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{task.title}</h4>
                    <p className="text-sm font-medium text-zinc-500 mt-1 flex items-center gap-2">
                       <Calendar size={14} className="text-indigo-400" />
                       {task.due_date ? `Vence em ${task.due_date}` : 'Sem prazo'} • {task.category_name || 'Geral'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
                   <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                     {task.status}
                   </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => setTaskModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
        <span className="absolute w-full h-full rounded-full bg-indigo-500 opacity-20 group-hover:animate-ping -z-10"></span>
      </button>

      {/* Global Dashboard Task Modal */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setTaskModalOpen(false)} 
        onSave={(payload) => saveMutation.mutateAsync({ payload })}
        task={null}
        categories={categories}
      />
    </div>
  );
}
