import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Camera, Mail, User, LogOut, CheckCircle2, ListTodo } from 'lucide-react';

export default function Profile() {
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { name: '', email: '', avatar: null };
  });

  const { data: stats = { total_tasks: 0, completed_tasks: 0 } } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, ...data }));
        return {
          total_tasks: data.total_tasks || 0,
          completed_tasks: data.completed_tasks || 0
        };
      }
      return { total_tasks: 0, completed_tasks: 0 };
    }
  });

  const [uploading, setUploading] = useState(false);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('avatar', file);
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        const updatedUser = { ...user, avatar: data.avatar };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    // Clear localStorage and redirect to /login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Meu Perfil
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Gerencie suas informações e preferências da conta.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="col-span-1 md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm text-center relative overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500 absolute top-0 left-0 w-full"></div>
            
            <div className="relative mt-8 mb-4">
              <div className="w-28 h-28 mx-auto rounded-full ring-4 ring-white dark:ring-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shadow-md">
                {user?.avatar ? (
                  <img src={`${import.meta.env.VITE_API_URL}${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-zinc-400 dark:text-zinc-500">{getInitials(user?.name || '')}</span>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-1/2 translate-x-12 bg-white dark:bg-zinc-800 p-2 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 transition-colors"
                title="Mudar foto"
              >
                <Camera size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/png, image/jpeg, image/webp" 
                className="hidden" 
              />
            </div>
            
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{user?.name}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">@{user?.name?.split(' ')[0].toLowerCase()}</p>

            <button 
              onClick={handleLogout}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <LogOut size={18} />
              Sair da Conta
            </button>
          </div>
        </div>

        {/* Info & Stats */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Informações Pessoais</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shrink-0">
                  <User className="text-zinc-400" size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Nome Completo</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{user.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shrink-0">
                  <Mail className="text-zinc-400" size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Endereço de E-mail</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-6 flex flex-col justify-center">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
                  <ListTodo className="text-indigo-600 dark:text-indigo-400" size={24} />
                </div>
                <span className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{stats.total_tasks}</span>
              </div>
              <h4 className="mt-4 font-medium text-indigo-900 dark:text-indigo-300">Total de Tarefas Criadas</h4>
            </div>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6 flex flex-col justify-center">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
                  <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />
                </div>
                <span className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{stats.completed_tasks}</span>
              </div>
              <h4 className="mt-4 font-medium text-emerald-900 dark:text-emerald-300">Tarefas Concluídas</h4>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
