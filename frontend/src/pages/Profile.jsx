import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Camera, Mail, User, LogOut, CheckCircle2, ListTodo, X } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase';

export default function Profile() {
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { name: '', email: '', avatar: null, uid: null };
  });

  const { data: stats = { total_tasks: 0, completed_tasks: 0 } } = useQuery({
    queryKey: ['userStats', user.uid],
    queryFn: async () => {
      if (!user.uid) return { total_tasks: 0, completed_tasks: 0 };
      
      const q = query(collection(db, 'tasks'), where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      let total_tasks = 0;
      let completed_tasks = 0;
      
      querySnapshot.forEach((doc) => {
        total_tasks++;
        if (doc.data().status === 'Concluído') {
          completed_tasks++;
        }
      });
      
      return { total_tasks, completed_tasks };
    },
    enabled: !!user.uid
  });

  const [uploading, setUploading] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  const DIVERSE_SEEDS = ['Aidan', 'Destiny', 'Jocelyn', 'Avery', 'Liam', 'Mason', 'Sofia', 'Valentina', 'Chloe', 'Elijah', 'Mia', 'Jackson'];
  
  const generateAvatar = (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleAvatarSelect = async (seed) => {
    setUploading(true);
    try {
      const avatarUrl = generateAvatar(seed);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: avatarUrl });
      }
      
      const updatedUser = { ...user, avatar: avatarUrl };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowAvatarSelector(false);
    } catch (e) {
      console.error("Erro ao atualizar avatar", e);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
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
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-zinc-400 dark:text-zinc-500">{getInitials(user?.name)}</span>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setShowAvatarSelector(true)}
                disabled={uploading}
                className="absolute bottom-0 right-1/2 translate-x-12 bg-white dark:bg-zinc-800 p-2 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 transition-colors"
                title="Mudar foto"
              >
                <Camera size={18} />
              </button>
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

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Escolha seu Avatar</h2>
              <button 
                onClick={() => setShowAvatarSelector(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {DIVERSE_SEEDS.map(seed => (
                  <button
                    key={seed}
                    onClick={() => handleAvatarSelect(seed)}
                    className="aspect-square rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden border-2 border-transparent hover:border-indigo-500 focus:border-indigo-500 focus:outline-none transition-all hover:scale-105 shadow-sm"
                  >
                    <img 
                      src={generateAvatar(seed)} 
                      alt={`Avatar ${seed}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
